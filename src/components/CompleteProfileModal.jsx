import React, { useState, useEffect, useRef } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Calendar as CalendarIcon, Check, ArrowRight, Loader2 } from 'lucide-react';
    import { format } from 'date-fns';
    import PhoneInput from 'react-phone-number-input/input';
    import { supabase } from '@/lib/customSupabaseClient';

    const parseBirthday = (b) => {
      if (!b) return null;
      if (typeof b === 'string') {
        const parts = b.split('-').map(Number);
        if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
      }
      return b instanceof Date ? b : null;
    };

    const CompleteProfileModal = ({ isOpen, setIsOpen, profile, setProfile }) => {
      const { user, updateUserPhone, verifyUserPhoneOtp, fetchProfile } = useAuth();
      const { toast } = useToast();

      const [step, setStep] = useState(1);
      const [formData, setFormData] = useState(() => ({
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
        username: profile?.username || '',
        birthday: parseBirthday(profile?.birthday),
        phone: profile?.phone || '+1',
      }));
      const [otp, setOtp] = useState(new Array(6).fill(""));
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const inputRefs = useRef([]);

      const signedUpWithPhone = user?.phone && !user?.email;
      const needsNameAndUsername = !profile?.first_name || !profile?.username;
      const needsPhone = !profile?.phone;
      const needsBirthday = !profile?.birthday;

      useEffect(() => {
        if (isOpen) {
          if (signedUpWithPhone) {
            if (needsNameAndUsername) setStep(1);
            else if (needsBirthday) setStep(3);
            else setStep(4);
          } else {
            if (needsPhone) setStep(2);
            else if (needsBirthday) setStep(3);
            else setStep(4);
          }
        }
      }, [isOpen, signedUpWithPhone, needsNameAndUsername, needsPhone, needsBirthday]);

      const handleUpdateProfile = async (updates) => {
        setLoading(true);
        setError(null);
        try {
          if (updates.username) {
            const { data: existingUser, error: checkError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('username', updates.username)
              .not('id', 'eq', user.id)
              .maybeSingle();
            if (checkError) throw checkError;
            if (existingUser) {
              setError('Username is already taken.');
              setLoading(false);
              return false;
            }
          }
          const { error } = await supabase.from('user_profiles').update(updates).eq('id', user.id);
          if (error) throw error;
          
          const updatedProfile = await fetchProfile(user.id);
          setProfile(updatedProfile);
          setLoading(false);
          return true;
        } catch (err) {
          setError(err.message);
          setLoading(false);
          return false;
        }
      };

      const handleNameSubmit = async (e) => {
        e.preventDefault();
        const success = await handleUpdateProfile({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
        });
        if (success) {
          if (needsBirthday) setStep(3);
          else setStep(4);
        }
      };

      const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await updateUserPhone(formData.phone);
        setLoading(false);
        if (error) {
          setError(error.message);
        } else {
          setStep('verifyPhone');
        }
      };

      const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const token = otp.join("");
        const { error } = await verifyUserPhoneOtp(formData.phone, token);
        setLoading(false);
        if (error) {
          setError(error.message);
        } else {
          await handleUpdateProfile({ phone: formData.phone });
          toast({ title: "Phone number verified!", className: "bg-green-500 text-white" });
          if (needsBirthday) setStep(3);
          else setStep(4);
        }
      };

      const handleBirthdaySubmit = async (e) => {
        e.preventDefault();
        const birthdayStr = formData.birthday
          ? (formData.birthday instanceof Date
              ? format(formData.birthday, 'yyyy-MM-dd')
              : String(formData.birthday).slice(0, 10))
          : null;
        const success = await handleUpdateProfile({ birthday: birthdayStr });
        if (success) {
          setStep(4);
        }
      };

      const handleFinish = () => {
        setIsOpen(false);
        toast({ title: "Profile complete!", description: "Welcome to Wen!", className: "bg-green-500 text-white" });
      };

      const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        if (element.value !== "" && index < 5) {
          inputRefs.current[index + 1].focus();
        }
      };

      const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
          inputRefs.current[index - 1].focus();
        }
      };

      const renderStep = () => {
        switch (step) {
          case 1: // Name and Username (for phone signup)
            return (
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold text-white text-center">Welcome to Wen!</DialogTitle>
                  <DialogDescription className="text-center text-white/70">Let's get your profile started.</DialogDescription>
                </DialogHeader>
                <div className="flex gap-4">
                  <div className="space-y-2 w-1/2">
                    <Label className="text-white/80">First Name</Label>
                    <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" required className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="space-y-2 w-1/2">
                    <Label className="text-white/80">Last Name</Label>
                    <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" required className="bg-white/10 border-white/20 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Username</Label>
                  <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s/g, '') })} placeholder="johndoe" required className="bg-white/10 border-white/20 text-white" />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold">
                  {loading ? <Loader2 className="animate-spin" /> : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            );
          case 2: // Phone (for email signup)
            return (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold text-white text-center">Verify Your Phone</DialogTitle>
                  <DialogDescription className="text-center text-white/70">Add a phone number for account recovery and features.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label className="text-white/80">Phone Number</Label>
                  <PhoneInput value={formData.phone} onChange={(p) => setFormData({ ...formData, phone: p })} required className="flex h-10 w-full rounded-md border border-input bg-white/10 px-3 py-2 text-sm text-white" />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold">
                  {loading ? <Loader2 className="animate-spin" /> : 'Send Code'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            );
          case 'verifyPhone': // OTP for phone verification
            return (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold text-white text-center">Enter Code</DialogTitle>
                  <DialogDescription className="text-center text-white/70">We sent a 6-digit code to {formData.phone}.</DialogDescription>
                </DialogHeader>
                <div className="flex justify-center gap-2">
                  {otp.map((data, index) => (
                    <Input key={index} type="text" maxLength="1" className="w-12 h-14 text-center text-2xl bg-white/10 border-white/20 text-white" value={data} onChange={e => handleOtpChange(e.target, index)} onKeyDown={e => handleOtpKeyDown(e, index)} ref={el => (inputRefs.current[index] = el)} />
                  ))}
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold">
                  {loading ? <Loader2 className="animate-spin" /> : 'Verify & Continue'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            );
          case 3: // Birthday (for all) — native date input for iOS wheel picker
            const today = new Date();
            const maxDate = format(today, 'yyyy-MM-dd');
            const minDate = '1900-01-01';
            const birthdayValue = formData.birthday
              ? (formData.birthday instanceof Date ? format(formData.birthday, 'yyyy-MM-dd') : String(formData.birthday).slice(0, 10))
              : '';
            return (
              <form onSubmit={handleBirthdaySubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold text-white text-center">When&apos;s Your Birthday?</DialogTitle>
                  <DialogDescription className="text-center text-white/70">This helps us personalize your experience.</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="birthday-modal" className="text-white/80 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Birthday
                  </Label>
                  <input
                    id="birthday-modal"
                    type="date"
                    value={birthdayValue}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        birthday: v ? new Date(v + 'T12:00:00') : null,
                      }));
                    }}
                    className="flex h-12 w-full rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 [color-scheme:dark]"
                  />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <Button type="submit" disabled={loading || !formData.birthday} className="w-full bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold">
                  {loading ? <Loader2 className="animate-spin" /> : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            );
          case 4: // All Done
            return (
              <div className="text-center space-y-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                  <Check className="h-24 w-24 mx-auto text-green-400 bg-green-400/20 rounded-full p-4" />
                </motion.div>
                <DialogTitle className="text-3xl font-bold text-white">You're All Set!</DialogTitle>
                <DialogDescription className="text-white/70">Your profile is complete. Let's dive in and start planning.</DialogDescription>
                <Button onClick={handleFinish} className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold">
                  Let's Go!
                </Button>
              </div>
            );
          default:
            return null;
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="p-8 border-none bg-transparent shadow-none max-w-md glass-strong">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      );
    };

    export default CompleteProfileModal;