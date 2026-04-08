import PageLayout from "@/components/landing/page-layout";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2
        className="text-xl font-semibold text-white mb-4"
        style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
      >
        {title}
      </h2>
      <div className="text-slate-400 leading-relaxed space-y-3 text-sm">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <PageLayout>
      <section className="relative overflow-hidden py-16" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Privacy Policy
          </h1>
          <p className="text-slate-400">Last updated: 1 April 2026</p>
        </div>
      </section>

      <section className="py-16 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 lg:p-10">
            <Section title="1. Introduction">
              <p>
                ISOComply Ltd (&ldquo;ISOComply&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share information about you when you use our platform at <strong className="text-slate-300">app.isocomply.io</strong> and associated services (together, the &ldquo;Service&rdquo;).
              </p>
              <p>
                ISOComply Ltd is registered in England and Wales (company number 14123456), with a registered address at 20 Finsbury Street, London, EC2Y 9AQ. We are the data controller for personal data processed in connection with your use of the Service.
              </p>
            </Section>

            <Section title="2. Data We Collect">
              <p>We collect the following categories of personal data:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-slate-300">Account data:</strong> Name, email address, job title, company name, and password (hashed).</li>
                <li><strong className="text-slate-300">Usage data:</strong> Pages visited, features used, login timestamps, and browser/device information.</li>
                <li><strong className="text-slate-300">Compliance data:</strong> Documents, policies, and evidence files you upload as part of your compliance programme.</li>
                <li><strong className="text-slate-300">Payment data:</strong> Billing address and last four digits of payment card (full card data is processed by Stripe and never stored by us).</li>
                <li><strong className="text-slate-300">Communications:</strong> Emails, support tickets, and survey responses you send to us.</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Data">
              <p>We use your data to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Provide, operate, and improve the Service</li>
                <li>Process your subscription payments</li>
                <li>Send transactional emails (account confirmations, evidence expiry reminders)</li>
                <li>Provide customer support</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with our legal obligations</li>
                <li>Send product update emails (you may opt out at any time)</li>
              </ul>
            </Section>

            <Section title="4. Legal Basis for Processing (GDPR)">
              <p>Our legal bases for processing your personal data are:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-slate-300">Contract:</strong> Processing necessary to provide the Service under our Terms of Service.</li>
                <li><strong className="text-slate-300">Legitimate interests:</strong> Service improvement, security, fraud prevention.</li>
                <li><strong className="text-slate-300">Legal obligation:</strong> Compliance with UK law and regulatory requirements.</li>
                <li><strong className="text-slate-300">Consent:</strong> Marketing emails (which you may withdraw at any time).</li>
              </ul>
            </Section>

            <Section title="5. Data Storage and Retention">
              <p>
                All data is stored on servers located in the United Kingdom (AWS eu-west-2, London). We retain account data for the duration of your subscription plus 90 days after cancellation, after which it is permanently deleted. You may request deletion at any time.
              </p>
              <p>
                Compliance documents you upload are retained for as long as your account is active. Upon account closure, you have 30 days to export your data before it is permanently deleted.
              </p>
            </Section>

            <Section title="6. Data Sharing">
              <p>We share your data with the following categories of third parties:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-slate-300">Infrastructure:</strong> Amazon Web Services (UK region)</li>
                <li><strong className="text-slate-300">Payments:</strong> Stripe (PCI-DSS Level 1 certified)</li>
                <li><strong className="text-slate-300">Email:</strong> Postmark (transactional email)</li>
                <li><strong className="text-slate-300">Analytics:</strong> Posthog (self-hosted, EU region)</li>
                <li><strong className="text-slate-300">Support:</strong> Intercom</li>
              </ul>
              <p>We do not sell your personal data to third parties.</p>
            </Section>

            <Section title="7. Your Rights (GDPR)">
              <p>Under UK GDPR, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-slate-300">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-slate-300">Rectification:</strong> Correct inaccurate data</li>
                <li><strong className="text-slate-300">Erasure:</strong> Request deletion of your data (&ldquo;right to be forgotten&rdquo;)</li>
                <li><strong className="text-slate-300">Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong className="text-slate-300">Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong className="text-slate-300">Restriction:</strong> Request we restrict processing</li>
              </ul>
              <p>
                To exercise your rights, email <a href="mailto:privacy@isocomply.io" className="text-blue-400 hover:text-blue-300">privacy@isocomply.io</a>. We will respond within 72 hours.
              </p>
            </Section>

            <Section title="8. Cookies">
              <p>
                We use essential cookies for authentication, functional cookies for preferences, and optional analytics cookies. See our <a href="/cookies" className="text-blue-400 hover:text-blue-300">Cookie Policy</a> for full details.
              </p>
            </Section>

            <Section title="9. Contact">
              <p>
                For privacy enquiries, contact our Data Protection Officer at:{" "}
                <a href="mailto:privacy@isocomply.io" className="text-blue-400 hover:text-blue-300">
                  privacy@isocomply.io
                </a>
              </p>
              <p>
                You also have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO) at <a href="https://ico.org.uk" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
              </p>
            </Section>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
