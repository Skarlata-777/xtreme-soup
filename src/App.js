import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Star, Sparkles, CheckCircle2, Lightbulb, Trophy } from 'lucide-react';

const THEMES = [
  { name: 'Espacio', words: ['PLANETA', 'ESTRELLA', 'GALAXIA', 'COMETA', 'ASTEROIDE'], color: '#6366f1' },
  { name: 'Océano', words: ['TIBURON', 'CORAL', 'MEDUSA', 'BALLENA', 'DELFIN'], color: '#06b6d4' },
  { name: 'Cocina', words: ['SARTEN', 'CUCHILLO', 'HORNO', 'RECETA', 'ESPECIAS'], color: '#f97316' }
];

const GRID_SIZE = 10;

const App = () => {
  const [theme, setTheme] = useState(THEMES[0]);
  const [grid, setGrid] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [puntos, setPuntos] = useState(0);

  // Función para generar el tablero
  const generateGrid = useCallback(() => {
    let newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    
    // Colocar palabras del tema
    theme.words.forEach(word => {
      let placed = false;
      while (!placed) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * (GRID_SIZE - word.length));
        if (newGrid[row].slice(col, col + word.length).every(char => char === '')) {
          for (let i = 0; i < word.length; i++) {
            newGrid[row][col + i] = word[i];
          }
          placed = true;
        }
      }
    });

    // Rellenar con letras aleatorias
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === '') {
          newGrid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
    setGrid(newGrid);
    setFoundWords([]);
  }, [theme]);

  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  const handleWordClick = (word) => {
    if (theme.words.includes(word) && !foundWords.includes(word)) {
      setFoundWords([...foundWords, word]);
      setPuntos(puntos + 100);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles color="#facc15" /> XTREME SOUP
        </h1>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' }}>
          <span style={{ background: '#1e293b', padding: '8px 15px', borderRadius: '20px', border: '1px solid #334155' }}>
            <Trophy size={16} color="#facc15" /> Puntos: {puntos}
          </span>
          <button onClick={generateGrid} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <RefreshCw size={16} /> Reiniciar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 35px)`, gap: '5px', background: '#1e293b', padding: '15px', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        {grid.map((row, r) => row.map((char, c) => (
          <div key={`${r}-${c}`} style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#334155', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
            {char}
          </div>
        )))}
      </div>

      <div style={{ marginTop: '25px', width: '100%', maxWidth: '400px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Lightbulb color="#facc15" size={20}/> Busca estas palabras:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          {theme.words.map(word => (
            <span 
              key={word} 
              onClick={() => handleWordClick(word)}
              style={{ 
                padding: '5px 12px', 
                borderRadius: '15px', 
                background: foundWords.includes(word) ? '#22c55e' : '#334155',
                textDecoration: foundWords.includes(word) ? 'line-through' : 'none',
                cursor: 'pointer',
                transition: '0.3s'
              }}
            >
              {foundWords.includes(word) && <CheckCircle2 size={14} style={{ marginRight: '5px' }} />}
              {word}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        {THEMES.map(t => (
          <button 
            key={t.name} 
            onClick={() => setTheme(t)}
            style={{ padding: '10px', borderRadius: '8px', border: 'none', background: t.color, color: 'white', cursor: 'pointer', fontWeight: 'bold', opacity: theme.name === t.name ? 1 : 0.5 }}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;