import React from 'react';
    import { motion } from 'framer-motion';
    import { Helmet } from 'react-helmet';
    import { Eye, Bell, BarChart, Lock, Users, Plane, Palette, Target, Sparkles } from 'lucide-react';
    import InfoPageLayout from './InfoPageLayout';

    const FeatureCard = ({ icon, title, text, delay }) => (
      <motion.div 
        className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-start space-x-4 h-full transition-all duration-300 hover:bg-white/10 hover:border-white/20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay }}
      >
        <div className="text-sky-300 mt-1 flex-shrink-0">{icon}</div>
        <div>
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <p className="text-white/70 mt-1">{text}</p>
        </div>
      </motion.div>
    );

    const AboutPage = () => {
      const features = [
        { icon: <Eye size={24} />, title: "Visualize Your Schedule", text: "Add images to events so your calendar feels more personal and memorable." },
        { icon: <Bell size={24} />, title: "Stay Notified", text: "Get smart reminders for upcoming plans so you never miss a moment." },
        { icon: <BarChart size={24} />, title: "Boost Your Productivity", text: "Keep your day organized and focused with a visual timeline that’s easy to scan at a glance." },
        { icon: <Lock size={24} />, title: "Control Your Privacy", text: "Create public or private events—share only what you want, with who you choose." },
        { icon: <Users size={24} />, title: "Plan with Friends", text: "Coordinate group trips, events, and hangouts using built-in group messaging." },
        { icon: <Plane size={24} />, title: "Book Travel Easily", text: "Track which friends have already booked flights, hotels, and car rentals all within the app." },
        { icon: <Palette size={24} />, title: "Customize Your Experience", text: "Pick from unique color themes and make Wen feel like home." }
      ];

      const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (delay = 0) => ({
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay }
        })
      };

      return (
        <InfoPageLayout
          pageTitle="About Wen"
          pageDescription="Plan Smarter. Live Visually."
          icon={Sparkles}
        >
          <Helmet>
            <title>About Wen</title>
            <meta name="description" content="Learn about the mission and features of Wen - the visual calendar app designed to make planning smarter and life more visual." />
          </Helmet>
          <div className="space-y-16">
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0.2}
              className="text-lg text-gray-300 space-y-4 text-center max-w-4xl mx-auto"
            >
              <p>At Wen, we believe your calendar should be more than just a list of dates—it should reflect your life. Whether you're planning a weekend trip, organizing a birthday party, or simply managing your day-to-day, Wen makes it easier and more enjoyable to stay on track.</p>
              <p>We’ve designed Wen to bring your plans to life using photos, colors, and clean design—so your schedule feels less like a chore and more like a visual timeline of the things you care about.</p>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              custom={0.3}
              className="p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Why We Built Wen</h2>
              <p className="text-lg text-gray-300 text-center mx-auto max-w-4xl">
                Traditional calendar apps are functional—but they lack personality. We wanted something better. Wen blends beauty with utility, giving you tools to collaborate with friends, plan events together, and keep everything in one place.
              </p>
            </motion.section>
            
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={0.4}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">What You Can Do with Wen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <FeatureCard key={index} {...feature} delay={index * 0.1} />
                ))}
              </div>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              custom={0.5}
              className="p-8 bg-gradient-to-r from-sky-500/10 to-cyan-500/8 rounded-2xl backdrop-blur-sm border border-white/10 text-center"
            >
              <Target className="w-12 h-12 mx-auto mb-4 text-sky-200" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-gray-200 mx-auto max-w-4xl">
                To make planning feel effortless, personal, and visually inspiring. We believe that organizing your life shouldn’t feel like work—it should feel like you. Wen transforms traditional scheduling into a visual experience, helping you stay on track, reduce stress, and enjoy every step of the journey.
              </p>
            </motion.section>
          </div>
        </InfoPageLayout>
      );
    };

    export default AboutPage;