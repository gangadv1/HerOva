from __future__ import annotations

from csv import DictReader
from io import StringIO
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
import clinical_rules


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

MODEL_PATH = Path(__file__).with_name("pcos_xgboost_model.joblib")
MODEL = joblib.load(MODEL_PATH)

FEATURE_NAMES = [
	"Age (yrs)",
	"Weight (Kg)",
	"Height(Cm)",
	"BMI",
	"Blood Group",
	"Pulse rate(bpm)",
	"RR (breaths/min)",
	"Hb(g/dl)",
	"Cycle(R/I)",
	"Cycle length(days)",
	"Marraige Status (Yrs)",
	"Pregnant(Y/N)",
	"No. of abortions",
	"I   beta-HCG(mIU/mL)",
	"II    beta-HCG(mIU/mL)",
	"FSH(mIU/mL)",
	"LH(mIU/mL)",
	"FSH/LH",
	"Hip(inch)",
	"Waist(inch)",
	"Waist:Hip Ratio",
	"TSH (mIU/L)",
	"AMH(ng/mL)",
	"PRL(ng/mL)",
	"Vit D3 (ng/mL)",
	"PRG(ng/mL)",
	"RBS(mg/dl)",
	"Weight gain(Y/N)",
	"hair growth(Y/N)",
	"Skin darkening (Y/N)",
	"Hair loss(Y/N)",
	"Pimples(Y/N)",
	"Fast food (Y/N)",
	"Reg.Exercise(Y/N)",
	"BP _Systolic (mmHg)",
	"BP _Diastolic (mmHg)",
	"Follicle No. (L)",
	"Follicle No. (R)",
	"Avg. F size (L) (mm)",
	"Avg. F size (R) (mm)",
	"Endometrium (mm)",
]

NUMERIC_FEATURES = {
	"Age (yrs)",
	"Weight (Kg)",
	"Height(Cm)",
	"BMI",
	"Pulse rate(bpm)",
	"RR (breaths/min)",
	"Hb(g/dl)",
	"Cycle length(days)",
	"Marraige Status (Yrs)",
	"No. of abortions",
	"I   beta-HCG(mIU/mL)",
	"II    beta-HCG(mIU/mL)",
	"FSH(mIU/mL)",
	"LH(mIU/mL)",
	"FSH/LH",
	"Hip(inch)",
	"Waist(inch)",
	"Waist:Hip Ratio",
	"TSH (mIU/L)",
	"AMH(ng/mL)",
	"PRL(ng/mL)",
	"Vit D3 (ng/mL)",
	"PRG(ng/mL)",
	"RBS(mg/dl)",
	"BP _Systolic (mmHg)",
	"BP _Diastolic (mmHg)",
	"Follicle No. (L)",
	"Follicle No. (R)",
	"Avg. F size (L) (mm)",
	"Avg. F size (R) (mm)",
	"Endometrium (mm)",
}


def _to_float(value: Any, default: float = 0.0) -> float:
	if value is None:
		return default
	if isinstance(value, (int, float, np.integer, np.floating)):
		value = float(value)
		return value if np.isfinite(value) else default
	if isinstance(value, str):
		cleaned = value.strip().replace(",", "")
		if not cleaned:
			return default
		try:
			parsed = float(cleaned)
		except ValueError:
			return default
		return parsed if np.isfinite(parsed) else default
	return default


def _to_bool(value: Any) -> bool:
	if isinstance(value, bool):
		return value
	if isinstance(value, (int, float, np.integer, np.floating)):
		return float(value) > 0
	if isinstance(value, str):
		normalized = value.strip().lower()
		if not normalized:
			return False
		if normalized in {"y", "yes", "true", "1", "1.0", "positive", "present", "irregular", "i"}:
			return True
		try:
			return float(normalized) > 0
		except ValueError:
			return False
	return False


def _blood_group(value: Any) -> float:
	if isinstance(value, (int, float, np.integer, np.floating)):
		return _to_float(value)
	if isinstance(value, str):
		normalized = value.strip().lower()
		blood_map = {
			"a+": 1.0,
			"a-": 2.0,
			"b+": 3.0,
			"b-": 4.0,
			"ab+": 5.0,
			"ab-": 6.0,
			"o+": 7.0,
			"o-": 8.0,
		}
		if normalized in blood_map:
			return blood_map[normalized]
	return _to_float(value)


def _cycle_value(value: Any) -> float:
	if isinstance(value, str):
		normalized = value.strip().lower()
		if normalized in {"i", "irregular", "irregularly", "1", "1.0"}:
			return 1.0
		if normalized in {"r", "regular", "0", "0.0"}:
			return 0.0
	return _to_float(value)


def _get_field(row: dict[str, Any], *candidates: str, default: Any = 0) -> Any:
	for candidate in candidates:
		if candidate in row and row[candidate] not in {None, ""}:
			return row[candidate]
	return default


def _clamp(value: float, lower: float = 0.0, upper: float = 100.0) -> float:
	return max(lower, min(upper, value))


