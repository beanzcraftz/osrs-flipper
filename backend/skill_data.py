import math

# ─── XP TABLE ────────────────────────────────────────────────────────────────
def _build_xp_table() -> list[int]:
    """Returns a list of 100 entries where index = level (0-indexed; index 0 unused).
    xp_table[L] = total XP needed to reach level L.
    Formula: floor(sum_{i=1}^{L-1} floor(i + 300 * 2^(i/7))) / 4
    """
    table = [0] * 100  # levels 0..99; we use 1..99
    xp = 0
    for i in range(1, 99):
        xp += math.floor(i + 300 * 2 ** (i / 7))
        table[i + 1] = math.floor(xp / 4)
    return table

XP_TABLE: list[int] = _build_xp_table()

def xp_for_level(level: int) -> int:
    """Total XP required to reach `level`."""
    if level < 1:
        return 0
    if level > 99:
        return XP_TABLE[99]
    return XP_TABLE[level]

def xp_between(current: int, goal: int) -> int:
    """XP gap between two levels."""
    return max(0, xp_for_level(goal) - xp_for_level(current))

# ─── TRAINING METHODS ─────────────────────────────────────────────────────────
# Each method dict:
#   name          : Display name
#   skill         : skill key (lowercase)
#   level_req     : minimum level to use this method
#   xp_per_action : XP gained per single action
#   actions_per_hour: approximate actions per hour
#   members       : True if P2P
#   notes         : short tip shown in UI
#   input_items   : list of {name, item_id, qty_per_action, role='buy'}
#   output_items  : list of {name, item_id, qty_per_action, role='sell'}
#   emoji         : for I'm Bored display
#   bored_task    : short directive shown in I'm Bored (30-min framing)

