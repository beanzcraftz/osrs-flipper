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
  
  const [showTodo, setShowTodo] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    fetch('/api/quests')
      .then(r => r.json())
      .then(data => setQuests(data))
      .catch(console.error);
  }, []);

  const fetchActiveChar = () => {
    if (!activeCharacterId) {
      setActiveChar(null);
      return;
    }
    fetch(`/api/characters/${activeCharacterId}`)
      .then(res => res.json())
      .then(data => setActiveChar(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchActiveChar();
  }, [activeCharacterId]);

  const toggleQuest = async (questName) => {
    if (!activeChar) return;
    
    // Optimistic update
    const isCompleted = activeChar.completed_quests?.includes(questName);
    const newCompleted = isCompleted 
      ? activeChar.completed_quests.filter(q => q !== questName)
      : [...(activeChar.completed_quests || []), questName];
      
    setActiveChar({ ...activeChar, completed_quests: newCompleted });

    await fetch(`/api/characters/${activeChar.id}/quests/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quest_name: questName })
    });
    fetchActiveChar(); // Sync just in case
  };

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
      
      const isCompleted = activeChar.completed_quests?.includes(quest.name) || false;
      return { ...quest, ready, missing, isCompleted };
    });
  }, [quests, activeChar]);

  const todoQuests = useMemo(() => {
    let list = processedQuests.filter(q => !q.isCompleted);
    if (filter === 'ready') list = list.filter(q => q.ready);
    if (filter === 'locked') list = list.filter(q => !q.ready);
    return list;
  }, [processedQuests, filter]);

  const completedQuests = useMemo(() => {
    return processedQuests.filter(q => q.isCompleted);
  }, [processedQuests]);

  if (!activeCharacterId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold text-gray-500 mb-2">No Active Character</h2>
        <p className="text-gray-600">Head to the Characters tab to select or create one.</p>
      </div>
    );
  }

  const renderQuestCard = (quest, i) => (
    <div key={i} className={`bg-gray-900 border rounded-xl p-5 ${quest.isCompleted ? 'border-blue-500/30' : (quest.ready ? 'border-emerald-500/30' : 'border-red-500/30')}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={quest.isCompleted} 
            onChange={() => toggleQuest(quest.name)}
            className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
          />
          <h3 className={`font-bold text-lg ${quest.isCompleted ? 'text-gray-400 line-through' : 'text-white'}`}>{quest.name}</h3>
        </div>
        {!quest.isCompleted && (
          quest.ready ? (
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Ready</span>
          ) : (
            <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Locked</span>
          )
        )}
      </div>

      {Object.keys(quest.reqs).length === 0 ? (
        <p className="text-sm text-gray-500 ml-8">No skill requirements.</p>
      ) : (
        <div className="flex flex-wrap gap-2 ml-8">
          {Object.entries(quest.reqs).map(([skill, reqLevel]) => {
            const current = activeChar.skills[skill] || 1;
            const hasLevel = current >= reqLevel;
            return (
              <div key={skill} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${quest.isCompleted ? 'bg-gray-800/50 border-gray-700/50 text-gray-500' : (hasLevel ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300')}`}>
                <span className={quest.isCompleted ? 'opacity-50' : ''}>{SKILL_ICONS[skill]}</span>
                <span className="capitalize">{skill}</span>
                <span className="font-bold">{hasLevel ? reqLevel : `${current}/${reqLevel}`}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-16 max-w-4xl">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            📜 Quest Tracker
          </h1>
          <p className="text-gray-400 mt-1">Track major OSRS quests and check your skill requirements.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Global Progress</p>
          <p className="text-xl font-bold text-blue-400">
            {completedQuests.length} <span className="text-gray-500 text-sm">/ {quests.length}</span>
          </p>
        </div>
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

      <div className="space-y-6">
        {/* TO DO SECTION */}
        <div className="bg-gray-950/50 border border-gray-800 rounded-xl overflow-hidden">
          <button 
            onClick={() => setShowTodo(!showTodo)}
            className="w-full flex items-center justify-between p-4 bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            <h2 className="font-bold text-white text-lg">📝 To Do ({todoQuests.length})</h2>
            <span className="text-gray-400">{showTodo ? '▼' : '▶'}</span>
          </button>
          
          {showTodo && (
            <div className="p-4 space-y-4">
              {todoQuests.map((quest, i) => renderQuestCard(quest, i))}
              {todoQuests.length === 0 && (
                <p className="text-gray-500">No quests found in To Do for this filter.</p>
              )}
            </div>
          )}
        </div>

        {/* COMPLETED SECTION */}
        <div className="bg-gray-950/50 border border-gray-800 rounded-xl overflow-hidden">
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between p-4 bg-gray-900 hover:bg-gray-800 transition-colors"
          >
            <h2 className="font-bold text-white text-lg">✅ Completed ({completedQuests.length})</h2>
            <span className="text-gray-400">{showCompleted ? '▼' : '▶'}</span>
          </button>
          
          {showCompleted && (
            <div className="p-4 space-y-4">
              {completedQuests.map((quest, i) => renderQuestCard(quest, i))}
              {completedQuests.length === 0 && (
                <p className="text-gray-500">No completed quests yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
