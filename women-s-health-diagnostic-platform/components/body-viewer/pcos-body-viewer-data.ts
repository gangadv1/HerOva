import type { SymptomHotspot } from "./interactive-body-viewer"

export interface SymptomData {
  id: string
  name: string
  region: string
  description: string
  severity: "mild" | "moderate" | "severe"
  symptoms: string[]
}

export const patientSymptomData: SymptomData[] = [
  {
    id: "scalp",
    name: "Scalp & Hair",
    region: "head",
    description: "Androgenic alopecia - Hair thinning at the crown and temples due to elevated DHT levels. Pattern consistent with hyperandrogenism.",
    severity: "moderate",
    symptoms: ["Diffuse hair thinning", "Receding hairline", "Increased shedding", "Oily scalp"],
  },
  {
    id: "face-acne",
    name: "Facial Acne",
    region: "face",
    description: "Hormonal acne concentrated along the jawline and chin - classic pattern associated with elevated androgens in PCOS.",
    severity: "moderate",
    symptoms: ["Cystic acne", "Inflammatory lesions", "Jawline breakouts", "Chin acne"],
  },
  {
    id: "hirsutism",
    name: "Hirsutism",
    region: "face",
    description: "Excess terminal hair growth in androgen-dependent areas. Ferriman-Gallwey score indicates moderate hirsutism.",
    severity: "mild",
    symptoms: ["Upper lip hair", "Chin hair", "Sideburn area", "Chest hair"],
  },
  {
    id: "thyroid",
    name: "Thyroid",
    region: "neck",
    description: "TSH levels within normal range but monitoring recommended. Thyroid dysfunction commonly co-occurs with PCOS.",
    severity: "mild",
    symptoms: ["Fatigue", "Cold intolerance", "Dry skin"],
  },
  {
    id: "abdomen",
    name: "Central Adiposity",
    region: "abdomen",
    description: "Visceral fat accumulation indicative of insulin resistance. Waist-to-hip ratio elevated. Key metabolic marker for PCOS.",
    severity: "moderate",
    symptoms: ["Abdominal weight gain", "Bloating", "Difficulty losing weight", "Insulin resistance markers"],
  },
  {
    id: "ovary-left",
    name: "Left Ovary",
    region: "reproductive",
    description: "Polycystic morphology confirmed via ultrasound. Volume: 12.3 mL. Antral follicle count: 14. Multiple peripheral follicles in 'string of pearls' pattern.",
    severity: "severe",
    symptoms: ["Multiple small follicles (2-9mm)", "Enlarged ovarian volume", "Peripheral follicle distribution", "Increased stromal echogenicity"],
  },
  {
    id: "ovary-right",
    name: "Right Ovary",
    region: "reproductive",
    description: "Polycystic morphology confirmed via ultrasound. Volume: 11.8 mL. Antral follicle count: 12. Evidence of anovulation.",
    severity: "severe",
    symptoms: ["Multiple small follicles (2-9mm)", "Enlarged ovarian volume", "Absent dominant follicle", "Thickened ovarian capsule"],
  },
  {
    id: "uterus",
    name: "Uterus",
    region: "reproductive",
    description: "Endometrial thickness: 8mm. Some irregularity noted. Prolonged anovulation may lead to endometrial hyperplasia - monitoring recommended.",
    severity: "moderate",
    symptoms: ["Irregular periods", "Heavy menstrual bleeding", "Prolonged cycles", "Amenorrhea episodes"],
  },
  {
    id: "pelvic",
    name: "Pelvic Region",
    region: "pelvis",
    description: "Chronic pelvic discomfort reported. May be related to ovarian enlargement or concurrent endometriosis.",
    severity: "mild",
    symptoms: ["Dull pelvic ache", "Discomfort during ovulation", "Lower back pain"],
  },
  {
    id: "skin-tags",
    name: "Acanthosis Nigricans",
    region: "neck-skin",
    description: "Darkened, velvety skin patches in neck folds and underarms - classic sign of insulin resistance and hyperinsulinemia.",
    severity: "moderate",
    symptoms: ["Dark skin patches", "Velvety texture", "Neck folds affected", "Axillary involvement"],
  },
]

