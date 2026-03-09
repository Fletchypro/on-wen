import React from 'react';
    import InfoPageLayout from '@/pages/InfoPageLayout';
    import { ShieldCheck } from 'lucide-react';
    import { Helmet } from 'react-helmet';

    const CommunityGuidelinesPage = () => {
      const Section = ({ title, children }) => (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-300 flex items-center">
            {title}
          </h2>
          <div className="space-y-4">{children}</div>
        </section>
      );

      return (
        <InfoPageLayout
          pageTitle="Community Guidelines"
          icon={ShieldCheck}
        >
          <Helmet>
            <title>Community Guidelines - Wen</title>
            <meta name="description" content="Read our community guidelines to help keep Wen a safe and positive space for everyone." />
          </Helmet>
          <div className="text-lg text-gray-300 text-left">
            <p>
              Welcome to Wen — a place to share, plan, and connect. To keep our community safe, respectful, and enjoyable, please follow these guidelines:
            </p>

            <Section title="✅ Be Respectful">
              <ul className="list-disc pl-5 space-y-2">
                <li>Treat others with kindness, patience, and understanding.</li>
                <li>Avoid rude, aggressive, or hateful comments.</li>
                <li>Everyone is here to stay organized and have fun — let’s keep it positive.</li>
              </ul>
            </Section>
            
            <Section title="🚫 No Inappropriate Content">
              <ul className="list-disc pl-5 space-y-2">
                <li>Do not share or post offensive, graphic, or adult material.</li>
                <li>Avoid posting anything discriminatory, threatening, or abusive.</li>
              </ul>
            </Section>
            
            <Section title="📅 Use Events Honestly">
              <ul className="list-disc pl-5 space-y-2">
                <li>Don’t spam or create misleading/fake events.</li>
                <li>Use events to plan, not to promote scams or unrelated products.</li>
              </ul>
            </Section>
            
            <Section title="🔒 Respect Privacy">
              <ul className="list-disc pl-5 space-y-2">
                <li>Do not post personal information (yours or others’) publicly.</li>
                <li>Keep shared calendars and private events secure and intentional.</li>
              </ul>
            </Section>

            <Section title="⚖️ Follow the Law">
              <ul className="list-disc pl-5 space-y-2">
                <li>No illegal activity of any kind.</li>
                <li>If something is against the law, it’s against our guidelines too.</li>
              </ul>
            </Section>

            <Section title="🚨 Report Issues">
              <p>See something suspicious or harmful? <br/>Email us at <a href="mailto:support@wen.com">support@wen.com</a> — we take your safety seriously.</p>
            </Section>

            <Section title="💬 Final Word">
              <p>We may warn, suspend, or remove accounts that violate these rules. These guidelines help ensure Wen remains a friendly and useful space for everyone.</p>
              <p>Thanks for keeping Wen awesome.</p>
            </Section>
          </div>
        </InfoPageLayout>
      );
    };

    export default CommunityGuidelinesPage;