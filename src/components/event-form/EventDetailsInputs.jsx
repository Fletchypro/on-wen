import React from 'react';
import { FileText } from 'lucide-react';
import { FormField } from '@/components/event-form/FormField';

const EventDetailsInputs = ({ formData, handleInputChange, isReadOnly }) => {
  if (!formData) return null;

  return (
    <>
      <FormField delay={0.1}>
        <label className="text-white font-medium flex items-center space-x-2">
          <FileText size={16} />
          <span>Event Title</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title || ''}
          onChange={handleInputChange}
          placeholder="Enter event title..."
          className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          required
          disabled={isReadOnly}
        />
      </FormField>
    </>
  );
};

export default EventDetailsInputs;