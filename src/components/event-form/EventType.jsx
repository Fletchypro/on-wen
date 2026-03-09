import React from 'react';
import { motion } from 'framer-motion';
import { FormField } from '@/components/event-form/FormField';

const baseEventTypes = [
  { value: 'personal', label: 'Personal', color: 'from-blue-500 to-indigo-600' },
  { value: 'work', label: 'Work', color: 'from-purple-500 to-pink-600' },
  { value: 'trip', label: 'Trip', color: 'from-green-500 to-teal-600' },
  { value: 'event', label: 'Event', color: 'from-cyan-500 to-blue-600' },
];

const trustedEventTypes = [
  ...baseEventTypes,
  { value: 'Movie/Show', label: 'Movie/Show', color: 'from-gray-500 to-gray-700' },
];

const EventType = ({ formData, handleFieldChange, isReadOnly, userRole }) => {
  if (!formData) {
    return null;
  }

  const eventTypes = userRole === 'trusted' || userRole === 'admin' ? trustedEventTypes : baseEventTypes;

  return (
    <FormField delay={0.4}>
      <label className="text-white font-medium">Event Type</label>
      <div className="flex gap-2">
        {eventTypes.map(type => (
          <motion.button
            key={type.value}
            type="button"
            name="event_type"
            onClick={() => handleFieldChange('event_type', type.value)}
            className={`flex-1 p-3 rounded-xl text-white font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm ${
              formData.event_type === type.value ? `bg-gradient-to-r ${type.color} shadow-lg` : 'bg-white/10 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isReadOnly}
          >
            {type.label}
          </motion.button>
        ))}
      </div>
    </FormField>
  );
};

export default EventType;