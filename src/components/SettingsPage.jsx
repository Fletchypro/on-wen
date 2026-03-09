import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProfileSettings from '@/components/settings/ProfileSettings.jsx';
import PreferenceSettings from '@/components/settings/PreferenceSettings.jsx';
import NotificationSettings from '@/components/settings/NotificationSettings.jsx';
import DataManagementSettings from '@/components/settings/DataManagementSettings.jsx';
import AccountSettings from '@/components/settings/AccountSettings.jsx';
import ThemeSettings from '@/components/settings/ThemeSettings.jsx';
import BlockedUsersSettings from '@/components/settings/BlockedUsersSettings.jsx';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { LifeBuoy, ShieldCheck, FileText } from 'lucide-react';
import ShareButton from '@/components/ShareButton';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const SettingsPage = ({
  deleteAllEvents,
  notificationPreferences, setNotificationPreferences, imageOpacity, setImageOpacity
}) => {
  const { theme } = useTheme();
  return (
    <motion.div
      className="p-4 md:p-6 pb-24 md:pb-6 space-y-6 max-w-5xl mx-auto w-full"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div className="flex-shrink-0" variants={itemVariants}>
        <div className="mb-3 mt-10">
          <h1 className={`text-4xl md:text-6xl font-bold tracking-tight ${theme.headerColor}`}>
            Settings
          </h1>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="space-y-8">
            <ProfileSettings />

            <div className="pt-8 border-t border-white/10">
              <h2 className="text-2xl font-semibold mb-4 text-white">Spread the Word</h2>
              <div className="glass p-4">
                <ShareButton variant="outline" className="w-full bg-transparent hover:bg-white/10 border-white/20 text-white">
                  <img alt="Wen Logo" className="inline-block h-6 w-6 mr-2 -mt-1" src="https://horizons-cdn.hostinger.com/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/d0404469f31c90a062889e665be85d0b.png" />
                  Share Wen with Friends
                </ShareButton>
              </div>
            </div>

            <PreferenceSettings
              imageOpacity={imageOpacity}
              setImageOpacity={setImageOpacity}
            />
            <ThemeSettings />
            <NotificationSettings
              notificationPreferences={notificationPreferences}
              setNotificationPreferences={setNotificationPreferences}
            />

            <DataManagementSettings
              deleteAllEvents={deleteAllEvents}
            />
            <AccountSettings />
            <BlockedUsersSettings />

            <div className="glass p-4 space-y-2">
              <Button asChild variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5">
                <Link to="/support">
                  <LifeBuoy className="mr-2 h-4 w-4" />
                  Support Center
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5">
                <Link to="/privacy">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Privacy Policy
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5">
                <Link to="/terms-of-service">
                  <FileText className="mr-2 h-4 w-4" />
                  Terms & Agreements
                </Link>
              </Button>
            </div>
          </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;