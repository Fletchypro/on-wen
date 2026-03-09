import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Palette, Star, Users } from 'lucide-react';
import { Helmet } from 'react-helmet';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import Footer from '@/components/Footer';
import ImageOptimizer from '@/components/ImageOptimizer';
import HeroOptimized from '@/components/HeroOptimized'; // Task 1 & 2
import '@/styles/imageOptimization.css';

const LOGO_URL =
  'https://horizons-cdn.hostinger.com/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/a5774761e581c55174ac5541de4be98f.png';

const screenshots = [
  'https://storage.googleapis.com/hostinger-horizons-assets-prod/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/3931e97789bf46de0cc87a022e2942e9.png',
  'https://storage.googleapis.com/hostinger-horizons-assets-prod/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/f085a80910ffd8403b7c6a35fc727a28.png',
  'https://storage.googleapis.com/hostinger-horizons-assets-prod/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/8bf810870a7c079fa3b6917ad3e9b7af.png',
  'https://storage.googleapis.com/hostinger-horizons-assets-prod/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/9b271ab584e5c8fa81d876367e50e98f.png',
  'https://storage.googleapis.com/hostinger-horizons-assets-prod/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/6546ca87361d707b89f91bace59bc13f.png',
  'https://storage.googleapis.com/hostinger-horizons-assets-prod/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/0f02b0921b072fdc456f9ef6145c4532.png'
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

// Lazy components for non-critical sections
const FeatureCard = ({ icon, title, children }) => (
  <div className="glass p-6 flex flex-col items-start transform hover:-translate-y-2 transition-transform duration-300 rounded-2xl">
    <div className="p-3 bg-purple-500/20 rounded-full mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-300">{children}</p>
  </div>
);

const TestimonialCard = ({ quote, name, role, avatarSrc, avatarAlt }) => (
  <div className="glass p-6 text-left rounded-2xl">
    <div className="flex items-center mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-gray-200 mb-4 italic">"{quote}"</p>
    <div className="flex items-center">
      <div className="mr-4 w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <ImageOptimizer
            src={avatarSrc}
            alt={avatarAlt}
            width={48}
            height={48}
            className="w-full h-full"
            objectFit="cover"
          />
      </div>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-400">{role}</p>
      </div>
    </div>
  </div>
);

const HowItWorksStep = ({ number, title, description }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-purple-600/30 border-2 border-purple-500 rounded-full font-bold text-xl">
      {number}
    </div>
    <div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  </div>
);

const IphoneMockup = ({ src, alt, rotation, className }) => (
  <motion.div
    className={cn('relative w-[280px] h-[570px] transition-transform duration-300', className)}
    style={{ transform: `rotate(${rotation}deg)` }}
    whileHover={{ scale: 1.05, y: -10 }}
  >
    <div className="absolute inset-0 bg-white rounded-[44px] p-1 shadow-lg">
      <div className="w-full h-full bg-black rounded-[40px] p-2.5 overflow-hidden">
        <ImageOptimizer
            src={src}
            alt={alt}
            width={280}
            height={570}
            className="rounded-[32px]"
            objectFit="cover"
        />
      </div>
    </div>
    <div className="absolute inset-0 rounded-[44px] ring-1 ring-inset ring-white/10" />
  </motion.div>
);

const ScreenshotCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } });
  }, [currentSlide, controls]);

  return (
    <Carousel
      setApi={(api) => {
        if (!api) return;
        api.on('select', () => {
          controls.start({ opacity: 0, x: -20, transition: { duration: 0.2 } }).then(() => {
            setCurrentSlide(api.selectedScrollSnap());
          });
        });
      }}
      opts={{ align: 'start', loop: true }}
      className="w-full max-w-4xl"
    >
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, slideIndex) => (
          <CarouselItem key={slideIndex} className="basis-full">
            <motion.div
              className="flex justify-center items-center h-[600px] relative gap-4 sm:gap-0"
              initial={{ opacity: 0, x: 20 }}
              animate={controls}
            >
              <IphoneMockup
                src={screenshots[slideIndex * 2]}
                alt={`Screenshot ${slideIndex * 2 + 1}`}
                rotation={-3}
                className="z-10 sm:mr-[-100px]"
              />
              <IphoneMockup
                src={screenshots[slideIndex * 2 + 1]}
                alt={`Screenshot ${slideIndex * 2 + 2}`}
                rotation={3}
                className="hidden sm:block"
              />
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="text-white bg-black/30 hover:bg-white/20 border-white/20 backdrop-blur-sm hidden sm:flex" />
      <CarouselNext className="text-white bg-black/30 hover:bg-white/20 border-white/20 backdrop-blur-sm hidden sm:flex" />
    </Carousel>
  );
};

