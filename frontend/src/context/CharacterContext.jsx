import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CharacterContext = createContext(null);

export function CharacterProvider({ children }) {
  const [characters, setCharacters] = useState([]);
  const [activeCharacterId, setActiveCharacterId] = useState(() => {
    const stored = localStorage.getItem('osrs_active_char');
    return stored ? parseInt(stored, 10) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchCharacters = useCallback(async () => {
    try {
      const res = await fetch('/api/characters');
      if (!res.ok) throw new Error('Failed to load characters');
      const data = await res.json();
      setCharacters(data);
      // If stored active char no longer exists, clear it
      if (activeCharacterId && !data.find(c => c.id === activeCharacterId)) {
        setActiveCharacterId(data[0]?.id ?? null);
      } else if (!activeCharacterId && data.length > 0) {
        setActiveCharacterId(data[0].id);
      }
    } catch (err) {
      console.error('Character fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  useEffect(() => {
    if (activeCharacterId != null) {
      localStorage.setItem('osrs_active_char', String(activeCharacterId));
    } else {
      localStorage.removeItem('osrs_active_char');
    }
  }, [activeCharacterId]);

  const activeCharacter = characters.find(c => c.id === activeCharacterId) ?? null;

  return (
    <CharacterContext.Provider value={{
      characters,
      activeCharacter,
      activeCharacterId,
      setActiveCharacterId,
      refreshCharacters: fetchCharacters,
      loading,
    }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error('useCharacter must be used inside CharacterProvider');
  return ctx;
}
