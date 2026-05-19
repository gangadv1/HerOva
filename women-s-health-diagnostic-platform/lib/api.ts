function getEnvVar(keys: string[]): string {
  if (typeof process !== "undefined" && process.env) {
    for (const key of keys) {
      if (process.env[key]) return process.env[key] as string;
    }
  }
  if (typeof import.meta !== "undefined" && import.meta.env) {
    for (const key of keys) {
      if ((import.meta.env as Record<string, string>)[key]) return (import.meta.env as Record<string, string>)[key];
    }
  }
  return "";
}

const SUPABASE_URL = getEnvVar(["NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"]);
const SUPABASE_ANON_KEY = getEnvVar(["NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]);
const LOCAL_MODEL_URL = getEnvVar(["LOCAL_MODEL_URL", "REACT_APP_LOCAL_MODEL_URL"]) || "http://localhost:8001";
const LOCAL_SESSION_STORAGE_KEY = "herova.local.sessions.v1";

interface LocalSessionRecord {
  id: string;
  created_at: string;
  patient_data: Record<string, unknown>;
  csv_data?: unknown;
  status: string;
  result?: Record<string, unknown>;
  results?: Array<Record<string, unknown>>;
}

interface LocalSessionStore {
  sessions: LocalSessionRecord[];
}

// Disable mock mode: always call real backend functions using SUPABASE_URL
const USE_MOCK = false;

function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  };
}

function isBrowserStorageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readLocalSessionStore(): LocalSessionStore {
  if (!isBrowserStorageAvailable()) {
    return { sessions: [] };
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_SESSION_STORAGE_KEY);
    if (!raw) return { sessions: [] };
    const parsed = JSON.parse(raw) as Partial<LocalSessionStore>;
    if (!parsed || !Array.isArray(parsed.sessions)) return { sessions: [] };
    return { sessions: parsed.sessions as LocalSessionRecord[] };
  } catch {
    return { sessions: [] };
  }
}

function writeLocalSessionStore(store: LocalSessionStore) {
  if (!isBrowserStorageAvailable()) return;
  window.localStorage.setItem(LOCAL_SESSION_STORAGE_KEY, JSON.stringify(store));
}

function upsertLocalSession(session: LocalSessionRecord) {
  const store = readLocalSessionStore();
  const index = store.sessions.findIndex((item) => item.id === session.id);

  if (index >= 0) {
    store.sessions[index] = { ...store.sessions[index], ...session };
  } else {
    store.sessions.unshift(session);
  }

  store.sessions.sort((left, right) => right.created_at.localeCompare(left.created_at));
  writeLocalSessionStore(store);
}

function getLocalSession(sessionId: string) {
  const store = readLocalSessionStore();
  return store.sessions.find((session) => session.id === sessionId);
}

function normalizeSavedResult(result: Record<string, unknown>) {
  const pcosRiskScore = result.pcos_risk_score ?? result.pcosRiskScore ?? 0;
  const riskLevel = result.risk_level ?? result.riskLevel ?? "low";
  const phenotype = result.phenotype ?? "NA";
  const phenotypeName = result.phenotype_name ?? result.phenotypeName ?? "Unknown";
  const phenotypeDescription = result.phenotype_description ?? result.phenotypeDescription ?? "";
  const contributingFactors = result.contributing_factors ?? result.contributingFactors ?? [];
  const shapValues = result.shap_values ?? result.shapValues ?? [];
  const clusterAssignment = result.cluster_assignment ?? result.clusterAssignment ?? {};
  const confidenceMetrics = result.confidence_metrics ?? result.confidenceMetrics ?? {};
  const recommendations = result.recommendations ?? [];

  return {
    ...result,
    pcos_risk_score: pcosRiskScore,
    risk_level: riskLevel,
    phenotype,
    phenotype_name: phenotypeName,
    phenotype_description: phenotypeDescription,
    contributing_factors: contributingFactors,
    shap_values: shapValues,
    cluster_assignment: clusterAssignment,
    confidence_metrics: confidenceMetrics,
    recommendations,
  };
}

async function apiCall<T>(endpoint: string, body: unknown): Promise<T> {
  const useLocal = !SUPABASE_URL;
  const url = useLocal ? `${LOCAL_MODEL_URL}/${endpoint}` : `${SUPABASE_URL}/functions/v1/${endpoint}`;
  const headers = useLocal ? { "Content-Type": "application/json" } : getHeaders();

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || error.message || `API error: ${response.status}`);
  }

  return response.json();
}

function detectDelimiter(headerLine: string): string {
  if (headerLine.includes("\t")) return "\t";
  if (headerLine.includes(";")) return ";";
  return ",";
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsvText(csvText: string): Array<Record<string, string>> {
  const normalized = csvText.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized.split("\n");
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map((header) => header.trim().replace(/^\uFEFF/, ""));

  return lines
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const values = splitCsvLine(line, delimiter);
      return headers.reduce<Record<string, string>>((row, header, index) => {
        row[header] = (values[index] ?? "").trim();
        return row;
      }, {});
    });
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) return 0;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return false;
    if (["y", "yes", "true", "positive", "present", "i", "irregular"].includes(normalized)) return true;
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric > 0 : false;
  }
  return false;
}

