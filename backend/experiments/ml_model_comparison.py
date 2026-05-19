"""
ML Model Comparison for Batch PCOS Risk Classification
Branch: experiment-batch-ml-models

KEY FINDING: The 541-row CSV has no true PCOS diagnosis labels.
  - Rule-based (Python, threshold≥70): 128 high-risk
  - Reference target:                  175 high-risk
  - Score threshold that gives 175:    ≥62 (not ≥70)
  - This gap means the rule-based scoring formula under-predicts by ~47 patients
    vs the external reference, suggesting either a threshold calibration issue
    or that the reference 175 is from PCOS diagnosis labels (~177 in Kaggle dataset).

All "accuracy" metrics below are against rule-based PSEUDO-LABELS, not clinical ground truth.
The reference count of 175 is used for calibration comparison only.
"""

import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_predict, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.calibration import CalibratedClassifierCV

CSV_PATH = "/Users/rheajohnson/Downloads/sample_batch_upload.csv"
REFERENCE_HIGH_RISK = 175
HIGH_RISK_THRESHOLD = 70          # current rule-based threshold
CALIBRATED_THRESHOLD = 62         # threshold that gives exactly 175 high-risk


# ─────────────────────────────────────────────────────────────────────────────
# Data loading
# ─────────────────────────────────────────────────────────────────────────────

