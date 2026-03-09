import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { HelpCircle, ChevronDown, ChevronRight, Star, Calendar, Image, Search, Settings, Plus } from 'lucide-react';

    const HelpPage = () => {
      const [expandedSection, setExpandedSection] = useState(null);

      const helpSections = [
        {
          id: 'getting-started',
          title: 'Getting Started',
          icon: Star,
          items: [
            {
              question: 'How do I create my first event?',
              answer: 'Tap the "Add Event" button from the home screen or navigation menu. Fill in the event details like title, date, time, and location. You can also set a priority level and upload an image to make your event visually appealing.'
            },
            {
              question: 'What makes VisualDays different?',
              answer: 'VisualDays is a visual-first calendar that lets you attach images to events and automatically scales them based on importance. It combines beautiful design with smart features like automatic image lookup and weather integration.'
            },
            {
              question: 'How do priority levels work?',
              answer: 'Priority levels determine the visual size of your events: Standard (small), Important (medium), and Very Important (large). Higher priority events get more visual prominence in your calendar.'
            }
          ]
        },
        {
          id: 'events',
          title: 'Managing Events',
          icon: Calendar,
          items: [
            {
              question: 'How do I edit or delete an event?',
              answer: 'Tap on any event in the calendar view to see its details. From there, you can edit the event information or delete it permanently. Changes are saved automatically.'
            },
            {
              question: 'Can I set reminders for events?',
              answer: 'Yes! You can enable event reminders in the Settings page. VisualDays will notify you before your important events so you never miss anything.'
            },
            {
              question: 'What event types are available?',
              answer: 'You can categorize events as Personal, Work, Birthday, or Social. Each type has its own color scheme to help you quickly identify different kinds of events.'
            }
          ]
        },
        {
          id: 'images',
          title: 'Images & Visuals',
          icon: Image,
          items: [
            {
              question: 'How does automatic image lookup work?',
              answer: 'When you enter a location for your event, VisualDays can automatically find and attach a relevant image. This feature can be enabled or disabled in Settings.'
            },
            {
              question: 'Can I upload my own images?',
              answer: 'Absolutely! When creating or editing an event, you can upload your own photos from your device. This gives you complete control over how your events look.'
            },
            {
              question: 'What image formats are supported?',
              answer: 'VisualDays supports all common image formats including JPEG, PNG, GIF, and WebP. Images are automatically optimized for the best viewing experience.'
            }
          ]
        },
        {
          id: 'calendar-views',
          title: 'Calendar Views',
          icon: Calendar,
          items: [
            {
              question: 'What calendar views are available?',
              answer: 'VisualDays offers three main views: Monthly (overview of the entire month), Weekly (detailed week view), and Daily (focused single-day view). Switch between them using the view toggle buttons.'
            },
            {
              question: 'How do I navigate between months?',
              answer: 'Use the arrow buttons next to the month name to navigate forward or backward. You can also tap on specific dates to jump to the daily view.'
            },
            {
              question: 'Can I see multiple events on the same day?',
              answer: 'Yes! The calendar automatically stacks multiple events on the same day. In monthly view, you\'ll see the first few events with a "+X more" indicator if there are additional events.'
            }
          ]
        },
        {
          id: 'search',
          title: 'Search & Filters',
          icon: Search,
          items: [
            {
              question: 'How do I search for events?',
              answer: 'Use the Search & Filters page to find events by title, location, or notes. You can also apply filters by priority, event type, date range, and location.'
            },
            {
              question: 'Can I filter events by date?',
              answer: 'Yes! You can filter events by Today, This Week, This Month, or Past Events. This helps you focus on the timeframe that matters most to you.'
            },
            {
              question: 'How do I clear search filters?',
              answer: 'Tap the "Clear" button in the search interface to reset all filters and search terms. This will show all your events again.'
            }
          ]
        },
        {
          id: 'settings',
          title: 'Settings & Customization',
          icon: Settings,
          items: [
            {
              question: 'How do I switch between light and dark mode?',
              answer: 'Go to Settings and toggle the "Dark Mode" switch. VisualDays will remember your preference and apply it every time you open the app.'
            },
            {
              question: 'Can I export my events?',
              answer: 'Yes! In Settings > Data Management, you can export all your events as a JSON file. This is useful for backing up your data or transferring to another device.'
            },
            {
              question: 'How do I import events from another app?',
              answer: 'If you have events in JSON format, you can import them using the Import feature in Settings. Make sure the file follows the correct format.'
            }
          ]
        }
      ];

      const toggleSection = (sectionId) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
      };

      return (
        <div className="h-full overflow-y-auto p-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center"
              >
                <HelpCircle size={40} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white">Help & Support</h1>
                <p className="text-white/70">Everything you need to know about VisualDays</p>
              </div>
            </div>

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4"
            >
              <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                <Star size={16} />
                <span>Quick Tips</span>
              </h3>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-start space-x-2">
                  <Plus size={14} className="mt-0.5 text-green-400" />
                  <span>Tap the "+" button to quickly create a new event</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Image size={14} className="mt-0.5 text-blue-400" />
                  <span>Add locations to automatically get beautiful images</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Star size={14} className="mt-0.5 text-yellow-400" />
                  <span>Use priority levels to make important events stand out</span>
                </div>
              </div>
            </motion.div>

            {/* Help Sections */}
            <div className="space-y-4">
              {helpSections.map((section, index) => {
                const SectionIcon = section.icon;
                const isExpanded = expandedSection === section.id;
                
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20"
                  >
                    <motion.button
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <SectionIcon size={20} className="text-purple-300" />
                        </div>
                        <h3 className="text-white font-semibold">{section.title}</h3>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={20} className="text-white/60" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-4 space-y-4">
                            {section.items.map((item, itemIndex) => (
                              <motion.div
                                key={itemIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: itemIndex * 0.1 }}
                                className="space-y-2"
                              >
                                <h4 className="text-white font-medium">{item.question}</h4>
                                <p className="text-white/70 text-sm leading-relaxed">{item.answer}</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Contact Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center space-y-4"
            >
              <h3 className="text-white font-semibold text-lg">Still need help?</h3>
              <p className="text-white/70 text-sm">
                Can't find what you're looking for? We're here to help you make the most of VisualDays.
              </p>
              <motion.button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  alert('🚧 Contact support feature coming soon! For now, you can request help in your next prompt! 🚀');
                }}
              >
                Contact Support
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      );
    };

    export default HelpPage;