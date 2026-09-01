import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCharacter } from '../context/CharacterContext';

const SKILL_COLORS = {
  attack: 'from-red-500 to-red-700',
  strength: 'from-green-600 to-green-800',
  defence: 'from-sky-500 to-sky-700',
  ranged: 'from-lime-500 to-lime-700',
  magic: 'from-blue-500 to-blue-700',
  prayer: 'from-yellow-300 to-yellow-500',
  hitpoints: 'from-red-400 to-pink-600',
  mining: 'from-slate-400 to-slate-600',
  smithing: 'from-orange-500 to-orange-700',
  woodcutting: 'from-amber-600 to-amber-800',
  fishing: 'from-cyan-500 to-cyan-700',
  cooking: 'from-orange-400 to-orange-600',
  firemaking: 'from-red-500 to-yellow-500',
  agility: 'from-sky-400 to-sky-600',
  thieving: 'from-purple-500 to-purple-700',
  herblore: 'from-green-400 to-green-600',
  crafting: 'from-amber-400 to-amber-600',
  fletching: 'from-lime-400 to-lime-600',
  runecraft: 'from-amber-300 to-yellow-500',
  slayer: 'from-zinc-400 to-zinc-600',
  farming: 'from-green-500 to-emerald-700',
  construction: 'from-stone-400 to-stone-600',
  hunter: 'from-emerald-400 to-emerald-700',
};

export default function BoredPage() {
  const { activeCharacter, activeCharacterId } = useCharacter();
  const [suggestion, setSuggestion] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const roll = async () => {
    setRolling(true);
    setRevealed(false);
    setSuggestion(null);

    // Short dramatic pause for effect
    await new Promise(r => setTimeout(r, 600));

    try {
      const url = activeCharacterId
        ? `/api/bored/suggest/${activeCharacterId}`
        : '/api/bored/suggest-guest';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Roll failed');
      const data = await res.json();
      setSuggestion(data);
      // Brief delay then reveal
      await new Promise(r => setTimeout(r, 100));
      setRevealed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setRolling(false);
    }
  };

  const gradientClass = suggestion
    ? (SKILL_COLORS[suggestion.skill] ?? 'from-amber-500 to-amber-700')
    : 'from-gray-700 to-gray-800';

  return (
    <div className="pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
          🎲 I'm Bored
        </h1>
        <p className="text-gray-400 text-sm mt-1">Get a random 30-minute micro-grind suggestion</p>
      </header>

      {!activeCharacter && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-lg mb-6 text-sm">
          💡 <Link to="/character" className="underline">Create a character</Link> for personalized suggestions based on your skill levels.
          Until then, you'll get beginner-friendly tasks.
        </div>
      )}

      {/* Roll button */}
      <div className="flex flex-col items-center justify-center py-12">
        <button
          onClick={roll}
          disabled={rolling}
          className={`relative w-48 h-48 rounded-full font-black text-3xl transition-all duration-300 select-none shadow-2xl
            ${rolling
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 animate-spin scale-90 cursor-not-allowed'
              : 'bg-gradient-to-br from-amber-400 to-amber-600 hover:scale-105 hover:shadow-amber-500/30 active:scale-95 cursor-pointer'
            } text-black`}
        >
          {rolling ? '⏳' : '🎲'}
        </button>

        <p className="mt-6 text-gray-400 text-sm">
          {rolling ? 'Rolling the dice…' : 'Click to roll a random 30-min task'}
        </p>

        {activeCharacter && (
          <p className="mt-2 text-xs text-amber-400/60">
            Tailored for {activeCharacter.name}
          </p>
        )}
      </div>

      {/* Result card */}
      {suggestion && (
        <div className={`max-w-2xl mx-auto transition-all duration-500 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className={`bg-gradient-to-br ${gradientClass} p-1 rounded-2xl shadow-2xl`}>
            <div className="bg-gray-950 rounded-xl p-8 text-center">
              {/* Emoji */}
              <div className="text-7xl mb-4 animate-bounce">{suggestion.emoji}</div>

              {/* Skill badge */}
              <span className={`inline-block bg-gradient-to-r ${gradientClass} text-white text-xs font-bold px-3 py-1 rounded-full mb-4 capitalize`}>
                {suggestion.skill} · Lvl {suggestion.current_level}
              </span>

              {/* Task */}
              <h2 className="text-2xl font-black text-white mb-3 leading-tight">
                {suggestion.task_description}
              </h2>

              {/* Method name */}
              <p className="text-gray-400 text-sm mb-6">
                📍 {suggestion.method_name}
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Duration</p>
                  <p className="font-bold text-white">⏱️ {suggestion.duration}</p>
                </div>
                <div className="bg-gray-900 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Est. XP Gained</p>
                  <p className="font-bold text-amber-400">
                    {new Intl.NumberFormat().format(suggestion.xp_estimate_30min)} XP
                  </p>
                </div>
                <div className="bg-gray-900 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">Access</p>
                  <p className="font-bold text-white">{suggestion.members ? '👑 P2P' : '🆓 F2P'}</p>
                </div>
              </div>

              {/* Tip */}
              <p className="text-gray-500 text-xs italic mb-6">{suggestion.notes}</p>

              {/* Roll again */}
              <button onClick={roll} disabled={rolling}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-8 py-3 rounded-xl text-lg transition-all hover:scale-105 active:scale-95 shadow-lg">
                🎲 Roll Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
