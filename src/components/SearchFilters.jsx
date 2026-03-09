import React, { useState, useMemo } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Search, Filter, Calendar, MapPin, Star, X, Clock } from 'lucide-react';

    const SearchFilters = ({ events }) => {
      const [searchQuery, setSearchQuery] = useState('');
      const [showFilters, setShowFilters] = useState(false);
      const [filters, setFilters] = useState({
        priority: 'all',
        eventType: 'all',
        dateRange: 'all',
        location: ''
      });

      const filteredEvents = useMemo(() => {
        let filtered = events;

        // Search query filter
        if (searchQuery) {
          filtered = filtered.filter(event =>
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.notes?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Priority filter
        if (filters.priority !== 'all') {
          filtered = filtered.filter(event => event.priority === parseInt(filters.priority));
        }

        // Event type filter
        if (filters.eventType !== 'all') {
          filtered = filtered.filter(event => event.eventType === filters.eventType);
        }

        // Date range filter
        if (filters.dateRange !== 'all') {
          const today = new Date();
          
          switch (filters.dateRange) {
            case 'today':
              filtered = filtered.filter(event => {
                const eDate = new Date(event.date);
                return eDate.toDateString() === today.toDateString();
              });
              break;
            case 'week':
              const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
              filtered = filtered.filter(event => {
                const eDate = new Date(event.date);
                return eDate >= today && eDate <= weekFromNow;
              });
              break;
            case 'month':
              const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
              filtered = filtered.filter(event => {
                const eDate = new Date(event.date);
                return eDate >= today && eDate <= monthFromNow;
              });
              break;
            case 'past':
              filtered = filtered.filter(event => {
                const eDate = new Date(event.date);
                return eDate < today;
              });
              break;
            default:
              break;
          }
        }

        // Location filter
        if (filters.location) {
          filtered = filtered.filter(event =>
            event.location?.toLowerCase().includes(filters.location.toLowerCase())
          );
        }

        return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      }, [events, searchQuery, filters]);

      const clearFilters = () => {
        setSearchQuery('');
        setFilters({
          priority: 'all',
          eventType: 'all',
          dateRange: 'all',
          location: ''
        });
        console.log("Filters cleared");
      };

      const getPriorityColor = (priority) => {
        switch (priority) {
          case 3: return 'bg-red-500';
          case 2: return 'bg-orange-500';
          default: return 'bg-blue-500';
        }
      };

      const getPriorityLabel = (priority) => {
        switch (priority) {
          case 3: return 'Very Important';
          case 2: return 'Important';
          default: return 'Standard';
        }
      };

      const getEventTypeColor = (type) => {
        switch (type) {
          case 'work': return 'from-purple-500 to-pink-600';
          case 'birthday': return 'from-yellow-500 to-orange-600';
          case 'social': return 'from-green-500 to-teal-600';
          default: return 'from-blue-500 to-indigo-600';
        }
      };

      return (
        <div className="h-full flex flex-col p-4 pb-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-6"
          >
            <h1 className="text-3xl font-bold text-white">Search & Filter</h1>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, locations, notes..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Filter size={16} />
                <span>Filters</span>
              </motion.button>

              {(searchQuery || Object.values(filters).some(f => f !== 'all' && f !== '')) && (
                <motion.button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X size={16} />
                  <span>Clear</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 mb-6 space-y-4"
              >
                {/* Priority Filter */}
                <div className="space-y-2">
                  <label className="text-white font-medium flex items-center space-x-2">
                    <Star size={16} />
                    <span>Priority</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'all', label: 'All' },
                      { value: '1', label: 'Standard' },
                      { value: '2', label: 'Important' },
                      { value: '3', label: 'Very Important' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => setFilters(prev => ({ ...prev, priority: option.value }))}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          filters.priority === option.value
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Event Type Filter */}
                <div className="space-y-2">
                  <label className="text-white font-medium">Event Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'personal', label: 'Personal' },
                      { value: 'work', label: 'Work' },
                      { value: 'birthday', label: 'Birthday' },
                      { value: 'social', label: 'Social' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => setFilters(prev => ({ ...prev, eventType: option.value }))}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          filters.eventType === option.value
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-white font-medium flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>Date Range</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'today', label: 'Today' },
                      { value: 'week', label: 'This Week' },
                      { value: 'month', label: 'This Month' },
                      { value: 'past', label: 'Past Events' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        onClick={() => setFilters(prev => ({ ...prev, dateRange: option.value }))}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          filters.dateRange === option.value
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-white font-medium flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>Location</span>
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Filter by location..."
                    className="w-full p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Results ({filteredEvents.length})
              </h2>
            </div>

            {filteredEvents.length > 0 ? (
              <div className="space-y-3">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/15 transition-all cursor-pointer border border-white/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-4">
                      {event.image ? (
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${getEventTypeColor(event.eventType)}`} />
                      )}
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="text-white font-semibold text-lg">{event.title}</h3>
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)}`} />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-white/70 text-sm">
                            <Calendar size={14} />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                            {event.time && (
                              <>
                                <Clock size={14} />
                                <span>{event.time}</span>
                              </>
                            )}
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center space-x-2 text-white/70 text-sm">
                              <MapPin size={14} />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 text-white/60 text-sm">
                            <span className="capitalize">{event.eventType}</span>
                            <span>•</span>
                            <span>{getPriorityLabel(event.priority)}</span>
                          </div>
                        </div>
                        
                        {event.notes && (
                          <p className="text-white/60 text-sm line-clamp-2">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                  <Search size={40} className="text-white/60" />
                </div>
                <h3 className="text-xl font-semibold text-white">No events found</h3>
                <p className="text-white/70">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </div>
        </div>
      );
    };

    export default SearchFilters;