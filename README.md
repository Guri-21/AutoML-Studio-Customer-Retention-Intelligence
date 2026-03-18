# E-commerce Retention Analysis Dashboard
**Advanced Data Analytics & Visualization Project**

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![Streamlit](https://img.shields.io/badge/Streamlit-Interactive-red)
![Pandas](https://img.shields.io/badge/Pandas-Data%20Processing-green)
![Status](https://img.shields.io/badge/Status-Complete-success)

## 🎯 Project Overview

An end-to-end data analytics project analyzing customer retention patterns for an e-commerce platform using the **DataCo Smart Supply Chain** dataset. This project features a comprehensive, interactive Streamlit dashboard designed to uncover complex longitudinal cohort behaviors, derive research-paper quality insights, and demonstrate how customer retention correlates with broader revenue generation over a 3-year period.

### 🔍 Key Analytical Challenge
**Challenge**: Moving beyond static snapshots of customer data to track evolving loyalty and revenue generation over multiple years.  
**Investigation**: Implemented rolling monthly tracking and multi-period cohort analysis spanning from 2015 to 2017.  
**Solution**: Built a dynamic, live-computed dashboard mapping out year-over-year retention, segmenting customer loyalty, and establishing statistical revenue correlations.  
**Impact**: Enabled data-driven strategic planning to address shifting customer retention dynamics.

## 📊 Key Findings & Dataset Scope

| Metric / Insight | Value | Context & Business Significance |
|------------------|-------|--------------------------------|
| **Total Transactions** | 180,519 | Provides a robust, statistically significant sample size |
| **Total Customers** | 20,652 | Diverse customer base allowing for deep sub-segmentation |
| **YoY Retention '15→'16** | 80.5% | Very strong initial annual retention rate |
| **YoY Retention '16→'17** | 70.3% | Highlights a noticeable drop requiring strategic remarketing |
| **Total Time Span** | 3 Years | 2015-2017 continuous analytical tracking |

## 🚀 Interactive Dashboard Features

The core deliverable of this project is a fully interactive, locally hosted Streamlit application providing real-time slices of data:

1. **Executive Summary**: Essential KPI metric cards dynamically summarizing total customers, active overall orders, total revenue, and overall average retention.
2. **Year-over-Year Retention**: Comparative bar chart and detailed data tables of retention rates across 2015, 2016, and 2017.
3. **Monthly Retention Trend**: A close-tracking monthly visualization equipped with a linear regression trend line to rapidly spot seasonal deviations.
4. **Cohort Retention Heatmap**: A classic, research-paper standard cohort analysis matrix plotting 13 quarterly cohorts over 12 subsequent periods to track lifetime decay curves.
5. **Customer Segmentation**: Behavioral breakdown classifying the customer base into One-time, Returning, Loyal, and Champion segments based on purchase frequency.
6. **Revenue-Retention Correlation**: An insightful dual-axis visualization demonstrating exactly how revenue pipelines align with user retention waves.
7. **Research Summary**: Auto-generated statistical findings, neatly structured and ready for academic reporting or executive presentations.

*(Run locally with `streamlit run dashboard.py`)*

## 🛠️ Technical Skills Demonstrated

### Advanced Data Processing
- **Data Engineering**: Handling, cleaning, and aggregating 180K+ rows of transactional data entirely in Python using Pandas.
- **Dynamic Feature Engineering**: On-the-fly calculation of customer lifespans, exact cohort assignments by quarter, and rolling monthly retention states.
- **Data Quality Focus**: Active filtering of irrelevant "noise" such as cancelled or highly anomalous fraudulent orders.

### Analytical Methodologies
- **Cohort Analysis**: Constructing complex user matrices to map origin period against future engagement periods.
- **Customer Segmentation**: Threshold-bound loyalty segmenting to distinguish between "One-time" users and "Champions".
- **Statistical Trending**: Implementing linear regression to highlight non-obvious downward or upward retention trajectories over time.

### Frontend Dashboarding
- **Streamlit Framework**: Building a modular, widget-driven UI entirely in Python.
- **Advanced Plotly Visualizations**: Crafting highly customized dual-axis charts, detailed heatmaps, and comparative bar plots that respond instantly to user filters.

## 🧠 Key Design Decisions

- **Excluded 2018 Data:** The dataset only contained data up until January 2018. Including this would mathematically skew year-over-year operational metrics into showing an artificial collapse.
- **Order State Filtering:** Rigorously filtered out canceled and fraudulent orders to maintain an accurate measure of genuine retention signals. 
- **Interactive Sidebar Filters:** Year selection and order status choices govern global dashboard state, allowing users to hypothesize on different data subsets.
- **Live Computations vs Static Aggregation:** All dashboard metrics are continuously re-evaluated from the core DataFrame in memory rather than relying on pre-calculated static files.

## 📁 Project Structure

```
ecommerce-customer-retention-analysis/
├── README.md                          # Comprehensive project documentation
├── dashboard.py                       # Main Streamlit application file
├── create_database.py                 # Original DB/Data preprocessing script
├── requirements.txt                   # Dependency manifest
├── .gitignore                         # Exclusions including massive CSVs
├── anaconda_projects/                 # Notebooks for exploratory data analysis
│   └── db/
│       ├── 01_data_exploration.ipynb
│       └── 02_database_creation.ipynb
└── sql_queries/                       # Reference historical queries
    └── retention_analysis.sql
```

## 💡 Business Insights & Strategic Recommendations

### Current State Analysis
- **Retention Drop-off:** The platform experienced a ~10% drop in overall retention between 2016 and 2017.
- **Segmentation Insight:** While the dashboard shows a massive base of One-time and Returning buyers, the 'Champions' and 'Loyal' segments drive heavily disproportionate revenue. Tracking their specific cohort drop-off is critical.

### Strategic Recommendations

#### 🎯 Immediate Actions (0-3 months)
1. **Targeted Remarketing to the 2016 Cohorts**
   - Address the noticeable drop in 2017 by directly incentivizing the 2016 cohort with aggressive "win-back" campaigns.
2. **Loyalty Nurturing**
   - Identify "Returning" customers nearing the order threshold for "Loyal" status and offer targeted free-shipping or discount codes to push them over the conversion line.

#### 📈 Medium-term Strategy (3-12 months)
1. **Predictive Cohort Intervention**
   - Utilize the Cohort Heatmap drop-off points (e.g., if a massive drop typically happens at Quarter 3) to trigger preemptive automated email flows exactly at Quarter 2.
2. **VIP Program Iteration**
   - Create a formalized VIP tier specifically for the heavily segmented 'Champion' users to artificially inflate their retention decay curve past standard lifespan expectations.

## 🔧 Setup & Installation

### Prerequisites
- Python 3.8+
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/Guri-21/ecommerce-customer-retention-analysis.git
cd ecommerce-customer-retention-analysis

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the interactive dashboard
streamlit run dashboard.py
```

## 📊 Dataset Information

**Source**: DataCo Smart Supply Chain Dataset (Kaggle)  
**Period Validated**: January 2015 - December 2017  
**Records Analyzed**: ~180,000 transactions across 20,000+ localized and international customers.

## 🔮 Future Enhancements

- **Machine Learning Integration**: Implementing predictive XGBoost survival models to predict exact churn probabilities per individual user.
- **Geographic Analysis**: Adding spatial map visualizations to correlate geographical supply chain regions with higher retention characteristics.
- **Real-time Pipeline**: Hooking the Streamlit dashboard up to a simulated Kafka/live SQL stream for true real-time dashboarding.

## 📞 Contact

**Name**: Gurnoor Partap Singh Bhogal  
**Email**: itsguri21@gmail.com  
**LinkedIn**: www.linkedin.com/in/gurnoor-p-s-bhogal-533818272  

---

*This project demonstrates my practical capabilities in full-stack data analysis, from data wrangling to front-end visualization and high-level business strategy formulation.*

**Technologies Used**: Python • Streamlit • Plotly • Pandas • Data Analytics
