import { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [sessionLimit, setSessionLimit] = useState(() => {
    return Number(localStorage.getItem('osrs_session_limit')) || 0;
  });
  
  const [sessionStart, setSessionStart] = useState(() => {
    return Number(localStorage.getItem('osrs_session_start')) || 0;
  });

  const [active, setActive] = useState(() => {
    return localStorage.getItem('osrs_session_active') === 'true';
  });

  const [lastBioCheck, setLastBioCheck] = useState(() => {
    return Number(localStorage.getItem('osrs_last_bio_check')) || 0;
  });

  const [elapsed, setElapsed] = useState(0);
  const [showBioPrompt, setShowBioPrompt] = useState(false);

  const startSession = (minutes) => {
    const start = Date.now();
    setSessionLimit(minutes);
    setSessionStart(start);
    setLastBioCheck(start);
    setActive(true);
    
    localStorage.setItem('osrs_session_limit', minutes);
    localStorage.setItem('osrs_session_start', start);
    localStorage.setItem('osrs_last_bio_check', start);
    localStorage.setItem('osrs_session_active', 'true');
  };

  const stopSession = () => {
    setActive(false);
    localStorage.setItem('osrs_session_active', 'false');
  };

  const completeBioCheck = () => {
    setLastBioCheck(Date.now());
    setShowBioPrompt(false);
    localStorage.setItem('osrs_last_bio_check', Date.now());
  };

  useEffect(() => {
    if (!active) return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const minsElapsed = Math.floor((now - sessionStart) / 60000);
      setElapsed(minsElapsed);

      // Bio check every 45 mins
      const minsSinceBio = Math.floor((now - lastBioCheck) / 60000);
      if (minsSinceBio >= 45 && !showBioPrompt) {
        setShowBioPrompt(true);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [active, sessionStart, lastBioCheck, showBioPrompt]);

  return (
    <SessionContext.Provider value={{ active, sessionLimit, elapsed, startSession, stopSession, showBioPrompt, completeBioCheck }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
