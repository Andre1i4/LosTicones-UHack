import json
import os

def merge_stats_to_ndjson(stats_folder, output_file):
    print(f"⏳ Merging 279 match files from {stats_folder}...")
    with open(output_file, 'w', encoding='utf-8') as f_out:
        for filename in os.listdir(stats_folder):
            if filename.endswith(".json"):
                filepath = os.path.join(stats_folder, filename)
                with open(filepath, 'r', encoding='utf-8') as f_in:
                    data = json.load(f_in)
                    for stat in data.get('players', []):
                        # Tag each row with the match name so we know where it came from
                        stat['match_name'] = filename.replace('_players_stats.json', '')
                        f_out.write(json.dumps(stat) + '\n')
    print(f"✅ Success! Created {output_file}")

def convert_players_to_ndjson(player_file, output_file):
    print(f"⏳ Converting {player_file}...")
    with open(output_file, 'w', encoding='utf-8') as f_out:
        with open(player_file, 'r', encoding='utf-8') as f_in:
            data = json.load(f_in)
            for player in data.get('players', []):
                f_out.write(json.dumps(player) + '\n')
    print(f"✅ Success! Created {output_file}")

# --- RUN THE SCRIPT ---
merge_stats_to_ndjson('./stats_files', 'all_matches_stats.jsonl')
convert_players_to_ndjson('players.json', 'players_master.jsonl')