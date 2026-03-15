import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ShieldAlert, UserPlus, Eye, EyeOff } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhoneInput from 'react-phone-number-input/input';
import { Helmet } from 'react-helmet';
import { getPageTitle, getMetaDescription, getOGTags, getTwitterTags, getCanonicalURL } from '@/lib/seoHelpers';

const LOGO_URL = 'https://horizons-cdn.hostinger.com/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/d0404469f31c90a062889e665be85d0b.png';

const EmailSignUpForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const { signUp } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    
    const handleSignUp = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!firstName || !lastName || !username || !email || !password) {
            setError("Please fill in all fields.");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        const options = {
            data: { first_name: firstName, last_name: lastName, username }
        };

        try {
            const { data, error: signUpError } = await signUp(email, password, options);
            
            if (signUpError) {
                let errorMessage = signUpError.message;
                
                if (signUpError.code === 'weak_password' || 
                    errorMessage.toLowerCase().includes('weak password') || 
                    errorMessage.toLowerCase().includes('too common')) {
                    errorMessage = 'This password is too common or weak. Please use a stronger password with mixed case, numbers, and symbols.';
                }
                
                setError(errorMessage);
                setLoading(false);
            } else if (data.user) {
                toast({
                    title: 'Check your email!',
                    description: 'A 6-digit code has been sent to verify your account.',
                    className: 'bg-green-500 text-white',
                });
                navigate('/verify', { 
                    state: { 
                        email, 
                        type: 'email' 
                    }, 
                    replace: true 
                });
            } else {
                setError("An unexpected error occurred. Please try again.");
                setLoading(false);
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg flex items-start gap-3"
                >
                    <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                    <span className="text-sm">{error}</span>
                </motion.div>
            )}
            <div className="flex gap-4">
                <div className="space-y-2 w-1/2">
                    <Label className="text-white/80" htmlFor="firstName">First Name</Label>
                    <Input 
                        id="firstName" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        placeholder="John" 
                        required 
                        disabled={loading}
                    />
                </div>
                <div className="space-y-2 w-1/2">
                    <Label className="text-white/80" htmlFor="lastName">Last Name</Label>
                    <Input 
                        id="lastName" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        placeholder="Doe" 
                        required 
                        disabled={loading}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-white/80" htmlFor="username">Username</Label>
                <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))} 
                    placeholder="johndoe" 
                    required 
                    disabled={loading}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-white/80" htmlFor="email-signup">Email</Label>
                <Input 
                    id="email-signup" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="you@example.com" 
                    required 
                    disabled={loading}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-white/80" htmlFor="password-signup">Password</Label>
                <div className="relative">
                    <Input 
                        id="password-signup" 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required 
                        minLength={6}
                        disabled={loading}
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-white/50 hover:text-white"
                        disabled={loading}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <PasswordStrengthIndicator password={password} />
            </div>
            <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold flex items-center justify-center gap-2"
            >
                {loading ? 'Creating account…' : <><UserPlus size={18} /> Sign Up with Email</>}
            </Button>
        </form>
    );
};

const PhoneSignUpForm = () => {
    const [phone, setPhone] = useState('+1');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const { signUpWithPhone } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!firstName || !lastName || !username || !phone || !password) {
            setError("Please fill in all fields.");
            return;
        }
        
        setLoading(true);
        setError(null);
        
        const options = {
            data: { first_name: firstName, last_name: lastName, username }
        };

        try {
            const { data, error: signUpError } = await signUpWithPhone(phone, password, options);
            
            if (signUpError) {
                let errorMessage = signUpError.message;
                if (signUpError.code === 'weak_password' || 
                    errorMessage.toLowerCase().includes('weak password') || 
                    errorMessage.toLowerCase().includes('too common')) {
                    errorMessage = 'This password is too common or weak. Please use a stronger password with mixed case, numbers, and symbols.';
                }
                setError(errorMessage);
                setLoading(false);
            } else if (data.user) {
                toast({
                    title: 'Code Sent!',
                    description: 'A 6-digit code has been sent to your phone for verification.',
                    className: 'bg-blue-500 text-white',
                });
                navigate('/verify', { 
                    state: { 
                        phone, 
                        type: 'sms' 
                    }, 
                    replace: true 
                });
            } else {
                setError("Something went wrong during sign up. Please try again.");
                setLoading(false);
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg flex items-start gap-3"
                >
                    <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                    <span className="text-sm">{error}</span>
                </motion.div>
            )}
            <div className="flex gap-4">
                <div className="space-y-2 w-1/2">
                    <Label className="text-white/80" htmlFor="firstName-phone">First Name</Label>
                    <Input 
                        id="firstName-phone" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        placeholder="John" 
                        required 
                        disabled={loading}
                    />
                </div>
                <div className="space-y-2 w-1/2">
                    <Label className="text-white/80" htmlFor="lastName-phone">Last Name</Label>
                    <Input 
                        id="lastName-phone" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        placeholder="Doe" 
                        required 
                        disabled={loading}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-white/80" htmlFor="username-phone">Username</Label>
                <Input 
                    id="username-phone" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))} 
                    placeholder="johndoe" 
                    required 
                    disabled={loading}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-white/80" htmlFor="phone-signup">Phone Number</Label>
                <PhoneInput 
                    id="phone-signup" 
                    value={phone} 
                    onChange={setPhone} 
                    placeholder="Enter phone number" 
                    required 
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-white/10 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white" 
                />
            </div>
            <div className="space-y-2">
                <Label className="text-white/80" htmlFor="password-signup-phone">Password</Label>
                <div className="relative">
                    <Input 
                        id="password-signup-phone" 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required 
                        minLength={6}
                        disabled={loading}
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-white/50 hover:text-white"
                        disabled={loading}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <PasswordStrengthIndicator password={password} />
            </div>
            <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold flex items-center justify-center gap-2"
            >
                {loading ? 'Creating account…' : <><UserPlus size={18} /> Sign Up with Phone</>}
            </Button>
        </form>
    );
};

const SignUpPage = () => {
    const ogTags = getOGTags('signup');
    const twitterTags = getTwitterTags('signup');

    return (
        <>
            <Helmet>
                <title>{getPageTitle('signup')}</title>
                <meta name="description" content={getMetaDescription('signup')} />
                <link rel="canonical" href={getCanonicalURL('signup')} />
                
                {Object.entries(ogTags).map(([key, value]) => (
                    <meta key={key} property={key} content={value} />
                ))}
                
                {Object.entries(twitterTags).map(([key, value]) => (
                    <meta key={key} name={key} content={value} />
                ))}
            </Helmet>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5, ease: 'easeOut' }} 
                className="w-full max-w-md mx-auto py-4"
            >
                <div className="text-center mb-8">
                    <Link to="/">
                        <img src={LOGO_URL} alt="Wen Logo" className="w-48 mx-auto" />
                    </Link>
                </div>
                <div className="glass-strong p-6 md:p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-white">Create an Account</h1>
                        <p className="text-white/60 mt-2">Join Wen to start organizing your life.</p>
                    </div>
                    <Tabs defaultValue="email" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="email">Email</TabsTrigger>
                            <TabsTrigger value="phone">Phone</TabsTrigger>
                        </TabsList>
                        <TabsContent value="email" className="py-4">
                            <EmailSignUpForm />
                        </TabsContent>
                        <TabsContent value="phone" className="py-4">
                            <PhoneSignUpForm />
                        </TabsContent>
                    </Tabs>
                    <div className="text-center mt-6">
                        <span className="text-white/70">Already have an account? </span>
                        <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-colors">Sign in</Link>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default SignUpPage;