const LandingPage = () => {
  // Make this page its own scroll container
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  
  // Defer non-critical content loading
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={scrollRef} className="flex flex-col h-[100dvh] min-h-0 overflow-y-auto text-white">
      <Helmet>
        <title>Wen - Plan Smarter, Live Visually</title>
        <meta
          name="description"
          content="The beautiful, image-first calendar app designed for visual planners. Organize events, plan group trips, and see your life unfold in a vibrant timeline."
        />
        <meta property="og:image" content={LOGO_URL} />
      </Helmet>

      {/* Background/parallax - Deferred opacity for performance */}
      <div className="fixed inset-0 immersive-bg -z-10 will-change-transform">
        <motion.div className="immersive-bg-glow" style={{ y }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-20 h-20 flex justify-between items-center px-6 bg-black/20 backdrop-blur-lg border-b border-white/10 ios-safe-top">
        <Link to="/">
          <div className="relative w-24 sm:w-28 h-auto">
             <ImageOptimizer
                src={LOGO_URL}
                alt="Wen Logo"
                width={112}
                height={40}
                priority={true} // Critical image
                objectFit="contain"
                className="filter drop-shadow-lg"
             />
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

      {/* Content */}
      <main className="flex-1">
        {/* Synchronous Hero Render */}
        <HeroOptimized />

        {/* Deferred Content */}
        {isReady && (
          <Suspense fallback={<div className="h-96" />}>
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "200px" }}
              className="w-full mt-16 sm:mt-24"
            >
              <ScreenshotCarousel />
            </motion.section>

            <section
              id="features"
              className="container mx-auto px-4 py-24 sm:py-32 text-center"
            >
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">All The Tools You Need To Plan Visually</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard icon={<Calendar className="w-8 h-8 text-purple-400" />} title="Visual Event Timeline">
                  Ditch the boring text. Attach photos to your events and see your schedule come to life in a beautiful, scrollable
                  timeline.
                </FeatureCard>
                <FeatureCard icon={<Users className="w-8 h-8 text-purple-400" />} title="Group Trip Planning & Chat">
                  Coordinate plans with friends effortlessly. Share events, see who's attending, and use the integrated group chat to
                  finalize details.
                </FeatureCard>
                <FeatureCard icon={<Palette className="w-8 h-8 text-purple-400" />} title="Custom Themes & Notifications">
                  Make Wen yours with custom color themes. Stay on top of your schedule with smart, configurable notifications.
                </FeatureCard>
              </div>
            </section>

            <section
              id="how-it-works"
              className="container mx-auto px-4 py-24 sm:py-32 text-center"
            >
              <div className="grid grid-cols-1 gap-16 items-center justify-items-center">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Get Started in 3 Easy Steps</h2>
                  <div className="space-y-8">
                    <HowItWorksStep number="1" title="Create Events With Photos">
                      Add a new event and upload a cover image that captures the moment. It’s a calendar and a photo album in one.
                    </HowItWorksStep>
                    <HowItWorksStep number="2" title="Invite Friends & Collaborate">
                      Share your event with friends, family, or colleagues. They can RSVP and join the conversation in the event’s
                      group chat.
                    </HowItWorksStep>
                    <HowItWorksStep number="3" title="Organize & Enjoy">
                      Keep track of everything in your visual timeline. See who's attending, manage logistics, and get ready for your
                      next big thing.
                    </HowItWorksStep>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="testimonials"
              className="container mx-auto px-4 py-24 sm:py-32 text-center"
            >
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">Loved by Visual Planners Everywhere</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <TestimonialCard
                  quote="Coordinating team offsites used to be email chaos. Now we create events with photos, chat in-app, and everybody’s on the same page."
                  name="Jack F."
                  role="Marketing Manager"
                  avatarSrc="https://storage.googleapis.com/hostinger-horizons-assets-prod/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/432f6211e65032bbf130c4c7892e567c.png"
                  avatarAlt="Avatar of Jack F."
                />
                <TestimonialCard
                  quote="I love that Wen blends style with function. From booking flights to adding family photos, it keeps everything organized and beautiful."
                  name="Lisa J."
                  role="Lifestyle Blogger"
                  avatarSrc="https://storage.googleapis.com/hostinger-horizons-assets-prod/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/ac69299512ed3174b4b8a1e3c137b78c.png"
                  avatarAlt="Avatar of Lisa J."
                />
                <TestimonialCard
                  quote="I switched from my old calendar app to Wen last month, and the difference is night and day. Having a photo for each event jogs my memory instantly—no more scrambling to remember details."
                  name="Jordan L."
                  role="Freelance Photographer"
                  avatarSrc="https://horizons-cdn.hostinger.com/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/8ebd64def36f0cbaeadc0f1f0043c4ad.png"
                  avatarAlt="Avatar of Jordan L."
                />
              </div>
            </section>
          </Suspense>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;