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

// ---------------------------------------------------------------------------
// ROTTERDAM CRITERIA CLINICAL RULES ENGINE (shared with /predict)
// See /predict for full clinical reasoning comments on each criterion.
// ---------------------------------------------------------------------------

interface CriterionEvidence {
  met: boolean;
  subcriteria: { name: string; met: boolean; detail: string }[];
  reasoning: string;
}

interface RotterdamEvaluation {
  hyperandrogenism: CriterionEvidence;
  ovulatoryDysfunction: CriterionEvidence;
  polycysticOvaries: CriterionEvidence;
  criteriaMetCount: number;
  diagnosisMet: boolean;
  exclusionNotes: string[];
}

function evaluateHyperandrogenism(data: PatientInput): CriterionEvidence {
  const subcriteria: { name: string; met: boolean; detail: string }[] = [];
  const clinicalHirsutism = data.hirsutism && data.hirsutismScore >= 8;
  subcriteria.push({ name: "Clinical hirsutism", met: clinicalHirsutism, detail: clinicalHirsutism ? `FG score ${data.hirsutismScore} (>=8)` : `FG score ${data.hirsutismScore} or absent` });
  subcriteria.push({ name: "Androgenic acne", met: data.acne, detail: data.acne ? `Present (severity: ${data.acneSeverity || "unspecified"})` : "Not present" });
  subcriteria.push({ name: "Androgenic alopecia", met: data.hairLoss, detail: data.hairLoss ? "Present" : "Not present" });
  const elevatedTotalT = data.totalTestosterone > 50;
  subcriteria.push({ name: "Elevated total testosterone", met: elevatedTotalT, detail: `${data.totalTestosterone} ng/dL (threshold >50)` });
  const elevatedFreeT = data.freeTestosterone > 3;
  subcriteria.push({ name: "Elevated free testosterone", met: elevatedFreeT, detail: `${data.freeTestosterone} pg/mL (threshold >3)` });
  const elevatedDHEAS = data.dheas > 350;
  subcriteria.push({ name: "Elevated DHEAS", met: elevatedDHEAS, detail: `${data.dheas} mcg/dL (threshold >350)` });
  const met = clinicalHirsutism || data.acne || data.hairLoss || elevatedTotalT || elevatedFreeT;
  const metLabels = subcriteria.filter(s => s.met).map(s => s.name);
  return { met, subcriteria, reasoning: met ? `Hyperandrogenism MET via: ${metLabels.join(", ")}` : "Hyperandrogenism NOT MET — no clinical or biochemical evidence" };
}

function evaluateOvulatoryDysfunction(data: PatientInput): CriterionEvidence {
  const subcriteria: { name: string; met: boolean; detail: string }[] = [];
  const oligomenorrhea = data.cycleLength > 35;
  subcriteria.push({ name: "Oligomenorrhea (cycle >35 days)", met: oligomenorrhea, detail: `Cycle length ${data.cycleLength} days` });
  subcriteria.push({ name: "Self-reported irregular periods", met: data.irregularPeriods, detail: data.irregularPeriods ? "Reported irregular" : "Reported regular" });
  const highVariability = data.cycleLengthVariability === "high" || data.cycleLengthVariability === "very-high";
  subcriteria.push({ name: "Cycle variability >21 days", met: highVariability, detail: `Variability: ${data.cycleLengthVariability || "normal"}` });
  const met = oligomenorrhea || data.irregularPeriods || highVariability;
  const metLabels = subcriteria.filter(s => s.met).map(s => s.name);
  return { met, subcriteria, reasoning: met ? `Ovulatory dysfunction MET via: ${metLabels.join(", ")}` : "Ovulatory dysfunction NOT MET — cycles appear regular" };
}

