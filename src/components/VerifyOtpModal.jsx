import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ShieldAlert } from 'lucide-react';

export const VerifyOtpModal = ({ isOpen, setIsOpen, email, phone, type, onSuccess }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOtp } = useAuth();
  const { toast } = useToast();
  const inputsRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      // Focus the first input when the modal opens
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
      setOtp(new Array(6).fill(""));
      setError('');
    }
  }, [isOpen]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // On backspace, if input is empty, focus previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    if (paste.length === 6 && /^\d+$/.test(paste)) {
      const newOtp = paste.split('');
      setOtp(newOtp);
      inputsRef.current[5].focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      setLoading(false);
      return;
    }

    const identifier = email || phone;
    const { data, error: verifyError } = await verifyOtp(identifier, token, type);

    setLoading(false);
    if (verifyError) {
      setError(verifyError.message || "Invalid or expired code. Please try again.");
    } else if (data.user) {
      toast({
        title: "Success!",
        description: "Your account has been verified.",
        className: "bg-green-500 text-white",
      });
      onSuccess();
    } else {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass-strong p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center">Check your {email ? 'email' : 'phone'}</DialogTitle>
          <DialogDescription className="text-white/70 text-center">
            We've sent a 6-digit code to {email || phone}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg flex items-center gap-3 text-sm">
              <ShieldAlert className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((data, index) => {
              return (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-12 h-14 text-center text-2xl font-bold text-white bg-white/10 rounded-lg border-2 border-white/20 focus:border-sky-400 focus:ring-2 focus:ring-sky-500 transition-all"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  ref={(el) => (inputsRef.current[index] = el)}
                />
              );
            })}
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold">
            {loading ? <Loader2 className="animate-spin" /> : 'Verify & Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};