import React from 'react';
    import InfoPageLayout from '@/pages/InfoPageLayout';
    import { ShieldCheck } from 'lucide-react';
    import { Helmet } from 'react-helmet';

    const PrivacyPage = () => {
      const Section = ({ title, children }) => (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-sky-200">{title}</h2>
          <div className="space-y-4">{children}</div>
        </section>
      );

      return (
        <InfoPageLayout
          pageTitle="Privacy Policy"
          icon={ShieldCheck}
        >
          <Helmet>
            <title>Privacy Policy - Wen</title>
            <meta name="description" content="Read our privacy policy to understand how we collect, use, and protect your data at Wen." />
          </Helmet>
          <div className="text-lg text-gray-300 text-left">
            <div className="text-sm mb-6">
              <p><strong>Effective Date:</strong> 6/23/2025</p>
              <p><strong>Last Updated:</strong> 7/19/2025</p>
            </div>
            <p>
              At Wen, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our app or website.
            </p>

            <Section title="1. Information We Collect">
              <p><strong>Personal Information You Provide:</strong></p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Name</li>
                <li>Email address</li>
                <li>Profile photo (if added)</li>
                <li>Birthday (optional)</li>
                <li>Calendar events and any data you choose to input</li>
              </ul>
              <p><strong>Automatically Collected Information:</strong></p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Device information (model, OS, language)</li>
                <li>Usage data (app interactions, crash logs)</li>
                <li>IP address</li>
                <li>Cookies (on web app only)</li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use your data to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Create and manage your account</li>
                <li>Display calendar events and images</li>
                <li>Send notifications and reminders</li>
                <li>Personalize your experience (e.g., themes, preferences)</li>
                <li>Improve app performance and fix bugs</li>
                <li>Respond to support requests</li>
              </ul>
              <p>We do not sell or share your personal data with third parties for advertising.</p>
            </Section>

            <Section title="3. How We Protect Your Information">
              <p>We use industry-standard security measures including:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>HTTPS encryption</li>
                <li>Secure database storage</li>
                <li>Role-based access controls</li>
              </ul>
              <p>Despite our efforts, no system is 100% secure. You use Wen at your own risk.</p>
            </Section>

            <Section title="4. Third-Party Services">
              <p>We may use the following services, each with their own privacy policies:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Supabase (database & auth)</li>
                <li>Google Firebase / Analytics (usage stats)</li>
                <li>Email providers (for account communication)</li>
              </ul>
              <p>These providers only access the data necessary to perform their functions.</p>
            </Section>

            <Section title="5. Data Retention">
              <p>We retain your data as long as your account is active. You can delete your account at any time in settings, which will permanently erase your data from our servers.</p>
            </Section>

            <Section title="6. Your Rights">
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Withdraw consent for certain uses</li>
              </ul>
              <p>To make any of these requests, email us at <a href="mailto:support@wen.com">support@wen.com</a>.</p>
            </Section>

            <Section title="7. Children’s Privacy">
              <p>Wen is not intended for children under 13. We do not knowingly collect personal data from children.</p>
            </Section>
            
            <Section title="8. Changes to This Policy">
              <p>We may update this Privacy Policy periodically. We’ll notify you of major changes via email or in-app notice.</p>
            </Section>

            <Section title="9. Contact Us">
              <p>If you have questions about this Privacy Policy, contact us at:<br/>
                <a href="mailto:support@wen.com">📧 support@wen.com</a>
              </p>
            </Section>
          </div>
        </InfoPageLayout>
      );
    };

    export default PrivacyPage;