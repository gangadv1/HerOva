# ============================================================
# ROTTERDAM CRITERIA ENGINE
# ============================================================

def _to_number(value, default=0):
    try:
        if value is None:
            return default
        if isinstance(value, bool):
            return int(value)
        return float(value)
    except (TypeError, ValueError):
        return default


def _to_bool(value):
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


def evaluate_rotterdam_criteria(patient_data):
    patient_data = patient_data or {}

    criteria_met = []

    # --------------------------------------------------------
    # HYPERANDROGENISM
    # --------------------------------------------------------

    acne = _to_bool(patient_data.get("acne")) or _to_bool(patient_data.get("Pimples(Y/N)"))
    hair_growth = _to_bool(patient_data.get("hair_growth")) or _to_bool(patient_data.get("hirsutism")) or _to_bool(patient_data.get("hair_growth(Y/N)"))
    hair_loss = _to_bool(patient_data.get("hairLoss")) or _to_bool(patient_data.get("Hair loss(Y/N)"))
    skin_darkening = _to_bool(patient_data.get("skinDarkening")) or _to_bool(patient_data.get("Skin darkening (Y/N)"))
    total_testosterone = _to_number(patient_data.get("totalTestosterone"))
    free_testosterone = _to_number(patient_data.get("freeTestosterone"))
    hirsutism_score = _to_number(patient_data.get("hirsutismScore"))

    if acne or hair_growth or hair_loss or skin_darkening or total_testosterone >= 60 or free_testosterone >= 4 or hirsutism_score >= 8:
        criteria_met.append("Hyperandrogenism")

    # --------------------------------------------------------
    # OVULATORY DYSFUNCTION
    # --------------------------------------------------------

    cycle_regular = patient_data.get("cycle_regular")
    irregular_periods = _to_bool(patient_data.get("irregularPeriods"))
    cycle_length = _to_number(patient_data.get("cycleLength"))
    cycle_length_variability = str(patient_data.get("cycleLengthVariability", "")).strip().lower()

    if cycle_regular is None:
        cycle_regular = 0 if irregular_periods or cycle_length >= 35 or cycle_length_variability in {"irregular", "high", "moderate"} else 1

    if _to_number(cycle_regular) == 0:
        criteria_met.append("Ovulatory Dysfunction")

    # --------------------------------------------------------
    # POLYCYSTIC OVARIES
    # --------------------------------------------------------

    follicles_left = _to_number(patient_data.get("follicles_left"), _to_number(patient_data.get("follicleCountLeft")))
    follicles_right = _to_number(patient_data.get("follicles_right"), _to_number(patient_data.get("follicleCountRight")))
    polycystic_appearance = _to_bool(patient_data.get("polycysticAppearance"))
    ovary_volume_left = _to_number(patient_data.get("ovaryVolumeLeft"))
    ovary_volume_right = _to_number(patient_data.get("ovaryVolumeRight"))

    if (
        follicles_left >= 12
        or follicles_right >= 12
        or polycystic_appearance
        or ovary_volume_left >= 10
        or ovary_volume_right >= 10
    ):
        criteria_met.append("Polycystic Ovaries")

    # --------------------------------------------------------
    # FINAL ROTTERDAM DECISION
    # --------------------------------------------------------

    rotterdam_positive = len(criteria_met) >= 2

    has_hyper = "Hyperandrogenism" in criteria_met
    has_ovulatory = "Ovulatory Dysfunction" in criteria_met
    has_ovaries = "Polycystic Ovaries" in criteria_met

    phenotype = "Non-PCOS"
    if has_hyper and has_ovulatory and has_ovaries:
        phenotype = "Type A - Classic Hyperandrogenic PCOS"
    elif has_hyper and has_ovulatory and not has_ovaries:
        phenotype = "Type B - Non-PCO PCOS"
    elif has_hyper and has_ovaries and not has_ovulatory:
        phenotype = "Type C - Ovulatory PCOS"
    elif has_ovulatory and has_ovaries and not has_hyper:
        phenotype = "Type D - Normo-androgenic PCOS"
    elif rotterdam_positive:
        phenotype = "PCOS - Unclassified"

    return {
        "criteria_met": criteria_met,
        "criteria_count": len(criteria_met),
        "rotterdam_positive": rotterdam_positive,
        "phenotype": phenotype,
    }