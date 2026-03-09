import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Mail, Smartphone, Loader2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';

const LOGO_URL = 'https://horizons-cdn.hostinger.com/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/d0404469f31c90a062889e665be85d0b.png';

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20 },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
};

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  const { email, phone, type } = state || {};

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  
  const { verifyOtp, resendSignupCode, signInWithPhone, user, isConfirmed } = useAuth();
  const { toast } = useToast();
  const inputRefs = useRef([]);

  const verificationTarget = useMemo(() => email || phone, [email, phone]);
  const verificationType = useMemo(() => (email ? 'email' : 'phone'), [email]);

  useEffect(() => {
    if (!verificationTarget) {
      console.log("No verification target, redirecting to signup.");
      navigate('/signup', { replace: true });
    }
  }, [verificationTarget, navigate]);
  
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value.slice(-1);
    setOtp(newOtp);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const { error: verifyError } = await verifyOtp({
        ...(email && { email }),
        ...(phone && { phone }),
        token,
        type,
    });
    
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: verifyError.message,
      });
    } else {
        toast({
            title: "Success!",
            description: "Welcome! Your account is verified.",
            className: "bg-green-500 text-white",
        });
        // The isConfirmed() check will handle navigation
    }
  };

  useEffect(() => {
    if (user && isConfirmed()) {
        navigate('/dashboard', { replace: true });
    }
  }, [user, isConfirmed, navigate]);

  const handleResendCode = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError(null);

    const isEmailVerification = type === 'email';
    
    const resendFunction = isEmailVerification ? () => resendSignupCode(email) : () => signInWithPhone(phone);
    
    const { error: resendError } = await resendFunction();
      
    setResendLoading(false);

    if (resendError) {
      setError(resendError.message);
      toast({
        variant: "destructive",
        title: "Failed to resend code",
        description: resendError.message,
      });
    } else {
      toast({
        title: "Code Sent!",
        description: `A new verification code has been sent to your ${verificationType}.`,
        className: "bg-blue-500 text-white",
      });
      setResendCooldown(30);
      inputRefs.current[0]?.focus();
    }
  };

  if (!verificationTarget) {
      return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      );
  }

  return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <div className="text-center mb-8">
            <Link to="/">
                <motion.img 
                    src={LOGO_URL} 
                    alt="Wen Logo" 
                    className="w-40 mx-auto" 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                />
            </Link>
        </div>
        <div className="bg-black/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl shadow-purple-900/20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div variants={itemVariants} className="text-center mb-6">
                 <div className="mx-auto bg-white/10 rounded-full h-20 w-20 flex items-center justify-center mb-4 border-2 border-white/10 shadow-lg">
                    {verificationType === 'email' ? <Mail className="w-10 h-10 text-purple-400"/> : <Smartphone className="w-10 h-10 text-purple-400"/>}
                </div>
              <h1 className="text-4xl font-bold tracking-tight text-white">Check Your {verificationType === 'email' ? 'Email' : 'Phone'}</h1>
              <p className="text-neutral-300 mt-3">
                We sent a 6-digit code to <br/> <span className="font-semibold text-purple-300">{verificationTarget}</span>.
              </p>
            </motion.div>
            <form onSubmit={handleSubmit}>
              <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {otp.map((data, index) => (
                   <motion.div key={index} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Input
                        type="tel"
                        name="otp"
                        maxLength="1"
                        className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-neutral-900/50 border-2 border-neutral-700 text-white focus:ring-purple-500 focus:border-purple-500 rounded-xl"
                        value={data}
                        onChange={e => handleChange(e.target, index)}
                        onKeyDown={e => handleKeyDown(e, index)}
                        onFocus={e => e.target.select()}
                        ref={el => (inputRefs.current[index] = el)}
                        autoComplete="one-time-code"
                      />
                   </motion.div>
                ))}
              </motion.div>
              {error && <motion.p variants={itemVariants} className="text-red-400 text-sm text-center mb-4">{error}</motion.p>}
              <motion.div variants={itemVariants}>
                <Button type="submit" disabled={loading} size="lg" variant="glow" className="w-full">
                    {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} className="mr-2"/> Verify & Continue</>}
                </Button>
              </motion.div>
            </form>
            <motion.div variants={itemVariants} className="mt-6 text-center">
              <Button
                variant="link"
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
                className="text-purple-400 hover:text-purple-300 disabled:text-neutral-500 disabled:no-underline transition-colors"
              >
                {resendLoading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </Button>
            </motion.div>
            <motion.div variants={itemVariants} className="mt-4 text-center">
                <Link to="/signup" className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
                    Back to Sign Up
                </Link>
             </motion.div>
           </motion.div>
          </div>
      </motion.div>
  );
};

export default VerifyOtpPage;