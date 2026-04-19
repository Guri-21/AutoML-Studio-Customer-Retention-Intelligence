import pandas as pd
import numpy as np

def run_time_series_forecast(df: pd.DataFrame) -> dict:
    """
    Dynamically attempts to find a Date column and a Sales/Revenue column,
    aggregates it daily, and produces a 30-day forward forecast using linear trend + moving average.
    """
    # 1. Find a Date Column
    date_cols = df.select_dtypes(include=['datetime64', 'object']).columns.tolist()
    
    date_col = None
    for col in date_cols:
        if 'date' in col.lower() or 'time' in col.lower():
            try:
                # Test if it can be cast to datetime
                pd.to_datetime(df[col].iloc[0])
                date_col = col
                break
            except:
                pass
                
    if not date_col:
        return {"error": "Could not identify a valid Date column for Time-Series forecasting."}
        
    # 2. Find a Sales/Revenue Column
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    target_col = None
    for col in numeric_cols:
        if 'sales' in col.lower() or 'revenue' in col.lower() or 'price' in col.lower() or 'total' in col.lower():
            target_col = col
            break
            
    if not target_col and numeric_cols:
        target_col = numeric_cols[0] 
        
    if not target_col:
         return {"error": "Could not identify a valid Target (Sales/Revenue) column."}

    # 3. Aggregate Data
    df['forecast_date'] = pd.to_datetime(df[date_col], errors='coerce')
    df_clean = df.dropna(subset=['forecast_date', target_col])
    
    daily_data = df_clean.groupby(df_clean['forecast_date'].dt.date)[target_col].sum().reset_index()
    daily_data.columns = ['Date', 'Value']
    daily_data = daily_data.sort_values('Date')
    
    if len(daily_data) < 10:
        return {"error": "Not enough historical data points to forecast."}
        
    # 4. Simple Forecasting (30 days) 
    y = daily_data['Value'].values
    x = np.arange(len(y))
    
    z = np.polyfit(x, y, 1)
    p = np.poly1d(z)
    
    last_date = pd.to_datetime(daily_data['Date'].iloc[-1])
    future_dates = [last_date + pd.Timedelta(days=i) for i in range(1, 31)]
    future_x = np.arange(len(y), len(y) + 30)
    
    future_trend = p(future_x)
    
    recent_ma = np.mean(y[-7:])
    trend_end = p(x[-1])
    offset = recent_ma - trend_end
    
    future_predictions = future_trend + offset
    future_predictions = np.maximum(future_predictions, 0)

    # 5. Format JSON output
    historical_points = daily_data.tail(30).to_dict(orient='records')
    historical_formatted = [{"date": str(row['Date']), "value": round(row['Value'], 2)} for row in historical_points]
    
    forecast_formatted = [{"date": str(d.date()), "value": round(v, 2)} for d, v in zip(future_dates, future_predictions)]
    
    return {
        "date_column_used": date_col,
        "target_column_used": target_col,
        "historical_data_sample": historical_formatted,
        "forecast_data": forecast_formatted,
        "forecast_period_days": 30
    }


# ─── Helper functions for column detection ───

def _detect_date_col(df):
    """Auto-detect the best date column."""
    for col in df.select_dtypes(include=['datetime64', 'object']).columns:
        if any(kw in col.lower() for kw in ['date', 'time', 'timestamp']):
            try:
                pd.to_datetime(df[col].dropna().iloc[0])
                return col
            except Exception:
                pass
    return None


def _detect_customer_col(df):
    """Auto-detect customer ID column."""
    for col in df.columns:
        if any(kw in col.lower() for kw in ['customer_id', 'customer id', 'cust_id', 'user_id', 'userid', 'client']):
            return col
    for col in df.columns:
        if 'id' in col.lower() and df[col].nunique() > 10:
            return col
    return None


def _detect_product_col(df):
    """Auto-detect product name/category column."""
    for col in df.columns:
        if any(kw in col.lower() for kw in ['product name', 'product_name', 'item_name', 'item name']):
            return col
    for col in df.columns:
        if any(kw in col.lower() for kw in ['category name', 'category_name', 'product category', 'product_category']):
            return col
    for col in df.columns:
        if 'product' in col.lower() and df[col].dtype == 'object':
            return col
    for col in df.columns:
        if 'category' in col.lower() and df[col].dtype == 'object':
            return col
    return None


def _detect_quantity_col(df):
    """Auto-detect quantity column."""
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in numeric_cols:
        if any(kw in col.lower() for kw in ['quantity', 'qty', 'units', 'count']):
            return col
    return None


