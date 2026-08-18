from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone

from backend.clinical_rules import evaluate_rotterdam_criteria

app = FastAPI()

# Allow the frontend dev server to call the API (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# INPUT MODEL
# ============================================================

class PatientData(BaseModel):
    acne: int
    hair_growth: int
    cycle_regular: int
    follicles_left: int
    follicles_right: int


def to_number(value, default=0.0):
    try:
        if value is None:
            return default
        if isinstance(value, bool):
            return float(int(value))
        return float(value)
    except (TypeError, ValueError):
        return default


def to_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value > 0
    if isinstance(value, str):
        normalized = value.strip().lower()
        if not normalized:
            return False
        if normalized in {"y", "yes", "true", "positive", "present", "irregular", "i"}:
            return True
        try:
            return float(normalized) > 0
        except ValueError:
            return False
    return False


def build_rotterdam_input(data: dict) -> dict:
    cycle_length = to_number(data.get("cycleLength"))
    irregular_periods = to_bool(data.get("irregularPeriods"))
    cycle_length_variability = str(data.get("cycleLengthVariability", "")).strip().lower()

    return {
        "acne": 1 if to_bool(data.get("acne")) or to_bool(data.get("acneSeverity")) else 0,
        "hair_growth": 1 if to_bool(data.get("hirsutism")) or to_number(data.get("hirsutismScore")) >= 8 else 0,
        "cycle_regular": 0 if irregular_periods or cycle_length >= 35 or cycle_length_variability in {"irregular", "high", "moderate"} else 1,
        "follicles_left": int(to_number(data.get("follicleCountLeft"))),
        "follicles_right": int(to_number(data.get("follicleCountRight"))),
        "polycysticAppearance": to_bool(data.get("polycysticAppearance")),
        "ovaryVolumeLeft": to_number(data.get("ovaryVolumeLeft")),
        "ovaryVolumeRight": to_number(data.get("ovaryVolumeRight")),
        "totalTestosterone": to_number(data.get("totalTestosterone")),
        "freeTestosterone": to_number(data.get("freeTestosterone")),
        "hirsutismScore": to_number(data.get("hirsutismScore")),
        "hairLoss": to_bool(data.get("hairLoss")),
        "skinDarkening": to_bool(data.get("skinDarkening")),
        "cycleLength": cycle_length,
        "irregularPeriods": irregular_periods,
        "amh": to_number(data.get("amh")),
        "lhFshRatio": to_number(data.get("lhFshRatio")),
        "fastingGlucose": to_number(data.get("fastingGlucose")),
        "insulinLevel": to_number(data.get("insulinLevel")),
        "homaIr": to_number(data.get("homaIr")),
        "bmi": to_number(data.get("bmi")),
        "waistHipRatio": to_number(data.get("waistHipRatio")),
        "bloodPressureSystolic": to_number(data.get("bloodPressureSystolic")),
        "bloodPressureDiastolic": to_number(data.get("bloodPressureDiastolic")),
        "prolactin": to_number(data.get("prolactin")),
        "tsh": to_number(data.get("tsh")),
        "age": to_number(data.get("age")),
    }


def calculate_risk_score(data: dict, rotterdam_results: dict) -> tuple[int, list[str]]:
    score = 0
    factors: list[str] = []

    criteria = set(rotterdam_results.get("criteria_met", []))
    if "Ovulatory Dysfunction" in criteria:
        score += 22
        factors.append("Ovulatory dysfunction")
    if "Hyperandrogenism" in criteria:
        score += 20
        factors.append("Hyperandrogenism")
    if "Polycystic Ovaries" in criteria:
        score += 22
        factors.append("Polycystic ovarian morphology")

    cycle_length = to_number(data.get("cycleLength"))
    if to_bool(data.get("irregularPeriods")) or cycle_length >= 35:
        score += 10
        factors.append("Irregular or prolonged cycles")

    if to_bool(data.get("hirsutism")) or to_bool(data.get("acne")) or to_bool(data.get("hairLoss")) or to_bool(data.get("skinDarkening")):
        score += 10
        factors.append("Clinical hyperandrogenism")

    amh = to_number(data.get("amh"))
    if amh >= 4:
        score += 8
        factors.append("Elevated AMH")

    lh_fsh_ratio = to_number(data.get("lhFshRatio"))
    if lh_fsh_ratio >= 2:
        score += 6
        factors.append("Elevated LH:FSH ratio")

    follicles_left = to_number(data.get("follicleCountLeft"))
    follicles_right = to_number(data.get("follicleCountRight"))
    if follicles_left >= 12 or follicles_right >= 12 or to_bool(data.get("polycysticAppearance")):
        score += 12
        factors.append("Polycystic ovarian morphology")

    bmi = to_number(data.get("bmi"))
    if bmi >= 25:
        score += 6
        factors.append("Elevated BMI")

    fasting_glucose = to_number(data.get("fastingGlucose"))
    insulin_level = to_number(data.get("insulinLevel"))
    homa_ir = to_number(data.get("homaIr"))
    if fasting_glucose >= 110 or insulin_level >= 15 or homa_ir >= 2.5:
        score += 6
        factors.append("Metabolic insulin resistance signal")

    if to_number(data.get("prolactin")) > 25 or to_number(data.get("tsh")) > 4.5:
        score += 4
        factors.append("Hormonal imbalance signal")

    return min(score, 100), factors


