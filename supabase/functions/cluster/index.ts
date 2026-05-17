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
// ROTTERDAM CRITERIA CLINICAL RULES ENGINE (abbreviated — see /predict for
// full clinical reasoning comments on each criterion evaluation)
// ---------------------------------------------------------------------------

interface CriterionEvidence {
  met: boolean;
  subcriteria: { name: string; met: boolean; detail: string }[];
  reasoning: string;
}

function evaluateHyperandrogenism(data: PatientInput): CriterionEvidence {
  const subcriteria: { name: string; met: boolean; detail: string }[] = [];
  const clinicalHirsutism = data.hirsutism && data.hirsutismScore >= 8;
  subcriteria.push({ name: "Clinical hirsutism", met: clinicalHirsutism, detail: clinicalHirsutism ? `FG score ${data.hirsutismScore} (>=8)` : `FG score ${data.hirsutismScore} or absent` });
  subcriteria.push({ name: "Androgenic acne", met: data.acne, detail: data.acne ? "Present" : "Not present" });
  subcriteria.push({ name: "Androgenic alopecia", met: data.hairLoss, detail: data.hairLoss ? "Present" : "Not present" });
  const elevatedTotalT = data.totalTestosterone > 50;
  subcriteria.push({ name: "Elevated total testosterone", met: elevatedTotalT, detail: `${data.totalTestosterone} ng/dL` });
  const elevatedFreeT = data.freeTestosterone > 3;
  subcriteria.push({ name: "Elevated free testosterone", met: elevatedFreeT, detail: `${data.freeTestosterone} pg/mL` });
  const met = clinicalHirsutism || data.acne || data.hairLoss || elevatedTotalT || elevatedFreeT;
  return { met, subcriteria, reasoning: met ? "Hyperandrogenism MET" : "Hyperandrogenism NOT MET" };
}

function evaluateOvulatoryDysfunction(data: PatientInput): CriterionEvidence {
  const subcriteria: { name: string; met: boolean; detail: string }[] = [];
  const oligomenorrhea = data.cycleLength > 35;
  subcriteria.push({ name: "Oligomenorrhea", met: oligomenorrhea, detail: `Cycle ${data.cycleLength} days` });
  subcriteria.push({ name: "Self-reported irregular periods", met: data.irregularPeriods, detail: data.irregularPeriods ? "Irregular" : "Regular" });
  const highVariability = data.cycleLengthVariability === "high" || data.cycleLengthVariability === "very-high";
  subcriteria.push({ name: "Cycle variability >21 days", met: highVariability, detail: data.cycleLengthVariability || "normal" });
  const met = oligomenorrhea || data.irregularPeriods || highVariability;
  return { met, subcriteria, reasoning: met ? "Ovulatory dysfunction MET" : "Ovulatory dysfunction NOT MET" };
}

function evaluatePolycysticOvaries(data: PatientInput): CriterionEvidence {
  const subcriteria: { name: string; met: boolean; detail: string }[] = [];
  const leftFollicles = data.follicleCountLeft >= 12;
  const rightFollicles = data.follicleCountRight >= 12;
  subcriteria.push({ name: "Follicle count >=12", met: leftFollicles || rightFollicles, detail: `L:${data.follicleCountLeft} R:${data.follicleCountRight}` });
  const leftVolume = data.ovaryVolumeLeft > 10;
  const rightVolume = data.ovaryVolumeRight > 10;
  subcriteria.push({ name: "Ovarian volume >10 mL", met: leftVolume || rightVolume, detail: `L:${data.ovaryVolumeLeft} R:${data.ovaryVolumeRight} mL` });
  subcriteria.push({ name: "Sonographer-reported PCOM", met: data.polycysticAppearance, detail: data.polycysticAppearance ? "Reported" : "Not reported" });
  const met = leftFollicles || rightFollicles || leftVolume || rightVolume || data.polycysticAppearance;
  return { met, subcriteria, reasoning: met ? "Polycystic ovaries MET" : "Polycystic ovaries NOT MET" };
}

// ---------------------------------------------------------------------------
// Phenotype clustering
//
// Clusters are derived from the Rotterdam criteria pattern plus metabolic
// markers (insulin resistance, BMI). Each cluster maps to a phenotype:
//   Cluster 0: Classic Metabolic PCOS  -> Type A (HA + OD + PCOM + IR)
//   Cluster 1: Reproductive PCOS       -> Type A without IR (lean phenotype)
//   Cluster 2: Hyperandrogenic-PCO     -> Type C (HA + PCOM, regular cycles)
//   Cluster 3: Normo-androgenic PCOS   -> Type D (OD + PCOM, no HA)
//   Cluster 4: Non-PCOS Control        -> <2/3 Rotterdam criteria
// ---------------------------------------------------------------------------
interface ClusterResult {
  clusterId: number; clusterName: string; description: string;
  centroid: Record<string, number>; patientCount: number;
  characteristics: string[]; riskProfile: string;
  metabolicRisk: "low" | "moderate" | "high";
  phenotypeLink: string;
}

