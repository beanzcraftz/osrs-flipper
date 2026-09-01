import { HashRouter, Routes, Route } from 'react-router-dom';
import { CharacterProvider } from './context/CharacterContext';
import Sidebar from './components/Sidebar';
import FlipperPage from './pages/FlipperPage';
import CharacterPage from './pages/CharacterPage';
import SkillerPage from './pages/SkillerPage';
import BoredPage from './pages/BoredPage';

export default function App() {
  return (
    <HashRouter>
      <CharacterProvider>
        <div className="flex min-h-screen bg-gray-950 text-gray-100">
          <Sidebar />
          <main className="flex-1 ml-56 p-6 max-w-full overflow-x-hidden">
            <Routes>
              <Route path="/" element={<FlipperPage />} />
              <Route path="/character" element={<CharacterPage />} />
              <Route path="/skiller" element={<SkillerPage />} />
              <Route path="/bored" element={<BoredPage />} />
            </Routes>
          </main>
        </div>
      </CharacterProvider>
    </HashRouter>
  );
}
