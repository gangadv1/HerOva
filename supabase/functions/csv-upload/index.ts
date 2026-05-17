const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PatientInput {
  age: number; weight: number; height: number; bmi: number;
  cycleLength: number; cycleLengthVariability: string; periodDuration: number;
  ageAtMenarche: number; irregularPeriods: boolean;
  acne: boolean; acneSeverity: string; hirsutism: boolean; hirsutismScore: number;
  hairLoss: boolean; skinDarkening: boolean;
  fastingGlucose: number; insulinLevel: number; homaIr: number;
  waistCircumference: number; bloodPressureSystolic: number; bloodPressureDiastolic: number;
  ovaryVolumeLeft: number; ovaryVolumeRight: number;
  follicleCountLeft: number; follicleCountRight: number;
  polycysticAppearance: boolean; endometrialThickness: number;
  lh: number; fsh: number; lhFshRatio: number;
  totalTestosterone: number; freeTestosterone: number;
  dheas: number; amh: number; prolactin: number; tsh: number;
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

function calculatePCOSRisk(data: Partial<PatientInput>) {
  let score = 0;
  const factors: string[] = [];
  if (data.irregularPeriods || (data.cycleLength && data.cycleLength > 35)) { score += 30; factors.push("Oligomenorrhea/Irregular cycles"); }
  if (data.hirsutism || data.acne || data.hairLoss) { score += 25; factors.push("Clinical hyperandrogenism"); }
  if ((data.totalTestosterone && data.totalTestosterone > 50) || (data.freeTestosterone && data.freeTestosterone > 3)) { score += 20; factors.push("Elevated androgens"); }
  if (data.polycysticAppearance || (data.follicleCountLeft && data.follicleCountLeft >= 12) || (data.follicleCountRight && data.follicleCountRight >= 12) || (data.ovaryVolumeLeft && data.ovaryVolumeLeft > 10) || (data.ovaryVolumeRight && data.ovaryVolumeRight > 10)) { score += 25; factors.push("Polycystic ovarian morphology"); }
  if (data.lhFshRatio && data.lhFshRatio > 2) { score += 10; factors.push("Elevated LH:FSH ratio"); }
  if (data.amh && data.amh > 6) { score += 10; factors.push("Elevated AMH"); }
  if (data.homaIr && data.homaIr > 2.5) { score += 10; factors.push("Insulin resistance"); }
  return { score: Math.min(score, 100), factors };
}

function determinePhenotype(data: Partial<PatientInput>) {
  const hasOligo = data.irregularPeriods || (data.cycleLength && data.cycleLength > 35);
  const hasHA = data.hirsutism || data.acne || (data.totalTestosterone && data.totalTestosterone > 50);
  const hasPCOM = data.polycysticAppearance || (data.follicleCountLeft && data.follicleCountLeft >= 12) || (data.follicleCountRight && data.follicleCountRight >= 12);
  if (hasOligo && hasHA && hasPCOM) return { type: "A", name: "Frank/Classic PCOS" };
  if (hasOligo && hasHA) return { type: "B", name: "Non-PCO PCOS" };
  if (hasHA && hasPCOM) return { type: "C", name: "Ovulatory PCOS" };
  if (hasOligo && hasPCOM) return { type: "D", name: "Non-Hyperandrogenic PCOS" };
  return { type: "N/A", name: "Uncertain" };
}

function parseCSV(csvText: string): Record<string, unknown>[] {
  const lines = csvText.replace(/\r\n/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];
  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map(h => h.trim().replace(/^\uFEFF/, ""));
  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i], delimiter);
    const row: Record<string, unknown> = {};
    headers.forEach((header, idx) => {
      const val = values[idx];
      const num = Number(val);
      row[header] = isNaN(num) || val === "" ? val : num;
    });
    rows.push(row);
  }
  return rows;
}

