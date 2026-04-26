"""
Example: Using Claude AI with player statistics for analysis

This example shows how to:
1. Fetch player stats from BigQuery
2. Send them to Claude AI for analysis
3. Get AI-generated insights and recommendations

Prerequisites:
  pip install anthropic

Usage:
  export ANTHROPIC_API_KEY="your-api-key-here"
  python scripts/example_claude_integration.py "Cristiano Ronaldo"
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scripts.analyze_player_ai import PlayerAnalyzer


def analyze_with_claude(player_name: str, match_name: str = None):
    """
    Analyze a player using Claude AI
    """
    
    try:
        from anthropic import Anthropic
    except ImportError:
        print("❌ Please install anthropic: pip install anthropic")
        return
    
    # Initialize analyzer
    analyzer = PlayerAnalyzer()
    
    # Get player data
    print(f"\n📊 Fetching data for {player_name}...")
    insights = analyzer.get_player_insights_for_api(player_name, match_name)
    
    if "error" in insights:
        print(f"❌ {insights['error']}")
        return
    
    # Get AI prompt
    ai_prompt = insights['ai_prompt']
    
    print(f"\n🤖 Sending to Claude AI for analysis...")
    print(f"{'='*70}\n")
    
    # Initialize Anthropic client
    client = Anthropic()
    
    # Call Claude API
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1500,
        messages=[
            {
                "role": "user",
                "content": ai_prompt
            }
        ]
    )
    
    # Print AI analysis
    ai_analysis = response.content[0].text
    print("Claude AI Analysis:")
    print(ai_analysis)
    
    print(f"\n{'='*70}\n")
    
    # Save results
    result = {
        "player_name": player_name,
        "match_name": match_name,
        "raw_stats": insights['raw_data'],
        "ai_analysis": ai_analysis,
        "model": "claude-3-5-sonnet-20241022"
    }
    
    filename = f"analysis_{player_name.replace(' ', '_')}.json"
    with open(filename, 'w') as f:
        json.dump(result, f, indent=2, default=str)
    
    print(f"✅ Analysis saved to {filename}")


def compare_with_claude(player1: str, player2: str):
    """
    Compare two players using Claude AI
    """
    
    try:
        from anthropic import Anthropic
    except ImportError:
        print("❌ Please install anthropic: pip install anthropic")
        return
    
    from scripts.fetch_player_stats import PlayerStatsExtractor
    
    extractor = PlayerStatsExtractor()
    
    print(f"\n📊 Fetching data for {player1} and {player2}...")
    
    # Get both players' career stats
    stats1 = extractor.get_player_all_matches(player1)
    stats2 = extractor.get_player_all_matches(player2)
    
    if stats1.empty or stats2.empty:
        print("❌ Could not find data for one or both players")
        return
    
    # Prepare comparison prompt
    prompt = f"""
Compare these two football players based on their career statistics:

**{player1}:**
- Matches Played: {len(stats1)}
- Total Goals: {stats1['total.goals'].sum()}
- Total Assists: {stats1['total.assists'].sum()}
- Avg Pass Accuracy: {stats1['total.passAccuracy'].mean():.1f}%
- Avg Passes/Match: {stats1['total.passes'].mean():.1f}
- Avg Duels/Match: {stats1['total.duels'].mean():.1f}
- Positions: {', '.join(stats1['position'].unique())}

**{player2}:**
- Matches Played: {len(stats2)}
- Total Goals: {stats2['total.goals'].sum()}
- Total Assists: {stats2['total.assists'].sum()}
- Avg Pass Accuracy: {stats2['total.passAccuracy'].mean():.1f}%
- Avg Passes/Match: {stats2['total.passes'].mean():.1f}
- Avg Duels/Match: {stats2['total.duels'].mean():.1f}
- Positions: {', '.join(stats2['position'].unique())}

Based on these statistics, provide:
1. Strengths of each player
2. Playing style comparison
3. Who would be better suited for different tactical roles
4. Head-to-head strengths and weaknesses
5. Overall assessment
"""
    
    print(f"\n🤖 Comparing players with Claude AI...")
    print(f"{'='*70}\n")
    
    # Call Claude
    client = Anthropic()
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )
    
    comparison = response.content[0].text
    print(comparison)
    
    print(f"\n{'='*70}\n")
    
    # Save results
    result = {
        "comparison": f"{player1} vs {player2}",
        "player1_stats": {
            "matches": len(stats1),
            "goals": float(stats1['total.goals'].sum()),
            "assists": float(stats1['total.assists'].sum()),
            "avg_pass_acc": float(stats1['total.passAccuracy'].mean())
        },
        "player2_stats": {
            "matches": len(stats2),
            "goals": float(stats2['total.goals'].sum()),
            "assists": float(stats2['total.assists'].sum()),
            "avg_pass_acc": float(stats2['total.passAccuracy'].mean())
        },
        "ai_comparison": comparison
    }
    
    filename = f"comparison_{player1.replace(' ', '_')}_vs_{player2.replace(' ', '_')}.json"
    with open(filename, 'w') as f:
        json.dump(result, f, indent=2, default=str)
    
    print(f"✅ Comparison saved to {filename}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python example_claude_integration.py <player_name> [match_name]")
        print("  python example_claude_integration.py compare <player1> <player2>")
        print("\nExample:")
        print("  python example_claude_integration.py 'Cristiano Ronaldo'")
        print("  python example_claude_integration.py 'Ronaldo' 'Man Utd vs City'")
        print("  python example_claude_integration.py compare 'Ronaldo' 'Messi'")
        sys.exit(1)
    
    # Check for API key
    if "ANTHROPIC_API_KEY" not in os.environ:
        print("❌ Error: ANTHROPIC_API_KEY environment variable not set")
        print("Set it with: export ANTHROPIC_API_KEY='sk-...'")
        sys.exit(1)
    
    if sys.argv[1] == "compare" and len(sys.argv) >= 4:
        compare_with_claude(sys.argv[2], sys.argv[3])
    elif len(sys.argv) >= 2:
        player_name = sys.argv[1]
        match_name = sys.argv[2] if len(sys.argv) > 2 else None
        analyze_with_claude(player_name, match_name)
