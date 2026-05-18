# ============================================================
# ROTTERDAM CRITERIA ENGINE
# ============================================================

def evaluate_rotterdam_criteria(patient_data):

    criteria_met = []

    # --------------------------------------------------------
    # HYPERANDROGENISM
    # --------------------------------------------------------

    acne = patient_data.get("acne", 0)
    hair_growth = patient_data.get("hair_growth", 0)

    if acne == 1 or hair_growth == 1:
        criteria_met.append("Hyperandrogenism")

    # --------------------------------------------------------
    # OVULATORY DYSFUNCTION
    # --------------------------------------------------------

    cycle_regular = patient_data.get("cycle_regular", 1)

    if cycle_regular == 0:
        criteria_met.append("Ovulatory Dysfunction")

    # --------------------------------------------------------
    # POLYCYSTIC OVARIES
    # --------------------------------------------------------

    follicles_left = patient_data.get("follicles_left", 0)
    follicles_right = patient_data.get("follicles_right", 0)

    if follicles_left >= 12 or follicles_right >= 12:
        criteria_met.append("Polycystic Ovaries")

    # --------------------------------------------------------
    # FINAL ROTTERDAM DECISION
    # --------------------------------------------------------

    rotterdam_positive = len(criteria_met) >= 2

    # --------------------------------------------------------
    # PHENOTYPE CLASSIFICATION
    # --------------------------------------------------------

        # ============================================================
    # IMPROVED PHENOTYPE ASSIGNMENT
    # ============================================================

    bmi = patient_data.get("BMI", 22)
    amh = patient_data.get("AMH", 3)

    # TYPE A
    # Hyperandrogenism + ovulatory dysfunction + PCO

    if has_hyper and has_ovulatory and has_ovaries:

        phenotype = "Type A - Classic Hyperandrogenic PCOS"


    # TYPE B
    # Hyperandrogenism + ovulatory dysfunction
    # without obvious polycystic ovaries

    elif has_hyper and has_ovulatory and not has_ovaries:

        phenotype = "Type B - Non-PCO PCOS"


    # TYPE C
    # Ovulatory phenotype with ovarian morphology

    elif has_hyper and has_ovaries and not has_ovulatory:

        phenotype = "Type C - Ovulatory PCOS"


    # TYPE D
    # Normo-androgenic phenotype

    elif has_ovulatory and has_ovaries and not has_hyper:

        phenotype = "Type D - Normo-androgenic PCOS"

    # --------------------------------------------------------
    # RETURN RESULTS
    # --------------------------------------------------------

    return {
        "criteria_met": criteria_met,
        "criteria_count": len(criteria_met),
        "rotterdam_positive": rotterdam_positive,
        "phenotype": phenotype
    }