import React from 'react';
import { motion } from 'framer-motion';
import { Maximize, Minimize, StretchHorizontal, X } from 'lucide-react';

const sizeLevels = [
  { value: 0, label: 'Micro', color: 'from-gray-500 to-slate-600', icon: X },
  { value: 1, label: 'Small', color: 'from-blue-500 to-indigo-600', icon: Minimize },
  { value: 2, label: 'Medium', color: 'from-orange-500 to-yellow-600', icon: StretchHorizontal },
  { value: 3, label: 'Large', color: 'from-red-500 to-pink-600', icon: Maximize },
];

const EventSize = ({ formData, handleFieldChange, isReadOnly }) => {
  if (!formData) {
    return null;
  }
  return (
    <div className="space-y-2">
      <label className="text-white font-medium">Adjust Cover Image Size</label>
      <div className="flex flex-wrap gap-2">
        {sizeLevels.map(level => (
          <motion.button
            key={level.value}
            type="button"
            name="priority"
            onClick={() => handleFieldChange('priority', level.value)}
            className={`flex-1 p-3 rounded-xl text-white font-medium transition-all flex flex-col items-center space-y-1 disabled:opacity-70 disabled:cursor-not-allowed ${
              formData.priority === level.value ? `bg-gradient-to-r ${level.color} shadow-lg` : 'bg-white/10 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isReadOnly}
          >
            <level.icon size={16} />
            <span>{level.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default EventSize;