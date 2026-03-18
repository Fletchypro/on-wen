import React, { useState } from 'react';
    import InfoPageLayout from '@/pages/InfoPageLayout';
    import { MessageSquare } from 'lucide-react';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { Helmet } from 'react-helmet';

    const FeedbackPage = () => {
      const { toast } = useToast();
      const [name, setName] = useState('');
      const [email, setEmail] = useState('');
      const [message, setMessage] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !message) {
          toast({
            title: 'Fields Required',
            description: 'Please fill out the email and message fields before submitting.',
            variant: 'destructive',
          });
          return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
          toast({
            title: 'Feedback Sent!',
            description: "Thank you for your feedback. We've received your message.",
          });
          setName('');
          setEmail('');
          setMessage('');
          setIsSubmitting(false);
        }, 1000);
      };

      return (
        <InfoPageLayout
          pageTitle="We’d Love Your Feedback!"
          icon={MessageSquare}
        >
          <Helmet>
            <title>Feedback - Wen</title>
            <meta name="description" content="Share your feedback, suggestions, or bug reports to help us improve Wen." />
          </Helmet>
          <div className="text-lg text-gray-300 text-left">
            <p>
              At Wen, your voice helps shape the future of the app. Whether it’s a suggestion, a feature request, or something we could improve — we’re all ears.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-sky-200">
                🛠️ Tell Us What You Think
              </h2>
              <p>
                Use the form below to share:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Feature ideas</li>
                <li>Bugs or glitches</li>
                <li>Improvements to design, performance, or functionality</li>
                <li>Anything you think would make Wen better</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-sky-200">
                📬 Feedback Form
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">Your Name (optional)</label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="bg-gray-900/50 border-gray-700"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="bg-gray-900/50 border-gray-700"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your feedback, suggestions, or bug reports..."
                    required
                    rows={6}
                    className="bg-gray-900/50 border-gray-700"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-sky-600 hover:bg-sky-500">
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </Button>
              </form>
              <p className="text-center text-sm mt-4">
                All messages go directly to our product team at <a href="mailto:support@wen.com">support@wen.com</a>
              </p>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-4 text-sky-200">
                ✅ What Happens Next?
              </h2>
              <p>
                We review every submission and prioritize improvements based on community demand and overall impact. You may not get a direct reply, but your feedback is always appreciated and helps us evolve.
              </p>
            </section>
          </div>
        </InfoPageLayout>
      );
    };

    export default FeedbackPage;