import React from 'react';
    import { motion } from 'framer-motion';
    import { Label } from '@/components/ui/label';
    import { Check, Palette } from 'lucide-react';
    import { useTheme } from '@/contexts/ThemeContext';
    import { cn } from '@/lib/utils';
    import { Card } from '@/components/ui/card';

    const ThemeSettings = () => {
      const { theme, setTheme, themes } = useTheme();

      return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <Card className="p-6 text-white">
                <Label className="flex items-center text-md font-semibold mb-4">
                    <Palette className="mr-3 h-5 w-5 text-sky-300" />
                    App Theme
                </Label>
                <p className="text-xs text-white/50 mb-3 px-0.5 leading-relaxed">
                  Each circle shows that theme&apos;s accent clearly. The home screen uses the same tint in a softer wash so it stays easy on the eyes.
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-x-3 gap-y-4">
                  {themes.map((item) => (
                    <motion.button
                      type="button"
                      key={item.id}
                      onClick={() => setTheme(item.id)}
                      className="cursor-pointer flex flex-col items-center gap-1.5 min-w-0 touch-manipulation"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      title={item.name}
                      aria-label={`Theme ${item.name}`}
                      aria-pressed={theme.id === item.id}
                    >
                      <div
                        className={cn(
                          'w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br shadow-md flex items-center justify-center transition-all duration-300 ring-1 ring-white/15',
                          item.swatch || item.gradient,
                          theme.id === item.id && 'ring-2 ring-offset-2 ring-offset-black/40 ring-white/80 shadow-lg shadow-black/50'
                        )}
                      >
                        {theme.id === item.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-7 h-7 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center border border-white/15"
                          >
                            <Check className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={2.5} />
                          </motion.div>
                        )}
                      </div>
                      <span className={cn(
                        'text-[10px] sm:text-[11px] font-medium truncate max-w-[3.25rem] sm:max-w-[3.5rem] text-center leading-tight',
                        theme.id === item.id ? 'text-white' : 'text-white/50'
                      )}>{item.name}</span>
                    </motion.button>
                  ))}
                </div>
                 <p className="text-sm text-white/40 px-0.5 mt-4">
                    Tip: System and Graphite are closest to native Settings / dark mode chrome.
                </p>
            </Card>
        </motion.div>
      );
    };

    export default ThemeSettings;