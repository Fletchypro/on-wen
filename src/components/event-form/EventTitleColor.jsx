import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

const EventTitleColor = ({ formData, handleFieldChange, isReadOnly }) => {
  const inputRef = useRef(null);

  if (!formData) {
    return null;
  }

  const handleColorBoxClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="text-white font-medium flex items-center space-x-2">
        <Palette size={16} />
        <span>Title Color</span>
      </label>
      <div className="relative flex items-center gap-4">
        <motion.div
          onClick={handleColorBoxClick}
          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/20"
          style={{ backgroundColor: formData.title_color }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        ></motion.div>
        <span className="font-mono text-lg text-white/80 tracking-wider">{formData.title_color}</span>
        <input
          ref={inputRef}
          type="color"
          value={formData.title_color || '#FFFFFF'}
          onChange={(e) => handleFieldChange('title_color', e.target.value)}
          disabled={isReadOnly}
          className="absolute top-0 left-0 w-12 h-12 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default EventTitleColor;