function mapCSVToPatient(row: Record<string, unknown>): Partial<PatientInput> | null {
  const get = (keys: string[], fallback: unknown = 0): unknown => {
    for (const key of keys) { if (row[key] !== undefined && row[key] !== "") return row[key]; }
    return fallback;
  };
  const toNum = (val: unknown): number => { const n = Number(val); return isNaN(n) ? 0 : n; };
  const toBool = (val: unknown): boolean => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true" || val === "1" || val.toLowerCase() === "yes";
    return toNum(val) === 1;
  };
  try {
    const weight = toNum(get(["Weight (Kg)", "Weight", "weight", "Weight_kg"], 60));
    const height = toNum(get(["Height(Cm)", "Height (Cm)", "Height", "height", "Height_cm"], 165));
    const lh = toNum(get(["LH(mIU/mL)", "LH", "lh", "LH_mIU"], 10));
    const fsh = toNum(get(["FSH(mIU/mL)", "FSH", "fsh", "FSH_mIU"], 6));
    const fastingGlucose = toNum(get(["RBS(mg/dl)", "Fasting_Glucose", "fasting_glucose", "Glucose"], 90));
    const insulinLevel = 0;
    const cycleValue = String(get(["Cycle(R/I)", "Cycle", "cycle"], "R"));
    const waist = toNum(get(["Waist(inch)", "Waist", "waist", "Waist_Circumference"], 75));
    const hip = toNum(get(["Hip(inch)", "Hip", "hip"], 90));
    const folLeft = toNum(get(["Follicle No. (L)", "Follicle_Count_Left", "follicle_count_left"], 10));
    const folRight = toNum(get(["Follicle No. (R)", "Follicle_Count_Right", "follicle_count_right"], 10));
    const weightGain = isYesLike(String(get(["Weight gain(Y/N)", "Weight_Gain", "weight_gain"], false)));
    const hairGrowth = isYesLike(String(get(["hair growth(Y/N)", "Hirsutism", "hirsutism"], false)));
    const skinDarkening = isYesLike(String(get(["Skin darkening (Y/N)", "Skin_Darkening", "skin_darkening"], false)));
    const hairLoss = isYesLike(String(get(["Hair loss(Y/N)", "Hair_Loss", "hair_loss"], false)));
    const pimples = isYesLike(String(get(["Pimples(Y/N)", "Acne", "acne"], false)));
    const fastFood = isYesLike(String(get(["Fast food (Y/N)", "fast_food"], false)));
    const regularExercise = isYesLike(String(get(["Reg.Exercise(Y/N)", "regular_exercise"], false)));
    const cycleIsIrregular = isIrregularCycleValue(cycleValue);
    return {
      age: toNum(get(["Age (yrs)", "Age", "age"], 28)), weight, height,
      bmi: toNum(get(["BMI", "bmi"], (weight / (height / 100) ** 2).toFixed(1))),
      cycleLength: toNum(get(["Cycle length(days)", "Cycle_Length", "cycle_length"], 28)),
      cycleLengthVariability: cycleIsIrregular ? "irregular" : String(get(["Cycle_Variability", "cycle_variability"], "regular")),
      periodDuration: toNum(get(["Period_Duration", "period_duration"], 5)),
      ageAtMenarche: toNum(get(["Age_Menarche", "age_menarche"], 13)),
      irregularPeriods: cycleIsIrregular || toBool(get(["Irregular_Periods", "irregular_periods", "Irregular"], false)),
      acne: pimples,
      acneSeverity: pimples ? "moderate" : String(get(["Acne_Severity", "acne_severity"], "none")),
      hirsutism: hairGrowth,
      hirsutismScore: hairGrowth ? 1 : 0,
      hairLoss,
      skinDarkening,
      fastingGlucose, insulinLevel,
      homaIr: toNum(get(["HOMA_IR", "homa_ir", "HOMA"], (insulinLevel * fastingGlucose) / 405)),
      waistCircumference: waist,
      bloodPressureSystolic: toNum(get(["BP _Systolic (mmHg)", "BP_Systolic", "bp_systolic"], 120)),
      bloodPressureDiastolic: toNum(get(["BP _Diastolic (mmHg)", "BP_Diastolic", "bp_diastolic"], 80)),
      ovaryVolumeLeft: toNum(get(["Avg. F size (L) (mm)", "Ovary_Vol_Left", "ovary_volume_left"], 8)),
      ovaryVolumeRight: toNum(get(["Avg. F size (R) (mm)", "Ovary_Vol_Right", "ovary_volume_right"], 8)),
      follicleCountLeft: folLeft,
      follicleCountRight: folRight,
      polycysticAppearance: folLeft >= 12 || folRight >= 12 || toBool(get(["Polycystic", "polycystic", "PCO_Appearance"], false)),
      endometrialThickness: toNum(get(["Endometrium (mm)", "Endometrial_Thickness", "endometrial_thickness"], 8)),
      lh, fsh, lhFshRatio: toNum(get(["LH_FSH_Ratio", "lh_fsh_ratio"], lh / fsh)),
      totalTestosterone: 0,
      freeTestosterone: 0,
      dheas: toNum(get(["DHEAS", "dheas"], 200)),
      amh: toNum(get(["AMH(ng/mL)", "AMH", "amh"], 4)),
      prolactin: toNum(get(["PRL(ng/mL)", "Prolactin", "prolactin"], 12)),
      tsh: toNum(get(["TSH (mIU/L)", "TSH", "tsh"], 2)),
      prg: toNum(get(["PRG(ng/mL)", "prg"], 0)),
      weightGain,
      fastFood,
      regularExercise,
    };
  } catch { return null; }
}

