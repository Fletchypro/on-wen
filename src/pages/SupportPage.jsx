import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Helmet } from 'react-helmet';
    import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
    import { Button } from '@/components/ui/button';
    import { Textarea } from '@/components/ui/textarea';
    import { useToast } from "@/components/ui/use-toast";
    import { LifeBuoy, Mail } from 'lucide-react';
    import InfoPageLayout from './InfoPageLayout';

    const faqItems = [
      {
        question: "What is Wen for?",
        answer: "Wen helps you see your calendar in a more visual way—using images instead of plain text. It's also designed to make planning trips with friends easier, with built-in group chat and tools to organize flights, hotels, and rental cars."
      },
      {
        question: "Does it cost anything?",
        answer: "Nope! Wen is completely free to use—no hidden fees."
      },
      {
        question: "How do I add a new event?",
        answer: "To add a new event, simply click the '+' button in the navigation bar. Fill in the event details, add an image if you like, and click 'Save'. Your event will instantly appear on your timeline."
      },
      {
        question: "Can I share events with friends?",
        answer: "Yes! When creating or editing an event, you can invite friends from your friend list. They will receive an invitation and, once accepted, the event will appear on their calendar as well."
      },
      {
        question: "Can everyone see my calendar?",
        answer: "Not at all! Even if you make events public, only your friends can view them. You can also create fully private events that are visible to you alone."
      },
      {
        question: "Is my data secure?",
        answer: "Absolutely. We take your privacy and data security very seriously. All your data is securely stored and encrypted. You can read more in our privacy policy."
      }
    ];

    const SupportPage = () => {
      const [message, setMessage] = useState('');
      const { toast } = useToast();

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) {
          toast({
            variant: "destructive",
            title: "Empty Message",
            description: "Please write a message before sending.",
          });
          return;
        }
        window.location.href = `mailto:support@onwen.com?subject=Support Request&body=${encodeURIComponent(message)}`;
        toast({
            title: "Redirecting to Email",
            description: "Opening your default email client to send your message.",
        });
      };

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
          pageTitle="Support Center"
          pageDescription="We're here to help. Find answers to your questions below."
          icon={LifeBuoy}
        >
          <Helmet>
            <title>Support Center - Wen</title>
            <meta name="description" content="Find answers to common questions and get help with Wen." />
          </Helmet>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              custom={0.2}
              className="lg:col-span-3 p-6 sm:p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"
            >
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left text-lg hover:no-underline focus:text-purple-300">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/70 text-base leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>

            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              custom={0.4}
              className="lg:col-span-2 p-6 sm:p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 h-fit"
            >
              <h2 className="text-2xl font-bold mb-2">Need More Help?</h2>
              <p className="text-white/70 mb-6">Send us a message and we’ll get back to you soon. Or email us at <a href="mailto:support@onwen.com" className="underline hover:text-purple-300 transition-colors">support@onwen.com</a>.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="bg-black/20 border-white/20 focus:ring-purple-500 focus:border-purple-500"
                />
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg group transition-all duration-300">
                  Send Message <Mail className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </motion.div>
          </div>
        </InfoPageLayout>
      );
    };

    export default SupportPage;