function getField(row: Record<string, string>, candidates: string[], fallback = ""): string {
  for (const candidate of candidates) {
    if (row[candidate] !== undefined && row[candidate] !== "") return row[candidate];
  }
  return fallback;
}

function isYesLike(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (["y", "yes", "true", "positive", "present"].includes(normalized)) return true;
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric > 0 : false;
}

function isIrregularCycleValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  const numeric = Number(normalized);
  return normalized === "i" || normalized === "irregular" || (Number.isFinite(numeric) && numeric >= 4);
}

function getTriggeredColumns(row: Record<string, string>, patient: ReturnType<typeof buildPatientFromUploadedRow>) {
  const columns: string[] = [];
  const addIf = (condition: boolean, label: string) => {
    if (condition) columns.push(label);
  };

  addIf(patient.irregularPeriods, `Cycle(R/I)=${getField(row, ["Cycle(R/I)", "Irregular_Periods", "irregular_periods"], "")}`);
  addIf(patient.weightGain, `Weight gain(Y/N)=${getField(row, ["Weight gain(Y/N)", "Weight_Gain", "weight_gain"], "")}`);
  addIf(patient.hirsutism, `hair growth(Y/N)=${getField(row, ["hair growth(Y/N)", "Hirsutism", "hirsutism"], "")}`);
  addIf(patient.acne, `Pimples(Y/N)=${getField(row, ["Pimples(Y/N)", "Acne", "acne"], "")}`);
  addIf(patient.skinDarkening, `Skin darkening (Y/N)=${getField(row, ["Skin darkening (Y/N)", "Skin_Darkening", "skin_darkening"], "")}`);
  addIf(patient.hairLoss, `Hair loss(Y/N)=${getField(row, ["Hair loss(Y/N)", "Hair_Loss", "hair_loss"], "")}`);
  addIf(patient.fastFood, `Fast food (Y/N)=${getField(row, ["Fast food (Y/N)", "fast_food"], "")}`);
  addIf(!patient.regularExercise, `Reg.Exercise(Y/N)=${getField(row, ["Reg.Exercise(Y/N)", "regular_exercise"], "")}`);
  addIf(patient.amh >= 4, `AMH(ng/mL)=${getField(row, ["AMH(ng/mL)", "AMH", "amh"], "")}`);
  addIf(patient.lhFshRatio >= 2, `FSH/LH=${getField(row, ["FSH/LH", "LH_FSH_Ratio", "lh_fsh_ratio"], "")}`);
  addIf(patient.follicleCountLeft >= 12 || patient.follicleCountRight >= 12, `Follicle No. (L/R)=${patient.follicleCountLeft}/${patient.follicleCountRight}`);
  addIf(patient.bmi >= 25, `BMI=${patient.bmi}`);
  addIf(patient.waistHipRatio > 0.85, `Waist:Hip Ratio=${patient.waistHipRatio}`);
  addIf(patient.bloodPressureSystolic >= 130 || patient.bloodPressureDiastolic >= 85, `BP _Systolic/BP _Diastolic=${patient.bloodPressureSystolic}/${patient.bloodPressureDiastolic}`);

  return columns;
}

