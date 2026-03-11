import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ShieldAlert, LogIn, Mail, Smartphone, Loader2 } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input/input';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet';
import { getPageTitle, getMetaDescription, getOGTags, getTwitterTags, getCanonicalURL } from '@/lib/seoHelpers';

const LOGO_URL = 'https://horizons-cdn.hostinger.com/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/d0404469f31c90a062889e665be85d0b.png';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, y: -20 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const MotionForm = motion.form;

const EmailSignInForm = ({ onSwitchToPhoneSignIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error: signInError } = await signIn(email, password);
        setLoading(false);
        if (signInError) {
            setError(signInError.message);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <MotionForm
            key="email-signin"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleSignIn}
            className="space-y-6"
        >
            {error && (
                <motion.div variants={itemVariants} className="bg-red-900/50 border border-red-500/50 text-red-300 p-3 rounded-lg flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                </motion.div>
            )}
            <motion.div variants={itemVariants}>
                <FloatingInput id="email-signin" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </motion.div>
            <motion.div variants={itemVariants}>
                <FloatingInput id="password-signin" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </motion.div>
            <motion.div variants={itemVariants} className="text-right">
                <Link to="/reset-password" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                    Forgot Password?
                </Link>
            </motion.div>
            <motion.div variants={itemVariants} className="pt-2">
              <Button type="submit" disabled={loading} size="lg" variant="glow" className="w-full">
                {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </Button>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
                <Button type="button" variant="link" onClick={onSwitchToPhoneSignIn} className="w-full text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2">
                    <Smartphone size={16} /> Use Phone Instead
                </Button>
            </motion.div>
        </MotionForm>
    );
};

const PhoneSignInForm = ({ onSwitchToEmailSignIn }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signInWithPhoneAndPassword } = useAuth();
    const navigate = useNavigate();
    
    const handleSignIn = async (e) => {
        e.preventDefault();
        
        if (!phone || !password) {
            setError("Please enter phone number and password.");
            return;
        }

        if (phone && !isValidPhoneNumber(phone)) {
            setError("Please enter a valid phone number.");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        const { error: signInError } = await signInWithPhoneAndPassword(phone, password);
        
        setLoading(false);
        if (signInError) {
            setError(signInError.message);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <MotionForm
            key="phone-signin"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleSignIn}
            className="space-y-6"
        >
            {error && (
                <motion.div variants={itemVariants} className="bg-red-900/50 border border-red-500/50 text-red-300 p-3 rounded-lg flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                </motion.div>
            )}
             <motion.div variants={itemVariants}>
                <div className={cn(
                  "relative group h-14 w-full rounded-2xl border-2 border-transparent bg-neutral-900/50 text-base text-white ring-offset-black transition-colors focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2 focus-within:border-purple-500",
                  (error && error.toLowerCase().includes('phone')) && "border-red-500/50",
                  !error && "focus-within:border-purple-500"
                )}>
                  <label 
                    htmlFor="phone-signin"
                    className={cn("absolute left-4 transition-all duration-300 pointer-events-none", 
                      phone ? 'top-1.5 text-xs text-purple-400' : 'top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:top-1.5 group-focus-within:text-xs group-focus-within:text-purple-400'
                    )}>
                    Phone Number
                  </label>
                  <PhoneInput
                      id="phone-signin"
                      value={phone}
                      onChange={setPhone}
                      defaultCountry="US"
                      international
                      countryCallingCodeEditable={false}
                      className="h-full w-full bg-transparent pl-4 pt-4 pr-4 pb-2 text-white outline-none phone-input-no-styles"
                  />
                </div>
                {phone && !isValidPhoneNumber(phone) && <p className="text-red-400 text-xs mt-1 pl-1">Invalid phone number format</p>}
            </motion.div>
            <motion.div variants={itemVariants}>
                <FloatingInput id="password-phone-signin" type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required hasError={error && error.toLowerCase().includes('password')} />
            </motion.div>
            <motion.div variants={itemVariants} className="text-right">
                <Link to="/reset-password" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                    Forgot Password?
                </Link>
            </motion.div>
            <motion.div variants={itemVariants} className="pt-2">
                <Button type="submit" disabled={loading} size="lg" variant="glow" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-[0_0_30px_theme(colors.blue.500)]">
                    {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                </Button>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center">
                <Button type="button" variant="link" onClick={onSwitchToEmailSignIn} className="w-full text-purple-400 hover:text-purple-300 flex items-center justify-center gap-2">
                    <Mail size={16} /> Use Email Instead
                </Button>
            </motion.div>
        </MotionForm>
    );
};

const SignInPage = () => {
    const [usePhoneSignIn, setUsePhoneSignIn] = useState(false);
    const ogTags = getOGTags('login');
    const twitterTags = getTwitterTags('login');

    return (
        <>
            <Helmet>
                <title>{getPageTitle('login')}</title>
                <meta name="description" content={getMetaDescription('login')} />
                <link rel="canonical" href={getCanonicalURL('login')} />
                
                {Object.entries(ogTags).map(([key, value]) => (
                    <meta key={key} property={key} content={value} />
                ))}
                
                {Object.entries(twitterTags).map(([key, value]) => (
                    <meta key={key} name={key} content={value} />
                ))}
            </Helmet>
            
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
                <div className="bg-black/40 backdrop-blur-2xl p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl shadow-purple-900/20">
                    <div className="text-center mb-8">
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
                        >Welcome Back</motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-neutral-400 mt-2"
                        >Sign in to continue your journey.</motion.p>
                    </div>
                    <AnimatePresence mode="wait">
                        {usePhoneSignIn ? (
                            <PhoneSignInForm
                                onSwitchToEmailSignIn={() => setUsePhoneSignIn(false)}
                            />
                        ) : (
                            <EmailSignInForm
                                onSwitchToPhoneSignIn={() => setUsePhoneSignIn(true)}
                            />
                        )}
                    </AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-sm text-neutral-400">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">Sign Up</Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default SignInPage;