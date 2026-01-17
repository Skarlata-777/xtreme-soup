import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, RefreshCw, Palette, Star, Sparkles, CheckCircle2, Lightbulb, BrainCircuit, Send, Loader2, Target, Award, Medal, Crown, Zap } from 'lucide-react';

const apiKey = ""; 

const THEME_GALLERY = [
  { name: 'Space', words: ['PLANET', 'STAR', 'GALAXY', 'COMET', 'ASTEROID', 'ORBIT', 'COSMOS', 'NEBULA'], color: 'bg-indigo-600', icon: '🚀' },
  { name: 'Ocean', words: ['SHARK', 'CORAL', 'JELLYFISH', 'WHALE', 'DOLPHIN', 'REEF', 'OCTOPUS', 'ABYSS'], color: 'bg-cyan-600', icon: '🌊' },
  { name: 'Cooking', words: ['PAN', 'KNIFE', 'OVEN', 'RECIPE', 'SPICES', 'MIXER', 'SPOON', 'SOUP'], color: 'bg-orange-600', icon: '🍳' },
  { name: 'Coding', words: ['VARIABLE', 'FUNCTION', 'OBJECT', 'ARRAY', 'STATE', 'COMPONENT', 'HOOKS', 'REDUX'], color: 'bg-emerald-600', icon: '💻' }
];

const ACHIEVEMENTS = [
  { threshold: 5000, label: 'Beginner', icon: <Star className="text-yellow-400" />, color: 'border-yellow-400/50' },
  { threshold: 10000, label: 'Bronze Seeker', icon: <Medal className="text-orange-400" />, color: 'border-orange-400/50' },
  { threshold: 20000, label: 'Silver Scholar', icon: <Medal className="text-slate-300" />, color: 'border-slate-300/50' },
  { threshold: 30000, label: 'Gold Master', icon: <Medal className="text-yellow-500" />, color: 'border-yellow-500/50' },
  { threshold: 50000, label: 'Platinum Legend', icon: <Award className="text-blue-300" />, color: 'border-blue-300/50' },
  { threshold: 100000, label: 'Puzzle Demigod', icon: <Crown className="text-purple-400" />, color: 'border-purple-400/50' },
];

const GRID_SIZE = 12;