function buildPatientFromUploadedRow(row: Record<string, string>) {
  const weight = toNumber(getField(row, ["Weight (Kg)", "Weight", "weight"]));
  const height = toNumber(getField(row, ["Height(Cm)", "Height (Cm)", "Height", "height"]));
  const bmi = toNumber(getField(row, ["BMI", "bmi"], weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : "0"));
  const cycleLength = toNumber(getField(row, ["Cycle length(days)", "Cycle_Length", "cycle_length"]));
  const cycleValue = getField(row, ["Cycle(R/I)", "Irregular_Periods", "irregular_periods"]);
  const waist = toNumber(getField(row, ["Waist(inch)", "Waist", "waist"]));
  const hip = toNumber(getField(row, ["Hip(inch)", "Hip", "hip"]));
  const waistHipRatio = toNumber(getField(row, ["Waist:Hip Ratio", "Waist_Hip_Ratio", "waist_hip_ratio"], waist && hip ? (waist / hip).toFixed(2) : "0"));
  const fastingGlucose = toNumber(getField(row, ["RBS(mg/dl)", "RBS", "Glucose", "Fasting_Glucose"]));
  const fsh = toNumber(getField(row, ["FSH(mIU/mL)", "FSH", "fsh"]));
  const lh = toNumber(getField(row, ["LH(mIU/mL)", "LH", "lh"]));
  const amh = toNumber(getField(row, ["AMH(ng/mL)", "AMH", "amh"]));
  const prolactin = toNumber(getField(row, ["PRL(ng/mL)", "Prolactin", "prolactin"]));
  const tsh = toNumber(getField(row, ["TSH (mIU/L)", "TSH", "tsh"]));
  const folLeft = toNumber(getField(row, ["Follicle No. (L)", "Follicle_Count_Left", "follicle_count_left"]));
  const folRight = toNumber(getField(row, ["Follicle No. (R)", "Follicle_Count_Right", "follicle_count_right"]));
  const avgSizeLeft = toNumber(getField(row, ["Avg. F size (L) (mm)", "Avg_F_Size_Left", "avg_f_size_left"]));
  const avgSizeRight = toNumber(getField(row, ["Avg. F size (R) (mm)", "Avg_F_Size_Right", "avg_f_size_right"]));
  const bloodPressureSystolic = toNumber(getField(row, ["BP _Systolic (mmHg)", "BP_Systolic", "bp_systolic"]));
  const bloodPressureDiastolic = toNumber(getField(row, ["BP _Diastolic (mmHg)", "BP_Diastolic", "bp_diastolic"]));
  const weightGain = isYesLike(getField(row, ["Weight gain(Y/N)", "Weight_Gain", "weight_gain"]));
  const hairGrowth = isYesLike(getField(row, ["hair growth(Y/N)", "Hirsutism", "hirsutism"]));
  const skinDarkening = isYesLike(getField(row, ["Skin darkening (Y/N)", "Skin_Darkening", "skin_darkening"]));
  const hairLoss = isYesLike(getField(row, ["Hair loss(Y/N)", "Hair_Loss", "hair_loss"]));
  const pimples = isYesLike(getField(row, ["Pimples(Y/N)", "Acne", "acne"]));
  const fastFoodRaw = getField(row, ["Fast food (Y/N)", "fast_food"]);
  const fastFood = fastFoodRaw !== "" ? isYesLike(fastFoodRaw) : false;
  const exerciseRaw = getField(row, ["Reg.Exercise(Y/N)", "regular_exercise"]);
  const regularExercise = exerciseRaw !== "" ? isYesLike(exerciseRaw) : true;
  const cycleIsIrregular = isIrregularCycleValue(cycleValue);

  return {
    age: toNumber(getField(row, ["Age (yrs)", "Age", "age"])),
    weight,
    height,
    bmi,
    cycleLength,
    cycleLengthVariability: cycleIsIrregular ? "irregular" : "regular",
    periodDuration: 5,
    ageAtMenarche: 13,
    irregularPeriods: cycleIsIrregular,
    acne: pimples,
    acneSeverity: pimples ? "moderate" : "none",
    hirsutism: hairGrowth,
    hirsutismScore: hairGrowth ? 1 : 0,
    hairLoss,
    skinDarkening,
    fastingGlucose,
    insulinLevel: 0,
    homaIr: 0,
    waistCircumference: waist,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    ovaryVolumeLeft: avgSizeLeft,
    ovaryVolumeRight: avgSizeRight,
    follicleCountLeft: folLeft,
    follicleCountRight: folRight,
    polycysticAppearance: folLeft >= 12 || folRight >= 12,
    endometrialThickness: toNumber(getField(row, ["Endometrium (mm)", "Endometrial_Thickness", "endometrial_thickness"])),
    lh,
    fsh,
    lhFshRatio: toNumber(getField(row, ["FSH/LH", "LH_FSH_Ratio", "lh_fsh_ratio"], lh > 0 ? (fsh / lh).toFixed(2) : "0")),
    totalTestosterone: 0,
    freeTestosterone: 0,
    dheas: 200,
    amh,
    prolactin,
    tsh,
    waistHipRatio,
    pulseRate: toNumber(getField(row, ["Pulse rate(bpm)", "pulse_rate"])),
    respiratoryRate: toNumber(getField(row, ["RR (breaths/min)", "rr"])),
    bloodGroup: getField(row, ["Blood Group", "blood_group"]),
    pregnancyStatus: getField(row, ["Pregnant(Y/N)", "pregnant"]),
    abortions: toNumber(getField(row, ["No. of abortions", "abortions"])),
    betaHcgI: toNumber(getField(row, ["I   beta-HCG(mIU/mL)", "beta_hcg_i"])),
    betaHcgII: toNumber(getField(row, ["II    beta-HCG(mIU/mL)", "beta_hcg_ii"])),
    vitD3: toNumber(getField(row, ["Vit D3 (ng/mL)", "vit_d3"])),
    prg: toNumber(getField(row, ["PRG(ng/mL)", "prg"])),
    weightGain,
    fastFood,
    regularExercise,
  };
}

