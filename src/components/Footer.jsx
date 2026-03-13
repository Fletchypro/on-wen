import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Share2 } from 'lucide-react';

const Footer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const homeLink = user ? '/dashboard' : '/';
  const isShareApiSupported = typeof navigator.share !== 'undefined';

  const handleShare = async (e) => {
    e.preventDefault();
    const shareData = {
      title: 'Check out Wen!',
      text: 'I\'m using Wen to organize my life visually. You should try it!',
      url: window.location.origin,
    };

    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
          toast({
          title: "Sharing failed",
          description: "Could not open the share dialog. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    // Task 1: Fix CLS issues
    // - Explicit width: 100%
    // - min-height: 120px
    // - contain: layout paint style
    // - will-change: contents
    <footer 
        className="relative z-50 text-center p-8 mt-16 sm:mt-24 text-gray-400 border-t border-white/10 w-full min-h-[120px] will-change-contents"
        style={{ contain: 'layout paint style' }}
    >
      <p>&copy; {new Date().getFullYear()} Wen. All rights reserved.</p>
      <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 mt-2">
        <Link to={homeLink} className="hover:text-white underline cursor-pointer">Home</Link>
        <Link to="/about" className="hover:text-white underline cursor-pointer">About</Link>
        <Link to="/support" className="hover:text-white underline cursor-pointer">Support</Link>
        <Link to="/feedback" className="hover:text-white underline cursor-pointer">Feedback</Link>
        {isShareApiSupported && (
          <a href="#" onClick={handleShare} className="hover:text-white underline inline-flex items-center cursor-pointer">
            <Share2 className="w-3 h-3 mr-1" /> Share App
          </a>
        )}
        <Link to="/legal" className="hover:text-white underline cursor-pointer">Legal</Link>
        <Link to="/community-guidelines" className="hover:text-white underline cursor-pointer">Community Guidelines</Link>
        <Link to="/security" className="hover:text-white underline cursor-pointer">Security</Link>
        <Link to="/privacy" className="hover:text-white underline cursor-pointer">Privacy Policy</Link>
        <Link to="/terms-of-service" className="hover:text-white underline cursor-pointer">Terms & Conditions</Link>
        <Link to="/delete-my-account" className="hover:text-white underline cursor-pointer">Delete Account</Link>
        {!user && (
          <>
            <Link to="/login" className="hover:text-white underline cursor-pointer">Login</Link>
            <Link to="/signup" className="hover:text-white underline cursor-pointer">Get Started</Link>
          </>
        )}
      </div>
    </footer>
  );
};

export default Footer;