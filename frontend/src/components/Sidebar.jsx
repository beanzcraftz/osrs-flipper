import { NavLink, useLocation } from 'react-router-dom';
import { useCharacter } from '../context/CharacterContext';
import { useTimers } from '../context/TimerContext';

const NAV = [
  { to: '/',           label: 'Dashboard',    emoji: '🏠' },
  { to: '/flipper',    label: 'GE Flipper',   emoji: '⚔️' },
  { to: '/character',  label: 'Characters',   emoji: '📋' },
  { to: '/skiller',    label: 'Skiller',      emoji: '📊' },
  { to: '/quests',     label: 'Quests',       emoji: '📜' },
  { to: '/bored',      label: "I'm Bored",    emoji: '🎲' },
];

function TimerRow({ id, label, minutes }) {
  const { startTimer, getRemaining } = useTimers();
  const ms = getRemaining(id);
  
  const formatted = ms > 0 
    ? `${Math.floor(ms/60000)}m ${Math.floor((ms%60000)/1000)}s` 
    : 'Ready';

  return (
    <div className="flex items-center justify-between mt-2">
      <span className="text-xs text-gray-300">{label}</span>
      {ms > 0 ? (
        <span className="text-xs font-mono text-amber-400">{formatted}</span>
      ) : (
        <button onClick={() => startTimer(id, minutes)}
          className="text-[10px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-2 py-0.5 rounded transition-colors">
          Start {minutes}m
        </button>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { activeCharacter } = useCharacter();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-gray-950 border-r border-gray-800 flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800 shrink-0">
        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
          OSRS Suite
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Account Manager</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, emoji }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`
            }
          >
            <span className="text-base leading-none">{emoji}</span>
            {label}
          </NavLink>
        ))}

        <div className="mt-6 pt-4 border-t border-gray-800 px-2">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Farm Timers</p>
          <TimerRow id="birdhouse" label="Birdhouse" minutes={50} />
          <TimerRow id="herb" label="Herb Run" minutes={80} />
          <TimerRow id="seaweed" label="Seaweed" minutes={40} />
        </div>
      </nav>

      {/* Active character badge */}
      <div className="px-4 py-4 border-t border-gray-800 shrink-0">
        {activeCharacter ? (
          <div className="bg-gray-900 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-500 mb-0.5">Active Character</p>
            <p className="text-sm font-semibold text-white truncate">{activeCharacter.name}</p>
            <p className="text-xs text-gray-400">
              Lvl {activeCharacter.combat_level} · {activeCharacter.total_level} total
            </p>
          </div>
        ) : (
          <NavLink to="/character" className="block bg-gray-900/60 border border-dashed border-gray-700 rounded-lg px-3 py-2 text-center hover:border-amber-500/50 transition-colors">
            <p className="text-xs text-gray-500">No character selected</p>
            <p className="text-xs text-amber-400 mt-0.5">+ Create one →</p>
          </NavLink>
        )}
      </div>
    </aside>
  );
}
