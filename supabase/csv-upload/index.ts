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
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
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
    const weight = toNum(get(["Weight", "weight", "Weight_kg"], 60));
    const height = toNum(get(["Height", "height", "Height_cm"], 165));
    const lh = toNum(get(["LH", "lh", "LH_mIU"], 10));
    const fsh = toNum(get(["FSH", "fsh", "FSH_mIU"], 6));
    const fastingGlucose = toNum(get(["Fasting_Glucose", "fasting_glucose", "Glucose"], 90));
    const insulinLevel = toNum(get(["Insulin", "insulin", "Fasting_Insulin"], 10));
    return {
      age: toNum(get(["Age", "age"], 28)), weight, height,
      bmi: toNum(get(["BMI", "bmi"], (weight / (height / 100) ** 2).toFixed(1))),
      cycleLength: toNum(get(["Cycle_Length", "cycle_length"], 28)),
      cycleLengthVariability: String(get(["Cycle_Variability", "cycle_variability"], "regular")),
      periodDuration: toNum(get(["Period_Duration", "period_duration"], 5)),
      ageAtMenarche: toNum(get(["Age_Menarche", "age_menarche"], 13)),
      irregularPeriods: toBool(get(["Irregular_Periods", "irregular_periods", "Irregular"], false)),
      acne: toBool(get(["Acne", "acne"], false)),
      acneSeverity: String(get(["Acne_Severity", "acne_severity"], "none")),
      hirsutism: toBool(get(["Hirsutism", "hirsutism"], false)),
      hirsutismScore: toNum(get(["Hirsutism_Score", "hirsutism_score", "FG_Score"], 0)),
      hairLoss: toBool(get(["Hair_Loss", "hair_loss"], false)),
      skinDarkening: toBool(get(["Skin_Darkening", "skin_darkening", "Acanthosis_Nigricans"], false)),
      fastingGlucose, insulinLevel,
      homaIr: toNum(get(["HOMA_IR", "homa_ir", "HOMA"], (insulinLevel * fastingGlucose) / 405)),
      waistCircumference: toNum(get(["Waist", "waist", "Waist_Circumference"], 75)),
      bloodPressureSystolic: toNum(get(["BP_Systolic", "bp_systolic"], 120)),
      bloodPressureDiastolic: toNum(get(["BP_Diastolic", "bp_diastolic"], 80)),
      ovaryVolumeLeft: toNum(get(["Ovary_Vol_Left", "ovary_volume_left"], 8)),
      ovaryVolumeRight: toNum(get(["Ovary_Vol_Right", "ovary_volume_right"], 8)),
      follicleCountLeft: toNum(get(["Follicle_Count_Left", "follicle_count_left"], 10)),
      follicleCountRight: toNum(get(["Follicle_Count_Right", "follicle_count_right"], 10)),
      polycysticAppearance: toBool(get(["Polycystic", "polycystic", "PCO_Appearance"], false)),
      endometrialThickness: toNum(get(["Endometrial_Thickness", "endometrial_thickness"], 8)),
      lh, fsh, lhFshRatio: toNum(get(["LH_FSH_Ratio", "lh_fsh_ratio"], lh / fsh)),
      totalTestosterone: toNum(get(["Total_Testosterone", "total_testosterone", "Testosterone"], 40)),
      freeTestosterone: toNum(get(["Free_Testosterone", "free_testosterone"], 2)),
      dheas: toNum(get(["DHEAS", "dheas"], 200)),
      amh: toNum(get(["AMH", "amh"], 4)),
      prolactin: toNum(get(["Prolactin", "prolactin"], 12)),
      tsh: toNum(get(["TSH", "tsh"], 2)),
    };
  } catch { return null; }
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
      const risk = calculatePCOSRisk(mapped);
      const phenotype = determinePhenotype(mapped);
      return { rowId: index + 1, patientData: mapped, riskScore: risk.score, riskLevel: risk.score >= 70 ? "high" : risk.score >= 40 ? "moderate" : "low", phenotype: phenotype.type, phenotypeName: phenotype.name, factors: risk.factors };
    }).filter(Boolean);
    const summary = {
      totalRows: rows.length, processedPatients: patients.length,
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
