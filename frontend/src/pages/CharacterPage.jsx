import { useState, useEffect } from 'react';
import { useCharacter } from '../context/CharacterContext';

const SKILLS = [
  'attack','hitpoints','mining','strength','agility','smithing',
  'defence','herblore','fishing','ranged','thieving','cooking',
  'prayer','crafting','firemaking','magic','fletching','woodcutting',
  'runecraft','slayer','farming','construction','hunter',
];

const SKILL_ICONS = {
  attack: '⚔️', hitpoints: '❤️', mining: '⛏️', strength: '💪',
  agility: '🏃', smithing: '🔨', defence: '🛡️', herblore: '⚗️',
  fishing: '🎣', ranged: '🏹', thieving: '🦝', cooking: '🍳',
  prayer: '🙏', crafting: '🧵', firemaking: '🔥', magic: '🧙',
  fletching: '🏹', woodcutting: '🪓', runecraft: '🔮', slayer: '💀',
  farming: '🌱', construction: '🏠', hunter: '🐾',
};

function xpForLevel(level) {
  if (level <= 1) return 0;
  if (level > 99) return 13034431;
  let xp = 0;
  for (let i = 1; i < level; i++) {
    xp += Math.floor(i + 300 * Math.pow(2, i / 7));
  }
  return Math.floor(xp / 4);
}

function ProgressBar({ current, target }) {
  const currentXP = xpForLevel(current);
  const targetXP = xpForLevel(target);
  const pct = targetXP > 0 ? Math.min(100, Math.round((currentXP / targetXP) * 100)) : 0;
  return (
    <div className="mt-1">
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-gray-500 mt-1">{pct}% to level {target}</p>
    </div>
  );
}

