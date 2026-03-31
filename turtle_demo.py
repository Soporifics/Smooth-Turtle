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
    # Loading the file and cleaning column names just in case of hidden spaces
    df = pd.read_excel('33647_Demo_Leads.xlsx')
    df.columns = df.columns.str.strip()
    
    def is_outside_fl(addr):
        if pd.isna(addr): return False
        match = re.search(r'([A-Z]{2})\s*\d{5}', str(addr))
        if match:
            state = match.group(1)
            return state != 'FL'
        return False

    # Check the Office 1 Address for out-of-state headquarters
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
filtered_df = df[df['Status'].isin(status_choice)].copy()
if out_of_state:
    filtered_df = filtered_df[filtered_df['Outside_FL'] == True]
if search_query:
    filtered_df = filtered_df[filtered_df['Entity_Name'].str.contains(search_query, case=False, na=False)]

# 4. Dashboard Metrics
c1, c2, c3 = st.columns(3)

# Total Leads
c1.metric("Total Leads Found", len(filtered_df))

# Freshness Metric: Filed in 2025
filed_2025 = len(filtered_df[filtered_df['File_Date'].astype(str).str.contains('2025', na=False)])
c2.metric("Filed in 2025", filed_2025)

# Compliance Metric: One Out-of-State Address (Warning for FL Agents)
out_of_state_count = filtered_df['Outside_FL'].sum()
c3.metric(label="One Out-of-State Address", 
          value=out_of_state_count, 
          delta="Check Headquarters Location", 
          delta_color="inverse")

# 5. THE MAP (With Safety Check)
st.write("### 📍 Commercial Territory Map")

if not filtered_df.empty:
    fig = px.scatter_mapbox(filtered_df, 
                            lat='lat', 
                            lon='lon', 
                            color='Residential?', 
                            color_discrete_map={'No': '#00CC96', 'Yes': '#EF553B'}, 
                            center=dict(lat=28.14, lon=-82.35), 
                            zoom=11,
                            mapbox_style="carto-darkmatter",
                            hover_name="Entity_Name",
                            hover_data={
                                "Principal_Add": True, 
                                "Status": True,
                                "lat": False, 
                                "lon": False
                            })
    fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})
    st.plotly_chart(fig, use_container_width=True)
else:
    st.warning("No leads match your current filters. Try adjusting the sidebar!")

# 6. Data Grid
st.write("### 📋 Lead Details (Non-Downloadable Preview)")
# Clean up display (hide the helper columns)
display_cols = [c for c in filtered_df.columns if c not in ['lat', 'lon', 'Outside_FL']]
st.dataframe(filtered_df[display_cols], use_container_width=True)