function buildAnalysisPayload(data: Record<string, unknown>) {
  const age = toNumber(data.age);
  const weight = toNumber(data.weight);
  const height = toNumber(data.height);
  const bmi = toNumber(data.bmi, weight && height ? Number((weight / ((height / 100) ** 2)).toFixed(1)) : 0);
  const cycleLength = toNumber(data.cycleLength);
  const irregularPeriods = toBoolean(data.irregularPeriods);
  const hirsutism = toBoolean(data.hirsutism);
  const acne = toBoolean(data.acne);
  const hairLoss = toBoolean(data.hairLoss);
  const skinDarkening = toBoolean(data.skinDarkening);
  const polycysticAppearance = toBoolean(data.polycysticAppearance);
  const folLeft = toNumber(data.follicleCountLeft);
  const folRight = toNumber(data.follicleCountRight);
  const ovaryLeft = toNumber(data.ovaryVolumeLeft);
  const ovaryRight = toNumber(data.ovaryVolumeRight);
  const waist = toNumber(data.waistCircumference);
  const hip = toNumber(data.hip);
  const waistHipRatio = toNumber(data.waistHipRatio, waist && hip ? Number((waist / hip).toFixed(2)) : 0);
  const lh = toNumber(data.lh);
  const fsh = toNumber(data.fsh);
  const lhFshRatio = toNumber(data.lhFshRatio, lh > 0 && fsh > 0 ? Number((lh / fsh).toFixed(2)) : 0);

  return {
    ...data,
    age,
    weight,
    height,
    bmi,
    cycleLength,
    cycleLengthVariability: String(data.cycleLengthVariability || (irregularPeriods ? "irregular" : "regular")),
    periodDuration: toNumber(data.periodDuration),
    ageAtMenarche: toNumber(data.ageAtMenarche),
    irregularPeriods,
    acne,
    acneSeverity: String(data.acneSeverity || (acne ? "moderate" : "none")),
    hirsutism,
    hirsutismScore: toNumber(data.hirsutismScore),
    hairLoss,
    skinDarkening,
    fastingGlucose: toNumber(data.fastingGlucose),
    insulinLevel: toNumber(data.insulinLevel),
    homaIr: toNumber(data.homaIr),
    waistCircumference: waist,
    bloodPressureSystolic: toNumber(data.bloodPressureSystolic),
    bloodPressureDiastolic: toNumber(data.bloodPressureDiastolic),
    ovaryVolumeLeft: ovaryLeft,
    ovaryVolumeRight: ovaryRight,
    follicleCountLeft: folLeft,
    follicleCountRight: folRight,
    polycysticAppearance,
    endometrialThickness: toNumber(data.endometrialThickness),
    lh,
    fsh,
    lhFshRatio,
    totalTestosterone: toNumber(data.totalTestosterone),
    freeTestosterone: toNumber(data.freeTestosterone),
    dheas: toNumber(data.dheas),
    amh: toNumber(data.amh),
    prolactin: toNumber(data.prolactin),
    tsh: toNumber(data.tsh),
    waistHipRatio,
    "Age (yrs)": age,
    "Weight (Kg)": weight,
    "Height(Cm)": height,
    "BMI": bmi,
    "Cycle(R/I)": irregularPeriods ? "I" : "R",
    "Cycle length(days)": cycleLength,
    "Pimples(Y/N)": acne ? "Y" : "N",
    "hair growth(Y/N)": hirsutism ? "Y" : "N",
    "Hair loss(Y/N)": hairLoss ? "Y" : "N",
    "Skin darkening (Y/N)": skinDarkening ? "Y" : "N",
    "Reg.Exercise(Y/N)": toBoolean(data.regularExercise) ? "Y" : "N",
    "AMH(ng/mL)": toNumber(data.amh),
    "FSH(mIU/mL)": fsh,
    "LH(mIU/mL)": lh,
    "FSH/LH": lh > 0 ? Number((fsh / lh).toFixed(2)) : 0,
    "Follicle No. (L)": folLeft,
    "Follicle No. (R)": folRight,
    "Avg. F size (L) (mm)": ovaryLeft,
    "Avg. F size (R) (mm)": ovaryRight,
    "Endometrium (mm)": toNumber(data.endometrialThickness),
    "BP _Systolic (mmHg)": toNumber(data.bloodPressureSystolic),
    "BP _Diastolic (mmHg)": toNumber(data.bloodPressureDiastolic),
    "Waist(inch)": waist,
    "Hip(inch)": hip,
    "Waist:Hip Ratio": waistHipRatio,
  };
}