def _ramp(value: float, lower: float, upper: float, min_score: float, max_score: float) -> float:
	if value <= lower:
		return min_score
	if value >= upper:
		return max_score
	span = upper - lower
	if span <= 0:
		return max_score
	ratio = (value - lower) / span
	return min_score + (ratio * (max_score - min_score))


def _parse_csv_text(csv_text: str) -> list[dict[str, str]]:
	normalized = csv_text.replace("\r\n", "\n").strip()
	if not normalized:
		return []

	lines = [line for line in normalized.split("\n") if line.strip()]
	if len(lines) < 2:
		return []

	header_line = lines[0]
	delimiter = "\t" if "\t" in header_line else ";" if ";" in header_line else ","
	reader = DictReader(StringIO(normalized), delimiter=delimiter)
	rows: list[dict[str, str]] = []

	for row in reader:
		rows.append({(key or "").strip().lstrip("\ufeff"): (value or "").strip() for key, value in row.items()})

	return rows


def _build_patient(row: dict[str, Any]) -> dict[str, float | bool | str]:
	weight = _to_float(_get_field(row, "Weight (Kg)", "Weight", "weight", "Weight_kg"))
	height = _to_float(_get_field(row, "Height(Cm)", "Height (Cm)", "Height", "height"))
	bmi = _to_float(_get_field(row, "BMI", "bmi"), weight / ((height / 100) ** 2) if weight and height else 0)
	waist = _to_float(_get_field(row, "Waist(inch)", "Waist", "waist", "waistCircumference", "waist_circumference"))
	hip = _to_float(_get_field(row, "Hip(inch)", "Hip", "hip"))
	waist_hip = _to_float(_get_field(row, "Waist:Hip Ratio", "Waist_Hip_Ratio", "waist_hip_ratio"), waist / hip if waist and hip else 0)
	cycle_value = _get_field(row, "Cycle(R/I)", "Cycle", "cycle", "cycleLengthVariability", "cycle_length_variability", "Irregular_Periods", "irregular_periods", "irregularPeriods")

	return {
		"age": _to_float(_get_field(row, "Age (yrs)", "Age", "age")),
		"weight": weight,
		"height": height,
		"bmi": bmi,
		"bloodGroup": _blood_group(_get_field(row, "Blood Group", "blood_group")),
		"pulseRate": _to_float(_get_field(row, "Pulse rate(bpm)", "pulse_rate")),
		"respiratoryRate": _to_float(_get_field(row, "RR (breaths/min)", "rr")),
		"hb": _to_float(_get_field(row, "Hb(g/dl)", "hb")),
		"cycleLength": _to_float(_get_field(row, "Cycle length(days)", "Cycle_Length", "cycle_length", "cycleLength")),
		"cycleValue": _cycle_value(cycle_value),
		"marriageYears": _to_float(_get_field(row, "Marraige Status (Yrs)", "Marriage_Status", "marriage_status")),
		"pregnant": _to_bool(_get_field(row, "Pregnant(Y/N)", "pregnant")),
		"abortions": _to_float(_get_field(row, "No. of abortions", "abortions")),
		"betaHcgI": _to_float(_get_field(row, "I   beta-HCG(mIU/mL)", "beta_hcg_i")),
		"betaHcgII": _to_float(_get_field(row, "II    beta-HCG(mIU/mL)", "beta_hcg_ii")),
		"fsh": _to_float(_get_field(row, "FSH(mIU/mL)", "FSH", "fsh")),
		"lh": _to_float(_get_field(row, "LH(mIU/mL)", "LH", "lh")),
		"fshLh": _to_float(_get_field(row, "FSH/LH", "LH_FSH_Ratio", "lh_fsh_ratio")),
		"hip": hip,
		"waist": waist,
		"waistHipRatio": waist_hip,
		"tsh": _to_float(_get_field(row, "TSH (mIU/L)", "TSH", "tsh")),
		"amh": _to_float(_get_field(row, "AMH(ng/mL)", "AMH", "amh")),
		"prl": _to_float(_get_field(row, "PRL(ng/mL)", "Prolactin", "prolactin")),
		"vitD3": _to_float(_get_field(row, "Vit D3 (ng/mL)", "vit_d3")),
		"prg": _to_float(_get_field(row, "PRG(ng/mL)", "prg")),
		"rbs": _to_float(_get_field(row, "RBS(mg/dl)", "RBS", "Glucose", "Fasting_Glucose")),
		"insulinLevel": _to_float(_get_field(row, "Insulin(mIU/mL)", "Insulin", "insulinLevel", "insulin_level")),
		"homaIr": _to_float(_get_field(row, "HOMA-IR", "HOMA_IR", "homaIr", "homa_ir")),
		"totalTestosterone": _to_float(_get_field(row, "Total Testosterone", "Total_Testosterone", "totalTestosterone", "total_testosterone")),
		"freeTestosterone": _to_float(_get_field(row, "Free Testosterone", "freeTestosterone", "free_testosterone")),
		"dheas": _to_float(_get_field(row, "DHEAS", "dheas")),
		"pelvicPain": _to_bool(_get_field(row, "Pelvic pain (Y/N)", "pelvic_pain", "pelvicPain", "dysmenorrhea", "painfulPeriods")),
		"dysmenorrhea": _to_bool(_get_field(row, "Dysmenorrhea (Y/N)", "dysmenorrhea", "painfulPeriods")),
		"infertility": _to_bool(_get_field(row, "Infertility (Y/N)", "infertility", "tryingToConceive")),
		"weightGain": _to_bool(_get_field(row, "Weight gain(Y/N)", "Weight_Gain", "weight_gain", "weightGain")),
		"hairGrowth": _to_bool(_get_field(row, "hair growth(Y/N)", "Hirsutism", "hirsutism", "hairGrowth")),
		"skinDarkening": _to_bool(_get_field(row, "Skin darkening (Y/N)", "Skin_Darkening", "skin_darkening", "skinDarkening")),
		"hairLoss": _to_bool(_get_field(row, "Hair loss(Y/N)", "Hair_Loss", "hair_loss", "hairLoss")),
		"pimples": _to_bool(_get_field(row, "Pimples(Y/N)", "Acne", "acne", "pimples")),
		"fastFood": _to_bool(_get_field(row, "Fast food (Y/N)", "fast_food", "fastFood")),
		"regularExercise": _to_bool(_get_field(row, "Reg.Exercise(Y/N)", "regular_exercise", "regularExercise")),
		"bpSystolic": _to_float(_get_field(row, "BP _Systolic (mmHg)", "BP_Systolic", "bp_systolic", "bloodPressureSystolic")),
		"bpDiastolic": _to_float(_get_field(row, "BP _Diastolic (mmHg)", "BP_Diastolic", "bp_diastolic", "bloodPressureDiastolic")),
		"follicleLeft": _to_float(_get_field(row, "Follicle No. (L)", "Follicle_Count_Left", "follicle_count_left", "follicleCountLeft")),
		"follicleRight": _to_float(_get_field(row, "Follicle No. (R)", "Follicle_Count_Right", "follicle_count_right", "follicleCountRight")),
		"avgSizeLeft": _to_float(_get_field(row, "Avg. F size (L) (mm)", "Avg_F_Size_Left", "avg_f_size_left", "ovaryVolumeLeft")),
		"avgSizeRight": _to_float(_get_field(row, "Avg. F size (R) (mm)", "Avg_F_Size_Right", "avg_f_size_right", "ovaryVolumeRight")),
		"endometrium": _to_float(_get_field(row, "Endometrium (mm)", "Endometrial_Thickness", "endometrial_thickness", "endometrialThickness")),
	}


