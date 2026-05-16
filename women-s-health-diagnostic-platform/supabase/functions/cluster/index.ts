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

interface ClusterResult {
  clusterId: number; clusterName: string; description: string;
  centroid: Record<string, number>; patientCount: number;
  characteristics: string[]; riskProfile: string; metabolicRisk: "low" | "moderate" | "high";
}

function performClustering(data: PatientInput): ClusterResult[] {
  const hasOligo = data.irregularPeriods || data.cycleLength > 35;
  const hasHA = data.hirsutism || data.acne || data.totalTestosterone > 50;
  const hasPCOM = data.polycysticAppearance || data.follicleCountLeft >= 12 || data.follicleCountRight >= 12;
  const hasIR = data.homaIr > 2.5;
  const hasObesity = data.bmi > 25;

  return [
    { clusterId: 0, clusterName: "Classic Metabolic PCOS", description: "Full Rotterdam phenotype with significant metabolic dysfunction. Highest cardiovascular and diabetes risk.", centroid: { bmi: 32, homaIr: 4.2, testosterone: 65, cycleLength: 60, follicleCount: 18 }, patientCount: hasOligo && hasHA && hasPCOM && hasIR ? 1 : 0, characteristics: ["Irregular cycles", "Hyperandrogenism", "Polycystic ovaries", "Insulin resistance", "Elevated BMI"], riskProfile: "Highest metabolic and cardiovascular risk", metabolicRisk: "high" },
    { clusterId: 1, clusterName: "Reproductive PCOS", description: "Primarily reproductive symptoms with moderate metabolic impact. Good response to ovulation induction.", centroid: { bmi: 24, homaIr: 2.0, testosterone: 55, cycleLength: 45, follicleCount: 16 }, patientCount: hasOligo && hasHA && hasPCOM && !hasIR && !hasObesity ? 1 : 0, characteristics: ["Irregular cycles", "Hyperandrogenism", "Polycystic ovaries", "Normal insulin sensitivity", "Normal BMI"], riskProfile: "Moderate reproductive risk, lower metabolic risk", metabolicRisk: "moderate" },
    { clusterId: 2, clusterName: "Hyperandrogenic-PCO", description: "Ovulatory phenotype with androgen excess and PCOM. Often presents with skin/hair symptoms.", centroid: { bmi: 26, homaIr: 2.3, testosterone: 58, cycleLength: 30, follicleCount: 14 }, patientCount: !hasOligo && hasHA && hasPCOM ? 1 : 0, characteristics: ["Regular cycles", "Hyperandrogenism", "Polycystic ovaries", "Skin manifestations"], riskProfile: "Lower metabolic risk, focus on dermatological symptoms", metabolicRisk: "moderate" },
    { clusterId: 3, clusterName: "Normo-androgenic PCOS", description: "Mildest phenotype with cycle irregularity and PCOM but without hyperandrogenism.", centroid: { bmi: 22, homaIr: 1.8, testosterone: 35, cycleLength: 42, follicleCount: 13 }, patientCount: hasOligo && !hasHA && hasPCOM ? 1 : 0, characteristics: ["Irregular cycles", "Normal androgens", "Polycystic ovaries", "Minimal metabolic impact"], riskProfile: "Lowest risk profile among PCOS phenotypes", metabolicRisk: "low" },
    { clusterId: 4, clusterName: "Non-PCOS Control", description: "Does not meet Rotterdam criteria. May have isolated symptoms but no PCOS diagnosis.", centroid: { bmi: 23, homaIr: 1.5, testosterone: 30, cycleLength: 28, follicleCount: 8 }, patientCount: !hasOligo && !hasHA && !hasPCOM ? 1 : 0, characteristics: ["Regular cycles", "Normal androgens", "Normal ovarian morphology"], riskProfile: "No PCOS diagnosis indicated", metabolicRisk: "low" },
  ];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const data: PatientInput = await req.json();
    const clusters = performClustering(data);
    const assignedCluster = clusters.find(c => c.patientCount > 0) || clusters[clusters.length - 1];
    return new Response(JSON.stringify({
      success: true,
      clusters,
      assignedCluster: { id: assignedCluster.clusterId, name: assignedCluster.clusterName, description: assignedCluster.description, characteristics: assignedCluster.characteristics, riskProfile: assignedCluster.riskProfile, metabolicRisk: assignedCluster.metabolicRisk },
      clusterVisualization: clusters.map(c => ({ id: c.clusterId, name: c.clusterName, patientCount: c.patientCount, metabolicRisk: c.metabolicRisk })),
      timestamp: new Date().toISOString(),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "Clustering failed", message: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