function calculateLocalRisk(patient: ReturnType<typeof buildPatientFromUploadedRow>) {
  let score = 0;
  const factors: string[] = [];

  if (patient.cycleLength > 35 || patient.irregularPeriods) {
    score += 18;
    factors.push("Irregular or prolonged cycles");
  }
  if (patient.weightGain) {
    score += 8;
    factors.push("Weight gain");
  }
  if (patient.hirsutism || patient.acne || patient.hairLoss || patient.skinDarkening) {
    score += 16;
    factors.push("Clinical hyperandrogenism");
  }
  if (patient.amh >= 4) {
    score += 12;
    factors.push("Elevated AMH");
  }
  if (patient.lhFshRatio >= 2) {
    score += 12;
    factors.push("Elevated FSH:LH ratio");
  }
  if (patient.follicleCountLeft >= 12 || patient.follicleCountRight >= 12) {
    score += 18;
    factors.push("Polycystic ovarian morphology");
  }
  if (patient.bmi >= 25) {
    score += 10;
    factors.push("Elevated BMI");
  }
  if (patient.waistHipRatio > 0.85) {
    score += 5;
    factors.push("Increased waist-to-hip ratio");
  }
  if (patient.fastingGlucose >= 110) {
    score += 8;
    factors.push("Elevated glucose");
  }
  if (patient.fastFood) {
    score += 3;
    factors.push("Frequent fast-food intake");
  }
  if (!patient.regularExercise) {
    score += 5;
    factors.push("Low physical activity");
  }
  if (patient.tsh > 4.5 || patient.prolactin > 25 || (patient.vitD3 > 0 && patient.vitD3 < 20)) {
    score += 5;
    factors.push("Hormonal or metabolic imbalance");
  }

  return { score: Math.min(score, 100), factors };
}

function determineLocalPhenotype(patient: ReturnType<typeof buildPatientFromUploadedRow>) {
  const hasOligo = patient.irregularPeriods || patient.cycleLength > 35;
  const hasHA = patient.hirsutism || patient.acne || patient.hairLoss || patient.skinDarkening;
  const hasPCOM = patient.follicleCountLeft >= 12 || patient.follicleCountRight >= 12;

  if (hasOligo && hasHA && hasPCOM) return { type: "A", name: "Classic PCOS" };
  if (hasOligo && hasHA) return { type: "B", name: "Non-PCO PCOS" };
  if (hasHA && hasPCOM) return { type: "C", name: "Ovulatory PCOS" };
  if (hasOligo && hasPCOM) return { type: "D", name: "Non-Hyperandrogenic PCOS" };
  return { type: "NA", name: "Non-PCOS" };
}

function buildLocalCsvResult(csvText: string): CSVUploadResult {
  const rows = parseCsvText(csvText);
  const patients = rows.map((row, index) => {
    const patient = buildPatientFromUploadedRow(row);
    const risk = calculateLocalRisk(patient);
    const phenotype = determineLocalPhenotype(patient);
    const triggeredColumns = getTriggeredColumns(row, patient);
    const riskLevel = risk.score >= 70 ? "high" : risk.score >= 40 ? "moderate" : "low";

    return {
      rowId: index + 1,
      patientData: patient,
      riskScore: risk.score,
      riskLevel,
      phenotype: phenotype.type,
      phenotypeName: phenotype.name,
      factors: risk.factors,
      triggeredColumns,
    };
  });

  const phenotypeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, NA: 0 };
  for (const patient of patients) phenotypeDistribution[patient.phenotype] = (phenotypeDistribution[patient.phenotype] || 0) + 1;

  // PCOS Positive: read directly from the PCOS (Y/N) column when present in the CSV.
  // Handles numeric 1, string "1", "Y", "Yes", "true" (case-insensitive).
  // Falls back to computed phenotype when the column is absent.
  const pcosColValues = rows.map((row) => getField(row, ["PCOS (Y/N)", "PCOS(Y/N)", "pcos_yn", "PCOS", "pcos"]));
  const hasPcosColumn = pcosColValues.some((v) => v !== "");
  const pcosPositive = hasPcosColumn
    ? pcosColValues.filter((v) => {
        const norm = v.trim().toLowerCase();
        return norm === "1" || norm === "y" || norm === "yes" || norm === "true";
      }).length
    : patients.filter((patient) => patient.phenotype !== "NA").length;

  return {
    success: true,
    summary: {
      totalRows: rows.length,
      processedPatients: patients.length,
      pcosPositive,
      highRisk: patients.filter((patient) => patient.riskLevel === "high").length,
      moderateRisk: patients.filter((patient) => patient.riskLevel === "moderate").length,
      lowRisk: patients.filter((patient) => patient.riskLevel === "low").length,
      phenotypeDistribution,
    },
    patients,
    timestamp: new Date().toISOString(),
  };
}

export interface RotterdamSubcriterion {
  name: string;
  met: boolean;
  detail: string;
}

export interface RotterdamCriterionResult {
  met: boolean;
  reasoning: string;
  subcriteria: RotterdamSubcriterion[];
}

export interface RotterdamEvaluation {
  hyperandrogenism: RotterdamCriterionResult;
  ovulatoryDysfunction: RotterdamCriterionResult;
  polycysticOvaries: RotterdamCriterionResult;
  criteriaMetCount: number;
  diagnosisMet: boolean;
  exclusionNotes: string[];
}

