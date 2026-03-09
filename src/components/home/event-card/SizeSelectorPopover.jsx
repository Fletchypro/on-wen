import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Minimize, StretchHorizontal, Maximize } from 'lucide-react';

const sizeLevels = [
    { value: 0, label: 'Micro', color: 'from-gray-500 to-slate-600', icon: X },
    { value: 1, label: 'S', color: 'from-blue-500 to-indigo-600', icon: Minimize },
    { value: 2, label: 'M', color: 'from-orange-500 to-yellow-600', icon: StretchHorizontal },
    { value: 3, label: 'L', color: 'from-red-500 to-pink-600', icon: Maximize }
];

export const SizeSelectorPopover = ({ event, onClose, onPriorityChange }) => {
    const popoverRef = useRef(null);
  
    useEffect(() => {
        function handleClickOutside(e) {
          if (popoverRef.current && !popoverRef.current.contains(e.target)) {
            onClose();
          }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const handleSelectSize = (newPriority) => {
        onPriorityChange(event, newPriority);
        onClose();
    };
  
    return (
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-64 p-3 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
        style={{ transformOrigin: 'bottom right' }}
      >
        <p className="text-xs font-medium text-white/70 mb-2">Adjust Size</p>
        <div className="grid grid-cols-4 gap-2">
          {sizeLevels.map((level) => (
            <motion.button
              key={level.value}
              type="button"
              onClick={() => handleSelectSize(level.value)}
              className={`p-2 rounded-lg text-white font-medium transition-all flex flex-col items-center space-y-1 ${
                event.priority === level.value
                  ? `bg-gradient-to-r ${level.color} shadow-lg`
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <level.icon size={14} />
              <span className="text-xs">{level.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
};

export default SizeSelectorPopover;