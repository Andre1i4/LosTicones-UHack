import streamlit as st
from utils.data_loader import run_query, get_all_opponents

# 1. Setup the Page
st.set_page_config(page_title="U-Scout: Tactical Bridge", layout="wide")
st.title("⚽ U-Scout: Tactical Command Center")

# 2. Build the Sidebar using live Cloud Data!
st.sidebar.header("Match Selection")
opponents = get_all_opponents()

if opponents:
    selected_match = st.sidebar.selectbox("Select Target Match:", opponents)
    st.write(f"### Loading Intelligence for: {selected_match}")
    
    # 3. Test pulling real data for the selected match
    test_query = f"""
        SELECT shortName, position, foot, total.minutesOnField 
        FROM `los-ticones-u-hack.u_scout.v_master_stats`
        WHERE match_name = '{selected_match}' AND total.minutesOnField > 0
        LIMIT 10
    """
    
    # Use our data_loader to get the data
    match_data = run_query(test_query)
    
    # Display it in the app
    st.dataframe(match_data)
else:
    st.sidebar.warning("Could not load opponents from database.")