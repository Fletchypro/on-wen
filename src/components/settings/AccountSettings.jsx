import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, KeyRound, UserCircle, Mail } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/settings/ChangePasswordDialog';
import { AddEmailDialog } from '@/components/settings/AddEmailDialog';
import { DialogTrigger } from '@/components/ui/dialog';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const AccountSettings = () => {
  const { user, profile, signOut } = useAuth();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  
  const handleSignOut = async () => {
    await signOut();
  };

  const signedUpWithPhoneOnly = user?.phone && (!profile?.email || profile.email.trim() === '');

  return (
    <motion.div 
      variants={itemVariants}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold text-foreground/80 flex items-center gap-2"><UserCircle size={22}/> Account</h2>
      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg space-y-3">
        <div className="flex items-center justify-between p-2 bg-black/20 rounded-xl">
          <span className="text-foreground/70 text-sm">Email:</span>
          <span className="text-foreground font-medium truncate shrink text-sm">{profile?.email || "Not set"}</span>
        </div>
        
        {signedUpWithPhoneOnly && (
          <AddEmailDialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full flex items-center justify-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Mail size={18} />
                <span>Add Email Address</span>
              </Button>
            </DialogTrigger>
          </AddEmailDialog>
        )}

        {profile?.email && (
          <>
            <Button
              onClick={() => setIsPasswordDialogOpen(true)}
              className="w-full flex items-center justify-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <KeyRound size={18} />
              <span>Change Password</span>
            </Button>
            <ChangePasswordDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} />
          </>
        )}

        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full flex items-center justify-center space-x-2"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </Button>
      </div>
    </motion.div>
  );
};

export default AccountSettings;