def build_shap_values(factors: list[str], score: int) -> list[dict]:
    weights = {
        "Ovulatory dysfunction": 0.22,
        "Hyperandrogenism": 0.20,
        "Polycystic ovarian morphology": 0.22,
        "Irregular or prolonged cycles": 0.10,
        "Clinical hyperandrogenism": 0.10,
        "Elevated AMH": 0.08,
        "Elevated LH:FSH ratio": 0.06,
        "Elevated BMI": 0.06,
        "Metabolic insulin resistance signal": 0.06,
        "Hormonal imbalance signal": 0.04,
    }

    values = []
    for factor in factors:
        impact = "high" if weights.get(factor, 0) >= 0.2 else "moderate" if weights.get(factor, 0) >= 0.08 else "low"
        values.append(
            {
                "name": factor,
                "value": weights.get(factor, 0.05),
                "impact": impact,
                "direction": "positive",
                "explanation": f"{factor} increases the single-patient PCOS risk estimate.",
            }
        )

    if not values:
        values.append(
            {
                "name": "No strong signals",
                "value": 0.05,
                "impact": "low",
                "direction": "neutral",
                "explanation": "No dominant PCOS drivers were detected from the available inputs.",
            }
        )

    top_contributors = [
        {
            "feature": item["name"],
            "contribution": item["value"],
            "impact": item["impact"],
            "direction": item["direction"],
            "explanation": item["explanation"],
        }
        for item in values[:5]
    ]

    return values, top_contributors


def human_readable_reasoning(top_contributors: list[dict]) -> list[str]:
    """Convert top SHAP-like contributors into short, clinical sentences."""
    sentences = []
    for item in top_contributors:
        name = item.get("feature") or item.get("feature", item.get("feature", "")) or item.get("feature")
        # fallback to 'feature' or 'feature' key differences
        name = item.get("feature") or item.get("feature") or item.get("feature") or item.get("feature")
        # fallback if the structure uses 'name'
        if not name:
            name = item.get("name") or item.get("feature") or "Feature"

        value = float(item.get("contribution", 0))
        # strength labels
        if value >= 0.18:
            strength = "strongly"
        elif value >= 0.08:
            strength = "substantially"
        else:
            strength = "mildly"

        direction = item.get("direction", "positive")
        if direction == "positive":
            verb = "increased"
        elif direction == "negative":
            verb = "decreased"
        else:
            verb = "influenced"

        # Clean up common names for readability
        mapping = {
            "Ovulatory dysfunction": "Ovulatory dysfunction",
            "Hyperandrogenism": "Hyperandrogenism",
            "Polycystic ovarian morphology": "Polycystic ovarian morphology",
            "Irregular or prolonged cycles": "Irregular cycles",
            "Clinical hyperandrogenism": "Clinical hyperandrogenism",
            "Elevated AMH": "Elevated AMH",
            "Elevated LH:FSH ratio": "Elevated LH:FSH ratio",
            "Elevated BMI": "Elevated BMI",
            "Metabolic insulin resistance signal": "Metabolic insulin resistance",
            "Hormonal imbalance signal": "Hormonal imbalance",
            "No strong signals": "No strong signals",
        }

        display = mapping.get(name, name)
        sentence = f"{display} {strength} {verb} PCOS probability"
        sentences.append(sentence)

    # deduplicate while preserving order
    seen = set()
    unique = []
    for s in sentences:
        if s not in seen:
            unique.append(s)
            seen.add(s)
    return unique


