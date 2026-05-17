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

// Disable mock mode: always call real backend functions using SUPABASE_URL
const USE_MOCK = false;

function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  };
}

async function apiCall<T>(endpoint: string, body: unknown): Promise<T> {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL is not set. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment. See README for setup.");
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
    method: "POST",
    headers: getHeaders(),
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

  const lines = normalized.split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map((header) => header.trim().replace(/^\uFEFF/, ""));

  return lines.slice(1).map((line) => {
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
  const fastFood = isYesLike(getField(row, ["Fast food (Y/N)", "fast_food"]));
  const regularExercise = isYesLike(getField(row, ["Reg.Exercise(Y/N)", "regular_exercise"]));
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
  if (patient.lhFshRatio >= 2 || (patient.lh > 0 && patient.fsh / patient.lh >= 2)) {
    score += 12;
    factors.push("Elevated FSH:LH ratio");
  }
  if (patient.follicleCountLeft >= 12 || patient.follicleCountRight >= 12) {
    score += 18;
    factors.push("Polycystic ovarian morphology");
  }
  if (patient.bmi >= 25 || patient.weight > 0 && patient.weight / ((patient.height / 100) ** 2) >= 25) {
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
  if (patient.tsh > 4.5 || patient.prolactin > 25 || patient.vitD3 > 0 && patient.vitD3 < 20) {
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

    return {
      rowId: index + 1,
      patientData: patient,
      riskScore: risk.score,
      riskLevel: risk.score >= 70 ? "high" : risk.score >= 40 ? "moderate" : "low",
      phenotype: phenotype.type,
      phenotypeName: phenotype.name,
      factors: risk.factors,
    };
  });

  const phenotypeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, NA: 0 };
  for (const patient of patients) phenotypeDistribution[patient.phenotype] = (phenotypeDistribution[patient.phenotype] || 0) + 1;

  return {
    success: true,
    summary: {
      totalRows: rows.length,
      processedPatients: patients.length,
      pcosPositive: patients.filter((patient) => patient.phenotype !== "NA").length,
      highRisk: patients.filter((patient) => patient.riskLevel === "high").length,
      moderateRisk: patients.filter((patient) => patient.riskLevel === "moderate").length,
      lowRisk: patients.filter((patient) => patient.riskLevel === "low").length,
      phenotypeDistribution,
    },
    patients,
    timestamp: new Date().toISOString(),
  };
}

export interface PredictionResult {
  success: boolean;
  pcosRiskScore: number;
  riskLevel: "low" | "moderate" | "high";
  phenotype: {
    type: string;
    name: string;
    description: string;
  };
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
  }>;
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
      : apiCall<PredictionResult>("predict", data),

  shap: (data: Record<string, unknown>) =>
    apiCall<SHAPResult>("shap", data),

  cluster: (data: Record<string, unknown>) =>
    apiCall<ClusterResult>("cluster", data),

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
      : apiCall<FullAnalysisResult>("analyze", data),

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
        : apiCall<SessionResult>("session", { action: "create", patientData, csvData }),

    get: (sessionId: string) =>
      USE_MOCK
        ? Promise.resolve({ success: true, session: { id: sessionId, created_at: new Date().toISOString(), patient_data: {}, status: "created" } } as SessionResult)
        : apiCall<SessionResult>("session", { action: "get", sessionId }),

    update: (sessionId: string, updates: { patientData?: Record<string, unknown>; csvData?: unknown; status?: string }) =>
      USE_MOCK
        ? Promise.resolve({ success: true, session: { id: sessionId, created_at: new Date().toISOString(), patient_data: updates.patientData || {}, csv_data: updates.csvData, status: updates.status || "updated" } } as SessionResult)
        : apiCall<SessionResult>("session", { action: "update", sessionId, ...updates }),

    saveResult: (sessionId: string, result: Record<string, unknown>) =>
      USE_MOCK
        ? Promise.resolve({ success: true, session: { id: sessionId, created_at: new Date().toISOString(), patient_data: {}, status: "saved" }, result } as SessionResult)
        : apiCall<SessionResult>("session", { action: "save-result", sessionId, ...result }),

    list: () =>
      USE_MOCK
        ? Promise.resolve({ success: true, sessions: [{ id: "mock-session-1", created_at: new Date().toISOString(), patient_data: {}, status: "created" }] } as SessionResult)
        : apiCall<SessionResult>("session", { action: "list" }),

    getResults: (sessionId: string) =>
      USE_MOCK
        ? Promise.resolve({ success: true, results: [ { pcos_risk_score: 42, phenotype: "Ovulatory PCOS", phenotype_name: "Ovulatory", phenotype_description: "Mock" , contributing_factors: ["AMH"] } ] } as SessionResult)
        : apiCall<SessionResult>("session", { action: "get-results", sessionId }),
  },
};

export function isSupabaseConfigured() {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
}
