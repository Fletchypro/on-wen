import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
      DialogTrigger,
    } from "@/components/ui/dialog"
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';

    export const ChangePasswordDialog = ({ open, onOpenChange, children }) => {
      const [newPassword, setNewPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [isUpdating, setIsUpdating] = useState(false);
      const { updateUserPassword } = useAuth();
      const { toast } = useToast();

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
          toast({
            variant: "destructive",
            title: "Passwords do not match",
            description: "Please ensure both password fields are identical.",
          });
          return;
        }
        if (newPassword.length < 6) {
            toast({
                variant: "destructive",
                title: "Password too short",
                description: "Your new password must be at least 6 characters long.",
            });
            return;
        }

        setIsUpdating(true);
        const { error } = await updateUserPassword(newPassword);
        setIsUpdating(false);

        if (!error) {
          toast({
            title: "Success",
            description: "Your password has been updated successfully.",
          });
          setNewPassword('');
          setConfirmPassword('');
          onOpenChange(false);
        } else {
            // Error toast is handled inside updateUserPassword
        }
      };

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>{children}</DialogTrigger>
          <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
            <div className="relative rounded-2xl overflow-hidden text-white glass-strong">
                <motion.div 
                    className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0,_#7c3aed_0%,_transparent_40%)]"
                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative p-8">
                    <DialogHeader className="text-left mb-6">
                        <DialogTitle className="text-3xl font-bold tracking-tight text-white">Change Password</DialogTitle>
                        <DialogDescription className="text-white/70 mt-1">
                            Enter a new password for your account below.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-password-dialog" className="text-right text-white/80">
                                New Password
                                </Label>
                                <Input
                                id="new-password-dialog"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="col-span-3 bg-black/30 border-white/20 text-white placeholder:text-white/50"
                                required
                                />
                            </div>
                            <PasswordStrengthIndicator password={newPassword} />
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="confirm-password-dialog" className="text-right text-white/80">
                                Confirm
                                </Label>
                                <Input
                                id="confirm-password-dialog"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="col-span-3 bg-black/30 border-white/20 text-white placeholder:text-white/50"
                                required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                                {isUpdating ? 'Updating...' : 'Save changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    };