def build_body_highlights(payload: dict, rotterdam_results: dict) -> dict:
    """Map clinical signals to body visualization highlights."""
    highlights = {
        "face": False,
        "abdomen": False,
        "ovary": False,
        "scalp_face": False,
    }

    if to_bool(payload.get("acne")) or to_number(payload.get("acneSeverity")) > 0:
        highlights["face"] = True

    insulin_flag = to_number(payload.get("insulinLevel")) >= 15 or to_number(payload.get("homaIr")) >= 2.5 or to_number(payload.get("fastingGlucose")) >= 110
    if insulin_flag:
        highlights["abdomen"] = True

    ovarian_flag = (
        to_bool(payload.get("polycysticAppearance"))
        or to_number(payload.get("follicleCountLeft", 0)) >= 12
        or to_number(payload.get("follicleCountRight", 0)) >= 12
        or to_number(payload.get("amh", 0)) >= 4
    )
    if ovarian_flag:
        highlights["ovary"] = True

    hirsutism_flag = to_bool(payload.get("hirsutism")) or to_number(payload.get("hirsutismScore")) >= 8 or to_bool(payload.get("hair_growth"))
    if hirsutism_flag:
        highlights["scalp_face"] = True

    return highlights


def suggest_next_investigations(payload: dict, rotterdam_results: dict, risk_level: str, factors: list[str]) -> list[str]:
    """Return a prioritized list of suggested follow-up investigations."""
    suggestions = []

    # metabolic priority
    if to_number(payload.get("insulinLevel")) >= 15 or to_number(payload.get("homaIr")) >= 2.5 or to_number(payload.get("fastingGlucose")) >= 110 or any("Metabolic" in f for f in factors):
        suggestions.append("fasting insulin")

    # ovarian imaging
    if to_bool(payload.get("polycysticAppearance")) or to_number(payload.get("follicleCountLeft", 0)) >= 12 or to_number(payload.get("follicleCountRight", 0)) >= 12 or to_number(payload.get("amh", 0)) >= 4:
        suggestions.append("pelvic ultrasound")

    # androgen testing
    if to_bool(payload.get("hirsutism")) or to_number(payload.get("hirsutismScore")) >= 8 or to_number(payload.get("totalTestosterone", 0)) > 0:
        suggestions.append("testosterone panel")

    # specialist referral if high risk or Rotterdam positive
    if rotterdam_results.get("rotterdam_positive") or risk_level == "high" or any(k in ["Ovulatory Dysfunction","Hyperandrogenism","Polycystic Ovaries"] for k in rotterdam_results.get("criteria_met", [])):
        suggestions.append("reproductive endocrinology referral")

    # baseline additions if nothing flagged
    if not suggestions:
        suggestions = [
            "fasting insulin",
            "pelvic ultrasound",
            "testosterone panel",
        ]

    # preserve order and uniqueness
    seen = set()
    ordered = []
    for s in suggestions:
        if s not in seen:
            ordered.append(s)
            seen.add(s)

    return ordered


def build_cluster_result(phenotype: dict, risk_level: str, factors: list[str]) -> dict:
    name = phenotype.get("name", "Non-PCOS")
    description = phenotype.get("description", "Clinical phenotype")
    cluster_id = {
        "Type A - Classic Hyperandrogenic PCOS": 1,
        "Type B - Non-PCO PCOS": 2,
        "Type C - Ovulatory PCOS": 3,
        "Type D - Normo-androgenic PCOS": 4,
    }.get(name, 0)

    assigned_cluster = {
        "id": cluster_id,
        "name": name,
        "description": description,
        "characteristics": factors[:4] if factors else ["No strong cluster-specific signal"],
        "riskProfile": risk_level,
        "metabolicRisk": "high" if risk_level == "high" else "moderate" if risk_level == "moderate" else "low",
    }

    all_clusters = [
        {"id": 1, "name": "Type A - Classic Hyperandrogenic PCOS", "patientCount": 0, "metabolicRisk": "high"},
        {"id": 2, "name": "Type B - Non-PCO PCOS", "patientCount": 0, "metabolicRisk": "moderate"},
        {"id": 3, "name": "Type C - Ovulatory PCOS", "patientCount": 0, "metabolicRisk": "moderate"},
        {"id": 4, "name": "Type D - Normo-androgenic PCOS", "patientCount": 0, "metabolicRisk": "low"},
        {"id": 0, "name": "Non-PCOS", "patientCount": 0, "metabolicRisk": "low"},
    ]

    return {
        "assignedCluster": assigned_cluster,
        "allClusters": all_clusters,
    }


# ============================================================
# PREDICTION ENDPOINT
# ============================================================