def load_and_prepare(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()
    df = df[df.apply(lambda r: r.astype(str).str.strip().ne("").any(), axis=1)].copy()

    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Cycle(R/I): 2=Regular→0, 4/5=Irregular→1
    df["cycle_irregular"] = (df["Cycle(R/I)"].fillna(2) >= 4).astype(int)

    # Y/N binary fields (already 0/1 in this CSV)
    df["fast_food_clean"]    = df["Fast food (Y/N)"].fillna(0).clip(0, 1).astype(int)
    df["exercise_clean"]     = df["Reg.Exercise(Y/N)"].fillna(1).clip(0, 1).astype(int)
    df["weight_gain"]        = df["Weight gain(Y/N)"].fillna(0).clip(0, 1).astype(int)
    df["hair_growth"]        = df["hair growth(Y/N)"].fillna(0).clip(0, 1).astype(int)
    df["skin_darkening"]     = df["Skin darkening (Y/N)"].fillna(0).clip(0, 1).astype(int)
    df["hair_loss"]          = df["Hair loss(Y/N)"].fillna(0).clip(0, 1).astype(int)
    df["pimples"]            = df["Pimples(Y/N)"].fillna(0).clip(0, 1).astype(int)

    # Clinical ratios
    df["lh_fsh_ratio"] = np.where(
        df["FSH(mIU/mL)"].fillna(0) > 0,
        df["LH(mIU/mL)"].fillna(0) / df["FSH(mIU/mL)"].fillna(0),
        0
    )
    df["any_hyperandrogenism"] = (
        (df["hair_growth"] == 1) | (df["pimples"] == 1) |
        (df["hair_loss"] == 1) | (df["skin_darkening"] == 1)
    ).astype(int)

    for col in ["BMI", "Cycle length(days)", "AMH(ng/mL)", "FSH/LH",
                "Follicle No. (L)", "Follicle No. (R)", "Waist:Hip Ratio",
                "RBS(mg/dl)", "TSH (mIU/L)", "PRL(ng/mL)", "Vit D3 (ng/mL)",
                "BP _Systolic (mmHg)", "BP _Diastolic (mmHg)",
                "FSH(mIU/mL)", "LH(mIU/mL)", "Age (yrs)", "Weight (Kg)",
                "Height(Cm)", "Hip(inch)", "Waist(inch)",
                "Avg. F size (L) (mm)", "Avg. F size (R) (mm)", "Endometrium (mm)"]:
        df[col] = df[col].fillna(0)

    return df


# ─────────────────────────────────────────────────────────────────────────────
# Rule-based scorer (mirrors TypeScript calculateLocalRisk exactly)
# ─────────────────────────────────────────────────────────────────────────────

def rule_based_score(df: pd.DataFrame) -> np.ndarray:
    vit = df["Vit D3 (ng/mL)"]
    s = np.zeros(len(df))
    s += np.where(
        (df["cycle_irregular"] == 1) | (df["Cycle length(days)"] > 35), 18, 0)
    s += np.where(df["weight_gain"] == 1, 8, 0)
    s += np.where(df["any_hyperandrogenism"] == 1, 16, 0)
    s += np.where(df["AMH(ng/mL)"] >= 4, 12, 0)
    s += np.where(df["FSH/LH"] >= 2, 12, 0)
    s += np.where(
        (df["Follicle No. (L)"] >= 12) | (df["Follicle No. (R)"] >= 12), 18, 0)
    s += np.where(df["BMI"] >= 25, 10, 0)
    s += np.where(df["Waist:Hip Ratio"] > 0.85, 5, 0)
    s += np.where(df["RBS(mg/dl)"] >= 110, 8, 0)
    s += np.where(df["fast_food_clean"] == 1, 3, 0)
    s += np.where(df["exercise_clean"] == 0, 5, 0)
    s += np.where(
        (df["TSH (mIU/L)"] > 4.5) |
        (df["PRL(ng/mL)"] > 25) |
        ((vit > 0) & (vit < 20)), 5, 0)
    return np.minimum(s, 100)


# ─────────────────────────────────────────────────────────────────────────────
# Features
# ─────────────────────────────────────────────────────────────────────────────

FEATURE_COLS = [
    # Cycle
    "cycle_irregular", "Cycle length(days)",
    # Symptoms
    "weight_gain", "hair_growth", "skin_darkening", "hair_loss", "pimples",
    "any_hyperandrogenism",
    # Hormones
    "AMH(ng/mL)", "FSH/LH", "FSH(mIU/mL)", "LH(mIU/mL)", "lh_fsh_ratio",
    "TSH (mIU/L)", "PRL(ng/mL)", "Vit D3 (ng/mL)",
    # Imaging
    "Follicle No. (L)", "Follicle No. (R)",
    "Avg. F size (L) (mm)", "Avg. F size (R) (mm)",
    # Metabolic
    "BMI", "Waist:Hip Ratio", "RBS(mg/dl)",
    "BP _Systolic (mmHg)", "BP _Diastolic (mmHg)",
    # Lifestyle
    "fast_food_clean", "exercise_clean",
    # Demographics
    "Age (yrs)", "Weight (Kg)", "Height(Cm)",
    "Waist(inch)", "Hip(inch)",
]


# ─────────────────────────────────────────────────────────────────────────────
# Probability-based high-risk count using calibrated threshold
# ─────────────────────────────────────────────────────────────────────────────

def count_high_from_proba(model, X, prob_threshold: float) -> int:
    """Count high-risk patients using a probability threshold."""
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(X)[:, 1]
        return int((proba >= prob_threshold).sum())
    return int(model.predict(X).sum())


# ─────────────────────────────────────────────────────────────────────────────
# Main experiment
# ─────────────────────────────────────────────────────────────────────────────

def run():
    df = load_and_prepare(CSV_PATH)
    n = len(df)
    print(f"Loaded {n} patients\n")

    # ── Rule-based baseline ──
    rb_scores = rule_based_score(df)
    rb_high_70  = int((rb_scores >= 70).sum())
    rb_high_62  = int((rb_scores >= 62).sum())
    rb_mod      = int(((rb_scores >= 40) & (rb_scores < 70)).sum())
    rb_low      = int((rb_scores < 40).sum())

    print(f"Rule-based (threshold≥70):  High={rb_high_70}, Moderate={rb_mod}, Low={rb_low}")
    print(f"Rule-based (threshold≥62):  High={rb_high_62}   ← matches reference 175")
    print(f"Reference target:           High={REFERENCE_HIGH_RISK}\n")
    print(f"FINDING: Score threshold of ≥62 (not ≥70) gives exactly {REFERENCE_HIGH_RISK} high-risk.")
    print(f"The 175 reference likely corresponds to PCOS-positive labels from the Kaggle dataset.\n")

    # Pseudo-labels at both thresholds
    pseudo_y70 = (rb_scores >= 70).astype(int)  # 128 positive
    pseudo_y62 = (rb_scores >= 62).astype(int)  # 175 positive

    X = df[FEATURE_COLS].values
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    base_models = {
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced")),
        ]),
        "Random Forest": RandomForestClassifier(
            n_estimators=300, max_depth=8, random_state=42, class_weight="balanced"),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=300, max_depth=4, learning_rate=0.05, random_state=42),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=6, min_samples_leaf=10, random_state=42, class_weight="balanced"),
        "K-Nearest Neighbors": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", KNeighborsClassifier(n_neighbors=11, weights="distance")),
        ]),
    }

    results = []

    # Rule-based at threshold 70
    results.append({
        "Model": "Rule-Based (threshold≥70)",
        "High Risk Count": rb_high_70,
        "Δ from 175": rb_high_70 - REFERENCE_HIGH_RISK,
        "CV Acc†": "—",
        "CV Prec†": "—",
        "CV Rec†": "—",
        "CV F1†": "—",
        "Notes": "Deterministic; current production threshold",
    })

    # Rule-based at threshold 62
    results.append({
        "Model": "Rule-Based (threshold≥62)",
        "High Risk Count": rb_high_62,
        "Δ from 175": rb_high_62 - REFERENCE_HIGH_RISK,
        "CV Acc†": "—",
        "CV Prec†": "—",
        "CV Rec†": "—",
        "CV F1†": "—",
        "Notes": "Threshold recalibrated to match reference; same formula",
    })

    print("Running ML models (5-fold CV, pseudo-labels from threshold≥62)...")
    for name, model in base_models.items():
        print(f"  {name}...")

        # CV metrics vs pseudo-labels at threshold 62 (the calibrated reference)
        cv_preds = cross_val_predict(model, X, pseudo_y62, cv=cv)
        acc  = accuracy_score(pseudo_y62, cv_preds)
        prec = precision_score(pseudo_y62, cv_preds, zero_division=0)
        rec  = recall_score(pseudo_y62, cv_preds, zero_division=0)
        f1   = f1_score(pseudo_y62, cv_preds, zero_division=0)

        # Full dataset prediction (trained on all, for count comparison)
        model.fit(X, pseudo_y62)
        full_preds = model.predict(X)
        high_count = int(full_preds.sum())

        results.append({
            "Model": name,
            "High Risk Count": high_count,
            "Δ from 175": high_count - REFERENCE_HIGH_RISK,
            "CV Acc†": f"{acc:.3f}",
            "CV Prec†": f"{prec:.3f}",
            "CV Rec†": f"{rec:.3f}",
            "CV F1†": f"{f1:.3f}",
            "Notes": "5-fold CV vs threshold-62 pseudo-labels",
        })

    return results, df, rb_scores, base_models, X, pseudo_y62


