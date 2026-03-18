import React from 'react';
import { motion } from 'framer-motion';
import { Maximize, Minimize, StretchHorizontal, X } from 'lucide-react';
import { FormField } from '@/components/event-form/FormField';
const eventTypes = [{
  value: 'personal',
  label: 'Personal',
  color: 'from-blue-500 to-indigo-600'
}, {
  value: 'work',
  label: 'Work',
  color: 'from-sky-500 to-cyan-600'
}, {
  value: 'birthday',
  label: 'Birthday',
  color: 'from-yellow-500 to-orange-600'
}, {
  value: 'travel_trip',
  label: 'Travel/Trip',
  color: 'from-green-500 to-teal-600'
}, {
  value: 'holiday',
  label: 'Holiday',
  color: 'from-red-500 to-pink-600'
}, {
  value: 'event',
  label: 'Event',
  color: 'from-cyan-500 to-blue-600'
}];
const sizeLevels = [{
  value: 0,
  label: 'Micro',
  color: 'from-gray-500 to-slate-600',
  icon: X
}, {
  value: 1,
  label: 'Small',
  color: 'from-blue-500 to-indigo-600',
  icon: Minimize
}, {
  value: 2,
  label: 'Medium',
  color: 'from-orange-500 to-yellow-600',
  icon: StretchHorizontal
}, {
  value: 3,
  label: 'Large',
  color: 'from-red-500 to-pink-600',
  icon: Maximize
}];
const EventTypeAndSize = ({
  formData,
  handleFieldChange,
  isReadOnly
}) => {
  if (!formData) {
    return null;
  }
  return <>
      <FormField delay={0.4}>
        <label className="text-white font-medium">Event Tag</label>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {eventTypes.map(type => <motion.button key={type.value} type="button" name="event_type" onClick={() => handleFieldChange('event_type', type.value)} className={`p-3 rounded-xl text-white font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed ${formData.event_type === type.value ? `bg-gradient-to-r ${type.color} shadow-lg` : 'bg-white/10 hover:bg-white/20'}`} whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} disabled={isReadOnly}>
              {type.label}
            </motion.button>)}
        </div>
      </FormField>

      <FormField delay={0.45}>
        <label className="text-white font-medium">Event Size</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {sizeLevels.map(level => <motion.button key={level.value} type="button" name="priority" onClick={() => handleFieldChange('priority', level.value)} className={`p-3 rounded-xl text-white font-medium transition-all flex flex-col items-center space-y-1 disabled:opacity-70 disabled:cursor-not-allowed ${formData.priority === level.value ? `bg-gradient-to-r ${level.color} shadow-lg` : 'bg-white/10 hover:bg-white/20'}`} whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} disabled={isReadOnly}>
              <level.icon size={16} />
              <span>{level.label}</span>
            </motion.button>)}
        </div>
      </FormField>
    </>;
};
export default EventTypeAndSize;