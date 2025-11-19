import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Wand2, Save, RefreshCw, FileDown, 
  Loader2, Edit3, Book, Sparkles, MoreHorizontal, Image as ImageIcon,
  CheckCircle2, AlertCircle, Palette, Paintbrush, Gamepad2, Type
} from 'lucide-react';  // <-- Add this closing brace and from statement
import { useProjectStore } from '../store';
import { generateOutline, generateChapterContent, rewriteTextSelection,
import { BookProject, Chapter, ProjectType } from '../types';

export const BookGenesis: React.FC = () => {
  const { currentProject, setProject, activeStyle, globalEntities, updateChapter } = useProjectStore();
  
  // Navigation State
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
  console.log('All env vars:', import.meta.env);
  console.log('Gemini key exists?', !!import.meta.env.VITE_GEMINI_API_KEY);
}, []);

  // Step 1: Form State
  const [projectType, setProjectType] = useState<ProjectType>('standard');
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('Non-Fiction'); // Acts as 'Theme' for Coloring Book
  const [audience, setAudience] = useState('General Public');
  const [length, setLength] = useState('Medium (10 chapters)');
  const [goals, setGoals] = useState('Educate and Inspire');

  // Step 3: Editor State
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [draftMode, setDraftMode] = useState<'balanced' | 'speed' | 'premium'>('balanced');
  const [showInlineTools, setShowInlineTools] = useState(false);
  const [selection, setSelection] = useState<{text: string, range: Range} | null>(null);
  const [rewriteCommand, setRewriteCommand] = useState('');
  const [activeToolTab, setActiveToolTab] = useState<'context' | 'art' | 'consistency'>('context');
  
  const contentRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const handleGenerateOutline = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const outline = await generateOutline(topic, genre, audience, length, goals, activeStyle, globalEntities, projectType);
      
      const newProject: BookProject = {
        id: crypto.randomUUID(),
        type: projectType,
        title: outline.title,
        topic,
        audience,
        genre,
        goals,
        progress: 0,
        synopsis: outline.synopsis,
        entities: globalEntities,
        styleProfileId: activeStyle.id,
        chapters: outline.chapters.map((c: any) => ({
          id: crypto.randomUUID(),
          number: c.number,
          title: c.title,
          summary: c.summary,
          key_points: c.key_points,
          status: 'draft'
        }))
      };
      
      setProject(newProject);
      setStep(2);
    } catch (e) {
      console.error(e);
      alert("Failed to generate outline. Check API connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateChapter = async (chapterId: string) => {
    if (!currentProject) return;
    const chapter = currentProject.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    setIsLoading(true);
    updateChapter(chapterId, { status: 'generating' });

    try {
      // 1. Generate Text Content
      const result = await generateChapterContent(
        chapter,
        { title: currentProject.title, synopsis: currentProject.synopsis },
        currentProject.entities,
        activeStyle,
        draftMode,
        currentProject.type
      );

      updateChapter(chapterId, {
        content: result.content_markdown,
        status: 'generated',
        recap_for_next: result.recap_for_next_chapter,
        entities_introduced: result.entities_introduced
      });

      // 2. Auto-generate Image Prompt for visual books
      if (currentProject.type !== 'standard') {
        const imgResult = await generateImageSuggestion(chapter.summary, [activeStyle.tone, ...activeStyle.avoid], currentProject.type);
        updateChapter(chapterId, {
          image_suggestion: {
            prompt: imgResult.image_prompt,
            negative_prompt: imgResult.negative_prompts,
            aspect_ratio: imgResult.suggested_aspect_ratio,
            sdxl_seed: imgResult.sdxl?.seed
          }
        });
      }

    } catch (e) {
      updateChapter(chapterId, { status: 'draft' });
      alert("Failed to generate content.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImagePrompt = async (chapterId: string) => {
     if (!currentProject) return;
     const chapter = currentProject.chapters.find(c => c.id === chapterId);
     if (!chapter) return;

     setIsLoading(true);
     try {
       const result = await generateImageSuggestion(chapter.summary, [activeStyle.tone, ...activeStyle.avoid], currentProject.type);
       updateChapter(chapterId, {
         image_suggestion: {
           prompt: result.image_prompt,
           negative_prompt: result.negative_prompts,
           aspect_ratio: result.suggested_aspect_ratio,
           sdxl_seed: result.sdxl?.seed
         }
       });
     } catch(e) {
       console.error(e);
     } finally {
       setIsLoading(false);
     }
  };

  const handleRenderActualImage = async (chapterId: string) => {
    if (!currentProject) return;
    const chapter = currentProject.chapters.find(c => c.id === chapterId);
    if (!chapter || !chapter.image_suggestion) return;
    
    setIsLoading(true);
    try {
      const url = await generateActualImage(chapter.image_suggestion.prompt, chapter.image_suggestion.aspect_ratio);
      updateChapter(chapterId, {
        image_suggestion: {
          ...chapter.image_suggestion,
          generated_image_url: url
        }
      });
    } catch (e) {
      console.error(e);
      alert("Image generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0 && contentRef.current?.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      setSelection({ text: sel.toString(), range });
      setShowInlineTools(true);
    } else {
      setShowInlineTools(false);
      setSelection(null);
    }
  };

  const handleRewrite = async () => {
    if (!selection || !currentProject) return;
    setIsLoading(true);
    try {
      const result = await rewriteTextSelection(
        selection.text,
        rewriteCommand || "Improve flow and tone",
        activeStyle,
        currentProject.entities
      );
      
      const activeChapter = currentProject.chapters.find(c => c.id === activeChapterId);
      if (activeChapter && activeChapter.content) {
         const newContent = activeChapter.content.replace(selection.text, result.rewritten_text);
         updateChapter(activeChapter.id, { content: newContent });
         window.getSelection()?.removeAllRanges();
         setShowInlineTools(false);
         setRewriteCommand('');
      }
    } catch (e) {
      alert("Rewrite failed");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Views ---

  // Step 1: Genesis Form
  if (step === 1) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in py-8">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Genesis Engine</h2>
          <p className="text-slate-400 text-lg">Define the DNA of your next masterpiece.</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl shadow-black/50">
          <div className="space-y-8">

            {/* Project Type Selector */}
            <div>
              <label className="block text-sm font-medium text-brand-400 mb-3 uppercase tracking-wider">Project Type</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'standard', label: 'Standard eBook', icon: Book },
                  { id: 'kids', label: 'Kids Picture Book', icon: Gamepad2 },
                  { id: 'coloring', label: 'Coloring Book', icon: Paintbrush },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setProjectType(type.id as ProjectType)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                      projectType === type.id 
                        ? 'bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-500/20' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    <type.icon size={24} className={projectType === type.id ? 'text-brand-400' : ''} />
                    <span className="font-medium text-sm">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Topic & Intent</label>
              <textarea 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none h-24 text-lg placeholder-slate-600"
                placeholder={projectType === 'coloring' ? "e.g. Wild animals in a steampunk style..." : "e.g. A cyberpunk detective novel..."}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{projectType === 'coloring' ? 'Theme' : 'Genre'}</label>
                  <select 
                    value={genre} onChange={e => setGenre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-brand-500 transition-colors"
                  >
                    {projectType === 'coloring' ? (
                      <>
                        <option>Wild Animals</option>
                        <option>Mandalas</option>
                        <option>Urban Landscapes</option>
                        <option>Fantasy Characters</option>
                        <option>Floral Patterns</option>
                      </>
                    ) : projectType === 'kids' ? (
                      <>
                        <option>Adventure</option>
                        <option>Bedtime Story</option>
                        <option>Educational</option>
                        <option>Fairytale</option>
                      </>
                    ) : (
                      <>
                        <option>Non-Fiction</option>
                        <option>Sci-Fi</option>
                        <option>Fantasy</option>
                        <option>Mystery</option>
                        <option>Thriller</option>
                        <option>Romance</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Target Audience</label>
                  <input 
                    type="text"
                    value={audience} onChange={e => setAudience(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-brand-500"
                    placeholder="e.g. Young Adult, CEOs"
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Core Goal</label>
                  <input 
                    type="text"
                    value={goals} onChange={e => setGoals(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-brand-500"
                    placeholder="e.g. Entertain, Teach"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Length</label>
                  <select 
                    value={length} onChange={e => setLength(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white outline-none focus:border-brand-500"
                  >
                    {projectType === 'standard' ? (
                      <>
                        <option>Short Story (5 chapters)</option>
                        <option>Novella (10 chapters)</option>
                        <option>Novel (20+ chapters)</option>
                      </>
                    ) : projectType === 'kids' ? (
                      <>
                        <option>Short (10 pages)</option>
                        <option>Standard (20 pages)</option>
                        <option>Max (25 pages)</option>
                      </>
                    ) : (
                      <>
                         <option>Standard (10 pages)</option>
                         <option>Max (20 pages)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-2 text-slate-500 text-sm">
                 <Palette size={16} />
                 Using Style: <span className="text-brand-400 font-medium">{activeStyle.name}</span>
               </div>
              <button 
                onClick={handleGenerateOutline}
                disabled={isLoading || !topic}
                className="bg-brand-600 hover:bg-brand-500 text-white text-lg font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-900/40 hover:shadow-brand-500/20 hover:-translate-y-0.5"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {isLoading ? 'Architecting...' : 'Generate Outline'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Outline Review (Shared logic, mostly text)
  if (step === 2 && currentProject) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
        <div className="flex justify-between items-end mb-6 bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold text-white">{currentProject.title}</h2>
              <span className="text-xs border border-slate-700 bg-slate-800 text-slate-400 px-2 py-1 rounded">{currentProject.genre}</span>
              {currentProject.type !== 'standard' && <span className="text-xs bg-brand-900 text-brand-300 px-2 py-1 rounded">{currentProject.type.toUpperCase()}</span>}
            </div>
            <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">{currentProject.synopsis}</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium">
               <RefreshCw size={16} /> Adjust Inputs
             </button>
             <button 
               onClick={() => {
                 setStep(3);
                 setActiveChapterId(currentProject.chapters[0].id);
                 // Automatically open Art tab for visual books
                 if(currentProject.type !== 'standard') setActiveToolTab('art');
               }}
               className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-brand-900/20 hover:-translate-y-0.5 transition-all"
             >
               Lock Outline & Start <ChevronRight size={18} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12 pr-2">
          {currentProject.chapters.map((chapter, idx) => (
            <div key={chapter.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative group hover:border-brand-500/30 transition-all hover:bg-slate-800/50">
              <div className="flex justify-between items-start mb-3">
                 <span className="bg-slate-950 text-slate-500 text-xs font-mono px-2 py-1 rounded border border-slate-800">
                   {currentProject.type === 'standard' ? `CH ${chapter.number}` : `PAGE ${chapter.number}`}
                 </span>
                 <button className="text-slate-600 hover:text-brand-400"><MoreHorizontal size={16} /></button>
              </div>
              <h3 className="font-bold text-white mb-2 text-lg leading-tight">{chapter.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">{chapter.summary}</p>
              <div className="space-y-1">
                {chapter.key_points.slice(0, 2).map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
                    <div className="w-1 h-1 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    <span className="line-clamp-1">{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: Interactive Workspace
  if (step === 3 && currentProject) {
    const activeChapter = currentProject.chapters.find(c => c.id === activeChapterId) || currentProject.chapters[0];
    const isVisualBook = currentProject.type !== 'standard';

    return (
      <div className="h-[calc(100vh-6rem)] flex gap-0 border border-slate-800 bg-slate-950 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
        
        {/* 1. Sidebar: Navigation */}
        <div className="w-64 flex flex-col border-r border-slate-800 bg-slate-900">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Book size={14} className="text-brand-400" /> {isVisualBook ? "Pages" : "Table of Contents"}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {currentProject.chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setActiveChapterId(chapter.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-all ${
                  activeChapterId === chapter.id 
                    ? 'bg-brand-500/10 text-brand-200 border border-brand-500/20 shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                 <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                   chapter.status === 'generated' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                   chapter.status === 'generating' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-700'
                 }`} />
                 <div className="truncate flex-1">
                   <span className="font-mono text-[10px] opacity-50 mr-2">{isVisualBook ? 'PG' : 'CH'} {chapter.number}</span>
                   <span className="font-medium">{chapter.title}</span>
                 </div>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
             <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
               <span>Progress</span>
               <span>{currentProject.chapters.filter(c => c.status === 'generated').length}/{currentProject.chapters.length}</span>
             </div>
             <div className="w-full bg-slate-800 h-1 rounded-full mb-4 overflow-hidden">
               <div className="bg-brand-500 h-full transition-all duration-500" style={{ width: `${(currentProject.chapters.filter(c => c.status === 'generated').length / currentProject.chapters.length) * 100}%` }}></div>
             </div>
             <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2 border border-slate-700">
               <FileDown size={14} /> Export Package
             </button>
          </div>
        </div>

        {/* 2. Center: Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
          {/* Toolbar */}
          <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur z-10">
             <div className="flex items-center gap-4 overflow-hidden">
               <h3 className="font-bold text-white truncate">{activeChapter.title}</h3>
               {activeChapter.status === 'generating' && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                    <Loader2 size={10} className="animate-spin" /> Generating
                  </span>
               )}
             </div>
             <div className="flex items-center gap-2">
               <div className="flex bg-slate-800 rounded-lg p-0.5 mr-4">
                 {['speed', 'balanced', 'premium'].map((m) => (
                   <button
                    key={m}
                    onClick={() => setDraftMode(m as any)}
                    className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                      draftMode === m ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                   >
                     {m}
                   </button>
                 ))}
               </div>
               <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors" title="Save">
                 <Save size={18} />
               </button>
             </div>
          </div>

          {/* Editor Surface */}
          <div 
            className="flex-1 overflow-y-auto p-8 md:p-16 bg-[#0f172a] relative"
            onMouseUp={handleTextSelection}
          >
            {/* Visual Book Layout */}
            {isVisualBook && (
              <div className="max-w-3xl mx-auto mb-12">
                <div className="aspect-square bg-slate-900 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                  {activeChapter.image_suggestion?.generated_image_url ? (
                     <img src={activeChapter.image_suggestion.generated_image_url} className="w-full h-full object-contain" alt="Page Art" />
                  ) : (
                     <div className="text-center p-6">
                       <ImageIcon className="mx-auto mb-3 text-slate-600" size={48}/>
                       <p className="text-slate-500 text-sm mb-4">No illustration generated yet.</p>
                       <button 
                        onClick={() => activeChapter.image_suggestion ? handleRenderActualImage(activeChapter.id) : handleGenerateImagePrompt(activeChapter.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                       >
                         {activeChapter.image_suggestion ? "Render Image (Imagen 3)" : "Generate Prompt"}
                       </button>
                     </div>
                  )}
                  {activeChapter.image_suggestion?.generated_image_url && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button onClick={() => handleRenderActualImage(activeChapter.id)} className="bg-white/10 backdrop-blur p-3 rounded-full hover:bg-white/20 text-white"><RefreshCw size={24}/></button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={contentRef} className="max-w-3xl mx-auto min-h-[400px] bg-slate-900 border border-slate-800 rounded-sm shadow-2xl p-12 text-slate-300 leading-relaxed text-lg font-serif selection:bg-brand-500/30 selection:text-brand-100 outline-none" contentEditable suppressContentEditableWarning>
              {activeChapter.status === 'draft' && !isLoading ? (
                 <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-xl">
                   <p className="text-slate-500 mb-6 text-center max-w-xs">Page content empty. Initialize Writer.</p>
                   <button 
                    onClick={() => handleGenerateChapter(activeChapter.id)}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-brand-600/20 hover:-translate-y-1 transition-all"
                   >
                     <Wand2 size={18} /> Generate {isVisualBook ? 'Page' : 'Chapter'}
                   </button>
                 </div>
              ) : (
                 // ReactMarkdown would go here, simulating simpler render for now
                 activeChapter.content?.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-4 font-sans">{line.replace('## ', '')}</h2>;
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i} className="mb-4">{line}</p>;
                 })
              )}
            </div>
            
            {/* Floating Inline Tools */}
            {showInlineTools && selection && (
              <div 
                className="absolute z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-2 flex flex-col gap-2 w-72 animate-in fade-in zoom-in duration-200"
                style={{ 
                  top: Math.min(selection.range.getBoundingClientRect().bottom + 10 + window.scrollY - 100, window.innerHeight - 200), // simplistic positioning
                  left: Math.max(20, selection.range.getBoundingClientRect().left + window.scrollX - 300)
                }}
              >
                <div className="text-xs font-medium text-slate-400 px-1 mb-1">AI Editor</div>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="How should I rewrite this?"
                  value={rewriteCommand}
                  onChange={(e) => setRewriteCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRewrite()}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white outline-none focus:border-brand-500"
                />
                <button 
                  onClick={handleRewrite}
                  disabled={isLoading}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12} />} Rewrite Selection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Sidebar: Tools */}
        <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col">
          <div className="flex border-b border-slate-800">
             {['context', 'art', 'consistency'].map((tab) => (
               <button 
                key={tab}
                onClick={() => setActiveToolTab(tab as any)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeToolTab === tab ? 'text-brand-400 border-b-2 border-brand-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
               >
                 {tab}
               </button>
             ))}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {activeToolTab === 'context' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Chapter Summary</h4>
                  <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded border border-slate-800">{activeChapter.summary}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Active Style</h4>
                  <div className="text-sm text-slate-300 bg-slate-950 p-3 rounded border border-slate-800">
                    <div className="font-bold text-brand-400 mb-1">{activeStyle.name}</div>
                    <div className="text-xs opacity-70 mb-2">{activeStyle.tone}</div>
                    <div className="flex flex-wrap gap-1">
                      {activeStyle.avoid.map(tag => <span key={tag} className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">No {tag}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeToolTab === 'art' && (
               <div className="space-y-4">
                 <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                   <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-brand-400">
                     <ImageIcon size={24} />
                   </div>
                   <h4 className="text-sm font-bold text-white mb-1">Page Illustration</h4>
                   <p className="text-xs text-slate-500 mb-4">Generate a prompt optimized for {isVisualBook ? (currentProject.type === 'kids' ? 'Pixar style' : 'Line Art') : 'Standard Art'}.</p>
                   <button 
                    onClick={() => handleGenerateImagePrompt(activeChapter.id)}
                    disabled={isLoading}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded border border-slate-700 transition-colors"
                   >
                     Generate Prompt
                   </button>
                 </div>

                 {activeChapter.image_suggestion && (
                   <div className="animate-fade-in">
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">Prompt</span>
                          <p className="text-xs text-slate-300 mt-1 select-all">{activeChapter.image_suggestion.prompt}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRenderActualImage(activeChapter.id)}
                        className="w-full mt-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2 rounded flex items-center justify-center gap-1"
                      >
                        <Wand2 size={12} /> Render Image
                      </button>
                   </div>
                 )}
               </div>
            )}

            {activeToolTab === 'consistency' && (
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                   <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <AlertCircle size={14} className="text-blue-500"/> Continuity Memory
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {activeChapter.recap_for_next || "No continuity data generated yet."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
