import React from 'react';
    import { Link } from 'react-router-dom';
    import InfoPageLayout from '@/pages/InfoPageLayout';
    import { FileSpreadsheet } from 'lucide-react';
    import { Helmet } from 'react-helmet';

    const LegalPage = () => {
      const Section = ({ title, children }) => (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-sky-200">{title}</h2>
          <div className="space-y-4">{children}</div>
        </section>
      );

      const InfoItem = ({ label, value, isLink = false, href = '#' }) => (
        <div className="flex flex-col sm:flex-row sm:items-center">
          <p className="w-full sm:w-1/4 font-semibold">{label}:</p>
          {isLink ? (
            <a href={href} className="w-full sm:w-3/4 text-sky-300 hover:underline">{value}</a>
          ) : (
            <p className="w-full sm:w-3/4">{value}</p>
          )}
        </div>
      );

      return (
        <InfoPageLayout
          pageTitle="Legal Information"
          icon={FileSpreadsheet}
        >
          <Helmet>
            <title>Legal Information - Wen</title>
            <meta name="description" content="View legal information, compliance details, and copyrights for the Wen app." />
          </Helmet>
          <div className="text-lg text-gray-300 text-left">
            <div className="mb-8 space-y-2">
              <InfoItem label="App Name" value="Wen" />
              <InfoItem label="Developer" value="Wen" />
              <InfoItem label="Email" value="support@wen.com" isLink href="mailto:support@wen.com" />
              <InfoItem label="Website" value="https://onwen.com" isLink href="https://onwen.com" />
            </div>

            <Section title="📄 Legal Documents">
              <ul className="list-disc pl-5 space-y-2">
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service">Terms of Service</Link></li>
                <li><Link to="/support">Support & Contact</Link></li>
              </ul>
            </Section>

            <Section title="📱 App Store & Google Play Compliance">
              <p>Wen complies with App Store and Google Play developer policies. We do not collect sensitive personal data without user consent. All data collected is securely stored and used solely for the purpose of enhancing user experience.</p>
            </Section>
            
            <Section title="🛡️ Copyright & Ownership">
              <p>All content, branding, designs, and functionality within the Wen app are © Wen. Unauthorized use or reproduction is strictly prohibited.</p>
            </Section>

            <Section title="🔄 App Version">
              <div className='space-y-2'>
                <InfoItem label="Current App Version" value="v1.0.0" />
                <InfoItem label="Release Date" value="7/15/2025" />
              </div>
            </Section>
            
            <Section title="🗑️ Account Deletion">
                <p>To delete your Wen account or request removal of personal data, please contact us via <a href="mailto:support@onwen.com">support@onwen.com</a> or visit the <Link to="/support">Support Page</Link>.</p>
            </Section>
          </div>
        </InfoPageLayout>
      );
    };

    export default LegalPage;