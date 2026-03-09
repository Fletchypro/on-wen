import React from 'react';
import { motion } from 'framer-motion';
import { Image } from 'lucide-react';
import LiquidSlider from '@/components/ui/LiquidSlider';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const PreferenceSettings = ({ imageOpacity, setImageOpacity }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card className="p-6 bg-white/5 border-white/10 text-white">
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="image-opacity-slider" className="flex items-center text-md font-semibold">
                <Image className="mr-3 h-5 w-5 text-purple-400" />
                Event Image Opacity
              </Label>
              <span className="text-lg font-bold text-purple-300 w-16 text-right">
                {Math.round(imageOpacity * 100)}%
              </span>
            </div>
            <div className="glass-strong p-4 rounded-2xl">
              <div className="flex items-center space-x-4">
                 <LiquidSlider
                    id="image-opacity-slider"
                    min={0.05}
                    max={1}
                    step={0.01}
                    value={[imageOpacity]}
                    onValueChange={(value) => setImageOpacity(value[0])}
                  />
              </div>
            </div>
            <p className="text-sm text-gray-400 px-1">
              Control how visible the background images are on your event cards.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default PreferenceSettings;