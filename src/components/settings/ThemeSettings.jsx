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
            <Card className="p-6 bg-white/5 border-white/10 text-white">
                <Label className="flex items-center text-md font-semibold mb-4">
                    <Palette className="mr-3 h-5 w-5 text-purple-400" />
                    App Theme
                </Label>
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {themes.map((item) => (
                    <motion.div
                      key={item.id}
                      onClick={() => setTheme(item.id)}
                      className="cursor-pointer"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      title={item.name}
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center transition-all duration-300',
                          item.gradient,
                          theme.id === item.id && 'ring-2 ring-offset-2 ring-offset-background ring-purple-400'
                        )}
                      >
                        {theme.id === item.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                 <p className="text-sm text-gray-400 px-1 mt-4">
                    Choose a background gradient that fits your style.
                </p>
            </Card>
        </motion.div>
      );
    };

    export default ThemeSettings;