import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus, MoreVertical } from 'lucide-react';

const projects = [
  { id: 1, title: "The Last Algorithm", genre: "Sci-Fi", words: 45000, updated: "2h ago", status: "In Progress" },
  { id: 2, title: "Modern Marketing 101", genre: "Non-Fiction", words: 12000, updated: "1d ago", status: "Drafting" },
  { id: 3, title: "Echoes of Eternity", genre: "Fantasy", words: 5000, updated: "3d ago", status: "Outlining" },
  { id: 4, title: "React Mastery", genre: "Tech", words: 22000, updated: "1w ago", status: "Editing" },
];

export const ProjectList: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">My Projects</h2>
        <Link 
          to="/projects/new" 
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-brand-500/30 transition-colors group relative">
            <div className="absolute top-6 right-6">
              <button className="text-slate-500 hover:text-white transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
            
            <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-4 text-brand-400 group-hover:bg-brand-900/20 group-hover:text-brand-300 transition-colors">
              <BookOpen size={24} />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">{project.genre}</span>
              <span>•</span>
              <span>{project.updated}</span>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800">
               <div className="text-sm text-slate-400">
                 <span className="text-white font-mono font-medium">{project.words.toLocaleString()}</span> words
               </div>
               <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                 project.status === 'In Progress' ? 'bg-green-500/10 text-green-400' : 
                 project.status === 'Editing' ? 'bg-purple-500/10 text-purple-400' : 
                 'bg-blue-500/10 text-blue-400'
               }`}>
                 {project.status}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};