const bodyViewerCoordinates: Record<string, Pick<SymptomHotspot, "x" | "y" | "zoomArea" | "region">> = {
  scalp: { x: 200, y: 45, region: "scalp", zoomArea: { x: 200, y: 80, scale: 3 } },
  "face-acne": { x: 200, y: 95, region: "face", zoomArea: { x: 200, y: 100, scale: 3.5 } },
  hirsutism: { x: 190, y: 105, region: "face", zoomArea: { x: 190, y: 105, scale: 3.5 } },
  thyroid: { x: 200, y: 155, region: "neck", zoomArea: { x: 200, y: 160, scale: 3 } },
  abdomen: { x: 200, y: 320, region: "abdomen", zoomArea: { x: 200, y: 320, scale: 2.5 } },
  "ovary-left": { x: 160, y: 390, region: "reproductive", zoomArea: { x: 170, y: 400, scale: 3.5 } },
  "ovary-right": { x: 240, y: 390, region: "reproductive", zoomArea: { x: 230, y: 400, scale: 3.5 } },
  uterus: { x: 200, y: 420, region: "reproductive", zoomArea: { x: 200, y: 420, scale: 3.2 } },
  pelvic: { x: 200, y: 455, region: "pelvis", zoomArea: { x: 200, y: 455, scale: 2.8 } },
  "skin-tags": { x: 220, y: 165, region: "neck", zoomArea: { x: 220, y: 165, scale: 3 } },
}

export const bodyViewerSymptoms: SymptomHotspot[] = patientSymptomData.map((symptom) => {
  const coordinates = bodyViewerCoordinates[symptom.id]

  return {
    id: symptom.id,
    name: symptom.name,
    region: coordinates.region,
    x: coordinates.x,
    y: coordinates.y,
    severity: symptom.severity,
    description: symptom.description,
    relatedSymptoms: symptom.symptoms,
    zoomArea: coordinates.zoomArea,
  }
})

export function buildSymptomsForPatient(patientData?: any, analysis?: any): SymptomHotspot[] {
  return patientSymptomData.map((symptom) => {
    const coordinates = bodyViewerCoordinates[symptom.id]

    // Clone base values
    let severity = symptom.severity
    let description = symptom.description

    if (patientData) {
      // Adjust severity and description heuristically based on patient inputs
      if (symptom.id === "hirsutism" && patientData.hirsutism) severity = patientData.hirsutism === true ? "moderate" : severity
      if (symptom.id === "face-acne" && patientData.acne) severity = "moderate"
      if (symptom.id === "scalp" && (patientData.hairLoss || patientData.hair_loss)) severity = "moderate"
      if (symptom.id === "thyroid" && patientData.tsh && patientData.tsh > 4) severity = "moderate"
      if (symptom.id === "abdomen" && patientData.bmi && patientData.bmi > 30) severity = "moderate"
      if ((symptom.id === "ovary-left" || symptom.id === "ovary-right") && (patientData.follicleCountLeft >= 12 || patientData.follicleCountRight >= 12 || patientData.polycysticAppearance)) severity = "severe"
      if (symptom.id === "uterus" && (patientData.irregularPeriods || patientData.cycleLength > 35)) severity = "moderate"

      // Tailor description with simple patient facts
      const extras: string[] = []
      if (patientData.age) extras.push(`Age ${patientData.age}`)
      if (patientData.bmi) extras.push(`BMI ${patientData.bmi}`)
      if (patientData.cycleLength) extras.push(`Cycle ${patientData.cycleLength}d`)

      // Include key lab/measurement values when available
      if (patientData.amh) extras.push(`AMH ${patientData.amh}`)
      if (patientData.tsh !== undefined) extras.push(`TSH ${patientData.tsh}`)
      if (patientData.totalTestosterone !== undefined) extras.push(`Tt ${patientData.totalTestosterone}`)
      if (patientData.follicleCountLeft !== undefined || patientData.follicleCountRight !== undefined) {
        extras.push(`Antral follicles L:${patientData.follicleCountLeft ?? "-"} R:${patientData.follicleCountRight ?? "-"}`)
      }

      if (extras.length) description = `${description} (${extras.join(" • ")})`

      // Add more targeted clinical detail from analysis snapshot when present
      if (analysis) {
        const rot = (analysis.rotterdamEvaluation || analysis.rotterdam || {})
        if ((symptom.id === "ovary-left" || symptom.id === "ovary-right") && rot.polycysticOvaries && rot.polycysticOvaries.met) {
          description += " — Ultrasound features support polycystic ovarian morphology in this patient."
        }
        if (symptom.id === "hirsutism" && (analysis.humanReasoning || []).length) {
          description += " — Clinical note: " + (analysis.humanReasoning[0] ?? "androgenic symptoms reported").slice(0, 200)
        }
      }
    }

    return {
      id: symptom.id,
      name: symptom.name,
      region: coordinates.region,
      x: coordinates.x,
      y: coordinates.y,
      severity: severity as "mild" | "moderate" | "severe",
      description,
      relatedSymptoms: symptom.symptoms,
      zoomArea: coordinates.zoomArea,
    }
  })
}