def _build_feature_vector(row: dict[str, Any]) -> tuple[np.ndarray, dict[str, Any]]:
	patient = _build_patient(row)
	vector = np.array([
		patient["age"],
		patient["weight"],
		patient["height"],
		patient["bmi"],
		patient["bloodGroup"],
		patient["pulseRate"],
		patient["respiratoryRate"],
		patient["hb"],
		patient["cycleValue"],
		patient["cycleLength"],
		patient["marriageYears"],
		1.0 if patient["pregnant"] else 0.0,
		patient["abortions"],
		patient["betaHcgI"],
		patient["betaHcgII"],
		patient["fsh"],
		patient["lh"],
		patient["fshLh"],
		patient["hip"],
		patient["waist"],
		patient["waistHipRatio"],
		patient["tsh"],
		patient["amh"],
		patient["prl"],
		patient["vitD3"],
		patient["prg"],
		patient["rbs"],
		1.0 if patient["weightGain"] else 0.0,
		1.0 if patient["hairGrowth"] else 0.0,
		1.0 if patient["skinDarkening"] else 0.0,
		1.0 if patient["hairLoss"] else 0.0,
		1.0 if patient["pimples"] else 0.0,
		1.0 if patient["fastFood"] else 0.0,
		1.0 if patient["regularExercise"] else 0.0,
		patient["bpSystolic"],
		patient["bpDiastolic"],
		patient["follicleLeft"],
		patient["follicleRight"],
		patient["avgSizeLeft"],
		patient["avgSizeRight"],
		patient["endometrium"],
	], dtype=float)

	return vector, patient


def _predict_probability(vector: np.ndarray) -> float:
	if hasattr(MODEL, "predict_proba"):
		probabilities = MODEL.predict_proba(vector.reshape(1, -1))[0]
		classes = list(getattr(MODEL, "classes_", []))
		if 1 in classes:
			return float(probabilities[classes.index(1)])
		return float(probabilities[-1])
	prediction = MODEL.predict(vector.reshape(1, -1))[0]
	return float(prediction)


