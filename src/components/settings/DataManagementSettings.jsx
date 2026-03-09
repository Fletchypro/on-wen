import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Trash2, UserX, DatabaseZap, Loader2 } from 'lucide-react';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    const PasswordConfirmationDialog = ({ open, onOpenChange, onConfirm, title, description, children, actionText = "Confirm" }) => {
        const [password, setPassword] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState('');
        const { user } = useAuth();
        const { toast } = useToast();

        const handleConfirm = async () => {
            if (!password) {
                setError('Password is required.');
                return;
            }
            setError('');
            setIsLoading(true);

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: password,
            });

            setIsLoading(false);

            if (signInError) {
                setError('Incorrect password. Please try again.');
                toast({
                    variant: 'destructive',
                    title: 'Authentication Failed',
                    description: 'The password you entered is incorrect.',
                });
            } else {
                onConfirm();
                setPassword('');
                onOpenChange(false);
            }
        };
        
        const handleOpenChange = (isOpen) => {
            if (!isOpen) {
                setPassword('');
                setError('');
                setIsLoading(false);
            }
            onOpenChange(isOpen);
        };

        return (
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
                  <div className="relative rounded-2xl overflow-hidden text-white bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <DialogHeader className="p-6">
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 px-6">
                        <Label htmlFor="password-confirm">Enter your password to continue</Label>
                        <Input
                            id="password-confirm"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="bg-black/30 border-white/20 text-white rounded-xl"
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                    <DialogFooter className="p-6">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {actionText}
                        </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
            </Dialog>
        );
    };

    const DataManagementSettings = ({ deleteAllEvents }) => {
      const { user } = useAuth();
      const { toast } = useToast();
      const navigate = useNavigate();
      const [isManageDataOpen, setIsManageDataOpen] = useState(false);
      const [isDeleteEventsDialogOpen, setIsDeleteEventsDialogOpen] = useState(false);
      const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);

      const handleDeleteAccount = async () => {
        if (!user) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to delete your account.',
          });
          return;
        }

        try {
          await supabase.auth.signOut();

          const { error: functionError } = await supabase.functions.invoke('delete-user', {
            body: JSON.stringify({ userId: user.id }),
          });

          if (functionError) {
            throw new Error(functionError.message || 'Failed to delete account from server.');
          }
          
          toast({
            title: 'Account Deleted',
            description: 'Your account has been successfully removed.',
          });

          navigate('/login');

        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Deletion Failed',
            description: error.message || 'There was a problem deleting your account.',
          });
        }
      };

      const handleSuccessfulDelete = () => {
        toast({
            title: 'All Events Deleted',
            description: 'Your personal events have been successfully removed.',
        });
        deleteAllEvents();
      }

      return (
        <motion.div 
          variants={itemVariants}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-foreground/80 flex items-center gap-2"><DatabaseZap size={22}/> Data Management</h2>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg space-y-4">
             <Dialog open={isManageDataOpen} onOpenChange={setIsManageDataOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-transparent hover:bg-white/10 border-white/20">
                        Manage Data
                    </Button>
                </DialogTrigger>
                <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
                    <div className="relative rounded-2xl overflow-hidden text-white bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                        <DialogHeader className="p-6">
                            <DialogTitle>Manage Data</DialogTitle>
                            <DialogDescription>
                                Here you can manage your event data and account. These actions are permanent.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-2 pt-4 px-6 pb-6">
                            <PasswordConfirmationDialog
                                open={isDeleteEventsDialogOpen}
                                onOpenChange={setIsDeleteEventsDialogOpen}
                                onConfirm={handleSuccessfulDelete}
                                title="Are you absolutely sure?"
                                description="This will permanently delete all your personal events. This action cannot be undone."
                                actionText="Yes, delete everything"
                            >
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="bg-red-800/80 hover:bg-red-700/80">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete All My Events
                                    </Button>
                                </DialogTrigger>
                            </PasswordConfirmationDialog>
                            
                            <PasswordConfirmationDialog
                                open={isDeleteAccountDialogOpen}
                                onOpenChange={setIsDeleteAccountDialogOpen}
                                onConfirm={handleDeleteAccount}
                                title="Are you sure you want to delete your account?"
                                description="This action is permanent and cannot be undone. All your data will be removed."
                                actionText="Yes, delete my account"
                            >
                                <DialogTrigger asChild>
                                    <Button variant="destructive">
                                        <UserX className="mr-2 h-4 w-4" /> Delete Account
                                    </Button>
                                </DialogTrigger>
                            </PasswordConfirmationDialog>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      );
    };

    export default DataManagementSettings;