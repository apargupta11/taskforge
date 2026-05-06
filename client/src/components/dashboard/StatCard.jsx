import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const colorMap = {
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'hover:border-violet-500/40', activeBorder: 'border-violet-500/50', glow: 'hover:shadow-violet-500/10' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'hover:border-emerald-500/40', activeBorder: 'border-emerald-500/50', glow: 'hover:shadow-emerald-500/10' },
  red:     { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'hover:border-red-500/40',     activeBorder: 'border-red-500/50',     glow: 'hover:shadow-red-500/10'     },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'hover:border-blue-500/40',    activeBorder: 'border-blue-500/50',    glow: 'hover:shadow-blue-500/10'    },
};

const StatCard = ({ icon: Icon, label, value, color = 'violet', delay = 0, onClick, active }) => {
  const c = colorMap[color] ?? colorMap.violet;

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={[
        'glass-card p-6 transition-all duration-200 group select-none cursor-pointer',
        `${c.border} hover:shadow-lg ${c.glow} hover:bg-slate-800/30 hover:-translate-y-0.5`,
        active ? `${c.activeBorder} bg-slate-800/30 -translate-y-0.5` : 'border-slate-700/50',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${c.bg} ${c.text} transition-transform duration-200 group-hover:scale-110 ${active ? 'scale-110' : ''}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">{label}</p>
            <h3 className="text-2xl font-bold text-white mt-0.5">{value}</h3>
          </div>
        </div>
        <ArrowUpRight
          className={`w-4 h-4 ${c.text} transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${active ? 'opacity-100 rotate-90' : 'opacity-0'}`}
        />
      </div>
    </motion.div>
  );
};

export default StatCard;