def _detect_sales_col(df):
    """Auto-detect sales/revenue column."""
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    for col in numeric_cols:
        if any(kw in col.lower() for kw in ['sales', 'revenue', 'amount', 'total', 'price', 'monetary']):
            return col
    return numeric_cols[0] if numeric_cols else None


def _mini_forecast(daily_data, n_days=30):
    """Run a simple linear trend + MA forecast on a daily series."""
    if len(daily_data) < 5:
        return [], "Stable", 0.0

    y = daily_data['Value'].values
    x = np.arange(len(y))

    z = np.polyfit(x, y, 1)
    p = np.poly1d(z)

    last_date = pd.to_datetime(daily_data['Date'].iloc[-1])
    future_dates = [last_date + pd.Timedelta(days=i) for i in range(1, n_days + 1)]
    future_x = np.arange(len(y), len(y) + n_days)

    future_trend = p(future_x)
    recent_ma = np.mean(y[-min(7, len(y)):])
    trend_end = p(x[-1])
    offset = recent_ma - trend_end
    future_predictions = np.maximum(future_trend + offset, 0)

    # Determine trend
    first_val = future_predictions[0]
    last_val = future_predictions[-1]
    if first_val > 0:
        change_pct = round(((last_val - first_val) / first_val) * 100, 1)
    else:
        change_pct = 0.0

    if change_pct > 5:
        trend = "Upward"
    elif change_pct < -5:
        trend = "Downward"
    else:
        trend = "Stable"

    forecast_formatted = [
        {"date": str(d.date()), "value": round(float(v), 2)}
        for d, v in zip(future_dates, future_predictions)
    ]

    return forecast_formatted, trend, change_pct


# ─── Product Retention Forecast ───

