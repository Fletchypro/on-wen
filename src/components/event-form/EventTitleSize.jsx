import React from 'react';
import { motion } from 'framer-motion';
import { Type } from 'lucide-react';

const titleSizeLevels = [
  { value: 14, label: 'Small' },
  { value: 16, label: 'Medium' },
  { value: 20, label: 'Large' },
  { value: 24, label: 'X-Large' },
];

const EventTitleSize = ({ formData, handleFieldChange, isReadOnly }) => {
  if (!formData) {
    return null;
  }
  return (
    <div className="space-y-2">
      <label className="text-white font-medium flex items-center space-x-2">
        <Type size={16} />
        <span>Adjust Title Size</span>
      </label>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {titleSizeLevels.map(level => (
          <motion.button
            key={level.value}
            type="button"
            name="title_size"
            onClick={() => handleFieldChange('title_size', level.value)}
            className={`p-3 rounded-xl text-white font-medium transition-all flex flex-col items-center space-y-1 disabled:opacity-70 disabled:cursor-not-allowed ${
              formData.title_size === level.value ? 'bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg' : 'bg-white/10 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isReadOnly}
          >
            <span>{level.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default EventTitleSize;