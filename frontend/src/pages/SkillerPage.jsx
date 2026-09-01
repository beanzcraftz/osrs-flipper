import { useState } from 'react';
import { useCharacter } from '../context/CharacterContext';

const SKILLS = [
  'attack','hitpoints','mining','strength','agility','smithing',
  'defence','herblore','fishing','ranged','thieving','cooking',
  'prayer','crafting','firemaking','magic','fletching','woodcutting',
  'runecraft','slayer','farming','construction','hunter','sailing'
];

const SKILL_ICONS = {
  attack: '⚔️', hitpoints: '❤️', mining: '⛏️', strength: '💪',
  agility: '🏃', smithing: '🔨', defence: '🛡️', herblore: '⚗️',
  fishing: '🎣', ranged: '🏹', thieving: '🦝', cooking: '🍳',
  prayer: '🙏', crafting: '🧵', firemaking: '🔥', magic: '🧙',
  fletching: '🏹', woodcutting: '🪓', runecraft: '🔮', slayer: '💀',
  farming: '🌱', construction: '🏠', hunter: '🐾', sailing: '⛵'
};

function fmt(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat().format(Math.abs(Math.round(n)));
}

export default function SkillerPage() {
  const { activeCharacter } = useCharacter();

  const [skill, setSkill] = useState('smithing');
  const [currentLevel, setCurrentLevel] = useState(
    () => activeCharacter?.skills?.smithing ?? 1
  );
  const [goalLevel, setGoalLevel] = useState(99);
  const [availableGP, setAvailableGP] = useState(
    () => activeCharacter?.current_gp ?? 0
  );
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSkillChange = (s) => {
    setSkill(s);
    if (activeCharacter?.skills?.[s]) {
      setCurrentLevel(activeCharacter.skills[s]);
    }
  };

  const calculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        skill,
        current_level: currentLevel,
        goal_level: goalLevel,
        available_gp: availableGP,
      });
      const res = await fetch(`/api/skiller/calculate?${params}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail ?? 'Calculation failed');
      }
      setResults(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
          📊 Skiller
        </h1>
        <p className="text-gray-400 text-sm mt-1">Calculate the best training method for your goal</p>
      </header>

      {/* Config panel */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Skill */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Skill</label>
            <select
              value={skill}
              onChange={e => handleSkillChange(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            >
              {SKILLS.map(s => (
                <option key={s} value={s}>{SKILL_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Current Level */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Current Level</label>
            <input
              type="number" min="1" max="98"
              value={currentLevel}
              onChange={e => setCurrentLevel(Number(e.target.value))}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Goal Level */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Goal Level</label>
            <input
              type="number" min="2" max="99"
              value={goalLevel}
              onChange={e => setGoalLevel(Number(e.target.value))}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* GP */}
          <div>
            <label className="text-xs text-gray-400 block mb-1">
              Available GP {activeCharacter && <span className="text-amber-400/70">(auto-filled)</span>}
            </label>
            <input
              type="number" min="0"
              value={availableGP}
              onChange={e => setAvailableGP(Number(e.target.value))}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Calculate */}
          <div className="flex items-end">
            <button
              onClick={calculate}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-2 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Calculating…' : '⚡ Calculate'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          {/* Summary bar */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 mb-4 flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-gray-400">Skill</p>
              <p className="font-bold text-white capitalize">{SKILL_ICONS[results.skill]} {results.skill}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Levels</p>
              <p className="font-bold text-white">{results.current_level} → {results.goal_level}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">XP Needed</p>
              <p className="font-bold text-amber-400">{fmt(results.xp_needed)} XP</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Methods Found</p>
              <p className="font-bold text-white">{results.methods.length}</p>
            </div>
          </div>

          {results.methods.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
              No training methods available for level {results.current_level} {results.skill}.
              <br />Try a higher level or different skill.
            </div>
          ) : (
            <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-gray-900">
                    <tr>
                      {['Method','Req','XP/hr','XP/action','Actions','Hours','Cost/action','Total Cost/Profit','Notes'].map(h => (
                        <th key={h} className="p-4 text-gray-400 font-medium text-sm">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.methods.map((m, i) => (
                      <tr key={i} className={`border-t border-gray-800 transition-colors ${
                        !m.affordable ? 'opacity-50' :
                        m.profitable ? 'bg-emerald-500/5 hover:bg-emerald-500/10' :
                        'hover:bg-gray-800/50'
                      }`}>
                        <td className="p-4">
                          <div className="font-medium text-white">{m.name}</div>
                          {m.members && <span className="text-xs text-amber-400/70">P2P</span>}
                          {!m.affordable && <span className="ml-2 text-xs text-red-400">⚠ Not affordable</span>}
                        </td>
                        <td className="p-4 text-gray-300">{m.level_req}</td>
                        <td className="p-4 text-amber-400 font-medium">{fmt(m.xp_per_hour)}</td>
                        <td className="p-4 text-gray-300">{m.xp_per_action.toFixed(1)}</td>
                        <td className="p-4 text-gray-300">{fmt(m.actions_required)}</td>
                        <td className="p-4 text-gray-300">{m.hours_required.toFixed(1)}h</td>
                        <td className={`p-4 font-medium ${m.cost_per_action < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.cost_per_action < 0 ? '+' : ''}{fmt(m.cost_per_action)} GP
                        </td>
                        <td className={`p-4 font-bold text-lg ${m.total_cost <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.total_cost <= 0 ? `+${fmt(Math.abs(m.total_cost))}` : `-${fmt(m.total_cost)}`} GP
                        </td>
                        <td className="p-4 text-gray-400 text-xs max-w-xs">{m.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div className="text-center text-gray-500 py-16">
          <p className="text-4xl mb-4">📊</p>
          <p>Select a skill and level range, then hit Calculate.</p>
          {activeCharacter && <p className="text-sm mt-2 text-amber-400/70">Stats from {activeCharacter.name} auto-populated.</p>}
        </div>
      )}
    </div>
  );
}