export interface PredictionResult {
  success: boolean;
  pcosRiskScore: number;
  riskLevel: "low" | "moderate" | "high";
  phenotype: {
    type: string;
    name: string;
    description: string;
    clinicalReasoning: string;
  };
  rotterdamEvaluation: RotterdamEvaluation;
  contributingFactors: string[];
  confidenceMetrics: {
    pcosClassification: number;
    phenotypeMatch: number;
    dataQuality: number;
  };
  recommendations: string[];
  timestamp: string;
}

export interface SHAPResult {
  success: boolean;
  shapValues: Array<{
    name: string;
    value: number;
    impact: string;
    direction: string;
    explanation: string;
  }>;
  topContributors: Array<{
    feature: string;
    contribution: number;
    impact: string;
    direction: string;
    explanation: string;
  }>;
  summary: {
    totalPositiveContribution: number;
    totalNegativeContribution: number;
    topFeature: string;
    topContribution: number;
  };
  explanation: string;
  timestamp: string;
}

export interface ClusterResult {
  success: boolean;
  clusters: Array<{
    clusterId: number;
    clusterName: string;
    description: string;
    centroid: Record<string, number>;
    patientCount: number;
    characteristics: string[];
    riskProfile: string;
    metabolicRisk: "low" | "moderate" | "high";
  }>;
  assignedCluster: {
    id: number;
    name: string;
    description: string;
    characteristics: string[];
    riskProfile: string;
    metabolicRisk: "low" | "moderate" | "high";
  };
  clusterVisualization: Array<{
    id: number;
    name: string;
    patientCount: number;
    metabolicRisk: string;
  }>;
  timestamp: string;
}

export interface CSVUploadResult {
  success: boolean;
  summary: {
    totalRows: number;
    processedPatients: number;
    pcosPositive: number;
    highRisk: number;
    moderateRisk: number;
    lowRisk: number;
    phenotypeDistribution: Record<string, number>;
  };
  patients: Array<{
    rowId: number;
    patientData: Record<string, unknown>;
    riskScore: number;
    riskLevel: string;
    phenotype: string;
    phenotypeName: string;
    factors: string[];
    triggeredColumns: string[];
  }>;
  timestamp: string;
}

export interface ExplainResult {
  success: boolean;
  shapValues: Array<{
    name: string;
    value: number;
    impact: string;
    direction: string;
    explanation: string;
  }>;
  topContributors: Array<{
    feature: string;
    contribution: number;
    impact: string;
    direction: string;
    explanation: string;
  }>;
  clinicalDetails: Array<{
    feature: string;
    clinicalContext: string;
    referenceRange: string;
    patientValue: string;
    rotterdamLink: string;
  }>;
  rotterdamEvaluation: RotterdamEvaluation;
  summary: {
    totalPositiveContribution: number;
    totalNegativeContribution: number;
    totalNeutralContribution: number;
    topFeature: string;
    topContribution: number;
    rotterdamCriteriaMet: number;
    rotterdamDiagnosis: boolean;
  };
  explanation: string;
  timestamp: string;
}

export interface PatientSummaryResult {
  success: boolean;
  patientSummary: {
    demographics: { age: number; bmi: number; weight: number; height: number };
    riskAssessment: {
      pcosRiskScore: number;
      riskLevel: string;
      contributingFactors: string[];
      confidenceMetrics: { pcosClassification: number; phenotypeMatch: number; dataQuality: number };
    };
    diagnosis: {
      rotterdamEvaluation: RotterdamEvaluation;
      phenotype: { type: string; name: string; description: string; clinicalReasoning: string };
      pcosDiagnosed: boolean;
    };
    metabolicProfile: {
      bmi: { value: number; category: string };
      insulinResistance: { present: boolean; homaIr: number; fastingGlucose: number; insulinLevel: number };
      bloodPressure: { systolic: number; diastolic: number; hypertensive: boolean };
      waistCircumference: { value: number; elevated: boolean };
      riskFactors: string[];
      metabolicRiskLevel: string;
    };
    hormonalProfile: {
      gonadotropins: { lh: number; fsh: number; ratio: number; abnormal: boolean };
      androgens: { totalTestosterone: number; freeTestosterone: number; dheas: number; elevated: boolean };
      ovarianReserve: { amh: number; elevated: boolean };
      other: { prolactin: number; tsh: number };
      abnormalities: string[];
    };
    ultrasoundFindings: {
      leftOvary: { volume: number; follicleCount: number; pcom: boolean };
      rightOvary: { volume: number; follicleCount: number; pcom: boolean };
      polycysticAppearance: boolean;
      endometrialThickness: number;
      pcomPresent: boolean;
    };
    clinicalSymptoms: {
      menstrual: { cycleLength: number; irregular: boolean; periodDuration: number; ageAtMenarche: number };
      dermatological: { acne: boolean; acneSeverity: string; hirsutism: boolean; hirsutismScore: number; hairLoss: boolean; skinDarkening: boolean };
      activeSymptoms: Array<{ name: string; present: boolean; severity?: string; detail?: string }>;
    };
    recommendations: Array<{ category: string; items: string[] }>;
    narrativeSummary: string;
  };
  timestamp: string;
}

