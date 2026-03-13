import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { ShieldAlert, CheckCircle, KeyRound, Mail, Loader2 } from 'lucide-react';
import { FloatingInput } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

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

const MotionForm = motion.form;

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { updateUserPassword, resetPasswordForEmail, loading: authLoading } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [isTokenFlow, setIsTokenFlow] = useState(false);

    useEffect(() => {
        const hash = location.hash;
        if (hash.includes('access_token')) {
            setIsTokenFlow(true);
        }
    }, [location.hash]);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError(null);

        const { error: updateError } = await updateUserPassword(password);

        setLoading(false);
        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccessMessage("Your password has been updated successfully!");
            toast({
                title: "Success!",
                description: "You will be redirected to the dashboard shortly.",
                className: "bg-green-500 text-white",
            });
            setTimeout(() => navigate('/dashboard', { replace: true }), 3000);
        }
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (typeof resetPasswordForEmail !== 'function') {
            setError('Password reset is not available. Please try again after refreshing, or contact support.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const timeoutMs = 15000;
            const result = await Promise.race([
                resetPasswordForEmail(email),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out. Check your SMTP setup in Supabase or try again.')), timeoutMs)),
            ]);
            const { error: resetError } = result;
            if (resetError) {
                setError(resetError.message);
            } else {
                setSuccessMessage(`A password reset link has been sent to ${email}.`);
                toast({
                    title: "Check your email!",
                    description: `A password reset link has been sent to ${email}.`,
                    className: "bg-blue-500 text-white",
                });
            }
        } catch (err) {
            console.error('Reset password error:', err);
            const msg = err?.message || 'Something went wrong. Try again or contact support.';
            setError(msg.includes('not a function') ? 'Password reset is temporarily unavailable. Please refresh the page or try again later.' : msg);
        } finally {
            setLoading(false);
        }
    };

    const renderContent = () => {
        if (authLoading && isTokenFlow) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
                </div>
            );
        }

        if (successMessage) {
            return (
                <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                        className="mx-auto w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/20"
                    >
                        <CheckCircle className="text-white h-12 w-12" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-2">Success!</h2>
                    <p className="text-neutral-300">{successMessage}</p>
                    <Button asChild variant="link" className="mt-4 text-purple-400">
                        <Link to="/login">Back to Sign In</Link>
                    </Button>
                </motion.div>
            );
        }

        if (isTokenFlow) {
            return (
                <MotionForm 
                  key="update-form" 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handlePasswordUpdate} 
                  className="space-y-6"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white tracking-tight">New Password</h1>
                        <p className="text-neutral-400 mt-2">Create a new, strong password.</p>
                    </div>
                    {error && (
                        <motion.div variants={itemVariants} className="bg-red-900/50 border border-red-500/50 text-red-300 p-3 rounded-lg flex items-center gap-3">
                            <ShieldAlert className="h-5 w-5" />
                            <span className="text-sm">{error}</span>
                        </motion.div>
                    )}
                    <motion.div variants={itemVariants}>
                        <FloatingInput id="new-password" type="password" label="New Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <PasswordStrengthIndicator password={password} />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <FloatingInput id="confirm-password" type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <Button type="submit" disabled={loading || !password || password !== confirmPassword} size="lg" variant="glow" className="w-full">
                          {loading ? <Loader2 className="animate-spin" /> : 'Update Password'}
                      </Button>
                    </motion.div>
                </MotionForm>
            );
        }

        return (
            <MotionForm 
              key="email-form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleEmailSubmit} 
              className="space-y-6"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Reset Password</h1>
                    <p className="text-neutral-400 mt-2">Enter your email to get a reset link.</p>
                </div>
                {error && (
                    <motion.div variants={itemVariants} className="bg-red-900/50 border border-red-500/50 text-red-300 p-3 rounded-lg flex items-center gap-3">
                        <ShieldAlert className="h-5 w-5" />
                        <span className="text-sm">{error}</span>
                    </motion.div>
                )}
                <motion.div variants={itemVariants}>
                    <FloatingInput id="email-reset" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Button type="submit" disabled={loading} size="lg" variant="glow" className="w-full">
                      {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
                  </Button>
                </motion.div>
            </MotionForm>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm mx-auto"
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
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default ResetPasswordPage;