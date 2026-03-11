import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';

const LOGO_URL = 'https://horizons-cdn.hostinger.com/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/5ef01cc123de0969e4fe4c81fd227bad.png';

const InfoPageHeader = () => {
  const { user } = useAuth();
  const homeLink = user ? '/dashboard' : '/';

  return (
    <header className="sticky top-0 left-0 right-0 z-20 h-16 sm:h-20 flex justify-between items-center px-4 sm:px-6 bg-black/20 backdrop-blur-lg border-b border-white/10 ios-safe-top">
      <Link to="/">
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-br from-purple-600 to-pink-500 opacity-20 blur-xl rounded-full" />
          <img src={LOGO_URL} alt="Wen Logo" className="relative w-24 sm:w-28 h-auto filter drop-shadow-lg" />
        </div>
      </Link>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Button asChild size="sm" variant="ghost" className="text-white hover:bg-white/10">
          <Link to="/login">Login</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold group hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-transform"
        >
          <Link to="/signup">Sign Up</Link>
        </Button>
      </div>
    </header>
  );
};

export default InfoPageHeader;