export interface FullAnalysisResult {
  success: boolean;
  prediction: {
    pcosRiskScore: number;
    riskLevel: string;
    contributingFactors: string[];
  };
  phenotype: {
    type: string;
    name: string;
    description: string;
  };
  phenotypeDisplay?: {
    displayName?: string;
    type?: string;
    characteristics?: string[];
  };
  biologicalInsights?: {
    pathways?: Array<{ name: string; reason: string }>;
    summary?: string;
  };
  nextInvestigations?: string[];
  humanReasoning?: string[];
  bodyHighlights?: { face?: boolean; abdomen?: boolean; ovary?: boolean; scalp_face?: boolean };
  suggestedInvestigations?: string[];
  rotterdamEvaluation: RotterdamEvaluation;
  shap: {
    values: Array<{
      name: string;
      value: number;
      impact: string;
      direction: string;
      explanation: string;
    }>;
    topContributors: Array<{
      feature: string;
      contribution: number;
      impact: string;
      direction: string;
      explanation: string;
    }>;
  };
  clustering: {
    assignedCluster: {
      id: number;
      name: string;
      description: string;
      characteristics: string[];
      riskProfile: string;
      metabolicRisk: string;
    };
    allClusters: Array<{
      id: number;
      name: string;
      patientCount: number;
      metabolicRisk: string;
    }>;
  };
  confidenceMetrics: {
    pcosClassification: number;
    phenotypeMatch: number;
    dataQuality: number;
  };
  recommendations: string[];
  timestamp: string;
}

export interface SessionResult {
  success: boolean;
  session?: {
    id: string;
    created_at: string;
    patient_data: Record<string, unknown>;
    csv_data?: unknown;
    status: string;
  };
  sessions?: Array<{
    id: string;
    created_at: string;
    patient_data: Record<string, unknown>;
    status: string;
  }>;
  result?: Record<string, unknown>;
  results?: Array<Record<string, unknown>>;
}

