import { useEffect, useState, useMemo } from 'react';
import { useCharacter } from '../context/CharacterContext';
import { useSession } from '../context/SessionContext';
import { ProgressBar } from './CharacterPage';

function Progress({ current, target }) {
  const pct = Math.min(100, Math.max(0, (current / target) * 100));
  return (
    <div className="w-full bg-gray-800 rounded-full h-2 mt-2 border border-gray-700 overflow-hidden">
      <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
    </div>
  );
}

const SKILL_ICONS = {
  attack: '⚔️', hitpoints: '❤️', mining: '⛏️', strength: '💪',
  agility: '🏃', smithing: '🔨', defence: '🛡️', herblore: '⚗️',
  fishing: '🎣', ranged: '🏹', thieving: '🦝', cooking: '🍳',
  prayer: '🙏', crafting: '🧵', firemaking: '🔥', magic: '🧙',
  fletching: '🏹', woodcutting: '🪓', runecraft: '🔮', slayer: '💀',
  farming: '🌱', construction: '🏠', hunter: '🐾', sailing: '⛵'
};

export default function DashboardPage() {
  const { characters, activeCharacterId } = useCharacter();
  const { active, sessionLimit, elapsed, startSession, stopSession } = useSession();
  
  const [activeChar, setActiveChar] = useState(null);
  const [quests, setQuests] = useState([]);
  
  // Alt GE Tracker state
  const [altSlots, setAltSlots] = useState(() => {
    return JSON.parse(localStorage.getItem('osrs_alt_ge') || '[]');
  });
  const [newAltItem, setNewAltItem] = useState('');

  useEffect(() => {
    fetch('/api/quests').then(r => r.json()).then(setQuests).catch(console.error);
  }, []);

  useEffect(() => {
    if (activeCharacterId) {
      fetch(`/api/characters/${activeCharacterId}`)
        .then(res => res.json())
        .then(data => setActiveChar(data))
        .catch(console.error);
    } else {
      setActiveChar(null);
    }
  }, [activeCharacterId]);

  useEffect(() => {
    localStorage.setItem('osrs_alt_ge', JSON.stringify(altSlots));
  }, [altSlots]);

  const nextQuest = useMemo(() => {
    if (!activeChar || !quests.length) return null;
    
    // Find quests that aren't completed
    const uncompleted = quests.filter(q => !(activeChar.completed_quests || []).includes(q.name));
    if (uncompleted.length === 0) return null;

    // Score quests by how close we are
    const scored = uncompleted.map(q => {
      let missingLevels = 0;
      for (const [skill, reqLevel] of Object.entries(q.reqs || {})) {
        const current = activeChar.skills[skill] || 1;
        if (current < reqLevel) {
          missingLevels += (reqLevel - current);
        }
      }
      return { ...q, missingLevels };
    });

    // Return the one with the fewest missing levels (0 means ready)
    scored.sort((a, b) => a.missingLevels - b.missingLevels);
    return scored[0];
  }, [quests, activeChar]);

  if (!activeCharacterId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold text-gray-500 mb-2">No Active Character</h2>
        <p className="text-gray-600">Head to the Characters tab to select or create one.</p>
      </div>
    );
  }

  if (!activeChar) return <div className="text-gray-500">Loading...</div>;

  const activeGoals = (activeChar.goals || []).filter(g => !g.completed);
  const recentNote = (activeChar.notes || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  return (
    <div className="pb-16 max-w-6xl">
      <header className="mb-8 flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            Command Center
          </h1>
          <p className="text-gray-400 mt-1">Welcome back, {activeChar.name}</p>
        </div>
        
        {/* Session Tracking */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-right">
          {active ? (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Session Active</p>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-emerald-400">{elapsed}m / {sessionLimit}m</span>
                <button onClick={stopSession} className="text-xs text-red-400 hover:text-red-300">Stop</button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Start Session</p>
              <div className="flex gap-2">
                <button onClick={() => startSession(60)} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-sm hover:bg-emerald-500/30">60m</button>
                <button onClick={() => startSession(120)} className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-sm hover:bg-emerald-500/30">120m</button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-center">
          <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">Combat Level</p>
          <p className="text-3xl font-bold text-white">{activeChar.combat_level}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-center">
          <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">Total Level</p>
          <p className="text-3xl font-bold text-white">{activeChar.total_level}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-center">
          <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-wide">Cash Stack</p>
          <p className="text-3xl font-bold text-emerald-400">{new Intl.NumberFormat().format(activeChar.current_gp)} GP</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-bold text-white mb-4">🎯 Active Goals</h2>
            <div className="space-y-4">
              {activeGoals.length > 0 ? (
                activeGoals.map(goal => (
                  <div key={goal.id} className="bg-gray-950 p-4 rounded-lg border border-gray-800">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-white capitalize">{SKILL_ICONS[goal.skill]} {goal.skill}</span>
                      <span className="text-gray-400">{goal.current_level} → <span className="text-amber-400 font-bold">{goal.target_level}</span></span>
                    </div>
                    <Progress current={activeChar.skills[goal.skill] ?? goal.current_level} target={goal.target_level} />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No active goals. Set some in the Characters tab!</p>
              )}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
            <h2 className="font-bold text-white mb-4">📝 Recent Activity</h2>
            {recentNote ? (
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 flex-1">
                <p className="text-xs text-gray-500 mb-2">{new Date(recentNote.created_at).toLocaleString()}</p>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{recentNote.content}</p>
              </div>
            ) : (
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 flex-1 flex items-center justify-center">
                <p className="text-gray-500 text-sm">No notes recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Next Quest Engine */}
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📜</div>
            <h2 className="font-bold text-blue-400 mb-2 relative z-10">Optimal Next Quest</h2>
            {nextQuest ? (
              <div className="relative z-10">
                <p className="text-xl font-bold text-white mb-2">{nextQuest.name}</p>
                {nextQuest.missingLevels === 0 ? (
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Ready to Start!</span>
                ) : (
                  <div>
                    <span className="text-red-400 text-sm font-medium">Missing {nextQuest.missingLevels} total levels</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No quests available to analyze.</p>
            )}
          </div>

          {/* Alt-Account GE Tracker */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <span>📈</span> Alt-Account GE Slots
            </h2>
            
            <div className="space-y-2 mb-4">
              {altSlots.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-950 border border-gray-800 p-2 rounded text-sm">
                  <span className="text-gray-300 truncate pr-2">{item}</span>
                  <button onClick={() => setAltSlots(altSlots.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-400">✕</button>
                </div>
              ))}
              {altSlots.length === 0 && <p className="text-xs text-gray-500">No active flip slots.</p>}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={newAltItem}
                onChange={e => setNewAltItem(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newAltItem) {
                    setAltSlots([...altSlots, newAltItem]);
                    setNewAltItem('');
                  }
                }}
                placeholder="Item name..."
                className="flex-1 bg-gray-950 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <button 
                onClick={() => {
                  if (newAltItem) {
                    setAltSlots([...altSlots, newAltItem]);
                    setNewAltItem('');
                  }
                }}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-3 py-1 rounded text-sm transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
