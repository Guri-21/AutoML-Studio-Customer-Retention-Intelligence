import pandas as pd
import numpy as np


def run_data_health(df: pd.DataFrame) -> dict:
    """
    Comprehensive data quality assessment.
    Returns per-column health metrics, duplicate info, and overall quality scores.
    """
    total_rows = len(df)
    total_cols = len(df.columns)

    # --- Per-column quality ---
    column_health = []
    for col in df.columns:
        missing = int(df[col].isnull().sum())
        missing_pct = round(missing / total_rows * 100, 1) if total_rows > 0 else 0
        unique = int(df[col].nunique())
        unique_pct = round(unique / total_rows * 100, 1) if total_rows > 0 else 0

        health = {
            "name": col,
            "dtype": str(df[col].dtype),
            "missing": missing,
            "missing_pct": missing_pct,
            "unique": unique,
            "unique_pct": unique_pct,
            "is_constant": unique <= 1,
        }

        if pd.api.types.is_numeric_dtype(df[col]):
            health["category"] = "numeric"
            clean = df[col].dropna()
            if len(clean) > 0:
                q1 = float(clean.quantile(0.25))
                q3 = float(clean.quantile(0.75))
                iqr = q3 - q1
                outlier_count = int(((clean < q1 - 1.5 * iqr) | (clean > q3 + 1.5 * iqr)).sum())
                health["outlier_count"] = outlier_count
                health["outlier_pct"] = round(outlier_count / len(clean) * 100, 1)
                health["zeros"] = int((clean == 0).sum())
                health["negatives"] = int((clean < 0).sum())
        else:
            health["category"] = "categorical"
            health["outlier_count"] = 0
            health["outlier_pct"] = 0

        column_health.append(health)

    # --- Duplicates ---
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = round(duplicate_rows / total_rows * 100, 1) if total_rows > 0 else 0

    # --- Overall scores ---
    total_missing = df.isnull().sum().sum()
    total_cells = total_rows * total_cols
    completeness = round((1 - total_missing / total_cells) * 100, 1) if total_cells > 0 else 0
    uniqueness = round((1 - duplicate_rows / total_rows) * 100, 1) if total_rows > 0 else 0

    # Type consistency: ratio of columns that have a single dominant dtype
    consistency = 100.0  # Simplification: pandas already enforces per-column types

    overall_score = round((completeness * 0.4 + uniqueness * 0.3 + consistency * 0.3), 1)

    # --- Issues summary ---
    issues = []
    high_missing = [c for c in column_health if c["missing_pct"] > 30]
    if high_missing:
        issues.append({
            "type": "high_missing",
            "severity": "warning",
            "message": f"{len(high_missing)} column(s) have >30% missing values",
            "columns": [c["name"] for c in high_missing]
        })
    if duplicate_rows > 0:
        issues.append({
            "type": "duplicates",
            "severity": "warning",
            "message": f"{duplicate_rows:,} duplicate rows found ({duplicate_pct}%)",
            "count": duplicate_rows
        })
    constant_cols = [c for c in column_health if c["is_constant"]]
    if constant_cols:
        issues.append({
            "type": "constant_columns",
            "severity": "info",
            "message": f"{len(constant_cols)} column(s) have only one unique value",
            "columns": [c["name"] for c in constant_cols]
        })
    high_outlier = [c for c in column_health if c.get("outlier_pct", 0) > 5]
    if high_outlier:
        issues.append({
            "type": "high_outliers",
            "severity": "info",
            "message": f"{len(high_outlier)} column(s) have >5% outlier values (IQR method)",
            "columns": [c["name"] for c in high_outlier]
        })

    return {
        "overall_score": overall_score,
        "completeness": completeness,
        "uniqueness": uniqueness,
        "consistency": consistency,
        "total_rows": total_rows,
        "total_columns": total_cols,
        "total_missing": int(total_missing),
        "duplicate_rows": duplicate_rows,
        "duplicate_pct": duplicate_pct,
        "column_health": column_health,
        "issues": issues,
    }


def auto_fix_dataset(df: pd.DataFrame) -> tuple:
    """
    Apply automatic data quality fixes:
    1. Fill missing numerics with column median
    2. Fill missing categoricals with column mode
    3. Remove duplicate rows
    Returns (fixed_df, change_log).
    """
    change_log = []
    fixed = df.copy()

    # 1. Fill missing numerics
    numeric_cols = fixed.select_dtypes(include=[np.number]).columns.tolist()
    for col in numeric_cols:
        missing = fixed[col].isnull().sum()
        if missing > 0:
            median_val = fixed[col].median()
            fixed[col] = fixed[col].fillna(median_val)
            change_log.append({
                "action": "fill_missing",
                "column": col,
                "method": "median",
                "fill_value": round(float(median_val), 4),
                "rows_affected": int(missing)
            })

    # 2. Fill missing categoricals
    cat_cols = fixed.select_dtypes(exclude=[np.number]).columns.tolist()
    for col in cat_cols:
        missing = fixed[col].isnull().sum()
        if missing > 0:
            mode_val = fixed[col].mode()
            if len(mode_val) > 0:
                fill = mode_val.iloc[0]
                fixed[col] = fixed[col].fillna(fill)
                change_log.append({
                    "action": "fill_missing",
                    "column": col,
                    "method": "mode",
                    "fill_value": str(fill),
                    "rows_affected": int(missing)
                })

    # 3. Remove duplicates
    dup_count = int(fixed.duplicated().sum())
    if dup_count > 0:
        fixed = fixed.drop_duplicates()
        change_log.append({
            "action": "remove_duplicates",
            "rows_removed": dup_count
        })

    return fixed, change_log
