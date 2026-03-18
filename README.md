# E-commerce Retention Analysis Dashboard
**Data Analytics Project**

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![SQL](https://img.shields.io/badge/SQL-SQLite-green)
![Streamlit](https://img.shields.io/badge/Streamlit-Interactive-red)
![Status](https://img.shields.io/badge/Status-Complete-success)

## 🎯 Project Overview

An interactive dashboard built with Streamlit for performing data-driven customer retention analysis over 3 years using the **DataCo Smart Supply Chain** dataset (180K transactions, 20K+ customers spanning 2015-2017). This project demonstrates practical experience with data analysis, SQL, and business problem-solving skills to derive research-paper quality insights.

## 🚀 Features

- **Executive Summary:** Essential metrics including total customers, active orders, total revenue, and dynamic retention rate.
- **Year-over-Year Retention:** Comparative bar chart and detailed data tables of retention rates across 2015, 2016, and 2017.
- **Monthly Retention Trend:** Monthly visualization for closer tracking of customer retention with a linear regression trend line.
- **Cohort Retention Heatmap:** Classic, research-paper quality cohort analysis matrix plotting 13 quarterly cohorts over 12 periods.
- **Customer Segmentation:** Breakdown of the customer base into One-time, Returning, Loyal, and Champion segments.
- **Revenue-Retention Correlation:** Dual-axis visualization showing how revenue trends align with user retention.
- **Research Summary:** Auto-generated findings and statistics, neatly structured for academic reporting or presentations.

## 🧠 Key Design Decisions

- **Excluded 2018 Data:** Only January data was available, which would organically skew year-over-year retention metrics.
- **Order Filtering:** Filtered out canceled and fraudulent orders to maintain an accurate measure of genuine retention signals.
- **Interactive Sidebar Filters:** Year selection and order status choices are built right in.
- **Live Computations:** All metrics are continuously updated from the core data rather than relying on hardcoded parameters.

## 📊 Dataset Information

**Source**: DataCo Smart Supply Chain Dataset (Kaggle)  
**Period**: January 2015 - December 2017  
**Records**: 180K+ transactions, 20K+ customers  

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

# Run interactive dashboard
streamlit run dashboard.py
```

## 📞 Contact

**Name**: Gurnoor Partap Singh Bhogal  
**Email**: itsguri21@gmail.com  
**LinkedIn**: www.linkedin.com/in/gurnoor-p-s-bhogal-533818272  

---

*This project demonstrates my practical experience with SQL, data analysis, and business problem-solving skills*

**Technologies Used**: Python • SQL • SQLite • Streamlit • Plotly • Pandas
