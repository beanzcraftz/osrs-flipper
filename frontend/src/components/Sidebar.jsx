import { NavLink, useLocation } from 'react-router-dom';
import { useCharacter } from '../context/CharacterContext';

const NAV = [
  { to: '/',           label: 'GE Flipper',   emoji: '⚔️' },
  { to: '/character',  label: 'Characters',   emoji: '📋' },
  { to: '/skiller',    label: 'Skiller',      emoji: '📊' },
  { to: '/bored',      label: "I'm Bored",    emoji: '🎲' },
];

export default function Sidebar() {
  const { activeCharacter } = useCharacter();
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-gray-950 border-r border-gray-800 flex flex-col z-20">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
          OSRS Suite
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Account Manager</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
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
      </nav>

      {/* Active character badge */}
      <div className="px-4 py-4 border-t border-gray-800">
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
