from google.cloud import bigquery
import pandas as pd
import streamlit as st

# We use st.cache_data so the app doesn't re-download the data every single time you click a button!
@st.cache_data(ttl=3600) # Caches the data for 1 hour
def run_query(sql_query):
    """
    Connects to BigQuery, runs the SQL, and returns a Pandas DataFrame.
    """
    try:
        # Notice we don't need passwords here, it uses your laptop's VIP pass!
        client = bigquery.Client(project="los-ticones-u-hack")
        df = client.query(sql_query).to_dataframe()
        return df
    except Exception as e:
        st.error(f"Database Connection Error: {e}")
        return pd.DataFrame() # Return empty dataframe if it fails

def get_all_opponents():
    """Fetches a list of all unique matches/opponents for the sidebar dropdown."""
    query = "SELECT DISTINCT match_name FROM `los-ticones-u-hack.u_scout.v_master_stats`"
    df = run_query(query)
    # Return just the list of names
    return df['match_name'].tolist() if not df.empty else []