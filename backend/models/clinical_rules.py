"""Rotterdam Criteria clinical rules engine for PCOS diagnosis.

This module provides a small, auditable rules engine that applies the
Rotterdam diagnostic framework to a normalized patient dictionary produced
by `backend/models/app.py`'s `_build_patient` helper.

Design goals:
- Explicitly evaluate the three Rotterdam criteria: hyperandrogenism,
  ovulatory dysfunction, and polycystic ovarian morphology (PCOM).
- Provide medically interpretable explanations for each criterion.
- Determine phenotype categories (A, B, C, D, Non-PCOS) per Rotterdam.
- Integrate (but do not override) ML model probability for combined
  interpretation and a short human-readable conclusion.

Notes:
- The thresholds below are conservative, clear, and documented. These
  are intentionally tunable constants; they are not the model's weights.
"""

from typing import Any, Dict, Optional

# Clinical thresholds (tunable)
TESTOSTERONE_TOTAL_THRESHOLD = 50.0  # ng/dL-ish (example threshold)
FREE_TESTOSTERONE_THRESHOLD = 3.0
DHEAS_THRESHOLD = 350.0  # ug/dL-ish
AMH_PCOS_THRESHOLD = 4.0
FOLLICLE_COUNT_THRESHOLD = 12
OVARY_VOLUME_THRESHOLD = 10.0


def _is_hyperandrogenism(patient: Dict[str, Any]) -> (bool, str):
    """Detect clinical or biochemical hyperandrogenism.

    Clinical signs: hirsutism (hairGrowth), acne/pimples, alopecia, skin changes.
    Biochemical: elevated total/free testosterone or DHEAS.

    Returns (met: bool, explanation: str).
    """
    clinical_signs = []
    if patient.get("hairGrowth"):
        clinical_signs.append("clinical hirsutism")
    if patient.get("pimples"):
        clinical_signs.append("acne")
    if patient.get("hairLoss"):
        clinical_signs.append("androgenic hair loss")
    if patient.get("skinDarkening"):
        clinical_signs.append("acanthosis/skin changes")

    biochemical_hits = []
    tt = float(patient.get("totalTestosterone") or 0)
    ft = float(patient.get("freeTestosterone") or 0)
    dheas = float(patient.get("dheas") or 0)
    if tt > TESTOSTERONE_TOTAL_THRESHOLD:
        biochemical_hits.append(f"total testosterone={tt}")
    if ft > FREE_TESTOSTERONE_THRESHOLD:
        biochemical_hits.append(f"free testosterone={ft}")
    if dheas > DHEAS_THRESHOLD:
        biochemical_hits.append(f"DHEAS={dheas}")

    met = bool(clinical_signs) or bool(biochemical_hits)
    parts = []
    if clinical_signs:
        parts.append("clinical signs: " + ", ".join(clinical_signs))
    if biochemical_hits:
        parts.append("biochemical: " + ", ".join(biochemical_hits))
    explanation = "; ".join(parts) if parts else "No clinical or biochemical hyperandrogenism detected."
    return met, explanation


def _is_ovulatory_dysfunction(patient: Dict[str, Any]) -> (bool, str):
    """Detect ovulatory dysfunction (oligo/amenorrhea) from cycle data.

    Uses cycle length (>35 days) or an explicit irregular-cycle flag.
    """
    cycle_len = float(patient.get("cycleLength") or 0)
    cycle_flag = bool(patient.get("cycleValue") and float(patient.get("cycleValue")) >= 1)
    met = cycle_len > 35 or cycle_flag
    if cycle_len > 35 and cycle_flag:
        explanation = f"Prolonged cycle length ({cycle_len} days) and irregular cycle flag present."
    elif cycle_len > 35:
        explanation = f"Prolonged cycle length ({cycle_len} days) consistent with oligo/amenorrhea."
    elif cycle_flag:
        explanation = "Reported irregular cycles (patient-reported or encoded)."
    else:
        explanation = "Cycle length and regularity do not suggest ovulatory dysfunction."
    return met, explanation


