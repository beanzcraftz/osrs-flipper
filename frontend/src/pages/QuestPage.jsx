import { useEffect, useState, useMemo } from 'react';
import { useCharacter } from '../context/CharacterContext';

const SKILL_ICONS = {
  attack: '⚔️', hitpoints: '❤️', mining: '⛏️', strength: '💪',
  agility: '🏃', smithing: '🔨', defence: '🛡️', herblore: '⚗️',
  fishing: '🎣', ranged: '🏹', thieving: '🦝', cooking: '🍳',
  prayer: '🙏', crafting: '🧵', firemaking: '🔥', magic: '🧙',
  fletching: '🏹', woodcutting: '🪓', runecraft: '🔮', slayer: '💀',
  farming: '🌱', construction: '🏠', hunter: '🐾', sailing: '⛵'
};

export default function QuestPage() {
  const { activeCharacterId } = useCharacter();
  const [activeChar, setActiveChar] = useState(null);
  const [quests, setQuests] = useState([]);
  const [filter, setFilter] = useState('all'); // all, ready, locked

  useEffect(() => {
    fetch('/api/quests')
      .then(r => r.json())
      .then(data => setQuests(data))
      .catch(console.error);
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

  const processedQuests = useMemo(() => {
    if (!activeChar) return [];
    
    return quests.map(quest => {
      let ready = true;
      const missing = [];
      
      for (const [skill, reqLevel] of Object.entries(quest.reqs || {})) {
        const current = activeChar.skills[skill] || 1;
        if (current < reqLevel) {
          ready = false;
          missing.push({ skill, reqLevel, current });
        }
      }
      
      return { ...quest, ready, missing };
    });
  }, [quests, activeChar]);

  const filteredQuests = useMemo(() => {
    if (filter === 'ready') return processedQuests.filter(q => q.ready);
    if (filter === 'locked') return processedQuests.filter(q => !q.ready);
    return processedQuests;
  }, [processedQuests, filter]);

  if (!activeCharacterId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold text-gray-500 mb-2">No Active Character</h2>
        <p className="text-gray-600">Head to the Characters tab to select or create one.</p>
      </div>
    );
  }

  return (
    <div className="pb-16 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          📜 Quest Tracker
        </h1>
        <p className="text-gray-400 mt-1">Check your skill requirements for major OSRS quests.</p>
      </header>

      <div className="flex gap-2 mb-6 bg-gray-900 p-2 rounded-lg inline-flex border border-gray-800">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>
          All Quests
        </button>
        <button onClick={() => setFilter('ready')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'ready' ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
          Ready to Start
        </button>
        <button onClick={() => setFilter('locked')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'locked' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'}`}>
          Locked
        </button>
      </div>

      <div className="space-y-4">
        {filteredQuests.map((quest, i) => (
          <div key={i} className={`bg-gray-900 border rounded-xl p-5 ${quest.ready ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg text-white">{quest.name}</h3>
              {quest.ready ? (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Ready</span>
              ) : (
                <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Locked</span>
              )}
            </div>

            {Object.keys(quest.reqs).length === 0 ? (
              <p className="text-sm text-gray-500">No skill requirements.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(quest.reqs).map(([skill, reqLevel]) => {
                  const current = activeChar.skills[skill] || 1;
                  const hasLevel = current >= reqLevel;
                  return (
                    <div key={skill} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${hasLevel ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
                      <span>{SKILL_ICONS[skill]}</span>
                      <span className="capitalize">{skill}</span>
                      <span className="font-bold">{hasLevel ? reqLevel : `${current}/${reqLevel}`}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {filteredQuests.length === 0 && (
          <p className="text-gray-500">No quests found for this filter.</p>
        )}
      </div>
    </div>
  );
}
