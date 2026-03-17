import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { ArrowLeft, KeyRound, Mail, CheckCircle, Loader2 } from 'lucide-react';

const CHANGE_PASSWORD_DRAFT_KEY = 'horizons_change_password_draft';
const DRAFT_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getDraft() {
  try {
    const raw = sessionStorage.getItem(CHANGE_PASSWORD_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (draft?.expiresAt && Date.now() < draft.expiresAt && draft.step === 'verification' && typeof draft.newPassword === 'string') {
      return draft;
    }
  } catch (_) {}
  return null;
}

function setDraft(newPassword) {
  try {
    sessionStorage.setItem(CHANGE_PASSWORD_DRAFT_KEY, JSON.stringify({
      step: 'verification',
      newPassword,
      expiresAt: Date.now() + DRAFT_TTL_MS,
    }));
  } catch (_) {}
}

function clearDraft() {
  try {
    sessionStorage.removeItem(CHANGE_PASSWORD_DRAFT_KEY);
  } catch (_) {}
}

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirectToSettings, setRedirectToSettings] = useState(false);
  const [inlineError, setInlineError] = useState(null);
  const restoredFromDraft = useRef(false);
  const { user, profile, updateUserPassword, reauthenticate, resetPasswordForEmail } = useAuth();
  const { toast } = useToast();

  // Step 1: enter password and continue → show verification step (we always use code flow)
  const [showVerificationStep, setShowVerificationStep] = useState(false);

  // Restore verification step and password from sessionStorage after tab reload / app refresh
  useEffect(() => {
    if (restoredFromDraft.current) return;
    const draft = getDraft();
    if (draft) {
      restoredFromDraft.current = true;
      setNewPassword(draft.newPassword);
      setConfirmPassword(draft.newPassword);
      setShowVerificationStep(true);
      toast({
        title: 'Welcome back',
        description: 'Paste the verification code from your email below.',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setRedirectToSettings(true), 1500);
    return () => clearTimeout(t);
  }, [success]);

  const handleContinue = (e) => {
    e.preventDefault();
    setInlineError(null);
    if (newPassword !== confirmPassword) {
      setInlineError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setInlineError('Password must be at least 6 characters.');
      return;
    }
    setShowVerificationStep(true);
    setDraft(newPassword);
  };

  const handleSendCode = async () => {
    setInlineError(null);
    setSendingCode(true);
    const { error } = await reauthenticate();
    setSendingCode(false);
    if (error) {
      setInlineError(error.message || 'Could not send code.');
    } else {
      toast({
        title: 'Code sent',
        description: 'Check your email (or phone) for the verification code.',
      });
    }
  };

  const handleUpdateWithCode = async (e) => {
    e.preventDefault();
    setInlineError(null);
    if (!verificationCode.trim()) {
      setInlineError('Enter the verification code.');
      return;
    }
    setIsUpdating(true);
    try {
      const { error } = await updateUserPassword(newPassword, verificationCode.trim());
      if (error) {
        setInlineError(error.message || 'Password update failed.');
        return;
      }
      setSuccess(true);
      clearDraft();
      toast({
        title: 'Password updated',
        description: 'Taking you back to settings.',
      });
      setNewPassword('');
      setConfirmPassword('');
      setVerificationCode('');
      setShowVerificationStep(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendResetLink = async () => {
    const email = user?.email || profile?.email;
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'No email',
        description: 'Your account has no email. Add one in Settings first.',
      });
      return;
    }
    setInlineError(null);
    setSendingLink(true);
    const { error } = await resetPasswordForEmail(email);
    setSendingLink(false);
    if (error) {
      setInlineError(error.message || 'Could not send reset link.');
    } else {
      toast({
        title: 'Check your email',
        description: 'We sent a link to ' + email + '. Use it to set a new password, then sign in.',
      });
    }
  };

  if (redirectToSettings) {
    return <Navigate to="/settings" replace />;
  }

  return (
    <motion.div
      className="p-4 md:p-6 pb-24 md:pb-6 max-w-lg mx-auto w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button variant="ghost" asChild className="mb-6 -ml-2 text-white/80 hover:text-white hover:bg-white/10">
        <Link to="/settings">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Link>
      </Button>

      <div className="relative rounded-2xl overflow-hidden text-white glass-strong p-6 md:p-8">
        <motion.div
          className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0,_#7c3aed_0%,_transparent_40%)]"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative">
          {success ? (
            <div className="py-6 text-center space-y-4">
              <CheckCircle className="h-14 w-14 text-green-400 mx-auto mb-4" aria-hidden />
              <h2 className="text-xl font-semibold text-white mb-2">Password updated successfully</h2>
              <p className="text-white/70">Taking you back to settings...</p>
              <Button
                onClick={() => setRedirectToSettings(true)}
                className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                Back to Settings
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2 mb-1">
                <KeyRound size={28} />
                Change Password
              </h1>
              <p className="text-white/70 mb-6">Enter a new password, then we’ll send a verification code to your email or phone.</p>

              {inlineError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 text-sm">
                  {inlineError}
                </div>
              )}

              {!showVerificationStep ? (
                <form onSubmit={handleContinue} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password-page" className="text-white/80">New Password</Label>
                    <Input
                      id="new-password-page"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-black/30 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                  <PasswordStrengthIndicator password={newPassword} />
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password-page" className="text-white/80">Confirm Password</Label>
                    <Input
                      id="confirm-password-page"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-black/30 border-white/20 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button type="submit" className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      Continue
                    </Button>
                    <Button type="button" variant="outline" asChild className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10">
                      <Link to="/settings">Cancel</Link>
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 pt-2 border-t border-white/20">
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    <Mail size={18} />
                    We’ll send a code to your email or phone. Enter it below.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    {sendingCode ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</> : 'Send verification code'}
                  </Button>
                  <form onSubmit={handleUpdateWithCode} className="space-y-3">
                    <Label htmlFor="verification-code" className="text-white/80">Verification code</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="bg-black/30 border-white/20 text-white placeholder:text-white/50 max-w-[8rem]"
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="submit"
                        disabled={isUpdating || !verificationCode.trim()}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      >
                        {isUpdating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating...</> : 'Update password'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => { clearDraft(); setShowVerificationStep(false); setInlineError(null); }}
                        className="text-white/80 hover:text-white"
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              <p className="text-white/50 text-sm mt-6">
                Prefer a link by email? We’ll send you a reset link; use it to set a new password, then sign in again.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleSendResetLink}
                disabled={sendingLink}
                className="mt-2 w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                {sendingLink ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</> : 'Email me a password reset link'}
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