def _is_pcos_morphology(patient: Dict[str, Any]) -> (bool, str):
    """Detect polycystic ovarian morphology (PCOM) using follicles/volume/AMH.

    Per Rotterdam, follicle counts >= 12 in either ovary suggests PCOM.
    We also consider raised AMH or increased ovarian volume as supporting evidence.
    """
    fl = float(patient.get("follicleLeft") or 0)
    fr = float(patient.get("follicleRight") or 0)
    avl = float(patient.get("avgSizeLeft") or 0)
    avr = float(patient.get("avgSizeRight") or 0)
    amh = float(patient.get("amh") or 0)

    follicle_hit = fl >= FOLLICLE_COUNT_THRESHOLD or fr >= FOLLICLE_COUNT_THRESHOLD
    volume_hit = avl > OVARY_VOLUME_THRESHOLD or avr > OVARY_VOLUME_THRESHOLD
    amh_hit = amh >= AMH_PCOS_THRESHOLD

    met = follicle_hit or volume_hit or amh_hit
    reasons = []
    if follicle_hit:
        reasons.append(f"follicle counts (L={int(fl)}, R={int(fr)})")
    if volume_hit:
        reasons.append(f"ovarian volume (L={avl}, R={avr} mm)")
    if amh_hit:
        reasons.append(f"AMH={amh} ng/mL")

    explanation = ", ".join(reasons) if reasons else "No ultrasound/AMH evidence of PCOM."
    return met, explanation


def evaluate_rotterdam(patient: Dict[str, Any], model_probability: Optional[float] = None) -> Dict[str, Any]:
    """Evaluate the Rotterdam criteria and produce phenotype + explanation.

    Returns a dictionary with keys:
    - type: 'A'|'B'|'C'|'D'|'N/A'
    - name: short phenotype name
    - description: brief clinical description
    - criteria: mapping of each criterion to (met, explanation)
    - summary: human-readable interpretation that integrates ML probability when available

    Clinical reasoning comments are embedded in the returned explanations for auditability.
    """
    ha_met, ha_ex = _is_hyperandrogenism(patient)
    od_met, od_ex = _is_ovulatory_dysfunction(patient)
    pcom_met, pcom_ex = _is_pcos_morphology(patient)

    criteria = {
        "hyperandrogenism": {"met": ha_met, "explanation": ha_ex},
        "ovulatoryDysfunction": {"met": od_met, "explanation": od_ex},
        "polycysticOvaries": {"met": pcom_met, "explanation": pcom_ex},
    }

    met_count = sum(1 for c in criteria.values() if c["met"])

    # Phenotype mapping per Rotterdam definitions
    if ha_met and od_met and pcom_met:
        ptype = "A"
        name = "Type A (Classic)"
        desc = "All three criteria present — classic PCOS phenotype with higher metabolic risk."
    elif ha_met and od_met:
        ptype = "B"
        name = "Type B"
        desc = "Hyperandrogenism with ovulatory dysfunction, without PCOM."
    elif ha_met and pcom_met:
        ptype = "C"
        name = "Type C"
        desc = "Hyperandrogenism with PCOM but preserved ovulation."
    elif od_met and pcom_met:
        ptype = "D"
        name = "Type D"
        desc = "Ovulatory dysfunction with PCOM but without hyperandrogenism."
    else:
        ptype = "N/A"
        name = "Non-PCOS / Uncertain"
        desc = "Does not meet at least two Rotterdam criteria for PCOS diagnosis."

    # Integrate ML probability gently — produce an interpretation string.
    prob_note = ""
    if model_probability is not None:
        prob_pct = int(round(model_probability * 100))
        if met_count >= 2 and model_probability >= 0.6:
            prob_note = f"ML model supports clinical diagnosis (model {prob_pct}%)."
        elif met_count >= 2 and model_probability < 0.6:
            prob_note = f"Clinical criteria suggest PCOS but ML model is less certain (model {prob_pct}%)."
        elif met_count < 2 and model_probability >= 0.6:
            prob_note = f"ML model suggests elevated probability ({prob_pct}%) despite not meeting 2 criteria — consider further testing."
        else:
            prob_note = f"ML model probability {prob_pct}%; concordant with clinical criteria."

    summary_parts = [f"Rotterdam criteria met: {met_count}/3"]
    if prob_note:
        summary_parts.append(prob_note)
    summary = " — ".join(summary_parts)

    return {
        "type": ptype,
        "name": name,
        "description": desc,
        "criteria": criteria,
        "metCount": met_count,
        "summary": summary,
    }
