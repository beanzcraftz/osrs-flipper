import { HashRouter, Routes, Route } from 'react-router-dom';
import { CharacterProvider } from './context/CharacterContext';
import { TimerProvider } from './context/TimerContext';
import Sidebar from './components/Sidebar';
import FlipperPage from './pages/FlipperPage';
import CharacterPage from './pages/CharacterPage';
import SkillerPage from './pages/SkillerPage';
import BoredPage from './pages/BoredPage';
import DashboardPage from './pages/DashboardPage';
import QuestPage from './pages/QuestPage';

export default function App() {
  return (
    <HashRouter>
      <TimerProvider>
        <CharacterProvider>
          <div className="flex min-h-screen bg-gray-950 text-gray-100">
            <Sidebar />
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
    </HashRouter>
  );
}
