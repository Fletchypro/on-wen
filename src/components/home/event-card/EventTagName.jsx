import React from 'react';
import { getTagColor } from '@/lib/utils';

const EventTagName = ({ name }) => {
  if (!name) return null;
  const colorClass = getTagColor(name);
  return (
    <div className={`px-2 py-0.5 text-xs font-semibold text-white rounded-full ${colorClass} backdrop-blur-sm`}>
      {name}
    </div>
  )
};

export default EventTagName;