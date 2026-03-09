import React from 'react';
    import { motion } from 'framer-motion';

    const tabs = [
      { id: 'city', label: 'Near You' },
      { id: 'friends', label: 'From Friends' },
      { id: 'subscribed', label: 'Subscribed' },
    ];

    const DiscoverHeader = ({ activeTab, onTabChange }) => {
      return (
        <div className="flex justify-center p-2 mb-4">
          <div className="flex space-x-2 bg-black/20 p-1.5 rounded-full backdrop-blur-lg">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onMouseDown={() => onTabChange(tab.id)}
                className={`${
                  activeTab === tab.id ? '' : 'hover:bg-white/10'
                } relative rounded-full px-4 py-1.5 text-sm font-medium text-white transition focus-visible:outline-2`}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="discover-bubble"
                    className="absolute inset-0 z-10 bg-white/10"
                    style={{ borderRadius: 9999 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-20">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
    };

    export default DiscoverHeader;