function buildRisk(data: Partial<PatientInput>) {
  let score = 0;
  const factors: string[] = [];
  if (data.irregularPeriods || (data.cycleLength && data.cycleLength > 35)) { score += 18; factors.push("Irregular or prolonged cycles"); }
  if ((data as { weightGain?: boolean }).weightGain) { score += 8; factors.push("Weight gain"); }
  if (data.hirsutism || data.acne || data.hairLoss || data.skinDarkening) { score += 16; factors.push("Clinical hyperandrogenism"); }
  if (data.amh && data.amh >= 4) { score += 12; factors.push("Elevated AMH"); }
  if (data.lhFshRatio && data.lhFshRatio >= 2) { score += 12; factors.push("Elevated FSH:LH ratio"); }
  if (data.polycysticAppearance || (data.follicleCountLeft && data.follicleCountLeft >= 12) || (data.follicleCountRight && data.follicleCountRight >= 12) || (data.ovaryVolumeLeft && data.ovaryVolumeLeft > 10) || (data.ovaryVolumeRight && data.ovaryVolumeRight > 10)) { score += 18; factors.push("Polycystic ovarian morphology"); }
  if (data.bmi && data.bmi >= 25) { score += 10; factors.push("Elevated BMI"); }
  if (data.waistCircumference && data.homaIr && data.homaIr > 2.5) { score += 5; factors.push("Insulin resistance"); }
  if ((data.bloodPressureSystolic && data.bloodPressureSystolic >= 130) || (data.bloodPressureDiastolic && data.bloodPressureDiastolic >= 85)) { score += 5; factors.push("Elevated blood pressure"); }
  return { score: Math.min(score, 100), factors };
}

function buildPhenotype(data: Partial<PatientInput>) {
  const hasOligo = data.irregularPeriods || (data.cycleLength && data.cycleLength > 35);
  const hasHA = data.hirsutism || data.acne || data.hairLoss || data.skinDarkening;
  const hasPCOM = data.polycysticAppearance || (data.follicleCountLeft && data.follicleCountLeft >= 12) || (data.follicleCountRight && data.follicleCountRight >= 12);
  if (hasOligo && hasHA && hasPCOM) return { type: "A", name: "Classic PCOS" };
  if (hasOligo && hasHA) return { type: "B", name: "Non-PCO PCOS" };
  if (hasHA && hasPCOM) return { type: "C", name: "Ovulatory PCOS" };
  if (hasOligo && hasPCOM) return { type: "D", name: "Non-Hyperandrogenic PCOS" };
  return { type: "NA", name: "Non-PCOS" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const contentType = req.headers.get("content-type") || "";
    let csvText: string;
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      if (!file || !(file instanceof File)) return new Response(JSON.stringify({ success: false, error: "No file provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      csvText = await file.text();
    } else {
      const body = await req.json();
      csvText = body.csvText || body.csv || "";
    }
    if (!csvText.trim()) return new Response(JSON.stringify({ success: false, error: "Empty CSV data" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const rows = parseCSV(csvText);
    if (rows.length === 0) return new Response(JSON.stringify({ success: false, error: "No valid data rows found" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const patients = rows.map((row, index) => {
      const mapped = mapCSVToPatient(row);
      if (!mapped) return null;
      const risk = buildRisk(mapped);
      const phenotype = buildPhenotype(mapped);
      return { rowId: index + 1, patientData: mapped, riskScore: risk.score, riskLevel: risk.score >= 70 ? "high" : risk.score >= 40 ? "moderate" : "low", phenotype: phenotype.type, phenotypeName: phenotype.name, factors: risk.factors };
    }).filter(Boolean);
    const summary = {
      totalRows: rows.length, processedPatients: patients.length,
      pcosPositive: patients.filter(p => p && p.phenotype !== "NA").length,
      highRisk: patients.filter(p => p && p.riskLevel === "high").length,
      moderateRisk: patients.filter(p => p && p.riskLevel === "moderate").length,
      lowRisk: patients.filter(p => p && p.riskLevel === "low").length,
      phenotypeDistribution: {
        A: patients.filter(p => p && p.phenotype === "A").length,
        B: patients.filter(p => p && p.phenotype === "B").length,
        C: patients.filter(p => p && p.phenotype === "C").length,
        D: patients.filter(p => p && p.phenotype === "D").length,
        NA: patients.filter(p => p && p.phenotype === "N/A").length,
      },
    };
    return new Response(JSON.stringify({ success: true, summary, patients, timestamp: new Date().toISOString() }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "CSV processing failed", message: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
