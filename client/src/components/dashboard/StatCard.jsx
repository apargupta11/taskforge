import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ delay }}
    className="glass-card p-6 border-slate-700/50 hover:border-slate-600 transition-colors group"
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
    </div>
  </motion.div>
);

export default StatCard;