export const healthApi = {
  predict: (data: Record<string, unknown>) =>
    USE_MOCK
      ? Promise.resolve({ success: true, pcosRiskScore: 12, riskLevel: "low", phenotype: { type: "NA", name: "Non-PCOS", description: "Mock result" }, contributingFactors: [], confidenceMetrics: { pcosClassification: 0.9, phenotypeMatch: 0.8, dataQuality: 0.9 }, recommendations: [], timestamp: new Date().toISOString() } as PredictionResult)
      : (async () => {
          const payload = buildAnalysisPayload(data);
          try {
            const resp = await fetch(`${LOCAL_MODEL_URL}/predict`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (resp.ok) return resp.json();
          } catch (e) {
            // local model unavailable; fallthrough to Supabase
          }

          return apiCall<PredictionResult>("predict", payload);
        })(),

  shap: (data: Record<string, unknown>) =>
    apiCall<SHAPResult>("shap", data),

  cluster: (data: Record<string, unknown>) =>
    apiCall<ClusterResult>("cluster", data),

  explain: (data: Record<string, unknown>) =>
    apiCall<ExplainResult>("explain", data),

  patientSummary: (data: Record<string, unknown>) =>
    apiCall<PatientSummaryResult>("patient-summary", data),

  analyze: (data: Record<string, unknown>) =>
    USE_MOCK
      ? Promise.resolve({
          success: true,
          prediction: { pcosRiskScore: 42, riskLevel: "moderate", contributingFactors: ["Irregular periods", "Elevated AMH"] },
          phenotype: { type: "C", name: "Ovulatory PCOS", description: "Mock phenotype description" },
          shap: { values: [{ name: "AMH", value: 0.8, impact: "high", direction: "positive", explanation: "Higher AMH increases PCOS risk" }], topContributors: [{ feature: "AMH", contribution: 0.8, impact: "high", direction: "positive", explanation: "Top contributor" }] },
          clustering: { assignedCluster: { id: 1, name: "Cluster A", description: "Mock cluster", characteristics: ["feature1"], riskProfile: "moderate", metabolicRisk: "moderate" }, allClusters: [] },
          confidenceMetrics: { pcosClassification: 0.85, phenotypeMatch: 0.7, dataQuality: 0.95 },
          recommendations: ["Refer to endocrinology"],
          timestamp: new Date().toISOString(),
        } as FullAnalysisResult)
      : (async () => {
          const payload = buildAnalysisPayload(data);
          try {
            const resp = await fetch(`${LOCAL_MODEL_URL}/analyze`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            if (resp.ok) return resp.json();
          } catch (e) {
            // fallback to Supabase
          }
          return apiCall<FullAnalysisResult>("analyze", payload);
        })(),

  csvUpload: async (file: File): Promise<CSVUploadResult> => {
    if (!SUPABASE_URL) {
      const csvText = await file.text();
      return buildLocalCsvResult(csvText);
    }
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/csv-upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || error.message || `Upload error: ${response.status}`);
    }

    return response.json();
  },

  csvUploadText: (csvText: string) =>
    apiCall<CSVUploadResult>("csv-upload", { csvText }),

  session: {
    create: (patientData: Record<string, unknown>, csvData?: unknown) =>
      USE_MOCK
        ? Promise.resolve({ success: true, session: { id: "mock-session-1", created_at: new Date().toISOString(), patient_data: patientData, csv_data: csvData, status: "created" } } as SessionResult)
        : !SUPABASE_URL
          ? (() => {
              const session = {
                id: `local-session-${Date.now()}`,
                created_at: new Date().toISOString(),
                patient_data: patientData,
                csv_data: csvData,
                status: "created",
              };

              upsertLocalSession(session);
              return Promise.resolve({ success: true, session } as SessionResult);
            })()
          : apiCall<SessionResult>("session", { action: "create", patientData, csvData }),

    get: (sessionId: string) =>
      USE_MOCK
        ? Promise.resolve({ success: true, session: { id: sessionId, created_at: new Date().toISOString(), patient_data: {}, status: "created" } } as SessionResult)
        : !SUPABASE_URL
          ? Promise.resolve({
              success: true,
              session: getLocalSession(sessionId) || { id: sessionId, created_at: new Date().toISOString(), patient_data: {}, status: "created" },
            } as SessionResult)
          : apiCall<SessionResult>("session", { action: "get", sessionId }),

    update: (sessionId: string, updates: { patientData?: Record<string, unknown>; csvData?: unknown; status?: string }) =>
      USE_MOCK
        ? Promise.resolve({ success: true, session: { id: sessionId, created_at: new Date().toISOString(), patient_data: updates.patientData || {}, csv_data: updates.csvData, status: updates.status || "updated" } } as SessionResult)
        : !SUPABASE_URL
          ? (() => {
              const existing = getLocalSession(sessionId);
              const session = {
                id: sessionId,
                created_at: existing?.created_at || new Date().toISOString(),
                patient_data: updates.patientData || existing?.patient_data || {},
                csv_data: updates.csvData ?? existing?.csv_data,
                status: updates.status || existing?.status || "updated",
                result: existing?.result,
                results: existing?.results,
              };

              upsertLocalSession(session);
              return Promise.resolve({ success: true, session } as SessionResult);
            })()
          : apiCall<SessionResult>("session", { action: "update", sessionId, ...updates }),

    saveResult: (sessionId: string, result: Record<string, unknown>) =>
      USE_MOCK
        ? Promise.resolve({ success: true, session: { id: sessionId, created_at: new Date().toISOString(), patient_data: {}, status: "saved" }, result } as SessionResult)
        : !SUPABASE_URL
          ? (() => {
              const normalizedResult = normalizeSavedResult(result);
              const existing = getLocalSession(sessionId);
              const session = {
                id: sessionId,
                created_at: existing?.created_at || new Date().toISOString(),
                patient_data: existing?.patient_data || {},
                csv_data: existing?.csv_data,
                status: "saved",
                result: normalizedResult,
                results: [normalizedResult],
              };

              upsertLocalSession(session);
              return Promise.resolve({ success: true, session, result: normalizedResult } as SessionResult);
            })()
          : apiCall<SessionResult>("session", { action: "save-result", sessionId, ...result }),

    list: () =>
      USE_MOCK
        ? Promise.resolve({ success: true, sessions: [{ id: "mock-session-1", created_at: new Date().toISOString(), patient_data: {}, status: "created" }] } as SessionResult)
        : !SUPABASE_URL
          ? Promise.resolve({ success: true, sessions: readLocalSessionStore().sessions } as SessionResult)
          : apiCall<SessionResult>("session", { action: "list" }),

    getResults: (sessionId: string) =>
      USE_MOCK
        ? Promise.resolve({ success: true, results: [ { pcos_risk_score: 42, phenotype: "Ovulatory PCOS", phenotype_name: "Ovulatory", phenotype_description: "Mock" , contributing_factors: ["AMH"] } ] } as SessionResult)
        : !SUPABASE_URL
          ? Promise.resolve({
              success: true,
              results: getLocalSession(sessionId)?.results || (getLocalSession(sessionId)?.result ? [normalizeSavedResult(getLocalSession(sessionId)!.result as Record<string, unknown>)] : []),
            } as SessionResult)
          : apiCall<SessionResult>("session", { action: "get-results", sessionId }),
  },
};

export function isSupabaseConfigured() {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}
