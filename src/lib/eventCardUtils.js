export const getCardSizeClass = (priority) => {
    switch (priority) {
      case 3: return 'h-44 md:h-52'; // Large
      case 2: return 'h-32 md:h-40'; // Medium
      case 1: return 'h-24 md:h-28'; // Small
      case 0: return 'h-12 md:h-14'; // Micro
      default: return 'h-24 md:h-28'; // Default to small
    }
};
  
export const getPriorityColor = (priority) => {
    switch (priority) {
      case 3: return 'from-red-500 to-pink-600';
      case 2: return 'from-orange-500 to-yellow-600';
      case 1: return 'from-blue-500 to-indigo-600';
      default: return 'from-gray-500 to-slate-600';
    }
};