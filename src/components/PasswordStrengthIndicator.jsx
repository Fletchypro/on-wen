import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const checkPasswordStrength = (password) => {
  let score = 0;
  if (!password) return 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if(password.length > 12) score++;

  return score;
};

const strengthLevels = [
  { label: '', color: 'bg-transparent', width: '0%' },
  { label: 'Weak', color: 'bg-red-500', width: '20%' },
  { label: 'Fair', color: 'bg-orange-500', width: '40%' },
  { label: 'Good', color: 'bg-yellow-500', width: '60%' },
  { label: 'Strong', color: 'bg-green-500', width: '80%' },
  { label: 'Very Strong', color: 'bg-emerald-500', width: '100%' },
];

export const PasswordStrengthIndicator = ({ password }) => {
  const strength = checkPasswordStrength(password);
  const { label, color, width } = strengthLevels[strength];

  if (!password) return null;

  return (
    <div className="space-y-1 pt-1">
      <div className="w-full bg-white/10 rounded-full h-1">
        <motion.div
          className={cn("h-1 rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      {label && <p className="text-xs text-neutral-400 text-right font-medium pr-1">{label}</p>}
    </div>
  );
};