function performClustering(data: PatientInput, ha: boolean, od: boolean, pcom: boolean): ClusterResult[] {
  const hasIR = data.homaIr > 2.5;
  const hasObesity = data.bmi > 25;

  return [
    {
      clusterId: 0,
      clusterName: "Classic Metabolic PCOS",
      description: "Full Rotterdam phenotype with significant metabolic dysfunction. Highest cardiovascular and diabetes risk.",
      centroid: { bmi: 32, homaIr: 4.2, testosterone: 65, cycleLength: 60, follicleCount: 18 },
      patientCount: od && ha && pcom && hasIR ? 1 : 0,
      characteristics: ["Irregular cycles", "Hyperandrogenism", "Polycystic ovaries", "Insulin resistance", "Elevated BMI"],
      riskProfile: "Highest metabolic and cardiovascular risk",
      metabolicRisk: "high",
      phenotypeLink: "Type A (Frank/Classic PCOS) with metabolic syndrome",
    },
    {
      clusterId: 1,
      clusterName: "Reproductive PCOS",
      description: "Primarily reproductive symptoms with moderate metabolic impact. Good response to ovulation induction.",
      centroid: { bmi: 24, homaIr: 2.0, testosterone: 55, cycleLength: 45, follicleCount: 16 },
      patientCount: od && ha && pcom && !hasIR && !hasObesity ? 1 : 0,
      characteristics: ["Irregular cycles", "Hyperandrogenism", "Polycystic ovaries", "Normal insulin sensitivity", "Normal BMI"],
      riskProfile: "Moderate reproductive risk, lower metabolic risk",
      metabolicRisk: "moderate",
      phenotypeLink: "Type A (Frank/Classic PCOS) lean phenotype",
    },
    {
      clusterId: 2,
      clusterName: "Hyperandrogenic-PCO",
      description: "Ovulatory phenotype with androgen excess and PCOM. Often presents with skin/hair symptoms.",
      centroid: { bmi: 26, homaIr: 2.3, testosterone: 58, cycleLength: 30, follicleCount: 14 },
      patientCount: !od && ha && pcom ? 1 : 0,
      characteristics: ["Regular cycles", "Hyperandrogenism", "Polycystic ovaries", "Skin manifestations"],
      riskProfile: "Lower metabolic risk, focus on dermatological symptoms",
      metabolicRisk: "moderate",
      phenotypeLink: "Type C (Ovulatory PCOS)",
    },
    {
      clusterId: 3,
      clusterName: "Normo-androgenic PCOS",
      description: "Mildest phenotype with cycle irregularity and PCOM but without hyperandrogenism.",
      centroid: { bmi: 22, homaIr: 1.8, testosterone: 35, cycleLength: 42, follicleCount: 13 },
      patientCount: od && !ha && pcom ? 1 : 0,
      characteristics: ["Irregular cycles", "Normal androgens", "Polycystic ovaries", "Minimal metabolic impact"],
      riskProfile: "Lowest risk profile among PCOS phenotypes",
      metabolicRisk: "low",
      phenotypeLink: "Type D (Non-Hyperandrogenic PCOS)",
    },
    {
      clusterId: 4,
      clusterName: "Non-PCOS Control",
      description: "Does not meet Rotterdam criteria. May have isolated symptoms but no PCOS diagnosis.",
      centroid: { bmi: 23, homaIr: 1.5, testosterone: 30, cycleLength: 28, follicleCount: 8 },
      patientCount: !od && !ha && !pcom ? 1 : 0,
      characteristics: ["Regular cycles", "Normal androgens", "Normal ovarian morphology"],
      riskProfile: "No PCOS diagnosis indicated",
      metabolicRisk: "low",
      phenotypeLink: "Non-PCOS (<2/3 Rotterdam criteria)",
    },
  ];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const data: PatientInput = await req.json();

    // Evaluate Rotterdam criteria to drive clustering
    const ha = evaluateHyperandrogenism(data).met;
    const od = evaluateOvulatoryDysfunction(data).met;
    const pcom = evaluatePolycysticOvaries(data).met;

    const clusters = performClustering(data, ha, od, pcom);
    const assignedCluster = clusters.find(c => c.patientCount > 0) || clusters[clusters.length - 1];

    return new Response(
      JSON.stringify({
        success: true,
        clusters,
        assignedCluster: {
          id: assignedCluster.clusterId,
          name: assignedCluster.clusterName,
          description: assignedCluster.description,
          characteristics: assignedCluster.characteristics,
          riskProfile: assignedCluster.riskProfile,
          metabolicRisk: assignedCluster.metabolicRisk,
          phenotypeLink: assignedCluster.phenotypeLink,
        },
        clusterVisualization: clusters.map(c => ({
          id: c.clusterId,
          name: c.clusterName,
          patientCount: c.patientCount,
          metabolicRisk: c.metabolicRisk,
          phenotypeLink: c.phenotypeLink,
        })),
        rotterdamCriteria: {
          hyperandrogenism: ha,
          ovulatoryDysfunction: od,
          polycysticOvaries: pcom,
          criteriaMetCount: [ha, od, pcom].filter(Boolean).length,
        },
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: "Clustering failed", message: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
