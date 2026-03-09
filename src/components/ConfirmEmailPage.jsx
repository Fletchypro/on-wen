import React, { useEffect, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '@/lib/customSupabaseClient';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast';

    const ConfirmEmailPage = () => {
      const [status, setStatus] = useState('confirming');
      const [errorMessage, setErrorMessage] = useState('');
      const navigate = useNavigate();
      const { toast } = useToast();

      useEffect(() => {
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));

        if (params.has('error')) {
          const errorDescription = params.get('error_description') || 'An unknown error occurred.';
          setErrorMessage(errorDescription);
          setStatus('error');
          toast({
            title: "Confirmation Failed",
            description: errorDescription,
            variant: "destructive",
          });
        } else {
          // Supabase handles the session creation in the background when the user clicks the link.
          // The user is not automatically signed in.
          // We can just confirm success and redirect to the login page.
          setStatus('success');
          toast({
            title: "Email Confirmed!",
            description: "Your account has been activated. Please log in to continue.",
            variant: "success"
          });
          setTimeout(() => navigate('/login'), 2000); // Redirect to login page
        }
      }, [navigate, toast]);

      const messages = {
        confirming: 'Confirming your email… Please wait.',
        success: 'Success! Redirecting you to the login page...',
        error: `Error: ${errorMessage}`
      };

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-white mb-4">{messages[status]}</h1>
            {status === 'confirming' && (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </motion.div>
        </div>
      );
    };

    export default ConfirmEmailPage;