@app.post("/predict")
def predict(data: PatientData):

    patient_data = data.dict()

    # Rotterdam clinical analysis
    rotterdam_results = evaluate_rotterdam_criteria(patient_data)

    # Final AI prediction
    prediction = (
        "PCOS"
        if rotterdam_results["rotterdam_positive"]
        else "Non-PCOS"
    )

    # Clinical interpretation
    interpretation = (
        f"The patient meets "
        f"{rotterdam_results['criteria_count']} Rotterdam criteria "
        f"and is classified as "
        f"{rotterdam_results['phenotype']}."
    )

    return {
        "prediction": prediction,
        "rotterdam_analysis": rotterdam_results,
        "clinical_interpretation": interpretation
    }


@app.post("/analyze")
def analyze(data: dict):
    payload = data or {}
    rotterdam_input = build_rotterdam_input(payload)
    rotterdam_results = evaluate_rotterdam_criteria(rotterdam_input)

    score, factors = calculate_risk_score(payload, rotterdam_results)
    risk_level = "high" if score >= 70 else "moderate" if score >= 40 else "low"

    phenotype_name = rotterdam_results.get("phenotype", "Non-PCOS")
    phenotype_type = {
        "Type A - Classic Hyperandrogenic PCOS": "A",
        "Type B - Non-PCO PCOS": "B",
        "Type C - Ovulatory PCOS": "C",
        "Type D - Normo-androgenic PCOS": "D",
        "PCOS - Unclassified": "NA",
        "Non-PCOS": "NA",
    }.get(phenotype_name, "NA")

    phenotype_description = {
        "Type A - Classic Hyperandrogenic PCOS": "Hyperandrogenic, ovulatory dysfunction, and polycystic ovaries are present.",
        "Type B - Non-PCO PCOS": "Hyperandrogenism and ovulatory dysfunction are present without classic PCOM findings.",
        "Type C - Ovulatory PCOS": "Hyperandrogenism with polycystic ovarian morphology but preserved ovulation.",
        "Type D - Normo-androgenic PCOS": "Ovulatory dysfunction and polycystic ovarian morphology without clear hyperandrogenism.",
        "PCOS - Unclassified": "Meets Rotterdam criteria but phenotype is not fully classified.",
        "Non-PCOS": "Clinical phenotype.",
    }.get(phenotype_name, "Clinical phenotype.")

    shap_values, top_contributors = build_shap_values(factors, score)
    cluster_result = build_cluster_result({"name": phenotype_name, "description": phenotype_description}, risk_level, factors)

    criteria_count = int(rotterdam_results.get("criteria_count", 0))
    confidence_metrics = {
        "pcosClassification": min(95, 65 + criteria_count * 10 + (10 if risk_level == "high" else 0)),
        "phenotypeMatch": min(92, 60 + criteria_count * 8),
        "dataQuality": min(100, 70 + min(len([k for k, v in payload.items() if v not in (None, "", [], {})]), 10) * 3),
    }

    recommendations = []
    if rotterdam_results.get("rotterdam_positive"):
        recommendations.append("Consider endocrinology follow-up for Rotterdam-positive PCOS features.")
    if "Ovulatory Dysfunction" in rotterdam_results.get("criteria_met", []):
        recommendations.append("Track cycle length and ovulatory regularity over the next 3 months.")
    if "Hyperandrogenism" in rotterdam_results.get("criteria_met", []):
        recommendations.append("Review androgenic symptoms and relevant hormone labs.")
    if "Polycystic Ovaries" in rotterdam_results.get("criteria_met", []):
        recommendations.append("Correlate with ultrasound findings and ovarian morphology.")
    if not recommendations:
        recommendations.append("No strong PCOS pattern detected; continue routine clinical review.")
    # Build human-readable AI reasoning sentences
    human_reasoning = human_readable_reasoning(top_contributors)

    # Body visualization highlights
    body_highlights = build_body_highlights(payload, rotterdam_results)

    # Suggested clinical next investigations
    suggested_investigations = suggest_next_investigations(payload, rotterdam_results, risk_level, factors)

    return {
        "success": True,
        "prediction": {
            "pcosRiskScore": score,
            "riskLevel": risk_level,
            "contributingFactors": factors,
        },
        "phenotype": {
            "type": phenotype_type,
            "name": phenotype_name,
            "description": phenotype_description,
        },
        "phenotypeDisplay": {
            "displayName": phenotype_name,
            "type": phenotype_type,
            "characteristics": factors[:4],
        },
        "rotterdamEvaluation": rotterdam_results,
        "shap": {
            "values": shap_values,
            "topContributors": top_contributors,
        },
        "humanReasoning": human_reasoning,
        "bodyHighlights": body_highlights,
        "suggestedInvestigations": suggested_investigations,
        "clustering": cluster_result,
        "confidenceMetrics": confidence_metrics,
        "recommendations": recommendations,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