function evaluatePolycysticOvaries(data: PatientInput): CriterionEvidence {
  const subcriteria: { name: string; met: boolean; detail: string }[] = [];
  const leftFollicles = data.follicleCountLeft >= 12;
  const rightFollicles = data.follicleCountRight >= 12;
  subcriteria.push({ name: "Follicle count >=12 per ovary", met: leftFollicles || rightFollicles, detail: `L:${data.follicleCountLeft} R:${data.follicleCountRight}` });
  const leftVolume = data.ovaryVolumeLeft > 10;
  const rightVolume = data.ovaryVolumeRight > 10;
  subcriteria.push({ name: "Ovarian volume >10 mL", met: leftVolume || rightVolume, detail: `L:${data.ovaryVolumeLeft} R:${data.ovaryVolumeRight} mL` });
  subcriteria.push({ name: "Sonographer-reported PCOM", met: data.polycysticAppearance, detail: data.polycysticAppearance ? "Reported" : "Not reported" });
  const met = leftFollicles || rightFollicles || leftVolume || rightVolume || data.polycysticAppearance;
  const metLabels = subcriteria.filter(s => s.met).map(s => s.name);
  return { met, subcriteria, reasoning: met ? `Polycystic ovaries MET via: ${metLabels.join(", ")}` : "Polycystic ovaries NOT MET — normal morphology" };
}

function checkExclusionaryConditions(data: PatientInput): string[] {
  const notes: string[] = [];
  if (data.tsh > 4.5) notes.push(`Elevated TSH (${data.tsh} mIU/L) — exclude thyroid dysfunction before PCOS diagnosis`);
  if (data.prolactin > 25) notes.push(`Elevated prolactin (${data.prolactin} ng/mL) — exclude hyperprolactinemia`);
  if (data.totalTestosterone > 150) notes.push(`Markedly elevated testosterone (${data.totalTestosterone} ng/dL) — exclude androgen-secreting neoplasm`);
  if (data.dheas > 700) notes.push(`Markedly elevated DHEAS (${data.dheas} mcg/dL) — exclude adrenal tumor/Cushing`);
  if (notes.length === 0) notes.push("No exclusionary conditions identified from available data.");
  return notes;
}

function evaluateRotterdamCriteria(data: PatientInput): RotterdamEvaluation {
  const hyperandrogenism = evaluateHyperandrogenism(data);
  const ovulatoryDysfunction = evaluateOvulatoryDysfunction(data);
  const polycysticOvaries = evaluatePolycysticOvaries(data);
  const exclusionNotes = checkExclusionaryConditions(data);
  const criteriaMetCount = [hyperandrogenism.met, ovulatoryDysfunction.met, polycysticOvaries.met].filter(Boolean).length;
  return { hyperandrogenism, ovulatoryDysfunction, polycysticOvaries, criteriaMetCount, diagnosisMet: criteriaMetCount >= 2, exclusionNotes };
}

// ---------------------------------------------------------------------------
// SHAP-style explainability with clinical context
//
// Each feature is mapped to its SHAP contribution value and paired with:
//   - clinicalContext: why this feature matters in PCOS pathophysiology
//   - referenceRange: normal values for clinical interpretation
//   - patientValue: the patient's actual measurement
//   - rotterdamLink: which Rotterdam criterion (if any) this feature supports
// ---------------------------------------------------------------------------
interface SHAPFeature {
  name: string;
  value: number;
  impact: "high" | "moderate" | "low";
  direction: "increases" | "decreases" | "neutral";
  explanation: string;
  clinicalContext: string;
  referenceRange: string;
  patientValue: string;
  rotterdamLink: string;
}

