import React, { useState } from 'react';
import { Plus, Search, User, MapPin, Book } from 'lucide-react';
import { useProjectStore } from '../store';

const categories = [
  { id: 'all', label: 'All Entries' },
  { id: 'Character', label: 'Characters', icon: User },
  { id: 'Location', label: 'Locations', icon: MapPin },
  { id: 'Lore', label: 'Lore & Rules', icon: Book },
];

export const StoryBible: React.FC = () => {
  const { globalEntities, addGlobalEntity } = useProjectStore();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = globalEntities.filter(e => {
    const matchesTab = activeTab === 'all' || e.type === activeTab;
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 animate-fade-in">
      {/* Sidebar */}
      <div className="w-64 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
           <h2 className="font-bold text-white mb-1">Story Bible</h2>
           <p className="text-xs text-slate-500">Context manager for AI consistency.</p>
        </div>
        <div className="p-2 space-y-1">
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === cat.id ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat.icon && <cat.icon size={16} />}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search entities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-brand-500 w-64 transition-colors"
            />
          </div>
          <button 
            onClick={() => addGlobalEntity({ id: crypto.randomUUID(), type: 'Character', name: 'New Entity', description: 'Description pending...' })}
            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> Add Entity
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {filteredEntries.map(entry => (
               <div key={entry.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-colors cursor-pointer group">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-white text-lg group-hover:text-brand-400 transition-colors">{entry.name}</h3>
                   <span className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">{entry.type}</span>
                 </div>
                 <p className="text-slate-400 text-sm leading-relaxed">{entry.description}</p>
               </div>
             ))}
             {filteredEntries.length === 0 && (
               <div className="col-span-full text-center py-12 text-slate-500">
                 No entities found.
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