function CharacterSlot({ slot, character, onSelect, isActive, onDelete }) {
  if (!character) {
    return (
      <button onClick={() => onSelect(slot)}
        className="border-2 border-dashed border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-amber-500/50 hover:bg-gray-800/30 transition-all min-h-[140px]">
        <span className="text-3xl">➕</span>
        <span className="text-gray-500 text-sm">Slot {slot}</span>
        <span className="text-xs text-gray-600">Click to create</span>
      </button>
    );
  }
  return (
    <div onClick={() => onSelect(character.id)}
      className={`rounded-xl p-5 cursor-pointer transition-all border ${isActive ? 'border-amber-500/60 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-gray-800 bg-gray-900/50 hover:bg-gray-800/50'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-white">{character.name}</h3>
          <p className="text-xs text-gray-400">Combat {character.combat_level} · {character.total_level} total</p>
        </div>
        {isActive && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">Active</span>}
      </div>
      <p className="text-sm text-emerald-400 font-medium">{new Intl.NumberFormat().format(character.current_gp ?? 0)} GP</p>
      <button onClick={(e) => { e.stopPropagation(); onDelete(character.id); }}
        className="mt-3 text-xs text-red-400/60 hover:text-red-400 transition-colors">Delete</button>
    </div>
  );
}

export default function CharacterPage() {
  const { characters, activeCharacterId, setActiveCharacterId, refreshCharacters } = useCharacter();
  const [selectedChar, setSelectedChar] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newGoal, setNewGoal] = useState({ skill: 'attack', current_level: 1, target_level: 10 });
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [createSlot, setCreateSlot] = useState(null);
  const [newName, setNewName] = useState('');

  // When characters load, select active one
  useEffect(() => {
    if (activeCharacterId && !selectedChar) {
      fetchCharacterDetail(activeCharacterId);
    }
  }, [activeCharacterId]); // eslint-disable-line

  const fetchCharacterDetail = async (id) => {
    const res = await fetch(`/api/characters/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedChar(data);
      setEditForm({ ...data, ...data.skills });
    }
  };

  const handleSlotClick = async (slotOrId) => {
    const existing = characters.find(c => c.id === slotOrId || c.slot === slotOrId);
    if (existing) {
      setActiveCharacterId(existing.id);
      await fetchCharacterDetail(existing.id);
    } else {
      // Creating new
      setCreateSlot(slotOrId);
      setNewName('');
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const res = await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), slot: createSlot }),
    });
    if (res.ok) {
      await refreshCharacters();
      setCreateSlot(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this character? This cannot be undone.')) return;
    await fetch(`/api/characters/${id}`, { method: 'DELETE' });
    setSelectedChar(null);
    setEditForm({});
    if (activeCharacterId === id) setActiveCharacterId(null);
    await refreshCharacters();
  };

  const handleSave = async () => {
    if (!selectedChar) return;
    setSaving(true);
    const body = {};
    ['name','combat_level','total_level','current_gp',...SKILLS].forEach(k => {
      if (editForm[k] !== undefined) body[k] = editForm[k];
    });
    await fetch(`/api/characters/${selectedChar.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    await fetchCharacterDetail(selectedChar.id);
    await refreshCharacters();
    setSaving(false);
  };

  const handleAddGoal = async () => {
    if (!selectedChar) return;
    await fetch(`/api/characters/${selectedChar.id}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGoal),
    });
    await fetchCharacterDetail(selectedChar.id);
  };

  const handleCompleteGoal = async (goalId, completed) => {
    await fetch(`/api/characters/${selectedChar.id}/goals/${goalId}?completed=${!completed}`, { method: 'PUT' });
    await fetchCharacterDetail(selectedChar.id);
  };

  const handleDeleteGoal = async (goalId) => {
    await fetch(`/api/characters/${selectedChar.id}/goals/${goalId}`, { method: 'DELETE' });
    await fetchCharacterDetail(selectedChar.id);
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selectedChar) return;
    await fetch(`/api/characters/${selectedChar.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: noteText.trim() }),
    });
    setNoteText('');
    await fetchCharacterDetail(selectedChar.id);
  };

  const slots = [1, 2, 3];

  return (
    <div className="pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
          📋 Character Recorder
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manage up to 3 OSRS characters</p>
      </header>

      {/* Create modal */}
      {createSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-80">
            <h3 className="font-bold text-white mb-4">Create Character (Slot {createSlot})</h3>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Character name"
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white mb-4 focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-3">
              <button onClick={handleCreate} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2 rounded-lg text-sm transition-colors">Create</button>
              <button onClick={() => setCreateSlot(null)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Character slots */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {slots.map(slot => {
          const char = characters.find(c => c.slot === slot);
          return (
            <CharacterSlot key={slot} slot={slot} character={char}
              onSelect={handleSlotClick} isActive={char?.id === activeCharacterId}
              onDelete={handleDelete} />
          );
        })}
      </div>

      {/* Selected character editor */}
      {selectedChar && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Stats form */}
          <div className="xl:col-span-2 bg-gray-900/80 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-white text-lg">📊 Stats — {selectedChar.name}</h2>
              <button onClick={handleSave} disabled={saving}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            {/* Name / combat / GP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'combat_level', label: 'Combat Lvl', type: 'number' },
                { key: 'total_level', label: 'Total Lvl', type: 'number' },
                { key: 'current_gp', label: 'Cash Stack (GP)', type: 'number' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-xs text-gray-400 block mb-1">{label}</label>
                  <input
                    type={type}
                    value={editForm[key] ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))}
            </div>

            {/* Skill grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {SKILLS.map(skill => (
                <div key={skill} className="bg-gray-950 rounded-lg p-2 text-center">
                  <div className="text-base mb-1">{SKILL_ICONS[skill]}</div>
                  <label className="text-xs text-gray-400 block mb-1 capitalize">{skill}</label>
                  <input
                    type="number" min="1" max="99"
                    value={editForm[skill] ?? 1}
                    onChange={e => setEditForm(f => ({ ...f, [skill]: Number(e.target.value) }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-1 py-1 text-white text-sm text-center focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Goals + Notes column */}
          <div className="space-y-6">
            {/* Goals */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
              <h2 className="font-bold text-white mb-4">🎯 Active Goals</h2>

              {selectedChar.goals?.filter(g => !g.completed).map(goal => (
                <div key={goal.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-white capitalize">
                      {SKILL_ICONS[goal.skill]} {goal.skill} {goal.current_level} → {goal.target_level}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleCompleteGoal(goal.id, goal.completed)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">✓ Done</button>
                      <button onClick={() => handleDeleteGoal(goal.id)}
                        className="text-xs text-red-400/60 hover:text-red-400 transition-colors">✕</button>
                    </div>
                  </div>
                  <ProgressBar current={editForm[goal.skill] ?? goal.current_level} target={goal.target_level} />
                </div>
              ))}

              {selectedChar.goals?.filter(g => !g.completed).length === 0 && (
                <p className="text-gray-500 text-sm mb-4">No active goals yet.</p>
              )}

              {/* Add goal form */}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-400 mb-2">Add Goal</p>
                <div className="flex gap-2 flex-wrap">
                  <select value={newGoal.skill} onChange={e => setNewGoal(g => ({ ...g, skill: e.target.value }))}
                    className="bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-amber-500">
                    {SKILLS.map(s => <option key={s} value={s}>{SKILL_ICONS[s]} {s}</option>)}
                  </select>
                  <input type="number" min="1" max="98" placeholder="From"
                    value={newGoal.current_level}
                    onChange={e => setNewGoal(g => ({ ...g, current_level: Number(e.target.value) }))}
                    className="w-16 bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-amber-500" />
                  <input type="number" min="2" max="99" placeholder="To"
                    value={newGoal.target_level}
                    onChange={e => setNewGoal(g => ({ ...g, target_level: Number(e.target.value) }))}
                    className="w-16 bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-amber-500" />
                  <button onClick={handleAddGoal}
                    className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 px-3 py-1 rounded text-sm transition-colors">
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-5">
              <h2 className="font-bold text-white mb-3">📝 Daily Notes</h2>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="What did you accomplish today? Goals for tomorrow?"
                rows={3}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 resize-none"
              />
              <button onClick={handleAddNote}
                className="mt-2 w-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 py-2 rounded-lg text-sm font-medium transition-colors">
                Save Note
              </button>
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {selectedChar.notes?.map(n => (
                  <div key={n.id} className="bg-gray-950 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500 mb-1">{new Date(n.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-300">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