def _has_risk_signal(patient: dict[str, Any]) -> list[str]:
	factors: list[str] = []
	if patient["cycleLength"] > 35 or patient["cycleValue"] >= 1:
		factors.append("Irregular or prolonged cycles")
	if patient["weightGain"]:
		factors.append("Weight gain")
	if patient["hairGrowth"] or patient["pimples"] or patient["hairLoss"] or patient["skinDarkening"]:
		factors.append("Clinical hyperandrogenism")
	if patient["totalTestosterone"] > 50 or patient["freeTestosterone"] > 3 or patient["dheas"] > 350:
		factors.append("Biochemical hyperandrogenism")
	if patient["amh"] >= 4:
		factors.append("Elevated AMH")
	if patient["fshLh"] >= 2 or (patient["fsh"] > 0 and patient["lh"] > 0 and patient["fsh"] / patient["lh"] >= 2):
		factors.append("Elevated FSH:LH ratio")
	if patient["follicleLeft"] >= 12 or patient["follicleRight"] >= 12:
		factors.append("Polycystic ovarian morphology")
	if patient["bmi"] >= 25:
		factors.append("Elevated BMI")
	if patient["waistHipRatio"] > 0.85:
		factors.append("Increased waist-to-hip ratio")
	if patient["rbs"] >= 110:
		factors.append("Elevated glucose")
	if patient["fastFood"]:
		factors.append("Frequent fast-food intake")
	if not patient["regularExercise"]:
		factors.append("Low physical activity")
	if patient["tsh"] > 4.5 or patient["prl"] > 25 or 0 < patient["vitD3"] < 20:
		factors.append("Hormonal or metabolic imbalance")
	return factors


def _clinical_risk_score(patient: dict[str, Any]) -> int:
	score = 0.0

	score += _ramp(patient["cycleLength"], 28, 56, 0, 22)
	if patient["cycleValue"] >= 1:
		score += 8
	if patient["weightGain"]:
		score += 4
	score += _ramp(patient["bmi"], 18.5, 35, 0, 10)
	score += _ramp(max(patient["follicleLeft"], patient["follicleRight"]), 8, 24, 0, 14)
	score += _ramp(patient["amh"], 2, 10, 0, 10)
	score += _ramp(patient["homaIr"], 1, 6, 0, 10)
	score += _ramp(patient["fshLh"], 1, 4, 0, 8)
	score += _ramp(patient["waistHipRatio"], 0.75, 1.05, 0, 4)
	score += _ramp(patient["rbs"], 80, 150, 0, 7)
	score += _ramp(patient["totalTestosterone"], 20, 80, 0, 8)
	score += _ramp(patient["freeTestosterone"], 1.0, 6.0, 0, 6)
	score += _ramp(patient["dheas"], 150, 500, 0, 5)
	if patient["hairGrowth"]:
		score += 7
	if patient["pimples"]:
		score += 4
	if patient["hairLoss"]:
		score += 3
	if patient["skinDarkening"]:
		score += 3
	if not patient["regularExercise"]:
		score += 3
	if patient["tsh"] > 4.5:
		score += 3
	if patient["prl"] > 25:
		score += 3
	if 0 < patient["vitD3"] < 20:
		score += 2

	return int(round(_clamp(score)))


def _phenotype(patient: dict[str, Any], model_probability: float | None = None) -> dict[str, str]:
	"""Wrapper that delegates to `clinical_rules.evaluate_rotterdam`.

	Returns a compact dict compatible with the rest of this module
	(keys: `type`, `name`, `description`). The rules engine produces
	additional detail which is preserved elsewhere if needed.
	"""
	result = clinical_rules.evaluate_rotterdam(patient, model_probability)
	# Keep compatibility with existing callers expecting a small dict
	return {"type": result.get("type", "N/A"), "name": result.get("name", ""), "description": result.get("description", "")}


def _confidence_metrics(probability: float, patient: dict[str, Any], phenotype: dict[str, str]) -> dict[str, int]:
	filled = sum(1 for value in patient.values() if value not in {None, "", 0, 0.0, False})
	data_quality = int(round((filled / len(patient)) * 100))
	phenotype_match = 96 if phenotype["type"] != "N/A" else 84
	pcos_classification = int(round(max(0.5, min(0.99, probability)) * 100))
	return {
		"pcosClassification": pcos_classification,
		"phenotypeMatch": phenotype_match,
		"dataQuality": data_quality,
	}


def _recommendations(risk_score: float, phenotype: dict[str, str]) -> list[str]:
	if risk_score >= 70:
		return [
			"Consider referral to endocrinologist for comprehensive hormonal evaluation",
			"Lifestyle modifications: diet optimization and regular exercise",
			"Monitor metabolic markers and consider insulin sensitizers if indicated",
			"Regular follow-up for endometrial protection if anovulatory",
			"Consider dermatological referral for hyperandrogenism symptoms",
		]
	if risk_score >= 40:
		return [
			"Consider specialist follow-up for targeted hormonal assessment",
			"Lifestyle modifications: diet optimization and regular exercise",
			"Monitor metabolic markers over time",
			"Track cycle regularity and androgen-related symptoms",
		]
	return [
		"Continue routine health monitoring",
		"Maintain healthy lifestyle habits",
		"Annual well-woman examination recommended",
	]


