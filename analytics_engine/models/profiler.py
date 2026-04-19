import pandas as pd
import numpy as np

def run_data_profile(df: pd.DataFrame) -> dict:
    """Generate comprehensive dataset profiling statistics."""
    total_rows = len(df)
    total_cols = len(df.columns)
    
    # Column-level stats
    columns_info = []
    for col in df.columns:
        info = {
            "name": col,
            "dtype": str(df[col].dtype),
            "missing": int(df[col].isnull().sum()),
            "missing_pct": round(df[col].isnull().sum() / total_rows * 100, 1),
            "unique": int(df[col].nunique()),
        }
        if pd.api.types.is_numeric_dtype(df[col]):
            info["mean"] = round(float(df[col].mean()), 2) if not df[col].isnull().all() else None
            info["std"] = round(float(df[col].std()), 2) if not df[col].isnull().all() else None
            info["min"] = round(float(df[col].min()), 2) if not df[col].isnull().all() else None
            info["max"] = round(float(df[col].max()), 2) if not df[col].isnull().all() else None
            info["category"] = "numeric"
        else:
            info["category"] = "categorical"
            top = df[col].value_counts().head(3)
            info["top_values"] = [{"value": str(k), "count": int(v)} for k, v in top.items()]
        columns_info.append(info)
    
    # Data quality score
    total_missing = df.isnull().sum().sum()
    total_cells = total_rows * total_cols
    quality_score = round((1 - total_missing / total_cells) * 100, 1) if total_cells > 0 else 0
    
    return {
        "total_rows": total_rows,
        "total_columns": total_cols,
        "total_missing": int(total_missing),
        "quality_score": quality_score,
        "memory_mb": round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2),
        "numeric_columns": len(df.select_dtypes(include=[np.number]).columns),
        "categorical_columns": len(df.select_dtypes(exclude=[np.number]).columns),
        "columns": columns_info
    }


def run_correlation(df: pd.DataFrame) -> dict:
    """Generate correlation matrix for numeric columns."""
    numeric_df = df.select_dtypes(include=[np.number])
    
    if len(numeric_df.columns) < 2:
        return {"error": "Not enough numeric columns for correlation analysis."}
    
    # Limit to top 15 numeric cols by variance to avoid huge matrices
    if len(numeric_df.columns) > 15:
        top_cols = numeric_df.var().nlargest(15).index.tolist()
        numeric_df = numeric_df[top_cols]
    
    corr = numeric_df.corr().round(3)
    
    # Find top correlations (excluding self-correlation)
    pairs = []
    cols = corr.columns.tolist()
    for i in range(len(cols)):
        for j in range(i+1, len(cols)):
            pairs.append({
                "col1": cols[i],
                "col2": cols[j],
                "correlation": float(corr.iloc[i, j])
            })
    
    pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)
    
    return {
        "columns": cols,
        "matrix": corr.values.tolist(),
        "top_correlations": pairs[:10]
    }


def run_distribution(df: pd.DataFrame) -> dict:
    """Generate histogram/distribution data for numeric columns."""
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if not numeric_cols:
        return {"error": "No numeric columns found."}
    
    # Pick top 8 most useful columns (by variance)
    if len(numeric_cols) > 8:
        top_cols = df[numeric_cols].var().nlargest(8).index.tolist()
    else:
        top_cols = numeric_cols
    
    distributions = []
    for col in top_cols:
        data = df[col].dropna()
        if len(data) == 0:
            continue
        
        hist, bin_edges = np.histogram(data, bins=20)
        distributions.append({
            "column": col,
            "histogram": [{"bin_start": round(float(bin_edges[i]), 2), "bin_end": round(float(bin_edges[i+1]), 2), "count": int(hist[i])} for i in range(len(hist))],
            "mean": round(float(data.mean()), 2),
            "median": round(float(data.median()), 2),
            "std": round(float(data.std()), 2)
        })
    
    return {"distributions": distributions}