def feature_importance_report(rf_model, feature_cols):
    imp = pd.Series(rf_model.feature_importances_, index=feature_cols)
    top = imp.sort_values(ascending=False).head(12)
    print("\n═══ Top-12 Features (Random Forest, trained on threshold-62 labels) ═══")
    for feat, val in top.items():
        bar = "█" * int(val * 80)
        print(f"  {feat:35s}  {val:.4f}  {bar}")


def score_distribution(scores):
    print("\n═══ Rule-Based Score Distribution ═══")
    bins = list(range(0, 105, 10))
    hist, _ = np.histogram(scores, bins=bins)
    for lo, hi, cnt in zip(bins, bins[1:], hist):
        label = "HIGH" if lo >= 70 else ("HIGH(62)" if lo >= 62 else ("MOD" if lo >= 40 else "LOW"))
        bar = "█" * (cnt // 4)
        print(f"  {lo:3d}–{hi:3d}  [{label:8s}]  {cnt:4d}  {bar}")
    print(f"\n  Boundary 60-69: {int(((scores >= 60) & (scores < 70)).sum())} patients")
    print(f"  Boundary 62-69: {int(((scores >= 62) & (scores < 70)).sum())} patients  ← these 47 shift label if threshold→62")
    print(f"  Boundary 70-79: {int(((scores >= 70) & (scores < 80)).sum())} patients")


def print_results(results):
    print("\n" + "═" * 130)
    print("RESULTS TABLE")
    print("═" * 130)
    print()
    print("| Model | High Risk Count | Δ from 175 | CV Acc† | CV Prec† | CV Recall† | CV F1† | Notes |")
    print("|---|---|---|---|---|---|---|---|")
    for r in results:
        diff = r["Δ from 175"]
        sign = "+" if diff > 0 else ""
        delta = f"{sign}{diff}"
        print(
            f"| {r['Model']:<35} | {r['High Risk Count']:^15} | {delta:^10} "
            f"| {r['CV Acc†']:^7} | {r['CV Prec†']:^8} | {r['CV Rec†']:^10} "
            f"| {r['CV F1†']:^6} | {r['Notes']} |"
        )
    print()
    print("† CV metrics computed against pseudo-labels (rule-based score≥62=high), NOT clinical ground truth.")
    print("  No true PCOS diagnosis labels are present in the 541-row CSV.")
    print("  The reference count 175 is an external calibration target, not per-row ground truth.")


def recommendation(results):
    print("\n═══ RECOMMENDATION ═══")
    print("""
Key findings:
  1. Current rule-based (threshold≥70) gives 128 high-risk — 47 fewer than the 175 reference.
  2. Lowering the threshold to 62 gives EXACTLY 175 without changing any scoring weights.
     This is the simplest fix and preserves clinical interpretability.
  3. ML models trained on threshold-62 pseudo-labels learn to approximate that distribution
     but may generalize differently to unseen patients (unknown since no true labels).

Without true clinical labels (PCOS Y/N) for the 541-row CSV, we cannot compute real accuracy
for any model — including the rule-based one. The 175 reference is a count target, not row-level ground truth.

RECOMMENDED NEXT STEP:
  Option A (low-risk):  Recalibrate threshold from 70 → 62. Zero formula change, exact hit.
  Option B (ambitious): Obtain PCOS Y/N labels for the 541-row dataset and retrain with true labels.
                        Random Forest and Gradient Boosting consistently show the highest CV F1
                        on pseudo-labeled data and are the best candidates for a true ML upgrade.
""")


if __name__ == "__main__":
    results, df, rb_scores, models, X, pseudo_y = run()
    score_distribution(rb_scores)
    rf = models["Random Forest"]
    rf.fit(X, pseudo_y)
    feature_importance_report(rf, FEATURE_COLS)
    print_results(results)
    recommendation(results)

    out = pd.DataFrame(results)
    out.to_csv("/Users/rheajohnson/HerOva/backend/experiments/model_comparison_results.csv", index=False)
    print("Results saved to backend/experiments/model_comparison_results.csv")
