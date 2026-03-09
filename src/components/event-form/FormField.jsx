import React from 'react';
import { motion } from 'framer-motion';

export const FormField = ({ delay, children, className }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className={`space-y-2 ${className || ''}`}
  >
    {children}
  </motion.div>
);