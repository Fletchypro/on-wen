import React, { useState } from 'react';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Loader2, Mail } from 'lucide-react';

    export const AddEmailDialog = ({ open, onOpenChange }) => {
      const { updateUserEmail } = useAuth();
      const { toast } = useToast();
      const [email, setEmail] = useState('');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await updateUserEmail(email);

        setLoading(false);
        if (error) {
          setError(error.message);
          toast({
            variant: "destructive",
            title: "Error adding email",
            description: error.message,
          });
        } else {
          toast({
            title: "Confirmation email sent!",
            description: "Please check your inbox to verify your new email address.",
            className: "bg-green-500 text-white",
          });
          onOpenChange(false);
          setEmail('');
        }
      };

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="glass-strong text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add Email Address</DialogTitle>
              <DialogDescription className="text-white/70">
                Add an email for account recovery and notifications. A confirmation link will be sent to this address.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-white/10 border-white/20"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent hover:bg-white/10 border-white/20">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-500 to-pink-600">
                  {loading ? <Loader2 className="animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  {loading ? 'Sending...' : 'Add Email'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };