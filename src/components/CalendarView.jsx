import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { ChevronLeft, ChevronRight, Grid3X3, List, Calendar as CalendarIcon, MapPin, Clock, Edit, Trash2 } from 'lucide-react';

    const CalendarView = ({ events, updateEvent, deleteEvent }) => {
      const [currentDate, setCurrentDate] = useState(new Date());
      const [viewMode, setViewMode] = useState('month'); // month, week, day
      const [selectedEvent, setSelectedEvent] = useState(null);

      const today = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const navigateMonth = (direction) => {
        setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setMonth(prev.getMonth() + direction);
          return newDate;
        });
      };

      const getEventsForDate = (date) => {
        return events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.toDateString() === date.toDateString();
        });
      };

      const getPriorityColor = (priority) => {
        switch (priority) {
          case 3: return 'bg-red-500';
          case 2: return 'bg-orange-500';
          default: return 'bg-blue-500';
        }
      };

      const handleEventClick = (event) => {
        setSelectedEvent(event);
      };

      const handleDeleteEvent = (eventId) => {
        deleteEvent(eventId);
        setSelectedEvent(null);
        console.log("Event deleted");
      };

      const renderCalendarDays = () => {
        const days = [];
        const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
          const dayNumber = i - firstDayOfMonth + 1;
          const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
          const date = new Date(currentYear, currentMonth, dayNumber);
          const isToday = isCurrentMonth && date.toDateString() === today.toDateString();
          const dayEvents = isCurrentMonth ? getEventsForDate(date) : [];

          days.push(
            <motion.div
              key={i}
              className={`min-h-[80px] p-1 border border-white/10 ${
                isCurrentMonth ? 'bg-white/5' : 'bg-transparent'
              } ${isToday ? 'bg-blue-500/20 border-blue-400' : ''}`}
              whileHover={isCurrentMonth ? { scale: 1.02 } : {}}
            >
              {isCurrentMonth && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-300' : 'text-white/80'
                  }`}>
                    {dayNumber}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <motion.div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`text-xs p-1 rounded cursor-pointer ${getPriorityColor(event.priority)} text-white truncate`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {event.title}
                      </motion.div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-white/60">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        }

        return days;
      };

      const renderWeekView = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + i);
          weekDays.push(date);
        }

        return (
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-white/60 text-sm font-medium mb-2">{day}</div>
                <div className="space-y-2">
                  {getEventsForDate(weekDays[index]).map((event) => (
                    <motion.div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className={`p-2 rounded-lg cursor-pointer ${getPriorityColor(event.priority)} text-white text-sm`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.time && (
                        <div className="text-xs opacity-80">{event.time}</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      };

      const renderDayView = () => {
        const dayEvents = getEventsForDate(currentDate);
        
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
            </div>
            
            <div className="space-y-3">
              {dayEvents.length > 0 ? (
                dayEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-4 h-4 rounded-full ${getPriorityColor(event.priority)} mt-1`} />
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg">{event.title}</h4>
                        {event.time && (
                          <div className="flex items-center space-x-1 text-white/70 text-sm mt-1">
                            <Clock size={14} />
                            <span>{event.time}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center space-x-1 text-white/70 text-sm mt-1">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.notes && (
                          <p className="text-white/60 text-sm mt-2">{event.notes}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon size={48} className="text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No events for this day</p>
                </div>
              )}
            </div>
          </div>
        );
      };

      return (
        <div className="h-full flex flex-col p-4 pb-20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={20} />
              </motion.button>
              
              <h1 className="text-2xl font-bold text-white">
                {monthNames[currentMonth]} {currentYear}
              </h1>
              
              <motion.button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={20} />
              </motion.button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white/10 rounded-lg p-1">
              {[
                { mode: 'month', icon: Grid3X3 },
                { mode: 'week', icon: List },
                { mode: 'day', icon: CalendarIcon }
              ].map(({ mode, icon: Icon }) => (
                <motion.button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === mode 
                      ? 'bg-white text-purple-600' 
                      : 'text-white hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={16} />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Calendar Content */}
          <motion.div
            className="flex-1 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-white/60 font-medium py-2 text-sm">
                    {day}
                  </div>
                ))}
                {/* Calendar Days */}
                {renderCalendarDays()}
              </div>
            )}

            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
          </motion.div>

          {/* Event Detail Modal */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedEvent(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-2xl font-bold text-white">{selectedEvent.title}</h3>
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => {
                            console.log("Edit feature is not implemented yet.");
                          }}
                          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteEvent(selectedEvent.id)}
                          className="p-2 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>

                    {selectedEvent.image && (
                      <img 
                        src={selectedEvent.image} 
                        alt={selectedEvent.title}
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-white/80">
                        <CalendarIcon size={16} />
                        <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                      </div>

                      {selectedEvent.time && (
                        <div className="flex items-center space-x-2 text-white/80">
                          <Clock size={16} />
                          <span>{selectedEvent.time}</span>
                        </div>
                      )}

                      {selectedEvent.location && (
                        <div className="flex items-center space-x-2 text-white/80">
                          <MapPin size={16} />
                          <span>{selectedEvent.location}</span>
                        </div>
                      )}

                      {selectedEvent.notes && (
                        <div className="text-white/70">
                          <p className="font-medium mb-1">Notes:</p>
                          <p>{selectedEvent.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <span className="text-white/60">Priority:</span>
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(selectedEvent.priority)}`} />
                        <span className="text-white/80">
                          {selectedEvent.priority === 3 ? 'Very Important' : 
                           selectedEvent.priority === 2 ? 'Important' : 'Standard'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    };

    export default CalendarView;