function calculateExplainValues(data: PatientInput, rotterdam: RotterdamEvaluation): SHAPFeature[] {
  const features: SHAPFeature[] = [
    {
      name: "Cycle Length",
      value: data.cycleLength > 35 ? 0.85 : data.cycleLength > 30 ? 0.4 : 0.15,
      impact: data.cycleLength > 35 ? "high" : data.cycleLength > 30 ? "moderate" : "low",
      direction: data.cycleLength > 35 ? "increases" : "neutral",
      explanation: data.cycleLength > 35 ? "Prolonged cycles (>35 days) strongly indicate oligomenorrhea, a key Rotterdam criterion" : "Normal cycle length (21-35 days) reduces PCOS likelihood",
      clinicalContext: "Oligomenorrhea is one of the three Rotterdam criteria. Cycles >35 days or <8 cycles/year indicate oligo/anovulation.",
      referenceRange: "21-35 days",
      patientValue: `${data.cycleLength} days`,
      rotterdamLink: "Ovulatory dysfunction",
    },
    {
      name: "Follicle Count",
      value: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? 0.75 : 0.2,
      impact: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? "high" : "low",
      direction: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? "increases" : "neutral",
      explanation: (data.follicleCountLeft + data.follicleCountRight) / 2 >= 12 ? "High follicle count per ovary (>=12) directly indicates polycystic morphology" : "Normal follicle count does not support PCOM criterion",
      clinicalContext: "PCOM is defined as >=12 follicles per ovary (2-9mm) or ovarian volume >10mL on ultrasound.",
      referenceRange: "<12 per ovary",
      patientValue: `L:${data.follicleCountLeft} R:${data.follicleCountRight}`,
      rotterdamLink: "Polycystic ovaries",
    },
    {
      name: "LH:FSH Ratio",
      value: data.lhFshRatio > 2 ? 0.7 : data.lhFshRatio > 1.5 ? 0.35 : 0.15,
      impact: data.lhFshRatio > 2 ? "high" : data.lhFshRatio > 1.5 ? "moderate" : "low",
      direction: data.lhFshRatio > 2 ? "increases" : "neutral",
      explanation: data.lhFshRatio > 2 ? "Elevated LH:FSH ratio (>2:1) suggests pituitary-ovarian axis dysregulation" : "Normal LH:FSH ratio does not support hormonal imbalance",
      clinicalContext: "While not a diagnostic criterion, elevated LH:FSH ratio is a supportive finding reflecting GnRH pulse frequency increase.",
      referenceRange: "0.5-2.0",
      patientValue: `${data.lhFshRatio.toFixed(1)}`,
      rotterdamLink: "Supporting marker (not a Rotterdam criterion)",
    },
    {
      name: "Total Testosterone",
      value: data.totalTestosterone > 50 ? 0.65 : data.totalTestosterone > 35 ? 0.3 : 0.1,
      impact: data.totalTestosterone > 50 ? "high" : data.totalTestosterone > 35 ? "moderate" : "low",
      direction: data.totalTestosterone > 50 ? "increases" : "neutral",
      explanation: data.totalTestosterone > 50 ? "Biochemical hyperandrogenism (>50 ng/dL) is a core Rotterdam criterion" : "Normal testosterone levels reduce hyperandrogenism likelihood",
      clinicalContext: "Biochemical hyperandrogenism is one of the three Rotterdam criteria. Requires follicular-phase morning draw.",
      referenceRange: "14-53 ng/dL",
      patientValue: `${data.totalTestosterone} ng/dL`,
      rotterdamLink: "Hyperandrogenism",
    },
    {
      name: "HOMA-IR",
      value: data.homaIr > 2.5 ? 0.6 : data.homaIr > 1.8 ? 0.3 : 0.1,
      impact: data.homaIr > 2.5 ? "moderate" : "low",
      direction: data.homaIr > 2.5 ? "increases" : "neutral",
      explanation: data.homaIr > 2.5 ? "Insulin resistance (HOMA-IR >2.5) amplifies ovarian androgen production" : "Normal insulin sensitivity is protective",
      clinicalContext: "Insulin resistance is not a diagnostic criterion but is a key pathophysiological feature affecting 70% of PCOS patients.",
      referenceRange: "<2.5",
      patientValue: `${data.homaIr.toFixed(1)}`,
      rotterdamLink: "Supporting marker (not a Rotterdam criterion)",
    },
    {
      name: "AMH Level",
      value: data.amh > 6 ? 0.55 : data.amh > 4 ? 0.3 : 0.1,
      impact: data.amh > 6 ? "moderate" : "low",
      direction: data.amh > 6 ? "increases" : "neutral",
      explanation: data.amh > 6 ? "Elevated AMH (>6 ng/mL) reflects increased follicle pool, supporting PCOM" : "Normal AMH does not suggest altered folliculogenesis",
      clinicalContext: "AMH correlates with follicle count and PCOM severity. Levels >6 ng/mL are strongly associated with PCOS.",
      referenceRange: "1.0-5.0 ng/mL",
      patientValue: `${data.amh} ng/mL`,
      rotterdamLink: "Supports polycystic ovaries criterion",
    },
    {
      name: "Hirsutism",
      value: data.hirsutism && data.hirsutismScore >= 8 ? 0.5 : data.hirsutism ? 0.3 : 0.05,
      impact: data.hirsutism && data.hirsutismScore >= 8 ? "moderate" : data.hirsutism ? "low" : "low",
      direction: data.hirsutism ? "increases" : "neutral",
      explanation: data.hirsutism ? "Clinical hyperandrogenism evidenced by excess terminal hair growth" : "No clinical evidence of hyperandrogenism via hair pattern",
      clinicalContext: "Clinical hyperandrogenism is a Rotterdam criterion. Modified FG score >=8 indicates hirsutism.",
      referenceRange: "FG score <8",
      patientValue: data.hirsutism ? `FG: ${data.hirsutismScore}` : "None",
      rotterdamLink: "Hyperandrogenism",
    },
    {
      name: "BMI",
      value: data.bmi > 30 ? 0.45 : data.bmi > 25 ? 0.3 : 0.1,
      impact: data.bmi > 30 ? "moderate" : data.bmi > 25 ? "low" : "low",
      direction: data.bmi > 25 ? "increases" : "neutral",
      explanation: data.bmi > 30 ? "Obesity (BMI >30) significantly contributes to insulin resistance and androgen production" : "Healthy BMI is protective",
      clinicalContext: "BMI affects PCOS severity and treatment response. 50% of PCOS patients are overweight/obese.",
      referenceRange: "18.5-24.9",
      patientValue: `${data.bmi.toFixed(1)}`,
      rotterdamLink: "Supporting marker (not a Rotterdam criterion)",
    },
    {
      name: "Ovary Volume",
      value: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? 0.6 : 0.1,
      impact: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? "high" : "low",
      direction: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? "increases" : "neutral",
      explanation: data.ovaryVolumeLeft > 10 || data.ovaryVolumeRight > 10 ? "Enlarged ovarian volume (>10 mL) is a key ultrasound marker for PCOM" : "Normal ovarian volume does not support PCOM",
      clinicalContext: "Ovarian volume >10 mL is an alternative PCOM criterion when follicle count is borderline.",
      referenceRange: "<10 mL",
      patientValue: `L:${data.ovaryVolumeLeft} R:${data.ovaryVolumeRight} mL`,
      rotterdamLink: "Polycystic ovaries",
    },
    {
      name: "Skin Darkening",
      value: data.skinDarkening ? 0.35 : 0.05,
      impact: data.skinDarkening ? "moderate" : "low",
      direction: data.skinDarkening ? "increases" : "neutral",
      explanation: data.skinDarkening ? "Acanthosis nigricans is a clinical marker of insulin resistance" : "No cutaneous signs of insulin resistance",
      clinicalContext: "Acanthosis nigricans indicates hyperinsulinemia, found in 30-50% of PCOS patients.",
      referenceRange: "Absent",
      patientValue: data.skinDarkening ? "Present" : "Absent",
      rotterdamLink: "Supporting marker (not a Rotterdam criterion)",
    },
    {
      name: "DHEAS",
      value: data.dheas > 350 ? 0.4 : 0.1,
      impact: data.dheas > 350 ? "moderate" : "low",
      direction: data.dheas > 350 ? "increases" : "neutral",
      explanation: data.dheas > 350 ? "Elevated DHEAS indicates adrenal androgen excess" : "Normal DHEAS",
      clinicalContext: "Adrenal androgen excess differentiates some PCOS subtypes. DHEAS >350 mcg/dL is considered elevated.",
      referenceRange: "65-340 mcg/dL",
      patientValue: `${data.dheas} mcg/dL`,
      rotterdamLink: "Supports hyperandrogenism criterion",
    },
    {
      name: "Prolactin",
      value: data.prolactin > 25 ? 0.25 : 0.05,
      impact: data.prolactin > 25 ? "moderate" : "low",
      direction: data.prolactin > 25 ? "increases" : "neutral",
      explanation: data.prolactin > 25 ? "Mildly elevated prolactin can co-occur with PCOS; marked elevation requires exclusion" : "Normal prolactin",
      clinicalContext: "Mild prolactin elevation occurs in 10-15% of PCOS patients. Marked elevation requires pituitary evaluation.",
      referenceRange: "2-25 ng/mL",
      patientValue: `${data.prolactin} ng/mL`,
      rotterdamLink: "Exclusionary condition check",
    },
  ];

  return features.sort((a, b) => b.value - a.value);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const data: PatientInput = await req.json();

    // Run the Rotterdam rules engine
    const rotterdam = evaluateRotterdamCriteria(data);

    // Generate SHAP-style explanations linked to Rotterdam criteria
    const shapValues = calculateExplainValues(data, rotterdam);
    const topContributors = shapValues.filter(f => f.impact !== "low");

    const positiveContribution = shapValues.filter(f => f.direction === "increases").reduce((sum, f) => sum + f.value, 0);
    const neutralContribution = shapValues.filter(f => f.direction === "neutral").reduce((sum, f) => sum + f.value, 0);

    const summary = {
      totalPositiveContribution: positiveContribution,
      totalNegativeContribution: 0,
      totalNeutralContribution: neutralContribution,
      topFeature: shapValues[0]?.name || "N/A",
      topContribution: shapValues[0]?.value || 0,
      rotterdamCriteriaMet: rotterdam.criteriaMetCount,
      rotterdamDiagnosis: rotterdam.diagnosisMet,
    };

    // Build narrative linking SHAP findings to Rotterdam criteria
    const rotterdamCriteriaNames = [
      rotterdam.hyperandrogenism.met && "hyperandrogenism",
      rotterdam.ovulatoryDysfunction.met && "ovulatory dysfunction",
      rotterdam.polycysticOvaries.met && "polycystic ovaries",
    ].filter(Boolean);

    const narrative = rotterdam.diagnosisMet
      ? `The primary risk driver is ${shapValues[0]?.name || "N/A"}, which ${shapValues[0]?.direction === "increases" ? "increases" : "has neutral effect on"} PCOS risk. ${topContributors.length} feature(s) contribute meaningfully. Rotterdam criteria: ${rotterdam.criteriaMetCount}/3 met (${rotterdamCriteriaNames.join(", ")}), supporting a PCOS diagnosis. ${rotterdam.exclusionNotes[0]}`
      : `The primary feature is ${shapValues[0]?.name || "N/A"} with ${shapValues[0]?.direction === "increases" ? "increasing" : "neutral"} effect on risk. Only ${rotterdam.criteriaMetCount}/3 Rotterdam criteria met (${rotterdamCriteriaNames.join(", ") || "none"}), which does not support PCOS diagnosis (requires >=2). ${rotterdam.exclusionNotes[0]}`;

    return new Response(
      JSON.stringify({
        success: true,
        shapValues: shapValues.map(({ clinicalContext, referenceRange, patientValue, rotterdamLink, ...rest }) => rest),
        topContributors: topContributors.map(({ clinicalContext, referenceRange, patientValue, rotterdamLink, ...rest }) => rest),
        clinicalDetails: shapValues.map(({ name, clinicalContext, referenceRange, patientValue, rotterdamLink }) => ({
          feature: name,
          clinicalContext,
          referenceRange,
          patientValue,
          rotterdamLink,
        })),
        rotterdamEvaluation: {
          hyperandrogenism: {
            met: rotterdam.hyperandrogenism.met,
            reasoning: rotterdam.hyperandrogenism.reasoning,
            subcriteria: rotterdam.hyperandrogenism.subcriteria,
          },
          ovulatoryDysfunction: {
            met: rotterdam.ovulatoryDysfunction.met,
            reasoning: rotterdam.ovulatoryDysfunction.reasoning,
            subcriteria: rotterdam.ovulatoryDysfunction.subcriteria,
          },
          polycysticOvaries: {
            met: rotterdam.polycysticOvaries.met,
            reasoning: rotterdam.polycysticOvaries.reasoning,
            subcriteria: rotterdam.polycysticOvaries.subcriteria,
          },
          criteriaMetCount: rotterdam.criteriaMetCount,
          diagnosisMet: rotterdam.diagnosisMet,
          exclusionNotes: rotterdam.exclusionNotes,
        },
        summary,
        explanation: narrative,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: "Explanation analysis failed", message: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
