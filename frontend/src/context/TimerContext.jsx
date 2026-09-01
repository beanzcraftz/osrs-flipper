import { createContext, useContext, useState, useEffect } from 'react';

const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [timers, setTimers] = useState(() => {
    const saved = localStorage.getItem('osrs_timers');
    return saved ? JSON.parse(saved) : {};
  });

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('osrs_timers', JSON.stringify(timers));
  }, [timers]);

  const startTimer = (id, minutes) => {
    const endTime = Date.now() + minutes * 60000;
    setTimers(prev => ({ ...prev, [id]: endTime }));
  };

  const getRemaining = (id) => {
    if (!timers[id]) return null;
    const remaining = timers[id] - now;
    if (remaining <= 0) return 0;
    return remaining;
  };

  return (
    <TimerContext.Provider value={{ startTimer, getRemaining }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimers() {
  return useContext(TimerContext);
}
