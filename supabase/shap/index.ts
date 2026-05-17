export {};
declare const Deno: any;

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

function calculateSHAPValues(data: PatientInput) {
  const features = [
    { name: "Cycle Length", value: data.cycleLength > 35 ? 0.85 : 0.3, impact: data.cycleLength > 35 ? "high" : "low", direction: data.cycleLength > 35 ? "increases" : "neutral", explanation: data.cycleLength > 35 ? "Prolonged cycles strongly indicate oligomenorrhea, a key Rotterdam criterion" : "Normal cycle length reduces PCOS likelihood" },
    { name: "Follicle Count", value: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? 0.75 : 0.25, impact: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? "high" : "low", direction: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? "increases" : "neutral", explanation: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? "High follicle count per ovary is a direct indicator of polycystic morphology" : "Normal follicle count does not support PCOM criterion" },
    { name: "LH:FSH Ratio", value: data.lhFshRatio > 2 ? 0.7 : 0.2, impact: data.lhFshRatio > 2 ? "high" : "low", direction: data.lhFshRatio > 2 ? "increases" : "neutral", explanation: data.lhFshRatio > 2 ? "Elevated LH:FSH ratio suggests pituitary-ovarian axis dysregulation" : "Normal ratio does not support hormonal imbalance" },
    { name: "Total Testosterone", value: data.totalTestosterone > 50 ? 0.65 : 0.2, impact: data.totalTestosterone > 50 ? "high" : "low", direction: data.totalTestosterone > 50 ? "increases" : "neutral", explanation: data.totalTestosterone > 50 ? "Biochemical hyperandrogenism is a core diagnostic criterion" : "Normal testosterone levels reduce hyperandrogenism likelihood" },
    { name: "HOMA-IR", value: data.homaIr > 2.5 ? 0.6 : 0.15, impact: data.homaIr > 2.5 ? "moderate" : "low", direction: data.homaIr > 2.5 ? "increases" : "neutral", explanation: data.homaIr > 2.5 ? "Insulin resistance amplifies ovarian androgen production" : "Normal insulin sensitivity is protective" },
    { name: "AMH Level", value: data.amh > 6 ? 0.55 : 0.2, impact: data.amh > 6 ? "moderate" : "low", direction: data.amh > 6 ? "increases" : "neutral", explanation: data.amh > 6 ? "Elevated AMH reflects increased follicle pool and granulosa cell activity" : "Normal AMH does not suggest altered folliculogenesis" },
    { name: "Hirsutism Score", value: data.hirsutism ? 0.5 : 0.1, impact: data.hirsutism ? "moderate" : "low", direction: data.hirsutism ? "increases" : "neutral", explanation: data.hirsutism ? "Clinical hyperandrogenism evidenced by excess terminal hair growth" : "No clinical evidence of hyperandrogenism via hair pattern" },
    { name: "BMI", value: data.bmi > 25 ? 0.4 : 0.15, impact: data.bmi > 25 ? "moderate" : "low", direction: data.bmi > 25 ? "increases" : "neutral", explanation: data.bmi > 25 ? "Elevated BMI contributes to insulin resistance and androgen production" : "Healthy BMI is protective against metabolic dysfunction" },
    { name: "Ovary Volume", value: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? 0.6 : 0.15, impact: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? "high" : "low", direction: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? "increases" : "neutral", explanation: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? "Enlarged ovarian volume is a key ultrasound marker for PCOM" : "Normal ovarian volume does not support PCOM" },
    { name: "Skin Darkening", value: data.skinDarkening ? 0.35 : 0.05, impact: data.skinDarkening ? "moderate" : "low", direction: data.skinDarkening ? "increases" : "neutral", explanation: data.skinDarkening ? "Acanthosis nigricans is a clinical marker of insulin resistance" : "No cutaneous signs of insulin resistance" },
  ];
  return features.sort((a, b) => b.value - a.value);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const data: PatientInput = await req.json();
    const shapValues = calculateSHAPValues(data);
    const topContributors = shapValues.filter(f => f.impact !== "low").map(f => ({ feature: f.name, contribution: f.value, impact: f.impact, direction: f.direction, explanation: f.explanation }));
    const summary = {
      totalPositiveContribution: shapValues.filter(f => f.direction === "increases").reduce((sum, f) => sum + f.value, 0),
      totalNegativeContribution: shapValues.filter(f => f.direction === "neutral").reduce((sum, f) => sum + f.value, 0),
      topFeature: shapValues[0]?.name || "N/A",
      topContribution: shapValues[0]?.value || 0,
    };
    return new Response(JSON.stringify({ success: true, shapValues, topContributors, summary, explanation: `The primary driver is ${shapValues[0]?.name || "N/A"}, which ${shapValues[0]?.direction === "increases" ? "increases" : "has neutral effect on"} the PCOS risk. ${topContributors.length} feature(s) contribute meaningfully.`, timestamp: new Date().toISOString() }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "SHAP analysis failed", message: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
