import React from 'react';
import { Sliders } from 'lucide-react';
import { useProjectStore } from '../store';

export const StyleEngine: React.FC = () => {
  const { activeStyle, updateActiveStyle } = useProjectStore();

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Sliders className="text-brand-400" /> Style Engine
        </h2>
        <p className="text-slate-400 mt-2">Define the voice and tone HydraSkript uses when writing.</p>
      </div>

      <div className="space-y-6">
        {/* Active Profile Card */}
        <div className="bg-slate-900 border border-brand-500/30 rounded-xl p-8 shadow-lg shadow-brand-900/10">
           <div className="flex justify-between items-start mb-6">
             <div>
               <h3 className="text-lg font-bold text-white">{activeStyle.name}</h3>
               <p className="text-sm text-slate-400">The active voice for all generation tasks.</p>
             </div>
             <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-bold px-2 py-1 rounded">ACTIVE</span>
           </div>

           <div className="space-y-6">
             <div>
               <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                 <span>Voice Strength (Strictness)</span>
                 <span>{activeStyle.voiceStrength}%</span>
               </label>
               <input 
                 type="range" 
                 min="0" 
                 max="100" 
                 value={activeStyle.voiceStrength}
                 onChange={(e) => updateActiveStyle({ voiceStrength: parseInt(e.target.value) })}
                 className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
               />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Tone Instructions</label>
                 <textarea 
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm h-32 resize-none outline-none focus:border-brand-500"
                   value={activeStyle.tone}
                   onChange={(e) => updateActiveStyle({ tone: e.target.value })}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Negative Constraints (Avoid)</label>
                 <textarea 
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm h-32 resize-none outline-none focus:border-red-500/50"
                   value={activeStyle.avoid.join(", ")}
                   onChange={(e) => updateActiveStyle({ avoid: e.target.value.split(",").map(s => s.trim()) })}
                 />
               </div>
             </div>
           </div>
           
           <div className="mt-8 flex justify-end">
             <button className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
               Save Profile Override
             </button>
           </div>
        </div>

        {/* Examples */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 opacity-50 hover:opacity-100 transition-opacity">
           <div className="flex justify-between items-center">
             <h3 className="font-bold text-white">Noir Thriller</h3>
             <button className="text-sm text-brand-400 hover:underline">Load Profile</button>
           </div>
           <p className="text-sm text-slate-400 mt-1">Short sentences. Cynical tone. High sensory detail regarding darkness and rain.</p>
        </div>
      </div>
    </div>
  );
};
