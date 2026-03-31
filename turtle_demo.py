import streamlit as st
import pandas as pd
import plotly.express as px
import re
import numpy as np

# 1. Branding & Setup
st.set_page_config(page_title="Smooth Turtle | Lead Portal", layout="wide")
st.title("🐢 Smooth Turtle: Sunbiz Lead Intelligence")
st.subheader("Interactive Demo: ZIP 33647 (New Tampa)")

# 2. Optimized Data Loading
@st.cache_data
def load_data():
    df = pd.read_excel('33647_Demo_Leads.xlsx')
    
    def is_outside_fl(addr):
        if pd.isna(addr): return False
        match = re.search(r'([A-Z]{2})\s*\d{5}', str(addr))
        if match:
            state = match.group(1)
            return state != 'FL'
        return False

    df['Outside_FL'] = df['Off_1_Addr'].apply(is_outside_fl)
    
    # MOCK GEOCODING: Creating the visual cloud for the 33647 area
    np.random.seed(42)
    df['lat'] = 28.14 + np.random.uniform(-0.03, 0.03, len(df))
    df['lon'] = -82.35 + np.random.uniform(-0.03, 0.03, len(df))
    return df

df = load_data()

# 3. Sidebar Filters
st.sidebar.header("Agent Prospecting Tools")
search_query = st.sidebar.text_input("🔍 Search Company Name", "")
status_choice = st.sidebar.multiselect("Entity Status", df['Status'].unique(), default=['AFLA'])
out_of_state = st.sidebar.checkbox("Flag: Out-of-State HQ")

# Filter Logic
filtered_df = df[df['Status'].isin(status_choice)]
if out_of_state:
    filtered_df = filtered_df[filtered_df['Outside_FL'] == True]
if search_query:
    filtered_df = filtered_df[filtered_df['Entity_Name'].str.contains(search_query, case=False, na=False)]

# 4. Dashboard Metrics
c1, c2, c3 = st.columns(3)
c1.metric("Total Leads Found", len(filtered_df))

# Metric 2: Identify fresh 2025 filings
filed_2025 = len(filtered_df[filtered_df['File_Date'].astype(str).str.contains('2025', na=False)])
c2.metric("Filed in 2025", filed_2025)

# Metric 3: The Exclusionary Factor for FL Agents
c3.metric(label="One Out-of-State Address", 
          value=df['Outside_FL'].sum(), 
          delta="Check Headquarters Location", 
          delta_color="inverse")

# 5. NEW SCATTER MAP
st.write("### 📍 Commercial Territory Map")
fig = px.scatter_mapbox(filtered_df, 
                        lat='lat', 
                        lon='lon', 
                        color='Residential?', # Matched to your list
                        color_discrete_map={'No': '#00CC96', 'Yes': '#EF553B'}, 
                        center=dict(lat=28.14, lon=-82.35), 
                        zoom=11,
                        mapbox_style="carto-darkmatter",
                        hover_name="Entity_Name", # Matched to your list
                        hover_data={
                            "Principal_Add": True, # Matched to your list
                            "lat": False, 
                            "lon": False, 
                            "Status": True 
                        })
st.plotly_chart(fig, use_container_width=True)

# 6. Data Grid
st.write("### 📋 Lead Details (Non-Downloadable Preview)")
st.dataframe(filtered_df.drop(columns=['lat', 'lon', 'Outside_FL']), use_container_width=True)
