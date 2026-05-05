import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const ModalOverlay = ({ onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="absolute inset-0 bg-[#0b1326]/80 backdrop-blur-sm" 
      onClick={onClose} 
    />
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      exit={{ scale: 0.95, opacity: 0 }} 
      className="relative w-full max-w-md glass-card border-slate-700 p-8"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
        <X className="w-5 h-5" />
      </button>
      {children}
    </motion.div>
  </div>
);

export default ModalOverlay;
