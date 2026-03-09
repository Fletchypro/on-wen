import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { getDisplayName } from '@/lib/utils';
import { Flag } from 'lucide-react';

const ReportUserDialog = ({ user, isOpen, onOpenChange }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmitReport = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for reporting this user.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.rpc('report_content', {
      p_report_type: 'user',
      p_reported_user_id: user.id,
      p_reason: reason,
    });
    setLoading(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'User Reported', description: 'Thank you for your feedback. Our team will review your report.' });
      onOpenChange(false);
      setReason('');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setReason('');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Report {getDisplayName(user)}</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide details about the incident. Your report is anonymous and helps us keep the community safe.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid w-full gap-1.5">
          <Label htmlFor="reason">Reason for reporting</Label>
          <Textarea
            id="reason"
            placeholder="Describe what happened..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-background"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleSubmitReport} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              <Flag className="mr-2 h-4 w-4" />
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ReportUserDialog;