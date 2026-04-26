from google.cloud import bigquery
import pandas as pd

def show_off_database():
    print("⏳ Pulling active player data from Google Cloud...")
    client = bigquery.Client(project="los-ticones-u-hack")
    
    # QUERY 1: Show the terminal a clean table of players who ACTUALLY played
    # Notice we added 'WHERE total.minutesOnField > 45' to remove the 0s!
    query_clean = """
        SELECT 
            shortName, 
            position, 
            match_name,
            total.minutesOnField, 
            total.passes, 
            total.duels
        FROM `los-ticones-u-hack.u_scout.v_master_stats` 
        WHERE total.minutesOnField > 45
        LIMIT 10
    """
    df_clean = client.query(query_clean).to_dataframe()
    
    print("\n✅ LIVE CLOUD DATA (Filtered for active players):")
    print("-" * 70)
    print(df_clean)
    
    # QUERY 2: Download a preview of ALL 100+ columns for the team to look at
    print("\n⏳ Generating an Excel/CSV preview of all 100+ columns...")
    query_all = """
        SELECT * FROM `los-ticones-u-hack.u_scout.v_master_stats` 
        WHERE total.minutesOnField > 0
        LIMIT 100
    """
    df_all = client.query(query_all).to_dataframe()
    
    # Save it to a file
    df_all.to_csv("database_preview.csv", index=False)
    print("✅ Done! Tell the team to open 'database_preview.csv' to see all the data!")

if __name__ == "__main__":
    show_off_database()