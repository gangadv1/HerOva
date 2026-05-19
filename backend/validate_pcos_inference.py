"""
Offline validation script — compares PCOS inference from 41-column clinical CSV
against ground-truth PCOS (Y/N) labels from the 42-column labelled dataset.

NOT used in production. PCOS (Y/N) is validation ground truth only.

Usage:
    python backend/validate_pcos_inference.py \
        --clinical /path/to/sample_batch_upload.csv \
        --labelled /path/to/sample_batch_upload_with_pcos.csv
"""
import csv
import argparse


def get(row, keys, default=""):
    for k in keys:
        v = row.get(k, "")
        if v is not None:
            v = str(v).strip()
            if v:
                return v
    return default


def to_num(v, default=0.0):
    try:
        return float(str(v).strip()) if str(v).strip() else default
    except (ValueError, TypeError):
        return default


def is_yes(v):
    s = str(v).strip().lower()
    if s in ("y", "yes", "true", "1", "1.0"):
        return True
    try:
        return float(s) > 0
    except (ValueError, TypeError):
        return False


def is_irregular_cycle(v):
    s = str(v).strip().lower()
    n = to_num(s)
    return s in ("i", "irregular") or (n != 0 and n >= 4)


def extract_features(row):
    cycle_code = to_num(get(row, ["Cycle(R/I)"]))
    cycle_len = to_num(get(row, ["Cycle length(days)"]))
    fol_l = to_num(get(row, ["Follicle No. (L)"]))
    fol_r = to_num(get(row, ["Follicle No. (R)"]))
    amh = to_num(get(row, ["AMH(ng/mL)"]))
    hirsutism = is_yes(get(row, ["hair growth(Y/N)"]))
    acne = is_yes(get(row, ["Pimples(Y/N)"]))
    hair_loss = is_yes(get(row, ["Hair loss(Y/N)"]))
    skin_dark = is_yes(get(row, ["Skin darkening (Y/N)"]))
    return dict(
        irregular=is_irregular_cycle(str(cycle_code)) or cycle_len > 35,
        hasHA=hirsutism or acne or hair_loss or skin_dark,
        fol_l=fol_l,
        fol_r=fol_r,
        total_fol=fol_l + fol_r,
        amh=amh,
    )


def infer_pcos(feat):
    """
    Mirrors determineLocalPhenotype in lib/api.ts.

    Extended PCOM: per-ovary >= 12 OR combined bilateral >= 20.
    Low-reserve exclusion: total < 6 AND AMH < 2 with irregular+HA → Non-PCOS.
    Rotterdam 2-of-3 with extended PCOM.
    """
    has_oligo = feat["irregular"]
    has_ha = feat["hasHA"]
    total = feat["total_fol"]
    has_pcom = feat["fol_l"] >= 12 or feat["fol_r"] >= 12 or total >= 20

    if total < 6 and feat["amh"] < 2 and has_oligo and has_ha:
        return False

    if has_oligo and has_ha:
        return True
    if has_ha and has_pcom:
        return True
    if has_oligo and has_pcom:
        return True
    return False


def metrics(tp, fp, tn, fn):
    total = tp + fp + tn + fn
    acc = (tp + tn) / total if total else 0
    prec = tp / (tp + fp) if (tp + fp) else 0
    rec = tp / (tp + fn) if (tp + fn) else 0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) else 0
    return acc, prec, rec, f1


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--clinical", default="/Users/rheajohnson/Downloads/sample_batch_upload.csv",
                        help="41-column clinical CSV (no PCOS label)")
    parser.add_argument("--labelled", default="/Users/rheajohnson/Downloads/sample_batch_upload_with_pcos.csv",
                        help="42-column CSV with PCOS (Y/N) ground truth")
    args = parser.parse_args()

    with open(args.clinical) as f:
        clinical_rows = list(csv.DictReader(f))
    with open(args.labelled) as f:
        labelled_rows = list(csv.DictReader(f))

    if len(clinical_rows) != len(labelled_rows):
        print(f"WARNING: row count mismatch ({len(clinical_rows)} vs {len(labelled_rows)})")

    tp = fp = tn = fn = 0
    fn_rows = []
    fp_rows = []

    for i, (clin_row, lab_row) in enumerate(zip(clinical_rows, labelled_rows)):
        feat = extract_features(clin_row)
        pred = infer_pcos(feat)
        true_pcos = to_num(get(lab_row, ["PCOS (Y/N)", "PCOS(Y/N)"])) > 0

        if true_pcos and pred:
            tp += 1
        elif not true_pcos and pred:
            fp += 1
            fp_rows.append(i + 1)
        elif not true_pcos and not pred:
            tn += 1
        else:
            fn += 1
            fn_rows.append(i + 1)

    acc, prec, rec, f1 = metrics(tp, fp, tn, fn)
    predicted_pos = tp + fp

    print("=== PCOS Inference Validation ===")
    print(f"Total patients : {len(clinical_rows)}")
    print(f"Predicted PCOS+: {predicted_pos}")
    print(f"True PCOS+     : {tp + fn}")
    print()
    print(f"TP={tp}  FP={fp}  TN={tn}  FN={fn}")
    print(f"Accuracy  : {acc:.3f}")
    print(f"Precision : {prec:.3f}")
    print(f"Recall    : {rec:.3f}")
    print(f"F1        : {f1:.3f}")
    print()
    print(f"False negatives ({fn}): rows {fn_rows[:20]}{'...' if len(fn_rows) > 20 else ''}")
    print(f"False positives ({fp}): rows {fp_rows[:20]}{'...' if len(fp_rows) > 20 else ''}")


if __name__ == "__main__":
    main()