def run_product_retention_forecast(df: pd.DataFrame) -> dict:
    """
    Identifies which products drive customer retention (repeat purchases),
    forecasts demand for those products, and generates manufacturing recommendations.

    Strategy:
    1. Detect customer ID, date, product, and sales columns
    2. Identify returning customers (≥2 distinct order dates)
    3. Compute which products returners buy disproportionately
    4. Forecast demand per top retention-driving product
    5. Generate manufacturing recommendations
    """

    # --- Step 1: Auto-detect columns ---
    date_col = _detect_date_col(df)
    customer_col = _detect_customer_col(df)
    product_col = _detect_product_col(df)
    sales_col = _detect_sales_col(df)
    quantity_col = _detect_quantity_col(df)

    if not date_col or not customer_col:
        return {"error": "Could not auto-detect required columns (Customer ID, Date) for product retention analysis."}

    if not product_col:
        return {"error": "Could not auto-detect a Product Name or Category column for retention analysis."}

    # --- Step 2: Parse and clean ---
    work = df.copy()
    work['_date'] = pd.to_datetime(work[date_col], errors='coerce')
    work = work.dropna(subset=['_date', customer_col, product_col])

    if len(work) < 50:
        return {"error": "Not enough valid rows for product retention analysis."}

    # --- Step 3: Identify returning vs one-time customers ---
    customer_order_dates = work.groupby(customer_col)['_date'].nunique().reset_index()
    customer_order_dates.columns = ['customer', 'distinct_dates']

    returning_customers = set(customer_order_dates[customer_order_dates['distinct_dates'] >= 2]['customer'])
    one_time_customers = set(customer_order_dates[customer_order_dates['distinct_dates'] == 1]['customer'])

    total_customers = len(customer_order_dates)
    returning_count = len(returning_customers)

    if returning_count < 5:
        return {"error": "Not enough returning customers to analyze product retention patterns."}

    return_rate = round((returning_count / total_customers) * 100, 1)

    # --- Step 4: Product affinity analysis ---
    returner_orders = work[work[customer_col].isin(returning_customers)]
    onetime_orders = work[work[customer_col].isin(one_time_customers)]

    returner_product_counts = returner_orders[product_col].value_counts()
    onetime_product_counts = onetime_orders[product_col].value_counts()

    total_returner_orders = len(returner_orders)
    total_onetime_orders = max(len(onetime_orders), 1)

    # Compute share percentages for each product
    product_stats = []
    for product in returner_product_counts.head(20).index:
        ret_count = int(returner_product_counts.get(product, 0))
        ot_count = int(onetime_product_counts.get(product, 0))

        ret_share = round((ret_count / total_returner_orders) * 100, 1)
        ot_share = round((ot_count / total_onetime_orders) * 100, 1)

        # Retention lift = how much more likely returners buy this vs one-timers
        retention_lift = round(ret_share / max(ot_share, 0.1), 2)

        product_stats.append({
            "product": str(product),
            "return_customer_orders": ret_count,
            "return_customer_share_pct": ret_share,
            "one_time_buyer_share_pct": ot_share,
            "retention_lift": retention_lift,
        })

    # Sort by retention lift * volume (balanced scoring)
    for ps in product_stats:
        ps['_score'] = ps['retention_lift'] * np.log1p(ps['return_customer_orders'])
    product_stats.sort(key=lambda x: x['_score'], reverse=True)

    # --- Step 5: Per-product forecast for top 5 ---
    top_products = product_stats[:5]
    value_col = sales_col or quantity_col

    for prod_stat in top_products:
        product_name = prod_stat['product']
        prod_data = work[work[product_col] == product_name].copy()

        if value_col and value_col in prod_data.columns:
            daily = prod_data.groupby(prod_data['_date'].dt.date)[value_col].sum().reset_index()
        else:
            daily = prod_data.groupby(prod_data['_date'].dt.date).size().reset_index()

        daily.columns = ['Date', 'Value']
        daily = daily.sort_values('Date')

        # Historical data (last 30 points)
        hist_points = daily.tail(30)
        prod_stat['historical_data'] = [
            {"date": str(row['Date']), "value": round(float(row['Value']), 2)}
            for _, row in hist_points.iterrows()
        ]

        # Forecast
        forecast_data, trend, trend_pct = _mini_forecast(daily, n_days=30)
        prod_stat['forecast_data'] = forecast_data
        prod_stat['trend'] = trend
        prod_stat['trend_change_pct'] = trend_pct

        # Generate recommendation
        if trend == "Upward" and prod_stat['retention_lift'] > 1.5:
            prod_stat['recommendation'] = f"Increase production — this product drives customer retention with growing demand (+{trend_pct}%)"
            action = "increase"
            urgency = "high" if trend_pct > 10 else "medium"
        elif trend == "Upward":
            prod_stat['recommendation'] = f"Consider increasing stock — demand is growing (+{trend_pct}%)"
            action = "increase"
            urgency = "medium" if trend_pct > 10 else "low"
        elif trend == "Downward" and trend_pct < -10:
            prod_stat['recommendation'] = f"Reduce inventory — demand is declining ({trend_pct}%)"
            action = "decrease"
            urgency = "medium"
        elif trend == "Downward":
            prod_stat['recommendation'] = f"Monitor closely — slight demand decline ({trend_pct}%)"
            action = "hold"
            urgency = "low"
        else:
            prod_stat['recommendation'] = "Maintain current production levels — demand is stable"
            action = "hold"
            urgency = "low"

        prod_stat['action'] = action
        prod_stat['urgency'] = urgency

        # Remove internal scoring key
        del prod_stat['_score']

    # Also clean up remaining products (not in top 5)
    for ps in product_stats[5:]:
        if '_score' in ps:
            del ps['_score']

    # --- Step 6: Build manufacturing actions summary ---
    manufacturing_actions = []
    for prod in top_products:
        manufacturing_actions.append({
            "product": prod['product'],
            "action": prod['action'],
            "urgency": prod['urgency'],
            "reason": prod['recommendation'],
            "retention_lift": prod['retention_lift'],
            "trend_change_pct": prod['trend_change_pct']
        })

    # Detect category column for enrichment
    category_col = None
    for col in df.columns:
        if any(kw in col.lower() for kw in ['category name', 'category_name']):
            category_col = col
            break

    # Add category info if available
    if category_col and category_col != product_col:
        for prod in top_products:
            cat_match = work[work[product_col] == prod['product']][category_col]
            if len(cat_match) > 0:
                prod['category'] = str(cat_match.mode().iloc[0]) if len(cat_match.mode()) > 0 else str(cat_match.iloc[0])
            else:
                prod['category'] = "Unknown"
    else:
        for prod in top_products:
            prod['category'] = "—"

    return {
        "returning_customer_count": int(returning_count),
        "total_customers": int(total_customers),
        "return_rate_pct": return_rate,
        "top_retention_products": top_products,
        "all_product_stats": product_stats[:15],  # Top 15 for reference
        "manufacturing_actions": manufacturing_actions,
        "columns_used": {
            "customer": customer_col,
            "date": date_col,
            "product": product_col,
            "sales": sales_col,
            "quantity": quantity_col,
            "category": category_col
        }
    }
