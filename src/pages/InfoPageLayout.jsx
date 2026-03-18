import React from 'react';
    import { motion } from 'framer-motion';
    import Footer from '@/components/Footer';
    import InfoPageHeader from '@/components/InfoPageHeader';
    import { useAuth } from '@/contexts/SupabaseAuthContext';

    const InfoPageLayout = ({ children, pageTitle, pageDescription, icon: Icon }) => {
      const { user } = useAuth();

      return (
        <div className="flex flex-col h-full text-white immersive-bg">
          {!user && <InfoPageHeader />}
          <motion.main
            className="flex-grow w-full px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 md:pt-32 pb-24 sm:pb-16 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12 sm:mb-16">
              {Icon && <Icon className="w-16 h-16 mx-auto mb-6 text-sky-300" />}
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                {pageTitle}
              </h1>
              {pageDescription && (
                <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300">
                  {pageDescription}
                </p>
              )}
            </div>
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </motion.main>
          <Footer />
        </div>
      );
    };

    export default InfoPageLayout;