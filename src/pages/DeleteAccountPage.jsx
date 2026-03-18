import React from 'react';
    import InfoPageLayout from '@/pages/InfoPageLayout';
    import { Trash2 } from 'lucide-react';
    import { Helmet } from 'react-helmet';

    const DeleteAccountPage = () => {
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
          pageTitle="Delete Your Account"
          icon={Trash2}
        >
          <Helmet>
            <title>Delete Account - Wen</title>
            <meta name="description" content="Learn how to permanently delete your Wen account and data." />
          </Helmet>
          <div className="text-lg text-gray-300 text-left">
            <p>
              We’re sorry to see you go — but we respect your decision. You have two ways to delete your Wen account:
            </p>

            <Section title="🔧 Option 1: Delete from Settings (Recommended)">
              <ol className="list-decimal pl-5 space-y-2">
                <li>Go to your Settings page inside the app</li>
                <li>Scroll to the Account section</li>
                <li>Tap Delete Account</li>
                <li>Confirm the action</li>
              </ol>
              <p>Your account and all associated data will be permanently removed.</p>
            </Section>
            
            <Section title="📧 Option 2: Email Us">
              <p>Prefer we handle it for you? No problem.</p>
              <p>Send a message from your registered email address to: <a href="mailto:support@wen.com">support@wen.com</a></p>
              <p>Please include:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Subject: Delete My Account</li>
                <li>Your username or email used in the app</li>
              </ul>
              <p>We’ll confirm the deletion and let you know once it’s complete.</p>
            </Section>
            
            <Section title="🔒 Your Data is Yours">
              <p>Deleting your account will:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Remove all event and calendar data</li>
                <li>Revoke access to your profile</li>
                <li>Permanently erase your user data from our system</li>
              </ul>
              <p>We do not retain your data once deletion is confirmed.</p>
            </Section>

            <p className="mt-8">Need help? Reach out anytime — we’re here for you.</p>
          </div>
        </InfoPageLayout>
      );
    };

    export default DeleteAccountPage;