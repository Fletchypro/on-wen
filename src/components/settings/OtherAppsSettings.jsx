import React from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Rocket, ArrowRight } from 'lucide-react';

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    const OtherAppsSettings = () => {
      const handleYooshieClick = () => {
        window.open('https://apps.apple.com/app/id6737348275', '_blank', 'noopener,noreferrer');
      };

      return (
        <motion.div 
          variants={itemVariants}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-foreground/80 flex items-center gap-2">
            <Rocket size={22}/>
            Our Other Apps
          </h2>
          <div className="p-4 rounded-xl glass-light border border-white/10 shadow-lg space-y-3">
            <div 
              className="flex items-center gap-4 p-3 -m-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              onClick={handleYooshieClick}
            >
              <img  
                className="h-12 w-12 rounded-lg object-contain" 
                alt="Yooshie app logo"
                src="https://storage.googleapis.com/hostinger-horizons-assets-prod/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/b915315ac95606981e1fb7fbe6c108f5.png" />
              <div className="flex-1">
                <p className="font-bold text-foreground">Yooshie</p>
                <p className="text-sm text-foreground/70">Discover your next favorite spot.</p>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <ArrowRight className="h-5 w-5 text-foreground/80"/>
              </Button>
            </div>
          </div>
        </motion.div>
      );
    };

    export default OtherAppsSettings;