def _next_investigations(patient: dict[str, Any], phenotype: dict[str, str], biological: dict[str, Any]) -> list[str]:
	"""Return a prioritized list of suggested next investigations tailored to the patient.

	The list is conservative and clinician-facing: it suggests commonly ordered tests
	to clarify metabolic, endocrine, and reproductive status that align with the
	predicted phenotype and biological pathway signals.
	"""
	suggestions: list[str] = []

	# Metabolic / insulin-resistance focused
	if biological.get("pathways"):
		names = [p.get("name", "").lower() for p in biological.get("pathways", [])]
	else:
		names = []

	if "insulin" in " ".join(names) or patient.get("homaIr", 0) >= 1.5 or patient.get("insulinLevel", 0) >= 12:
		suggestions.extend(["Fasting insulin", "Oral glucose tolerance test (OGTT)", "HOMA-IR calculation", "HbA1c"])

	# Reproductive / ovarian function
	if patient.get("amh", 0) >= 2 or patient.get("follicleLeft", 0) >= 10 or patient.get("follicleRight", 0) >= 10:
		suggestions.extend(["Pelvic ultrasound (transvaginal preferred)", "AMH repeat/confirmation", "Pelvic ultrasound with follicle count documentation"]) 

	# Androgen workup
	if "androgen" in " ".join(names) or patient.get("totalTestosterone", 0) > 40 or patient.get("freeTestosterone", 0) > 2.5:
		suggestions.extend(["Testosterone panel (total + free)", "DHEAS level", "17-OH progesterone as appropriate"])

	# Endometriosis / pelvic pain signals
	if patient.get("pelvicPain") or patient.get("dysmenorrhea"):
		suggestions.extend(["Transvaginal pelvic ultrasound to assess endometriosis-related findings", "Consider referral for diagnostic laparoscopy if clinically indicated", "Pain and symptom-focused assessment by gynecology"]) 

	# General metabolic and cardiovascular screening
	if patient.get("bmi", 0) >= 25 or patient.get("rbs", 0) >= 100:
		suggestions.extend(["Fasting lipid profile", "Liver function tests (ALT/AST)", "Blood pressure monitoring"])

	# Specialist referral if phenotype severe or high risk
	if phenotype.get("type") in {"A", "B"} or (patient.get("bmi", 0) >= 30 and patient.get("homaIr", 0) > 2):
		suggestions.append("Referral to reproductive endocrinology / endocrinologist")

	# Deduplicate while preserving order
	seen = set()
	deduped = []
	for s in suggestions:
		if s not in seen:
			deduped.append(s)
			seen.add(s)

	# If nothing suggested, provide a minimal sensible panel
	if not deduped:
		deduped = ["Fasting glucose / HbA1c", "Basic hormonal panel (TSH, prolactin)", "Routine pelvic ultrasound if symptoms"]

	return deduped


def _analyze_single(row: dict[str, Any]) -> dict[str, Any]:
	vector, patient = _build_feature_vector(row)
	probability = _predict_probability(vector)
	model_score = int(round(probability * 100))
	clinical_score = _clinical_risk_score(patient)
	risk_score = int(round(_clamp((model_score * 0.3) + (clinical_score * 0.7))))
	phenotype = _phenotype(patient, probability)
	risk_level = "high" if risk_score >= 70 else "moderate" if risk_score >= 40 else "low"
	factors = _has_risk_signal(patient)
	confidence = _confidence_metrics(probability, patient, phenotype)
	recommendations = _recommendations(risk_score, phenotype)
	# biological insights and suggested next investigations
	shap_values, top_contributors = _shap_like_values(patient)
	biological = _biological_insights(patient, top_contributors, phenotype)
	next_investigations = _next_investigations(patient, phenotype, biological)

	return {
		"pcosRiskScore": risk_score,
		"riskLevel": risk_level,
		"phenotype": phenotype,
		"contributingFactors": factors,
		"confidenceMetrics": confidence,
		"recommendations": recommendations,
		"nextInvestigations": next_investigations,
		"patient": patient,
		"probability": probability,
		"modelScore": model_score,
		"clinicalScore": clinical_score,
	}


