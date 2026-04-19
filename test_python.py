import pandas as pd
import sys
import os

sys.path.append(os.path.abspath('analytics_engine'))

from models.anomaly import run_anomaly_detection
from models.forecasting import run_time_series_forecast

try:
    print("Loading CSV...")
    df = pd.read_csv("DataCoSupplyChainDataset.csv", encoding="latin-1")
    print("CSV loaded. Rows:", len(df))
    
    print("Running Anomaly Detection...")
    res1 = run_anomaly_detection(df)
    print("Anomaly Detection Success. Keys:", res1.keys())
    
    print("Running Forecasting...")
    res2 = run_time_series_forecast(df)
    if "error" in res2:
        print("Forecast Error:", res2["error"])
    else:
        print("Forecast Success.")
        
    print("Testing JSON Serialization...")
    import json
    json.dumps(res1)
    json.dumps(res2)
    print("Serialization OK!")
    
except Exception as e:
    import traceback
    traceback.print_exc()
