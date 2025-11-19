import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Clock, FileText, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const data = [
  { name: 'Mon', words: 4000 },
  { name: 'Tue', words: 3000 },
  { name: 'Wed', words: 2000 },
  { name: 'Thu', words: 2780 },
  { name: 'Fri', words: 1890 },
  { name: 'Sat', words: 2390 },
  { name: 'Sun', words: 3490 },
];

const MetricCard = ({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend?: string }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-800 rounded-lg text-brand-400">
        <Icon size={20} />
      </div>
      {trend && <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{trend}</span>}
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white">Welcome back, Author.</h2>
          <p className="text-slate-400 mt-2">Your creative engine is idle. Ready to start?</p>
        </div>
        <Link to="/projects/new" className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-brand-600/20">
          <Zap size={18} />
          <span>New Project</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Words Written" value="124,592" icon={FileText} trend="+12%" />
        <MetricCard title="Active Projects" value="3" icon={Clock} />
        <MetricCard title="Avg. Daily Words" value="3,240" icon={TrendingUp} trend="+5%" />
        <MetricCard title="Credits Remaining" value="850" icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Writing Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} 
                  itemStyle={{ color: '#2dd4bf' }}
                />
                <Bar dataKey="words" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
            <Link to="/projects" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { title: "The Last Algorithm", genre: "Sci-Fi", progress: 75 },
              { title: "Modern Marketing 101", genre: "Non-Fiction", progress: 30 },
              { title: "Echoes of Eternity", genre: "Fantasy", progress: 12 },
            ].map((project, i) => (
              <div key={i} className="group p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer border border-transparent hover:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white group-hover:text-brand-300 transition-colors">{project.title}</h4>
                  <span className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">{project.genre}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{project.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};