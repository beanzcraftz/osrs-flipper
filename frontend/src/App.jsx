import { HashRouter, Routes, Route } from 'react-router-dom';
import { CharacterProvider } from './context/CharacterContext';
import { TimerProvider } from './context/TimerContext';
import { SessionProvider, useSession } from './context/SessionContext';
import Sidebar from './components/Sidebar';
import FlipperPage from './pages/FlipperPage';
import CharacterPage from './pages/CharacterPage';
import SkillerPage from './pages/SkillerPage';
import BoredPage from './pages/BoredPage';
import DashboardPage from './pages/DashboardPage';
import QuestPage from './pages/QuestPage';

function BioCheckModal() {
  const { showBioPrompt, completeBioCheck } = useSession();
  if (!showBioPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-blue-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          💧 Bio-Check!
        </h2>
        <p className="text-gray-300 mb-6">
          It's been 45 minutes. Take a quick break:
        </p>
        <ul className="space-y-3 mb-8 text-gray-400">
          <li className="flex items-center gap-2"><span>🧍</span> Check your posture</li>
          <li className="flex items-center gap-2"><span>🚰</span> Drink some water</li>
          <li className="flex items-center gap-2"><span>📈</span> Check your Alt-Account's GE Flips</li>
        </ul>
        <button onClick={completeBioCheck}
          className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-bold py-3 rounded-xl transition-colors border border-blue-500/30">
          I'm Good, Back to Grinding
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <SessionProvider>
        <TimerProvider>
          <CharacterProvider>
            <div className="flex min-h-screen bg-gray-950 text-gray-100">
              <Sidebar />
              <BioCheckModal />
              <main className="flex-1 ml-56 p-6 max-w-full overflow-x-hidden">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/flipper" element={<FlipperPage />} />
                <Route path="/character" element={<CharacterPage />} />
                <Route path="/skiller" element={<SkillerPage />} />
                <Route path="/bored" element={<BoredPage />} />
                <Route path="/quests" element={<QuestPage />} />
              </Routes>
            </main>
          </div>
        </CharacterProvider>
      </TimerProvider>
      </SessionProvider>
    </HashRouter>
  );
}