TRAINING_METHODS: list[dict] = [

    # ── AGILITY ──────────────────────────────────────────────────────────────
    {
        'name': 'Gnome Stronghold Agility Course',
        'skill': 'agility', 'level_req': 1, 'xp_per_action': 86.5,
        'actions_per_hour': 60, 'members': True,
        'notes': 'Best low-level course. ~5,190 XP/hr.',
        'input_items': [], 'output_items': [],
        'emoji': '🏃', 'bored_task': 'Run 50 laps of the Gnome Stronghold Agility Course!',
    },
    {
        'name': 'Draynor Village Rooftop',
        'skill': 'agility', 'level_req': 10, 'xp_per_action': 120.0,
        'actions_per_hour': 60, 'members': True,
        'notes': 'Good marks of grace rate at low levels.',
        'input_items': [], 'output_items': [],
        'emoji': '🏃', 'bored_task': 'Complete 60 laps of the Draynor Village Rooftop course!',
    },
    {
        'name': 'Canifis Rooftop',
        'skill': 'agility', 'level_req': 40, 'xp_per_action': 240.0,
        'actions_per_hour': 60, 'members': True,
        'notes': 'Best marks of grace per hour.',
        'input_items': [], 'output_items': [],
        'emoji': '🏃', 'bored_task': 'Run 30 laps of the Canifis Rooftop course!',
    },
    {
        'name': 'Seers Village Rooftop',
        'skill': 'agility', 'level_req': 60, 'xp_per_action': 570.0,
        'actions_per_hour': 60, 'members': True,
        'notes': 'Unlock elite diary for +20% XP. ~34,200 XP/hr base.',
        'input_items': [], 'output_items': [],
        'emoji': '🏃', 'bored_task': 'Do 25 laps of Seers Village Rooftop!',
    },
    {
        'name': 'Ardougne Rooftop',
        'skill': 'agility', 'level_req': 90, 'xp_per_action': 793.0,
        'actions_per_hour': 60, 'members': True,
        'notes': 'Best marks of grace + high XP at 90+.',
        'input_items': [], 'output_items': [],
        'emoji': '🏃', 'bored_task': 'Complete 20 laps of the Ardougne Rooftop course!',
    },

    # ── SMITHING ─────────────────────────────────────────────────────────────
    {
        'name': 'Iron bars (furnace)',
        'skill': 'smithing', 'level_req': 15, 'xp_per_action': 12.5,
        'actions_per_hour': 1800, 'members': False,
        'notes': 'F2P method. ~22,500 XP/hr.',
        'input_items': [{'name': 'Iron ore', 'item_id': 440, 'qty': 1}],
        'output_items': [{'name': 'Iron bar', 'item_id': 2351, 'qty': 1}],
        'emoji': '⚒️', 'bored_task': 'Smelt 500 iron bars at a furnace!',
    },
    {
        'name': 'Gold bars at Blast Furnace',
        'skill': 'smithing', 'level_req': 40, 'xp_per_action': 56.2,
        'actions_per_hour': 5000, 'members': True,
        'notes': 'Goldsmith gauntlets required. ~350K XP/hr. Net loss ~80GP/bar.',
        'input_items': [{'name': 'Gold ore', 'item_id': 444, 'qty': 1}],
        'output_items': [{'name': 'Gold bar', 'item_id': 2357, 'qty': 1}],
        'emoji': '⚒️', 'bored_task': 'Smelt 1,500 gold bars at the Blast Furnace!',
    },
    {
        'name': 'Steel bars at Blast Furnace',
        'skill': 'smithing', 'level_req': 30, 'xp_per_action': 17.5,
        'actions_per_hour': 5000, 'members': True,
        'notes': 'Profitable method. ~87,500 XP/hr.',
        'input_items': [
            {'name': 'Iron ore', 'item_id': 440, 'qty': 1},
            {'name': 'Coal', 'item_id': 453, 'qty': 1},
        ],
        'output_items': [{'name': 'Steel bar', 'item_id': 2353, 'qty': 1}],
        'emoji': '⚒️', 'bored_task': 'Smelt 1,000 steel bars at the Blast Furnace!',
    },
    {
        'name': 'Mithril bars at Blast Furnace',
        'skill': 'smithing', 'level_req': 50, 'xp_per_action': 30.0,
        'actions_per_hour': 3000, 'members': True,
        'notes': 'Very profitable. ~90,000 XP/hr.',
        'input_items': [
            {'name': 'Mithril ore', 'item_id': 447, 'qty': 1},
            {'name': 'Coal', 'item_id': 453, 'qty': 2},
        ],
        'output_items': [{'name': 'Mithril bar', 'item_id': 2359, 'qty': 1}],
        'emoji': '⚒️', 'bored_task': 'Smelt 800 mithril bars at the Blast Furnace!',
    },
    {
        'name': "Giants' Foundry",
        'skill': 'smithing', 'level_req': 15, 'xp_per_action': 3500.0,
        'actions_per_hour': 20, 'members': True,
        'notes': 'Minigame. ~70,000 XP/hr depending on sword tier. Profitable.',
        'input_items': [], 'output_items': [],
        'emoji': '⚒️', 'bored_task': 'Complete 10 commissions at the Giants\' Foundry!',
    },

    # ── WOODCUTTING ──────────────────────────────────────────────────────────
    {
        'name': 'Regular trees',
        'skill': 'woodcutting', 'level_req': 1, 'xp_per_action': 25.0,
        'actions_per_hour': 100, 'members': False,
        'notes': 'F2P. ~2,500 XP/hr.',
        'input_items': [],
        'output_items': [{'name': 'Logs', 'item_id': 1511, 'qty': 1}],
        'emoji': '🪓', 'bored_task': 'Chop 200 regular logs and bank them!',
    },
    {
        'name': 'Oak trees',
        'skill': 'woodcutting', 'level_req': 15, 'xp_per_action': 37.5,
        'actions_per_hour': 170, 'members': False,
        'notes': 'F2P viable. ~6,375 XP/hr.',
        'input_items': [],
        'output_items': [{'name': 'Oak logs', 'item_id': 1521, 'qty': 1}],
        'emoji': '🪓', 'bored_task': 'Chop 300 oak logs!',
    },
    {
        'name': 'Teak trees (Ape Atoll)',
        'skill': 'woodcutting', 'level_req': 35, 'xp_per_action': 85.0,
        'actions_per_hour': 850, 'members': True,
        'notes': '2-tick woodcutting at Ape Atoll. ~150K XP/hr.',
        'input_items': [],
        'output_items': [{'name': 'Teak logs', 'item_id': 6333, 'qty': 1}],
        'emoji': '🪓', 'bored_task': '2-tick chop teak trees at Ape Atoll for 30 minutes!',
    },
    {
        'name': 'Sulliuscep mushrooms',
        'skill': 'woodcutting', 'level_req': 65, 'xp_per_action': 111.5,
        'actions_per_hour': 950, 'members': True,
        'notes': 'Tar Swamp. ~105,000 XP/hr + good combat XP + fossils.',
        'input_items': [],
        'output_items': [],
        'emoji': '🪓', 'bored_task': 'Chop Sulliuscep mushrooms in the Tar Swamp!',
    },
    {
        'name': 'Redwood trees',
        'skill': 'woodcutting', 'level_req': 90, 'xp_per_action': 380.0,
        'actions_per_hour': 350, 'members': True,
        'notes': 'Hosidius Woodcutting Guild. ~133,000 XP/hr, AFK.',
        'input_items': [],
        'output_items': [{'name': 'Redwood logs', 'item_id': 19669, 'qty': 1}],
        'emoji': '🪓', 'bored_task': 'AFK chop Redwood trees for 30 minutes!',
    },

    # ── MINING ───────────────────────────────────────────────────────────────
    {
        'name': 'Iron ore (3-rock)',
        'skill': 'mining', 'level_req': 15, 'xp_per_action': 35.0,
        'actions_per_hour': 1000, 'members': False,
        'notes': 'F2P/P2P. ~35,000 XP/hr at 3-rock spots.',
        'input_items': [],
        'output_items': [{'name': 'Iron ore', 'item_id': 440, 'qty': 1}],
        'emoji': '⛏️', 'bored_task': 'Mine 500 iron ore!',
    },
    {
        'name': 'Motherlode Mine',
        'skill': 'mining', 'level_req': 30, 'xp_per_action': 60.0,
        'actions_per_hour': 600, 'members': True,
        'notes': 'Semi-AFK. ~25,000-40,000 XP/hr. Gold nuggets for prospector.',
        'input_items': [],
        'output_items': [],
        'emoji': '⛏️', 'bored_task': 'Mine ore at Motherlode Mine for 30 minutes!',
    },
    {
        'name': 'Granite (Quarry)',
        'skill': 'mining', 'level_req': 45, 'xp_per_action': 75.0,
        'actions_per_hour': 1300, 'members': True,
        'notes': '2-tick granite. ~100,000 XP/hr. Requires waterskins.',
        'input_items': [],
        'output_items': [],
        'emoji': '⛏️', 'bored_task': '2-tick mine granite at the Desert Quarry!',
    },
    {
        'name': 'Amethyst',
        'skill': 'mining', 'level_req': 92, 'xp_per_action': 240.0,
        'actions_per_hour': 200, 'members': True,
        'notes': 'AFK method. ~48,000 XP/hr. Profitable amethyst output.',
        'input_items': [],
        'output_items': [{'name': 'Amethyst', 'item_id': 21347, 'qty': 1}],
        'emoji': '⛏️', 'bored_task': 'AFK mine amethyst for 30 minutes!',
    },

    # ── FISHING ──────────────────────────────────────────────────────────────
    {
        'name': 'Shrimp / Anchovies',
        'skill': 'fishing', 'level_req': 1, 'xp_per_action': 10.0,
        'actions_per_hour': 1000, 'members': False,
        'notes': 'F2P starter method. Bank at Draynor.',
        'input_items': [], 'output_items': [],
        'emoji': '🎣', 'bored_task': 'Catch 500 shrimp at Draynor Village!',
    },
    {
        'name': 'Fly fishing (Barbarian Village)',
        'skill': 'fishing', 'level_req': 20, 'xp_per_action': 40.0,
        'actions_per_hour': 1200, 'members': False,
        'notes': '~55,000 XP/hr at high levels. Drop fish, no banking.',
        'input_items': [], 'output_items': [],
        'emoji': '🎣', 'bored_task': 'Fly fish at Barbarian Village and drop everything!',
    },
    {
        'name': 'Barbarian Fishing (Otto\'s Grotto)',
        'skill': 'fishing', 'level_req': 48, 'xp_per_action': 110.0,
        'actions_per_hour': 1000, 'members': True,
        'notes': 'Grants Strength/Agility XP too. ~100K XP/hr at 70+.',
        'input_items': [], 'output_items': [],
        'emoji': '🎣', 'bored_task': 'Barbarian fish at Otto\'s Grotto for 30 minutes!',
    },
    {
        'name': 'Karambwan fishing',
        'skill': 'fishing', 'level_req': 65, 'xp_per_action': 50.0,
        'actions_per_hour': 2000, 'members': True,
        'notes': 'Very profitable. ~80K XP/hr.',
        'input_items': [],
        'output_items': [{'name': 'Raw karambwan', 'item_id': 3142, 'qty': 1}],
        'emoji': '🎣', 'bored_task': 'Fish 300 karambwan at Tai Bwo Wannai!',
    },
    {
        'name': 'Infernal eel (Mor Ul Rek)',
        'skill': 'fishing', 'level_req': 80, 'xp_per_action': 95.0,
        'actions_per_hour': 700, 'members': True,
        'notes': 'AFK. Onyx shards + tokkul. ~70K XP/hr.',
        'input_items': [], 'output_items': [],
        'emoji': '🎣', 'bored_task': 'Fish infernal eels in the Mor Ul Rek for 30 minutes!',
    },

    # ── COOKING ──────────────────────────────────────────────────────────────
    {
        'name': 'Cook fish (Range)',
        'skill': 'cooking', 'level_req': 1, 'xp_per_action': 30.0,
        'actions_per_hour': 1200, 'members': False,
        'notes': 'F2P method cooking trout/salmon.',
        'input_items': [{'name': 'Raw trout', 'item_id': 335, 'qty': 1}],
        'output_items': [{'name': 'Trout', 'item_id': 333, 'qty': 1}],
        'emoji': '🍳', 'bored_task': 'Cook 500 trout at the Lumbridge Range!',
    },
    {
        'name': 'Lobsters (Hosidius Range)',
        'skill': 'cooking', 'level_req': 40, 'xp_per_action': 120.0,
        'actions_per_hour': 1300, 'members': True,
        'notes': 'Great burn rate at Hosidius (5% range boost).',
        'input_items': [{'name': 'Raw lobster', 'item_id': 377, 'qty': 1}],
        'output_items': [{'name': 'Lobster', 'item_id': 379, 'qty': 1}],
        'emoji': '🍳', 'bored_task': 'Cook 600 lobsters at the Hosidius Range!',
    },
    {
        'name': 'Karambwan (1-tick)',
        'skill': 'cooking', 'level_req': 30, 'xp_per_action': 190.0,
        'actions_per_hour': 3500, 'members': True,
        'notes': '1-tick cooking. ~665K XP/hr. High profit method.',
        'input_items': [{'name': 'Raw karambwan', 'item_id': 3142, 'qty': 1}],
        'output_items': [{'name': 'Cooked karambwan', 'item_id': 3144, 'qty': 1}],
        'emoji': '🍳', 'bored_task': '1-tick cook karambwan for 30 minutes!',
    },
    {
        'name': 'Sharks (Hosidius Range)',
        'skill': 'cooking', 'level_req': 80, 'xp_per_action': 210.0,
        'actions_per_hour': 1300, 'members': True,
        'notes': 'Never burns at 94 Cooking + Hosidius. Profitable.',
        'input_items': [{'name': 'Raw shark', 'item_id': 383, 'qty': 1}],
        'output_items': [{'name': 'Shark', 'item_id': 385, 'qty': 1}],
        'emoji': '🍳', 'bored_task': 'Cook 500 sharks at the Hosidius Range!',
    },

    # ── FIREMAKING ───────────────────────────────────────────────────────────
    {
        'name': 'Logs (F2P)',
        'skill': 'firemaking', 'level_req': 1, 'xp_per_action': 40.0,
        'actions_per_hour': 1200, 'members': False,
        'notes': 'F2P. ~48,000 XP/hr.',
        'input_items': [{'name': 'Logs', 'item_id': 1511, 'qty': 1}],
        'output_items': [],
        'emoji': '🔥', 'bored_task': 'Burn 500 regular logs on the GE!',
    },
    {
        'name': 'Oak logs',
        'skill': 'firemaking', 'level_req': 15, 'xp_per_action': 60.0,
        'actions_per_hour': 1250, 'members': False,
        'notes': '~75,000 XP/hr. Cheap.',
        'input_items': [{'name': 'Oak logs', 'item_id': 1521, 'qty': 1}],
        'output_items': [],
        'emoji': '🔥', 'bored_task': 'Burn 600 oak logs!',
    },
    {
        'name': 'Wintertodt',
        'skill': 'firemaking', 'level_req': 50, 'xp_per_action': 1000.0,
        'actions_per_hour': 15, 'members': True,
        'notes': 'Minigame. Supply crate rewards. ~250K XP/hr. Very popular.',
        'input_items': [], 'output_items': [],
        'emoji': '🔥', 'bored_task': 'Fight the Wintertodt for 30 minutes!',
    },
    {
        'name': 'Magic logs',
        'skill': 'firemaking', 'level_req': 75, 'xp_per_action': 303.8,
        'actions_per_hour': 1300, 'members': False,
        'notes': '~395K XP/hr. Expensive but very fast.',
        'input_items': [{'name': 'Magic logs', 'item_id': 1513, 'qty': 1}],
        'output_items': [],
        'emoji': '🔥', 'bored_task': 'Burn 400 magic logs!',
    },

    # ── FARMING ──────────────────────────────────────────────────────────────
    {
        'name': 'Birdhouses (Fossil Island)',
        'skill': 'farming', 'level_req': 5, 'xp_per_action': 280.0,
        'actions_per_hour': 4, 'members': True,
        'notes': 'AFK every 50 mins. ~1,120 XP + Hunter XP per round. Profitable seeds.',
        'input_items': [], 'output_items': [],
        'emoji': '🌱', 'bored_task': 'Do a birdhouse run on Fossil Island!',
    },
    {
        'name': 'Herb runs (Ranarr/Snapdragon)',
        'skill': 'farming', 'level_req': 32, 'xp_per_action': 1000.0,
        'actions_per_hour': 5, 'members': True,
        'notes': 'Most profitable activity in the game per hour spent. AFK every 80 mins.',
        'input_items': [], 'output_items': [],
        'emoji': '🌱', 'bored_task': 'Do a complete herb run across all patches!',
    },
    {
        'name': 'Tree runs (Magic/Yew)',
        'skill': 'farming', 'level_req': 75, 'xp_per_action': 13768.0,
        'actions_per_hour': 1, 'members': True,
        'notes': '~7 runs/day. Magic trees: 13,768 XP each. Best XP/hr for time invested.',
        'input_items': [], 'output_items': [],
        'emoji': '🌱', 'bored_task': 'Plant and check all your tree patches!',
    },
    {
        'name': 'Tithe Farm',
        'skill': 'farming', 'level_req': 34, 'xp_per_action': 260.0,
        'actions_per_hour': 300, 'members': True,
        'notes': '~100K XP/hr. Unlocks Farmer\'s outfit + Gricoller\'s can.',
        'input_items': [], 'output_items': [],
        'emoji': '🌱', 'bored_task': 'Play Tithe Farm for 30 minutes!',
    },

    # ── THIEVING ─────────────────────────────────────────────────────────────
    {
        'name': 'Men / Women (Lumbridge)',
        'skill': 'thieving', 'level_req': 1, 'xp_per_action': 8.0,
        'actions_per_hour': 2000, 'members': False,
        'notes': 'F2P starter. ~16,000 XP/hr.',
        'input_items': [], 'output_items': [],
        'emoji': '🦝', 'bored_task': 'Pickpocket 500 men in Lumbridge!',
    },
    {
        'name': 'Blackjacking (Bandits)',
        'skill': 'thieving', 'level_req': 45, 'xp_per_action': 65.0,
        'actions_per_hour': 3000, 'members': True,
        'notes': 'Pollnivneach. ~200K XP/hr. Requires PP potion.',
        'input_items': [], 'output_items': [],
        'emoji': '🦝', 'bored_task': 'Blackjack bandits in Pollnivneach for 30 minutes!',
    },
    {
        'name': 'Pyramid Plunder',
        'skill': 'thieving', 'level_req': 71, 'xp_per_action': 3500.0,
        'actions_per_hour': 16, 'members': True,
        'notes': 'Minigame. ~225K XP/hr at 91+. Pharaoh\'s sceptre chance.',
        'input_items': [], 'output_items': [],
        'emoji': '🦝', 'bored_task': 'Complete 8 rounds of Pyramid Plunder!',
    },
    {
        'name': 'Gnome Restaurant (wealthy clients)',
        'skill': 'thieving', 'level_req': 75, 'xp_per_action': 120.0,
        'actions_per_hour': 2000, 'members': True,
        'notes': 'Alternatively: Master Farmers at 38+ for seeds.',
        'input_items': [], 'output_items': [],
        'emoji': '🦝', 'bored_task': 'Pickpocket Master Farmers for 30 minutes!',
    },

    # ── CRAFTING ─────────────────────────────────────────────────────────────
    {
        'name': 'Leather gloves',
        'skill': 'crafting', 'level_req': 1, 'xp_per_action': 13.8,
        'actions_per_hour': 1200, 'members': False,
        'notes': 'F2P starter.',
        'input_items': [{'name': 'Leather', 'item_id': 1741, 'qty': 1}],
        'output_items': [],
        'emoji': '🧶', 'bored_task': 'Craft 500 leather gloves!',
    },
    {
        'name': 'Gold amulets (u)',
        'skill': 'crafting', 'level_req': 8, 'xp_per_action': 30.0,
        'actions_per_hour': 2200, 'members': False,
        'notes': 'F2P. Decent XP/hr with gold bars.',
        'input_items': [{'name': 'Gold bar', 'item_id': 2357, 'qty': 1}],
        'output_items': [],
        'emoji': '🧶', 'bored_task': 'Craft 500 gold amulets (u)!',
    },
    {
        'name': 'Green d\'hide bodies',
        'skill': 'crafting', 'level_req': 63, 'xp_per_action': 186.0,
        'actions_per_hour': 2000, 'members': True,
        'notes': 'Very fast XP. Can be profitable.',
        'input_items': [{'name': "Green d'hide", 'item_id': 1753, 'qty': 3}],
        'output_items': [{'name': "Green d'hide body", 'item_id': 1135, 'qty': 1}],
        'emoji': '🧶', 'bored_task': 'Craft 300 green dragonhide bodies!',
    },
    {
        'name': 'Battlestaves (air/water/earth/fire)',
        'skill': 'crafting', 'level_req': 54, 'xp_per_action': 137.5,
        'actions_per_hour': 2000, 'members': True,
        'notes': 'Buy orbs + battlestaves. Good XP + profit.',
        'input_items': [
            {'name': 'Battlestaff', 'item_id': 1391, 'qty': 1},
            {'name': 'Air orb', 'item_id': 573, 'qty': 1},
        ],
        'output_items': [{'name': 'Air battlestaff', 'item_id': 1397, 'qty': 1}],
        'emoji': '🧶', 'bored_task': 'Craft 500 battlestaves!',
    },

    # ── RUNECRAFT ─────────────────────────────────────────────────────────────
    {
        'name': 'Air runes (F2P)',
        'skill': 'runecraft', 'level_req': 1, 'xp_per_action': 5.0,
        'actions_per_hour': 1200, 'members': False,
        'notes': 'F2P. Run to Air Altar. ~6K XP/hr.',
        'input_items': [{'name': 'Pure essence', 'item_id': 7936, 'qty': 1}],
        'output_items': [{'name': 'Air rune', 'item_id': 556, 'qty': 1}],
        'emoji': '🔮', 'bored_task': 'Craft 500 air runes at the Air Altar!',
    },
    {
        'name': 'Lava runes (Ourania Altar teleport)',
        'skill': 'runecraft', 'level_req': 23, 'xp_per_action': 10.5,
        'actions_per_hour': 1800, 'members': True,
        'notes': 'Fast low/mid method. ~60K XP/hr.',
        'input_items': [{'name': 'Pure essence', 'item_id': 7936, 'qty': 1}],
        'output_items': [{'name': 'Lava rune', 'item_id': 4699, 'qty': 1}],
        'emoji': '🔮', 'bored_task': 'Craft lava runes for 30 minutes!',
    },
    {
        'name': 'Blood runes (Arceuus)',
        'skill': 'runecraft', 'level_req': 77, 'xp_per_action': 23.8,
        'actions_per_hour': 1200, 'members': True,
        'notes': 'Very profitable. ~38K XP/hr + ~1M GP/hr.',
        'input_items': [{'name': 'Pure essence', 'item_id': 7936, 'qty': 1}],
        'output_items': [{'name': 'Blood rune', 'item_id': 565, 'qty': 1}],
        'emoji': '🔮', 'bored_task': 'Craft blood runes at Arceuus for 30 minutes!',
    },
    {
        'name': 'Wrath runes (Mythology\'s Guild)',
        'skill': 'runecraft', 'level_req': 95, 'xp_per_action': 8.0,
        'actions_per_hour': 1800, 'members': True,
        'notes': 'Most profitable RC method. ~2M GP/hr.',
        'input_items': [{'name': 'Pure essence', 'item_id': 7936, 'qty': 1}],
        'output_items': [{'name': 'Wrath rune', 'item_id': 21880, 'qty': 1}],
        'emoji': '🔮', 'bored_task': 'Craft wrath runes for 30 minutes!',
    },

    # ── MAGIC ─────────────────────────────────────────────────────────────────
    {
        'name': 'High Alchemy (any item)',
        'skill': 'magic', 'level_req': 55, 'xp_per_action': 65.0,
        'actions_per_hour': 1200, 'members': False,
        'notes': 'F2P/P2P. ~78K XP/hr. Profit depends on item selection.',
        'input_items': [],
        'output_items': [],
        'emoji': '🧙', 'bored_task': 'High Alch 500 items!',
    },
    {
        'name': 'Splashing (low-level enemies)',
        'skill': 'magic', 'level_req': 1, 'xp_per_action': 3.5,
        'actions_per_hour': 1200, 'members': False,
        'notes': 'AFK. Very slow. 4.2K XP/hr. Requires -65 magic accuracy.',
        'input_items': [],
        'output_items': [],
        'emoji': '🧙', 'bored_task': 'Splash magic for 30 minutes (AFK)!',
    },
    {
        'name': 'Humidify (Lunar)',
        'skill': 'magic', 'level_req': 68, 'xp_per_action': 65.0,
        'actions_per_hour': 2000, 'members': True,
        'notes': 'Profitable. Create full vials of water. ~130K XP/hr.',
        'input_items': [],
        'output_items': [],
        'emoji': '🧙', 'bored_task': 'Cast Humidify 500 times to fill clay!',
    },
    {
        'name': 'Enchanting bolts (onyx)',
        'skill': 'magic', 'level_req': 87, 'xp_per_action': 97.0,
        'actions_per_hour': 1200, 'members': True,
        'notes': 'Very profitable enchanting onyx/diamond bolts. ~116K XP/hr.',
        'input_items': [],
        'output_items': [],
        'emoji': '🧙', 'bored_task': 'Enchant bolts for 30 minutes!',
    },

    # ── PRAYER ────────────────────────────────────────────────────────────────
    {
        'name': 'Burying bones (Giant bones)',
        'skill': 'prayer', 'level_req': 1, 'xp_per_action': 45.0,
        'actions_per_hour': 1500, 'members': True,
        'notes': 'Slow but free if you kill giants.',
        'input_items': [{'name': 'Big bones', 'item_id': 532, 'qty': 1}],
        'output_items': [],
        'emoji': '💀', 'bored_task': 'Bury 500 big bones!',
    },
    {
        'name': 'Gilded altar (Dragon bones)',
        'skill': 'prayer', 'level_req': 1, 'xp_per_action': 252.0,
        'actions_per_hour': 2000, 'members': True,
        'notes': '3.5x XP with 2 lit burners. ~504K XP/hr.',
        'input_items': [{'name': 'Dragon bones', 'item_id': 536, 'qty': 1}],
        'output_items': [],
        'emoji': '💀', 'bored_task': 'Offer 500 dragon bones at a Gilded Altar!',
    },
    {
        'name': 'Chaos Temple (Dragon bones)',
        'skill': 'prayer', 'level_req': 1, 'xp_per_action': 252.0,
        'actions_per_hour': 1500, 'members': True,
        'notes': '50% chance to not consume bone. Wilderness risk.',
        'input_items': [{'name': 'Dragon bones', 'item_id': 536, 'qty': 1}],
        'output_items': [],
        'emoji': '💀', 'bored_task': 'Use Chaos Temple altar for dragon bones!',
    },

    # ── HERBLORE ─────────────────────────────────────────────────────────────
    {
        'name': 'Guthix rest potions',
        'skill': 'herblore', 'level_req': 18, 'xp_per_action': 59.5,
        'actions_per_hour': 2000, 'members': True,
        'notes': 'Profitable starter method.',
        'input_items': [],
        'output_items': [],
        'emoji': '⚗️', 'bored_task': 'Make 400 Guthix rest potions!',
    },
    {
        'name': 'Stamina potions (4)',
        'skill': 'herblore', 'level_req': 77, 'xp_per_action': 102.0,
        'actions_per_hour': 2000, 'members': True,
        'notes': 'Highly profitable. ~200K XP/hr.',
        'input_items': [
            {'name': 'Super energy (4)', 'item_id': 3016, 'qty': 1},
            {'name': 'Amylase crystal', 'item_id': 13440, 'qty': 4},
        ],
        'output_items': [{'name': 'Stamina potion (4)', 'item_id': 12625, 'qty': 1}],
        'emoji': '⚗️', 'bored_task': 'Make 400 stamina potions!',
    },
    {
        'name': 'Saradomin brews',
        'skill': 'herblore', 'level_req': 81, 'xp_per_action': 180.0,
        'actions_per_hour': 2000, 'members': True,
        'notes': 'Decent XP. Very in-demand item.',
        'input_items': [],
        'output_items': [],
        'emoji': '⚗️', 'bored_task': 'Brew 300 Saradomin brews!',
    },

    # ── FLETCHING ─────────────────────────────────────────────────────────────
    {
        'name': 'Arrow shafts',
        'skill': 'fletching', 'level_req': 1, 'xp_per_action': 5.0,
        'actions_per_hour': 3000, 'members': False,
        'notes': 'F2P. ~15K XP/hr. Very cheap.',
        'input_items': [{'name': 'Logs', 'item_id': 1511, 'qty': 1}],
        'output_items': [],
        'emoji': '🏹', 'bored_task': 'Fletch 1,000 arrow shafts!',
    },
    {
        'name': 'Stringing maple shortbows',
        'skill': 'fletching', 'level_req': 50, 'xp_per_action': 75.0,
        'actions_per_hour': 1800, 'members': False,
        'notes': 'F2P/P2P. ~135K XP/hr. Slightly profitable.',
        'input_items': [
            {'name': 'Maple shortbow (u)', 'item_id': 4229, 'qty': 1},
            {'name': 'Bowstring', 'item_id': 1777, 'qty': 1},
        ],
        'output_items': [{'name': 'Maple shortbow', 'item_id': 853, 'qty': 1}],
        'emoji': '🏹', 'bored_task': 'String 600 maple shortbows!',
    },
    {
        'name': 'Dragon darts',
        'skill': 'fletching', 'level_req': 95, 'xp_per_action': 250.0,
        'actions_per_hour': 4500, 'members': True,
        'notes': 'Fastest fletching in the game. Profitable.',
        'input_items': [
            {'name': 'Dragon dart tip', 'item_id': 11232, 'qty': 1},
            {'name': 'Feather', 'item_id': 314, 'qty': 1},
        ],
        'output_items': [{'name': 'Dragon dart', 'item_id': 11230, 'qty': 1}],
        'emoji': '🏹', 'bored_task': 'Fletch 1,500 dragon darts!',
    },

    # ── ATTACK / STRENGTH / DEFENCE / RANGED ──────────────────────────────────
    {
        'name': 'Crabs (Sand/Rock/Ammonite)',
        'skill': 'attack', 'level_req': 1, 'xp_per_action': 200.0,
        'actions_per_hour': 100, 'members': True,
        'notes': 'AFK combat training. ~20K XP/hr. Also good for strength/defence.',
        'input_items': [], 'output_items': [],
        'emoji': '⚔️', 'bored_task': 'AFK train on crabs for 30 minutes!',
    },
    {
        'name': 'Crabs (Sand/Rock/Ammonite)',
        'skill': 'strength', 'level_req': 1, 'xp_per_action': 200.0,
        'actions_per_hour': 100, 'members': True,
        'notes': 'AFK combat training on crabs.',
        'input_items': [], 'output_items': [],
        'emoji': '💪', 'bored_task': 'AFK train Strength on crabs for 30 minutes!',
    },
    {
        'name': 'Crabs (Sand/Rock/Ammonite)',
        'skill': 'defence', 'level_req': 1, 'xp_per_action': 200.0,
        'actions_per_hour': 100, 'members': True,
        'notes': 'AFK combat training on crabs.',
        'input_items': [], 'output_items': [],
        'emoji': '🛡️', 'bored_task': 'AFK train Defence on crabs for 30 minutes!',
    },
    {
        'name': 'Chinchompas (MM2 tunnels)',
        'skill': 'ranged', 'level_req': 55, 'xp_per_action': 500.0,
        'actions_per_hour': 800, 'members': True,
        'notes': 'Red chinchompas at MM2 tunnels. ~800K XP/hr.',
        'input_items': [{'name': 'Red chinchompa', 'item_id': 10034, 'qty': 1}],
        'output_items': [],
        'emoji': '🏹', 'bored_task': 'Chin chinchompas in MM2 tunnels for 30 minutes!',
    },
    {
        'name': 'Slayer (combat XP)',
        'skill': 'slayer', 'level_req': 1, 'xp_per_action': 50.0,
        'actions_per_hour': 200, 'members': True,
        'notes': 'Do a Slayer task assigned by your Slayer master.',
        'input_items': [], 'output_items': [],
        'emoji': '💀', 'bored_task': 'Complete a full Slayer task!',
    },
    {
        'name': 'Slayer (combat XP)',
        'skill': 'hitpoints', 'level_req': 1, 'xp_per_action': 50.0,
        'actions_per_hour': 200, 'members': True,
        'notes': 'Hitpoints XP is gained proportionally during combat.',
        'input_items': [], 'output_items': [],
        'emoji': '❤️', 'bored_task': 'Go do a Slayer task for Hitpoints XP!',
    },

    # ── HUNTER ────────────────────────────────────────────────────────────────
    {
        'name': 'Birdhouses (Fossil Island)',
        'skill': 'hunter', 'level_req': 5, 'xp_per_action': 280.0,
        'actions_per_hour': 4, 'members': True,
        'notes': 'AFK every 50 mins. Best XP/time ratio in Hunter.',
        'input_items': [], 'output_items': [],
        'emoji': '🐾', 'bored_task': 'Do a birdhouse run on Fossil Island!',
    },
    {
        'name': 'Aerial fishing (Molch Island)',
        'skill': 'hunter', 'level_req': 35, 'xp_per_action': 40.0,
        'actions_per_hour': 500, 'members': True,
        'notes': 'Also grants Fishing XP. Molch pearls for angler outfit.',
        'input_items': [], 'output_items': [],
        'emoji': '🐾', 'bored_task': 'Aerial fish at Molch Island for 30 minutes!',
    },
    {
        'name': 'Black chinchompas (Wilderness)',
        'skill': 'hunter', 'level_req': 73, 'xp_per_action': 198.4,
        'actions_per_hour': 900, 'members': True,
        'notes': '~175K XP/hr. Wilderness risk. Very profitable.',
        'input_items': [], 'output_items': [],
        'emoji': '🐾', 'bored_task': 'Hunt black chinchompas in the Wilderness!',
    },

    # ── CONSTRUCTION ──────────────────────────────────────────────────────────
    {
        'name': 'Oak dining tables',
        'skill': 'construction', 'level_req': 22, 'xp_per_action': 240.0,
        'actions_per_hour': 1000, 'members': True,
        'notes': '~240K XP/hr. Good low-cost training.',
        'input_items': [{'name': 'Oak plank', 'item_id': 8778, 'qty': 4}],
        'output_items': [],
        'emoji': '🏠', 'bored_task': 'Build and remove oak dining tables in your POH!',
    },
    {
        'name': 'Mahogany tables',
        'skill': 'construction', 'level_req': 52, 'xp_per_action': 840.0,
        'actions_per_hour': 1000, 'members': True,
        'notes': '~900K XP/hr. Most efficient construction method. Very expensive.',
        'input_items': [{'name': 'Mahogany plank', 'item_id': 8782, 'qty': 6}],
        'output_items': [],
        'emoji': '🏠', 'bored_task': 'Build 200 mahogany tables in your POH!',
    },
    {
        'name': 'Mahogany homes',
        'skill': 'construction', 'level_req': 1, 'xp_per_action': 2000.0,
        'actions_per_hour': 15, 'members': True,
        'notes': 'Minigame. ~500K XP/hr. More efficient than tables. Carpenter outfit.',
        'input_items': [], 'output_items': [],
        'emoji': '🏠', 'bored_task': 'Complete 6 contracts in Mahogany Homes!',
    },
]
