import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const backdropVariants = {
  visible: { opacity: 1, transition: { duration: 0.3 } },
  hidden: { opacity: 0, transition: { duration: 0.3, delay: 0.1 } },
};

const ImageLightbox = ({ src, alt, onClose, originRect }) => {
  const avatarImage = (
    <Avatar className="h-full w-full border-2 border-background/50 ring-2 ring-green-500">
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>{alt?.[0] || 'U'}</AvatarFallback>
    </Avatar>
  );

  const imageVariants = {
    hidden: (custom) => ({
      x: custom ? custom.left : window.innerWidth / 2,
      y: custom ? custom.top : window.innerHeight / 2,
      width: custom ? custom.width : 0,
      height: custom ? custom.height : 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    }),
    visible: {
      x: window.innerWidth / 2 - 128,
      y: window.innerHeight / 2 - 128,
      width: 256,
      height: 256,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          <motion.div
            className="absolute"
            custom={originRect}
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              top: 0,
              left: 0,
            }}
          >
            {avatarImage}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;