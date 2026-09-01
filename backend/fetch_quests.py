import urllib.request
import json
import os
import ssl

def fetch_quests():
    quests_output = []
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    # Method 1: cesoun's osrs-wiki-parse
    try:
        url = "https://raw.githubusercontent.com/cesoun/osrs-wiki-parse/master/quests.json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10, context=ctx) as response:
            data = json.loads(response.read().decode())
            
        for q in data:
            name = q.get("name")
            if not name: continue
            
            reqs = q.get("skillReqs", [])
            parsed_reqs = {}
            for req_item in reqs:
                if isinstance(req_item, dict) and "skill" in req_item and "level" in req_item:
                    parsed_reqs[req_item["skill"].lower()] = req_item["level"]
            
            quests_output.append({"name": name, "reqs": parsed_reqs})
            
        if len(quests_output) > 100:
            print(f"Success! Fetched {len(quests_output)} quests from GitHub (osrs-wiki-parse).")
            return quests_output
    except Exception as e:
        print(f"Method 1 failed: {e}")

    # Method 2: Weirdgloop API
    try:
        url = "https://chisel.weirdgloop.org/mojo/data/quests.json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10, context=ctx) as response:
            data = json.loads(response.read().decode())
            
        quests_output = []
        for k, v in data.items():
            if isinstance(v, dict):
                name = v.get("name")
                if not name: continue
                
                parsed_reqs = {}
                reqs = v.get("skillReqs", v.get("requirements", {}))
                if isinstance(reqs, list):
                    for req_item in reqs:
                        if isinstance(req_item, dict) and "skill" in req_item and "level" in req_item:
                            parsed_reqs[req_item["skill"].lower()] = req_item["level"]
                elif isinstance(reqs, dict):
                    for sk, lvl in reqs.items():
                        if isinstance(lvl, int):
                            parsed_reqs[sk.lower()] = lvl
                            
                quests_output.append({"name": name, "reqs": parsed_reqs})
                
        if len(quests_output) > 100:
            print(f"Success! Fetched {len(quests_output)} quests from Weirdgloop API.")
            return quests_output
    except Exception as e:
        print(f"Method 2 failed: {e}")

    # Method 3: Fallback data (generated from memory)
    print("APIs unreachable or formatted incorrectly. Falling back to internal memory list...")
    quests_output = [
        {"name": "Cook's Assistant", "reqs": {}},
        {"name": "Dragon Slayer I", "reqs": {"crafting": 8, "magic": 34}},
        {"name": "Desert Treasure", "reqs": {"magic": 50, "thieving": 53, "firemaking": 50, "slayer": 10}},
        {"name": "Recipe for Disaster", "reqs": {"cooking": 70, "agility": 48, "mining": 50, "fishing": 53, "thieving": 53, "herblore": 45, "magic": 59, "smithing": 40, "firemaking": 50, "ranged": 40, "crafting": 40, "fletching": 10, "slayer": 10, "woodcutting": 36}},
        {"name": "Monkey Madness II", "reqs": {"slayer": 69, "crafting": 70, "hunter": 60, "agility": 55, "thieving": 55, "firemaking": 60}},
        {"name": "Dragon Slayer II", "reqs": {"magic": 75, "smithing": 70, "mining": 68, "crafting": 62, "agility": 60, "thieving": 60, "construction": 50, "hitpoints": 50}},
        {"name": "Song of the Elves", "reqs": {"agility": 70, "construction": 70, "farming": 70, "herblore": 70, "hunter": 70, "mining": 70, "smithing": 70, "woodcutting": 70}},
        {"name": "Desert Treasure II", "reqs": {"magic": 75, "firemaking": 75, "thieving": 70, "herblore": 62, "runecraft": 60, "construction": 65}}
    ]
    return quests_output

def save_quests(quests, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("QUESTS = [\n")
        for i, q in enumerate(quests):
            f.write(f'    {json.dumps(q)}')
            if i < len(quests) - 1:
                f.write(",\n")
            else:
                f.write("\n")
        f.write("]\n")

if __name__ == '__main__':
    out_path = r"/app/quest_data.py"
    print("Fetching quest data...")
    quests_data = fetch_quests()
    save_quests(quests_data, out_path)
    print(f"Successfully saved {len(quests_data)} quests to {out_path}")
