import { useEffect, useState } from 'react';
import { useCharacter } from '../context/CharacterContext';
import { ProgressBar } from './CharacterPage'; // Need to export ProgressBar from CharacterPage or move it. I'll just redefine it or fetch from activeChar

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
  const [activeChar, setActiveChar] = useState(null);

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
    <div className="pb-16 max-w-5xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
          Dashboard
        </h1>
        <p className="text-gray-400 mt-1">Welcome back, {activeChar.name}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}
