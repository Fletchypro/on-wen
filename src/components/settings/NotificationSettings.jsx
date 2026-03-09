import React from 'react';
    import { motion } from 'framer-motion';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import { Bell } from 'lucide-react';

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    const NotificationSettings = ({ notificationPreferences, setNotificationPreferences }) => {

      const handleNotificationChange = (key, value) => {
        if (setNotificationPreferences) {
          setNotificationPreferences(prev => ({...prev, [key]: value}));
        }
      };

      if (!notificationPreferences) {
        return null;
      }

      return (
        <motion.div 
          variants={itemVariants}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-foreground/80 flex items-center gap-2"><Bell size={22}/> Notifications</h2>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="reminders-switch" className="font-medium text-foreground">Event Reminders</Label>
                <Switch
                    id="reminders-switch"
                    checked={notificationPreferences.eventReminders}
                    onCheckedChange={(val) => handleNotificationChange('eventReminders', val)}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="upcoming-switch" className="font-medium text-foreground">Upcoming Event Alerts</Label>
                <Switch
                    id="upcoming-switch"
                    checked={notificationPreferences.upcomingEvents}
                    onCheckedChange={(val) => handleNotificationChange('upcomingEvents', val)}
                />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="updates-switch" className="font-medium text-foreground">Feature Updates</Label>
                <Switch
                    id="updates-switch"
                    checked={notificationPreferences.featureUpdates}
                    onCheckedChange={(val) => handleNotificationChange('featureUpdates', val)}
                />
            </div>
          </div>
        </motion.div>
      );
    };

    export default NotificationSettings;