const App = () => {
  const [theme, setTheme] = useState(THEME_GALLERY[0]);
  const [grid, setGrid] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundPaths, setFoundPaths] = useState([]); 
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [currentSelection, setCurrentSelection] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [score, setScore] = useState(0);
  
  const [customTopic, setCustomTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiHint, setAiHint] = useState('');
  const [isGeneratingHint, setIsGeneratingHint] = useState(false);
  const [achievementAlert, setAchievementAlert] = useState(null);

  const fetchGemini = async (prompt, systemInstruction = "") => {
    let delay = 1000;
    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            generationConfig: { responseMimeType: "application/json" }
          })
        });
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        return JSON.parse(data.candidates[0].content.parts[0].text);
      } catch (error) {
        if (i === 4) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const generateAiTheme = async (topic = customTopic) => {
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const prompt = `Genera un nuevo tema de sopa de letras sobre "${topic}". Formato JSON: {"name": "Nombre", "words": ["PALABRA1", "PALABRA2", ...], "icon": "emoji"}`;
      const result = await fetchGemini(prompt, "Diseñador de juegos. 8 palabras máximo. Solo JSON.");
      const newTheme = { ...result, words: result.words.map(w => w.toUpperCase()), color: 'bg-violet-600' };
      setTheme(newTheme);
      setFoundWords([]);
      setFoundPaths([]);
      generateGrid(newTheme.words);
      setCustomTopic('');
    } catch (error) {
      setSuccessMessage("Error de conexión IA.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateGrid = useCallback((words) => {
    let newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];

    words.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 200) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        if (canPlace(newGrid, word, row, col, dir)) {
          for (let i = 0; i < word.length; i++) {
            newGrid[row + i * dir[0]][col + i * dir[1]] = word[i];
          }
          placed = true;
        }
        attempts++;
      }
    });

    const letters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === '') newGrid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
    setGrid(newGrid);
  }, []);

  const canPlace = (grid, word, row, col, dir) => {
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dir[0];
      const c = col + i * dir[1];
      if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
    }
    return true;
  };

  useEffect(() => {
    generateGrid(theme.words);
  }, [generateGrid, theme.words]);

  useEffect(() => {
    const achievement = ACHIEVEMENTS.find(a => a.threshold === score);
    if (achievement) {
      setAchievementAlert(achievement);
      setTimeout(() => setAchievementAlert(null), 4000);
    }
  }, [score]);

  const handleMouseDown = (r, c) => {
    setIsSelecting(true);
    setSelectionStart({ r, c });
    setCurrentSelection([{ r, c }]);
  };

  const handleMouseEnter = (r, c) => {
    if (isSelecting && selectionStart) {
      const dr = r - selectionStart.r;
      const dc = c - selectionStart.c;
      if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
        const steps = Math.max(Math.abs(dr), Math.abs(dc));
        const stepR = dr === 0 ? 0 : dr / steps;
        const stepC = dc === 0 ? 0 : dc / steps;
        const cells = [];
        for (let i = 0; i <= steps; i++) {
          cells.push({ r: selectionStart.r + i * stepR, c: selectionStart.c + i * stepC });
        }
        setCurrentSelection(cells);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    const selectedWord = currentSelection.map(cell => grid[Math.round(cell.r)][Math.round(cell.c)]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    const matchedWord = theme.words.find(w => w === selectedWord || w === reversedWord);
    
    if (matchedWord && !foundWords.includes(matchedWord)) {
      setFoundWords(prev => [...prev, matchedWord]);
      setFoundPaths(prev => [...prev, ...currentSelection]);
      setScore(prev => prev + 250); 
      setSuccessMessage(`¡MAGNÍFICO! +250`);
      setTimeout(() => setSuccessMessage(''), 1500);
    }
    setIsSelecting(false);
    setCurrentSelection([]);
  };

  const isCellSelected = (r, c) => currentSelection.some(cell => Math.round(cell.r) === r && Math.round(cell.c) === c);
  const isCellFound = (r, c) => foundPaths.some(cell => Math.round(cell.r) === r && Math.round(cell.c) === c);

  const getNextLevel = () => {
    const nextThemes = ["Misterios del Mundo", "Criaturas Mitológicas", "Ciudades Futuristas", "Inventos Locos", "Animales Exóticos"];
    const randomTopic = nextThemes[Math.floor(Math.random() * nextThemes.length)];
    generateAiTheme(randomTopic);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 font-sans select-none overflow-x-hidden text-slate-100" onMouseUp={handleMouseUp}>
      
      {/* Notificación de Logro */}
      {achievementAlert && (
        <div className="fixed top-10 z-[110] flex items-center gap-4 bg-slate-900 border-2 border-indigo-500 p-6 rounded-3xl shadow-[0_0_40px_rgba(79,70,229,0.5)] animate-in slide-in-from-top-20 duration-500">
          <div className="p-3 bg-indigo-600 rounded-2xl animate-bounce">
            {achievementAlert.icon}
          </div>
          <div>
            <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest">¡Logro Desbloqueado!</h4>
            <p className="text-white text-xl font-black">{achievementAlert.label}</p>
          </div>
        </div>
      )}

      {/* Panel Superior */}
      <div className="w-full max-w-5xl bg-slate-900 rounded-3xl shadow-2xl p-6 mb-6 border border-slate-800 relative overflow-hidden">
        
        {/* Espacio para el Logo Circular en la esquina superior izquierda */}
        <div className="absolute top-2 left-2 w-20 h-20 opacity-40 pointer-events-none">
           <img src="https://images.unsplash.com/photo-1614850715649-1d0106293bd1?q=80&w=250&auto=format&fit=crop" alt="Logo" className="w-full h-full object-cover rounded-full border-2 border-indigo-500/50" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 pl-16">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl text-white ${theme.color} shadow-lg ring-4 ring-indigo-500/10`}>
              <Target size={32} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-white to-purple-400 bg-clip-text text-transparent italic">
                XTREME WORD SEARCH
              </h1>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">
                {theme.icon} {theme.name} • INFINITE MODE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Total Points</span>
              <span className="text-4xl font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]">{score}</span>
            </div>
            <button onClick={() => { setFoundWords([]); setFoundPaths([]); generateGrid(theme.words); }} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700">
              <RefreshCw size={24} />
            </button>
          </div>
        </div>

        {/* Gemini AI Input */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row gap-4 relative z-10">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Enter ANY topic and AI will create it..." 
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full pl-4 pr-12 py-4 bg-black border-2 border-slate-800 rounded-2xl focus:border-indigo-500 outline-none transition-all text-white font-medium"
              onKeyDown={(e) => e.key === 'Enter' && generateAiTheme()}
            />
            <button 
              onClick={() => generateAiTheme()}
              disabled={isLoading || !customTopic}
              className="absolute right-2 top-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-30"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-2xl border border-slate-700 overflow-x-auto no-scrollbar">
            {ACHIEVEMENTS.map(a => (
              <div key={a.label} className={`flex-shrink-0 p-2 rounded-lg opacity-30 ${score >= a.threshold ? 'opacity-100 bg-indigo-900/40' : ''}`}>
                {a.icon}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-800/50">
            <h2 className="text-xs font-black text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
              <Target className="text-indigo-500" size={14} />
              Level Progress
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {theme.words.map(word => (
                <div 
                  key={word}
                  className={`px-4 py-2.5 rounded-xl text-[11px] font-black transition-all duration-700 flex justify-between items-center ${
                    foundWords.includes(word) 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 opacity-50' 
                      : 'bg-black/40 text-slate-400 border border-slate-800/50'
                  }`}
                >
                  <span className={foundWords.includes(word) ? 'line-through' : ''}>{word}</span>
                  {foundWords.includes(word) && <CheckCircle2 size={12} className="text-indigo-400" />}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={async () => {
              const remaining = theme.words.filter(w => !foundWords.includes(w));
              if (remaining.length === 0) return;
              setIsGeneratingHint(true);
              try {
                const target = remaining[Math.floor(Math.random() * remaining.length)];
                const res = await fetchGemini(`Pista corta para "${target}". JSON: {"hint":"..."}`);
                setAiHint(res.hint);
                setTimeout(() => setAiHint(''), 8000);
              } finally { setIsGeneratingHint(false); }
            }}
            className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-900/40 text-xs tracking-widest uppercase"
          >
            {isGeneratingHint ? <Loader2 className="animate-spin" /> : <Lightbulb size={18} />}
            Get a Hint
          </button>

          {aiHint && (
            <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-2xl animate-in fade-in">
              <p className="text-indigo-200 text-xs italic text-center font-medium">"{aiHint}"</p>
            </div>
          )}
        </div>

        {/* Tablero */}
        <div className="lg:col-span-9 flex flex-col items-center relative">
          
          {successMessage && (
            <div className="absolute -top-12 z-50 px-8 py-3 bg-white text-indigo-950 font-black rounded-full shadow-[0_0_30px_white] animate-bounce text-sm">
              {successMessage}
            </div>
          )}

          <div className="bg-slate-900 p-5 rounded-[3rem] shadow-2xl border-8 border-slate-800/30">
            <div 
              className="grid gap-1.5 bg-black/50 p-3 rounded-[2rem]"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                touchAction: 'none'
              }}
            >
              {grid.map((row, r) => 
                row.map((letter, c) => {
                  const selected = isCellSelected(r, c);
                  const found = isCellFound(r, c);
                  return (
                    <div
                      key={`${r}-${c}`}
                      onMouseDown={() => handleMouseDown(r, c)}
                      onMouseEnter={() => handleMouseEnter(r, c)}
                      className={`
                        w-8 h-8 md:w-12 md:h-12 flex items-center justify-center 
                        text-xl font-black rounded-xl cursor-crosshair transition-all duration-100
                        ${selected 
                          ? 'bg-white text-black scale-125 z-20 shadow-[0_0_25px_white] rotate-6' 
                          : found 
                            ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'
                            : 'bg-slate-900 text-slate-600 hover:text-slate-400 border border-slate-800/50'}
                      `}
                    >
                      {letter}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-12">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-600 font-black uppercase mb-2">Next Achievement</span>
              <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                {(() => {
                  const next = ACHIEVEMENTS.find(a => a.threshold > score) || ACHIEVEMENTS[ACHIEVEMENTS.length-1];
                  const prev = ACHIEVEMENTS.findLast(a => a.threshold <= score)?.threshold || 0;
                  const progress = ((score - prev) / (next.threshold - prev)) * 100;
                  return <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />;
                })()}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Pantalla de Victoria del Nivel */}
      {foundWords.length > 0 && foundWords.length === theme.words.length && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-700">
          <div className="max-w-md w-full text-center">
            <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-8 shadow-[0_0_50px_rgba(79,70,229,0.6)] animate-bounce">
              <Sparkles size={64} />
            </div>
            <h2 className="text-5xl font-black text-white mb-2 italic tracking-tighter uppercase">Level Complete!</h2>
            <p className="text-slate-400 mb-10 font-medium">You mastered {theme.name}. Ready for more?</p>
            <div className="space-y-4">
              <button 
                onClick={getNextLevel}
                className="w-full py-6 bg-white text-black font-black rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all text-xl uppercase tracking-tighter flex items-center justify-center gap-4"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Zap className="fill-black" />}
                NEXT AI LEVEL
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        body { background-color: #020617; }
      `}</style>
    </div>
  );
};

export default App;
