import React from 'react';
    import InfoPageLayout from '@/pages/InfoPageLayout';
    import { FileText } from 'lucide-react';
    import { Link } from 'react-router-dom';
    import { Helmet } from 'react-helmet';

    const TermsOfServicePage = () => {
      const Section = ({ title, children }) => (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-sky-200">{title}</h2>
          <div className="space-y-4">{children}</div>
        </section>
      );

      return (
        <InfoPageLayout
          pageTitle="Terms & Conditions"
          icon={FileText}
        >
          <Helmet>
            <title>Terms & Conditions - Wen</title>
            <meta name="description" content="Read the terms and conditions for using the Wen application." />
          </Helmet>
          <div className="text-lg text-gray-300 text-left">
            <div className="text-sm mb-6">
              <p><strong>Effective Date:</strong> 6/17/2025</p>
              <p><strong>Last Updated:</strong> 7/10/2025</p>
            </div>
            <p>
              These Terms of Use (“Terms”) govern your use of Wen (“we,” “our,” “the app,” or “Wen”). By accessing or using Wen, you agree to be bound by these Terms. If you do not agree, do not use the app.
            </p>

            <Section title="1. Use of the App">
              <p>You may use Wen only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use the app in any way that violates any laws</li>
                <li>Upload or post offensive, abusive, or false content</li>
                <li>Attempt to hack, reverse-engineer, or disrupt the app</li>
              </ul>
            </Section>

            <Section title="2. User Accounts">
              <p>To access certain features, you must create an account. You agree to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide accurate information</li>
                <li>Keep your login credentials secure</li>
                <li>Be responsible for activity under your account</li>
              </ul>
              <p>We reserve the right to suspend or terminate your account for violation of these Terms.</p>
            </Section>

            <Section title="3. User Content">
              <p>You retain ownership of any content (like calendar events or images) you upload. However, by uploading, you grant Wen a limited license to store and display your content for use within the app.</p>
              <p>You are responsible for any content you create and share.</p>
            </Section>
            
            <Section title="4. Privacy">
                <p>Your use of Wen is also governed by our <Link to="/privacy">Privacy Policy</Link>, which explains how we collect and use your data.</p>
            </Section>

            <Section title="5. Intellectual Property">
              <p>Wen, including the name, logo, app design, and original content, is our property and protected by copyright and trademark laws.</p>
              <p>You may not use our branding or designs without permission.</p>
            </Section>
            
            <Section title="6. Disclaimer of Warranties">
              <p>Wen is provided “as-is” without warranties of any kind. We do not guarantee that the app will be error-free, uninterrupted, or secure.</p>
              <p>You use the app at your own risk.</p>
            </Section>
            
            <Section title="7. Limitation of Liability">
                <p>To the maximum extent permitted by law, Wen is not liable for any indirect, incidental, or consequential damages resulting from your use of the app.</p>
            </Section>
            
            <Section title="8. Modifications">
                <p>We may update these Terms occasionally. If we make significant changes, we’ll notify you via email or in-app notice. Continued use after updates means you accept the revised terms.</p>
            </Section>

            <Section title="9. Governing Law">
                <p>These Terms are governed by the laws of the State of [Insert State] without regard to conflict of laws principles.</p>
            </Section>
            
            <Section title="10. Contact Us">
                <p>If you have questions about these Terms, contact us at:<br/>
                    <a href="mailto:support@wen.com">📧 support@wen.com</a>
                </p>
            </Section>

          </div>
        </InfoPageLayout>
      );
    };

    export default TermsOfServicePage;