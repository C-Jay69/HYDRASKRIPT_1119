import React, { useState, useRef } from 'react';
import { Upload, Mic2, Play, Pause, Download, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { generateSpeech } from '../services/gemini';

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

export const AudiobookStudio: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5MB Limit
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size exceeds 5MB limit.");
      return;
    }
    setFileError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setText(ev.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    if (!text) return;
    setIsLoading(true);
    setAudioUrl(null);

    try {
      // In a real app, we would chunk this text because TTS APIs have limits.
      // For this demo, we take the first 1000 chars to avoid timeouts/limits.
      const textToSpeak = text.length > 1000 ? text.substring(0, 1000) + "..." : text;
      
      const audioBuffer = await generateSpeech(textToSpeak, selectedVoice);
      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (e) {
      console.error(e);
      alert("Failed to generate audio. Please check API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Audiobook Studio</h2>
        <p className="text-slate-400">Transform your manuscript into a professional narration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
             <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Upload size={18}/> Source Material</h3>
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-800/50 hover:border-brand-500/50 transition-all"
             >
               <input ref={fileInputRef} type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
               <FileText className="mx-auto text-slate-500 mb-2" />
               <p className="text-sm text-slate-300 font-medium">Click to Upload Script</p>
               <p className="text-xs text-slate-500 mt-1">Max 5MB (.txt)</p>
             </div>
             {fileError && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><AlertCircle size={12}/> {fileError}</p>}
           </div>

           <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
             <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Mic2 size={18}/> Voice Actor</h3>
             <div className="space-y-2">
               {VOICES.map(voice => (
                 <button
                   key={voice}
                   onClick={() => setSelectedVoice(voice)}
                   className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                     selectedVoice === voice 
                       ? 'bg-brand-600/10 border-brand-500 text-brand-300' 
                       : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                   }`}
                 >
                   <span className="font-medium">{voice}</span>
                   {selectedVoice === voice && <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />}
                 </button>
               ))}
             </div>
           </div>

           <button 
             onClick={handleGenerate}
             disabled={isLoading || !text}
             className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-900/20 flex items-center justify-center gap-2"
           >
             {isLoading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
             Generate Narration
           </button>
        </div>

        {/* Editor & Output */}
        <div className="lg:col-span-2 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
           <div className="flex-1 p-4">
             <textarea 
               value={text}
               onChange={(e) => setText(e.target.value)}
               placeholder="Or paste your script here..."
               className="w-full h-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 focus:border-brand-500 outline-none resize-none font-mono text-sm leading-relaxed"
             />
           </div>
           
           {/* Player Bar */}
           <div className="h-24 bg-slate-950 border-t border-slate-800 p-4 flex items-center justify-between">
              {audioUrl ? (
                <div className="w-full flex items-center gap-4">
                  <audio ref={audioRef} src={audioUrl} controls className="flex-1 h-10" />
                  <a 
                    href={audioUrl} 
                    download="audiobook_chapter.wav"
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-lg"
                  >
                    <Download size={18} />
                    <span>Download WAV (Max 200MB)</span>
                  </a>
                </div>
              ) : (
                <div className="w-full text-center text-slate-500 text-sm">
                  Select a voice and generate to listen.
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};