def _shap_like_values(patient: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
	signals = [
		("Cycle Length", patient["cycleLength"] > 35, 0.85 if patient["cycleLength"] > 35 else 0.3, "Prolonged cycles indicate oligomenorrhea" if patient["cycleLength"] > 35 else "Normal cycle length reduces PCOS likelihood"),
		("Follicle Count", patient["follicleLeft"] >= 12 or patient["follicleRight"] >= 12, 0.75 if patient["follicleLeft"] >= 12 or patient["follicleRight"] >= 12 else 0.25, "High follicle count indicates polycystic morphology" if patient["follicleLeft"] >= 12 or patient["follicleRight"] >= 12 else "Normal follicle count"),
		("LH:FSH Ratio", patient["fshLh"] > 2 or (patient["fsh"] > 0 and patient["lh"] > 0 and patient["fsh"] / patient["lh"] > 2), 0.7 if patient["fshLh"] > 2 else 0.2, "Elevated ratio suggests pituitary-ovarian dysregulation" if patient["fshLh"] > 2 else "Normal ratio"),
		("AMH Level", patient["amh"] > 6, 0.55 if patient["amh"] > 6 else 0.2, "Elevated AMH reflects increased follicle pool" if patient["amh"] > 6 else "Normal AMH"),
		("Hirsutism Score", patient["hairGrowth"], 0.5 if patient["hairGrowth"] else 0.1, "Clinical hyperandrogenism" if patient["hairGrowth"] else "No hirsutism"),
		("BMI", patient["bmi"] > 25, 0.4 if patient["bmi"] > 25 else 0.15, "Elevated BMI contributes to insulin resistance" if patient["bmi"] > 25 else "Healthy BMI"),
		("Ovary Volume", patient["avgSizeLeft"] > 10 or patient["avgSizeRight"] > 10, 0.6 if patient["avgSizeLeft"] > 10 or patient["avgSizeRight"] > 10 else 0.15, "Enlarged ovarian volume indicates PCOM" if patient["avgSizeLeft"] > 10 or patient["avgSizeRight"] > 10 else "Normal volume"),
		("Skin Darkening", patient["skinDarkening"], 0.35 if patient["skinDarkening"] else 0.05, "Acanthosis nigricans indicates insulin resistance" if patient["skinDarkening"] else "No skin changes"),
	]

	shap_values = [
		{
			"name": name,
			"value": value,
			"impact": "high" if value >= 0.7 else "moderate" if value >= 0.4 else "low",
			"direction": "increases" if active else "neutral",
			"explanation": explanation,
		}
		for name, active, value, explanation in signals
	]
	top_contributors = [
		{
			"feature": value["name"],
			"contribution": value["value"],
			"impact": value["impact"],
			"direction": value["direction"],
			"explanation": value["explanation"],
		}
		for value in shap_values
		if value["impact"] != "low"
	]
	return shap_values, top_contributors


def _biological_insights(patient: dict[str, Any], top_contributors: list[dict[str, Any]], phenotype: dict[str, str]) -> dict[str, Any]:
	"""Generate lightweight biological insights linking pathways to clinical features.

	This is intentionally simple and transparent: it maps clinical and SHAP-like
	contributors to pathway-level signals and produces a clinician-friendly
	summary sentence that does NOT claim extensive bioinformatics work.
	"""
	pathways = {
		"inflammatory": False,
		"insulin_signaling": False,
		"androgen_signaling": False,
		"ovarian_dysfunction": False,
	}

	# Look for clinical signals
	if patient.get("skinDarkening") or patient.get("rbs", 0) >= 110 or patient.get("bmi", 0) >= 25:
		pathways["inflammatory"] = True
		pathways["insulin_signaling"] = True

	if patient.get("homaIr", 0) > 1.5 or patient.get("insulinLevel", 0) > 12:
		pathways["insulin_signaling"] = True

	if patient.get("totalTestosterone", 0) > 40 or patient.get("freeTestosterone", 0) > 2.5 or patient.get("dheas", 0) > 300:
		pathways["androgen_signaling"] = True

	if patient.get("amh", 0) >= 4 or patient.get("follicleLeft", 0) >= 12 or patient.get("follicleRight", 0) >= 12:
		pathways["ovarian_dysfunction"] = True

	# Use SHAP-like top contributors to boost confidence for matching pathways
	for contrib in top_contributors:
		name = contrib.get("feature", "").lower()
		if "cycle" in name or "follicle" in name or "amh" in name:
			pathways["ovarian_dysfunction"] = True
		if "bmi" in name or "glucose" in name or "homa" in name:
			pathways["insulin_signaling"] = True
		if "skin" in name or "acne" in name or "hirsutism" in name:
			pathways["inflammatory"] = True
		if "testosterone" in name or "androgen" in name or "dheas" in name:
			pathways["androgen_signaling"] = True

	# Build clinician-friendly summary (per requirement phrasing)
	summary_parts = []
	if pathways["inflammatory"] and pathways["insulin_signaling"]:
		summary = "Observed inflammatory and insulin-signaling pathway dysregulation aligns with the patient's predicted phenotype."
	elif pathways["inflammatory"]:
		summary = "Observed inflammatory pathway signals align with the patient's predicted phenotype."
	elif pathways["insulin_signaling"]:
		summary = "Observed insulin-signaling pathway signals align with the patient's predicted phenotype."
	else:
		summary = "No strong pathway-level signals identified from available clinical features."

	# Prepare pathway list with short descriptions
	pathway_list = []
	if pathways["inflammatory"]:
		pathway_list.append({"name": "Inflammatory pathways", "reason": "Clinical inflammation markers, skin changes, or metabolic signals"})
	if pathways["insulin_signaling"]:
		pathway_list.append({"name": "Insulin signaling", "reason": "HOMA-IR, elevated glucose, or BMI-associated signals"})
	if pathways["androgen_signaling"]:
		pathway_list.append({"name": "Androgen signaling", "reason": "Elevated testosterone/DHEAS or clinical hyperandrogenism"})
	if pathways["ovarian_dysfunction"]:
		pathway_list.append({"name": "Ovarian dysfunction markers", "reason": "Elevated AMH, high follicle counts, or cycle irregularity"})

	return {"pathways": pathway_list, "summary": summary}


def _clusters(patient: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
	has_oligo = patient["cycleLength"] > 35 or patient["cycleValue"] >= 1
	has_ha = patient["hairGrowth"] or patient["pimples"] or patient["hairLoss"] or patient["skinDarkening"]
	has_pcom = patient["follicleLeft"] >= 12 or patient["follicleRight"] >= 12
	has_ir = patient["bmi"] > 25 or patient["waistHipRatio"] > 0.85
	has_obesity = patient["bmi"] > 25

	clusters = [
		{"clusterId": 0, "clusterName": "Classic Metabolic PCOS", "description": "Full Rotterdam phenotype with significant metabolic dysfunction.", "patientCount": 1 if has_oligo and has_ha and has_pcom and has_ir else 0, "characteristics": ["Irregular cycles", "Hyperandrogenism", "Polycystic ovaries", "Insulin resistance", "Elevated BMI"], "riskProfile": "Highest metabolic and cardiovascular risk", "metabolicRisk": "high"},
		{"clusterId": 1, "clusterName": "Reproductive PCOS", "description": "Primarily reproductive symptoms with moderate metabolic impact.", "patientCount": 1 if has_oligo and has_ha and has_pcom and not has_ir and not has_obesity else 0, "characteristics": ["Irregular cycles", "Hyperandrogenism", "Polycystic ovaries", "Normal insulin sensitivity"], "riskProfile": "Moderate reproductive risk, lower metabolic risk", "metabolicRisk": "moderate"},
		{"clusterId": 2, "clusterName": "Hyperandrogenic-PCO", "description": "Ovulatory phenotype with androgen excess and PCOM.", "patientCount": 1 if not has_oligo and has_ha and has_pcom else 0, "characteristics": ["Regular cycles", "Hyperandrogenism", "Polycystic ovaries", "Skin manifestations"], "riskProfile": "Lower metabolic risk", "metabolicRisk": "moderate"},
		{"clusterId": 3, "clusterName": "Normo-androgenic PCOS", "description": "Mildest phenotype with cycle irregularity and PCOM.", "patientCount": 1 if has_oligo and not has_ha and has_pcom else 0, "characteristics": ["Irregular cycles", "Normal androgens", "Polycystic ovaries"], "riskProfile": "Lowest risk among PCOS phenotypes", "metabolicRisk": "low"},
		{"clusterId": 4, "clusterName": "Non-PCOS Control", "description": "Does not meet Rotterdam criteria.", "patientCount": 1 if not has_oligo and not has_ha and not has_pcom else 0, "characteristics": ["Regular cycles", "Normal androgens", "Normal ovarian morphology"], "riskProfile": "No PCOS diagnosis indicated", "metabolicRisk": "low"},
	]

	# Map cluster IDs to higher-level interpretations and phenotype types
	id_to_interpretation = {
		0: {"interpretation": "insulin resistant", "mappedType": "Type A", "display": "Type A — Classic hyperandrogenic PCOS", "characteristics": ["elevated AMH", "irregular ovulation", "insulin resistance", "inflammatory profile"]},
		1: {"interpretation": "hyperandrogenic", "mappedType": "Type B", "display": "Type B — Hyperandrogenic PCOS", "characteristics": ["elevated testosterone", "hirsutism", "irregular cycles"]},
		2: {"interpretation": "inflammatory", "mappedType": "Type C", "display": "Type C — Inflammatory / Ovulatory PCOS", "characteristics": ["inflammatory markers", "pelvic pain signals", "PCOM"]},
		3: {"interpretation": "lean PCOS", "mappedType": "Type D", "display": "Type D — Lean / Normo-androgenic PCOS", "characteristics": ["normal BMI", "irregular cycles", "PCOM"]},
		4: {"interpretation": "control", "mappedType": "N/A", "display": "Non-PCOS Control", "characteristics": []},
	}

	# Attach interpretation info to each cluster entry
	for c in clusters:
		meta = id_to_interpretation.get(c["clusterId"], {})
		c["interpretation"] = meta.get("interpretation")
		c["mappedType"] = meta.get("mappedType")
		c["phenotypeDisplay"] = meta.get("display")
		# Merge characteristic lists (unique)
		merged_chars = list(dict.fromkeys((c.get("characteristics", []) or []) + (meta.get("characteristics", []) or [])))
		c["characteristics"] = merged_chars

	assigned = next((cluster for cluster in clusters if cluster["patientCount"] > 0), clusters[-1])

	# Ensure the assigned cluster exposes the phenotype mapping succinctly
	assigned_summary = {
		"clusterId": assigned["clusterId"],
		"clusterName": assigned["clusterName"],
		"interpretation": assigned.get("interpretation"),
		"mappedType": assigned.get("mappedType"),
		"phenotypeDisplay": assigned.get("phenotypeDisplay"),
		"characteristics": assigned.get("characteristics", []),
		"riskProfile": assigned.get("riskProfile"),
		"metabolicRisk": assigned.get("metabolicRisk"),
	}

	return assigned_summary, clusters





@app.get("/health")
def health() -> tuple[Any, int]:
	return jsonify({"success": True, "modelLoaded": True, "features": len(FEATURE_NAMES)}), 200


@app.post("/predict")
def predict() -> tuple[Any, int]:
	payload = request.get_json(force=True, silent=True) or {}
	analysis = _analyze_single(payload)
	return jsonify(
		{
			"success": True,
			"pcosRiskScore": analysis["pcosRiskScore"],
			"riskLevel": analysis["riskLevel"],
			"phenotype": analysis["phenotype"],
			"contributingFactors": analysis["contributingFactors"],
			"confidenceMetrics": analysis["confidenceMetrics"],
			"recommendations": analysis["recommendations"],
			"timestamp": __import__("datetime").datetime.utcnow().isoformat(),
		}
	), 200


@app.post("/analyze")
def analyze() -> tuple[Any, int]:
	payload = request.get_json(force=True, silent=True) or {}
	analysis = _analyze_single(payload)
	shap_values, top_contributors = _shap_like_values(analysis["patient"])
	assigned_cluster, all_clusters = _clusters(analysis["patient"])
	# Biological insights
	biological = _biological_insights(analysis["patient"], top_contributors, analysis["phenotype"]) 
	return jsonify(
		{
			"success": True,
			"prediction": {
				"pcosRiskScore": analysis["pcosRiskScore"],
				"riskLevel": analysis["riskLevel"],
				"contributingFactors": analysis["contributingFactors"],
			},
			"phenotype": analysis["phenotype"],
			"phenotypeDisplay": {
				"displayName": assigned_cluster.get("phenotypeDisplay"),
				"type": assigned_cluster.get("mappedType"),
				"characteristics": assigned_cluster.get("characteristics", []),
			},
			"biologicalInsights": biological,
			"shap": {"values": shap_values, "topContributors": top_contributors},
			"clustering": {
				"assignedCluster": {
					"id": assigned_cluster["clusterId"],
					"name": assigned_cluster["clusterName"],
					"description": assigned_cluster["description"],
					"characteristics": assigned_cluster["characteristics"],
					"riskProfile": assigned_cluster["riskProfile"],
					"metabolicRisk": assigned_cluster["metabolicRisk"],
				},
				"allClusters": [
					{"id": cluster["clusterId"], "name": cluster["clusterName"], "patientCount": cluster["patientCount"], "metabolicRisk": cluster["metabolicRisk"]}
					for cluster in all_clusters
				],
			},
			"confidenceMetrics": analysis["confidenceMetrics"],
			"recommendations": analysis["recommendations"],
			"timestamp": __import__("datetime").datetime.utcnow().isoformat(),
		}
	), 200


@app.post("/csv-upload")
def csv_upload() -> tuple[Any, int]:
	payload = request.get_json(force=True, silent=True) or {}
	csv_text = payload.get("csvText") or payload.get("csv_text") or ""
	rows = _parse_csv_text(str(csv_text))

	patients = []
	phenotype_distribution = {"A": 0, "B": 0, "C": 0, "D": 0, "NA": 0}

	for index, row in enumerate(rows):
		analysis = _analyze_single(row)
		patient = analysis["patient"]
		phenotype = analysis["phenotype"]
		phenotype_distribution[phenotype["type"]] = phenotype_distribution.get(phenotype["type"], 0) + 1

		patients.append(
			{
				"rowId": index + 1,
				"patientData": patient,
				"riskScore": analysis["pcosRiskScore"],
				"riskLevel": analysis["riskLevel"],
				"phenotype": phenotype["type"],
				"phenotypeName": phenotype["name"],
				"factors": analysis["contributingFactors"],
				"triggeredColumns": [factor for factor in analysis["contributingFactors"]],
			}
		)

	summary = {
		"totalRows": len(rows),
		"processedPatients": len(patients),
		"pcosPositive": sum(1 for patient in patients if patient["phenotype"] != "NA"),
		"highRisk": sum(1 for patient in patients if patient["riskLevel"] == "high"),
		"moderateRisk": sum(1 for patient in patients if patient["riskLevel"] == "moderate"),
		"lowRisk": sum(1 for patient in patients if patient["riskLevel"] == "low"),
		"phenotypeDistribution": phenotype_distribution,
	}

	return jsonify({"success": True, "summary": summary, "patients": patients, "timestamp": __import__("datetime").datetime.utcnow().isoformat()}), 200


if __name__ == "__main__":
	app.run(host="0.0.0.0", port=8000, debug=True)