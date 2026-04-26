from google.cloud import bigquery

def test_connection():
    print("⏳ Connecting to Google BigQuery...")
    
    # Python uses your terminal login and connects to your exact project automatically!
    client = bigquery.Client(project="los-ticones-u-hack")
    
    # We ask the database for 5 players from your Magic View
    query = """
        SELECT shortName, position, foot
        FROM `los-ticones-u-hack.u_scout.v_master_stats` 
        LIMIT 5
    """
    
    # Run the query and convert to a Pandas DataFrame
    df = client.query(query).to_dataframe()
    
    print("✅ Connection Successful! Here is the live cloud data:")
    print("-" * 50)
    print(df)

if __name__ == "__main__":
    test_connection()