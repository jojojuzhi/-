import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { TreeState } from './types';
import { GoogleGenAI } from "@google/genai";

// Although the prompt asks for standard Google GenAI setup, this specific
// 3D visualization does not strictly *require* AI generation to function.
// However, I will include the initialization structure as requested by the "Role"
// to show where AI control logic would sit (e.g., using AI to change tree colors).
const API_KEY = process.env.API_KEY; 
// const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const toggleState = () => {
    setTreeState(prev => prev === TreeState.SCATTERED ? TreeState.TREE_SHAPE : TreeState.SCATTERED);
  };

  const isScattered = treeState === TreeState.SCATTERED;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* 3D Scene Container */}
      <div className="absolute inset-0 z-0">
        <Canvas 
          gl={{ antialias: false, toneMapping: 3 }} // toneMapping: ACESFilmic
          dpr={[1, 2]} // Handle high DPI screens
        >
          <Experience treeState={treeState} />
        </Canvas>
      </div>

      {/* Cinematic Vignette Overlay (Static CSS gradient for extra depth) */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      {/* UI Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl md:text-6xl text-[#D4AF37] font-serif tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(212,175,55,0.5)]" style={{ fontFamily: 'Cinzel, serif' }}>
              Arix
            </h1>
            <p className="text-[#0fa37f] text-sm md:text-base tracking-[0.3em] mt-2 font-light uppercase">
              Signature Collection
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[#D4AF37] text-xs tracking-widest opacity-70">INTERACTIVE 3D EXPERIENCE</p>
            <p className="text-white text-xs tracking-widest opacity-50 mt-1">DEC 2024 EDITION</p>
          </div>
        </header>

        {/* Controls (Interactive) */}
        <footer className="pointer-events-auto flex flex-col items-center justify-center gap-6">
          
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleState}
              className={`
                group relative px-8 py-3 bg-transparent border border-[#D4AF37] 
                text-[#D4AF37] font-serif tracking-widest uppercase text-sm transition-all duration-700
                hover:bg-[#D4AF37] hover:text-black hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]
                ${isScattered ? 'opacity-80' : 'opacity-100'}
              `}
            >
              <span className="relative z-10 transition-transform duration-500 group-hover:scale-105">
                {isScattered ? 'Assemble Tree' : 'Scatter Elements'}
              </span>
            </button>
            
            <p className="text-white/40 text-[10px] tracking-[0.2em] mt-4">
              {isScattered ? 'CHAOS MODE' : 'HARMONY MODE'}
            </p>
          </div>

          <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
          
        </footer>
      </div>

      {/* Decorative Border */}
      <div className="absolute inset-0 z-30 pointer-events-none border-[1px] border-[#D4AF37]/20 m-4 md:m-8" />
      
    </div>
  );
};

export default App;
