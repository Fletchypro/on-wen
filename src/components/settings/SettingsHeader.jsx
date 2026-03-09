import React from 'react';
import { motion } from 'framer-motion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings } from 'lucide-react';

const SettingsHeader = ({ user }) => {
  const { profile } = useUserProfile(user);

  return (
    <div className="relative p-4 rounded-2xl header-gradient text-white max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            className="text-2xl font-bold flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Settings size={24} />
            Settings
          </motion.h1>
          <motion.p 
            className="text-sm text-gray-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Manage your account and preferences.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <Avatar>
            <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
            <AvatarFallback>
              {profile?.first_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsHeader;