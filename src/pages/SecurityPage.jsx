import React from 'react';
    import InfoPageLayout from '@/pages/InfoPageLayout';
    import { ShieldAlert } from 'lucide-react';
    import { Helmet } from 'react-helmet';

    const SecurityPage = () => {
      const Section = ({ title, children }) => (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-sky-200 flex items-center">
            {title}
          </h2>
          <div className="space-y-4">{children}</div>
        </section>
      );

      return (
        <InfoPageLayout
          pageTitle="Security at Wen"
          icon={ShieldAlert}
        >
          <Helmet>
            <title>Security - Wen</title>
            <meta name="description" content="Learn about the security measures we take to protect your data and privacy at Wen." />
          </Helmet>
          <div className="text-lg text-gray-300 text-left">
            <p>
              Your trust means everything to us. At Wen, we take your data and security seriously. Here’s how we keep your experience safe:
            </p>

            <Section title="✅ Data Encryption">
              <p>All data transmitted between your device and our servers is encrypted using HTTPS (SSL/TLS), keeping your information private and protected from interception.</p>
            </Section>
            
            <Section title="🧑‍💻 Account Protection">
              <ul className="list-disc pl-5 space-y-2">
                <li>Passwords are securely hashed — we never store them in plain text.</li>
                <li>Two-step email verification is used to confirm your identity during sign-up and password resets.</li>
              </ul>
            </Section>
            
            <Section title="🗂️ User Data Control">
              <p>You have full control over your personal data:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Edit or delete your account anytime</li>
                <li>Manage visibility of your events and calendar items</li>
                <li>Customize privacy settings</li>
              </ul>
            </Section>
            
            <Section title="🔒 Secure Infrastructure">
              <p>Our platform is built on trusted infrastructure providers who implement strict physical and digital security measures. We regularly monitor and audit for vulnerabilities.</p>
            </Section>

            <Section title="🧠 Team Training & Policies">
              <p>All team members are trained in basic security hygiene and privacy practices. We apply internal policies to protect sensitive data and access.</p>
            </Section>

            <Section title="🛑 Reporting Issues">
              <p>If you discover a bug or security vulnerability, please report it immediately to <a href="mailto:support@wen.com">support@wen.com</a></p>
              <p>We take all reports seriously and respond promptly.</p>
            </Section>

            <Section title="📜 Staying Up to Date">
              <p>We’re committed to continuously improving our security. Any major changes to our system or practices will be disclosed in our Privacy Policy or via in-app notice.</p>
            </Section>
          </div>
        </InfoPageLayout>
      );
    };

    export default SecurityPage;