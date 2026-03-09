import React from 'react';
import { motion } from 'framer-motion';

const FriendTabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-1 bg-foreground/10 p-1 rounded-full">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative flex-1 p-2.5 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 focus:outline-none
            ${activeTab === tab.id ? 'text-white' : 'text-foreground/70 hover:bg-white/10 hover:text-white'}`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <tab.icon size={18} />
            <span className="hidden sm:inline">{tab.label}</span>
          </span>
          {tab.count > 0 && (
            <motion.span 
              className="relative z-10 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              {tab.count}
            </motion.span>
          )}
        </button>
      ))}
    </div>
  );
};

export default FriendTabs;