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

export default function TermsPage() {
  return (
    <PageLayout>
      <section className="relative overflow-hidden py-16" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Terms of Service
          </h1>
          <p className="text-slate-400">Last updated: 1 April 2026</p>
        </div>
      </section>

      <section className="py-16 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 lg:p-10">
            <Section title="1. Acceptance of Terms">
              <p>
                By accessing or using the ISOComply platform (&ldquo;Service&rdquo;), operated by ISOComply Ltd (company number 14123456, registered in England and Wales), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you are using the Service on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms.
              </p>
              <p>
                These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </Section>

            <Section title="2. Description of Service">
              <p>
                ISOComply provides a software-as-a-service platform for ISO standards compliance management, including gap analysis, evidence management, audit report generation, and team collaboration tools. The Service is provided on a subscription basis.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice. We will not be liable for any modification, suspension, or discontinuation.
              </p>
            </Section>

            <Section title="3. User Accounts">
              <p>
                You must create an account to use the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately at <a href="mailto:security@isocomply.io" className="text-blue-400 hover:text-blue-300">security@isocomply.io</a> of any unauthorised use of your account.
              </p>
              <p>
                You may not share your account credentials with any third party. Enterprise accounts may have multiple named users under a single subscription as specified in your plan.
              </p>
            </Section>

            <Section title="4. Acceptable Use">
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Use the Service for any unlawful purpose or in violation of any regulations</li>
                <li>Upload content that infringes third-party intellectual property rights</li>
                <li>Attempt to gain unauthorised access to any part of the Service or its related systems</li>
                <li>Use automated means to scrape, crawl, or extract data from the Service</li>
                <li>Interfere with or disrupt the integrity or performance of the Service</li>
                <li>Upload malicious code, viruses, or harmful files</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
              </ul>
            </Section>

            <Section title="5. Payment and Subscription">
              <p>
                All paid plans require a minimum of 5 users. Fees are exclusive of GST (or applicable local tax), which will be added at the applicable rate. Payment is processed by Stripe. By providing payment details, you authorise us to charge your payment method on each billing period.
              </p>
              <p>
                <strong className="text-slate-200">Monthly Plans.</strong>{" "}
                Monthly subscriptions are billed on a recurring monthly basis. Cancellation takes effect at the end of the current monthly billing period with no further charges.
              </p>
              <p>
                <strong className="text-slate-200">Annual Plans — 12-Month Commitment, Billed Monthly.</strong>{" "}
                When you select an annual plan, you enter into a binding 12-month subscription commitment. Annual plans are billed monthly at the discounted annual rate — they are <em>not</em> billed upfront. However, the full 12-month term is a contractual commitment: if you cancel or downgrade before the end of the 12-month period, you remain liable for all monthly payments due for the remainder of that term. Early cancellation does not release you from payment obligations for the remaining months.
              </p>
              <p>
                <strong className="text-slate-200">Auto-Renewal.</strong>{" "}
                Annual subscriptions automatically renew for a further 12-month term at the end of each period. To prevent renewal, you must submit a written cancellation notice at least 30 days before the renewal date to{" "}
                <a href="mailto:billing@isocomply.io" className="text-blue-400 hover:text-blue-300">billing@isocomply.io</a>.
                If no cancellation is received by that deadline, the plan renews and you commit to a new 12-month term.
              </p>
              <p>
                We reserve the right to change pricing with 30 days&apos; written notice. If you do not cancel before the new pricing takes effect on renewal, you will be charged at the updated rate.
              </p>
            </Section>

            <Section title="5A. Customer Data & Privacy">
              <p>
                <strong className="text-slate-200">Your data belongs to you.</strong>{" "}
                All compliance data, documents, evidence, and information you upload to ISOComply (&ldquo;Customer Data&rdquo;) remains your exclusive property at all times. We claim no rights of ownership over Customer Data.
              </p>
              <p>
                <strong className="text-slate-200">No access by ISOComply personnel.</strong>{" "}
                ISOComply employees, contractors, and internal staff accounts — including those of founders, directors, and administrators — are strictly prohibited from accessing, viewing, exporting, or processing Customer Data without explicit, written authorisation from an authorised representative of your organisation. Access controls are enforced at the platform level to give effect to this restriction.
              </p>
              <p>
                <strong className="text-slate-200">Test and demonstration accounts.</strong>{" "}
                Any accounts used internally by ISOComply for testing, quality assurance, or product demonstrations are isolated environments seeded exclusively with synthetically generated dummy data. These accounts are technically prevented from interacting with, or accessing, any production Customer Data.
              </p>
              <p>
                <strong className="text-slate-200">Limited processing.</strong>{" "}
                We process Customer Data solely for the purpose of providing the Service as described in our{" "}
                <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>. We do not sell, share, or otherwise commercialise Customer Data for any purpose.
              </p>
              <p>
                <strong className="text-slate-200">Security measures.</strong>{" "}
                Customer Data is encrypted at rest (AES-256) and in transit (TLS 1.3 or higher). Access to production systems is governed by role-based access controls, least-privilege principles, and mandatory multi-factor authentication for all personnel with infrastructure access.
              </p>
              <p>
                For a complete description of our data handling practices, please refer to our{" "}
                <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>{" "}
                and{" "}
                <a href="/dpa" className="text-blue-400 hover:text-blue-300">Data Processing Agreement</a>.
              </p>
            </Section>

            <Section title="6. Intellectual Property">
              <p>
                The Service, including all software, content, and trademarks, is owned by ISOComply Ltd and protected by applicable intellectual property laws. You are granted a limited, non-exclusive, non-transferable licence to use the Service for your internal business purposes during your subscription.
              </p>
              <p>
                You retain ownership of all content you upload to the Service. By uploading content, you grant us a limited licence to store and process that content solely to provide the Service.
              </p>
            </Section>

            <Section title="7. Termination">
              <p>
                Either party may terminate these Terms at any time. Upon termination, your right to access the Service ceases immediately. We will retain your data for 30 days following termination to allow export, after which it will be permanently deleted.
              </p>
              <p>
                We may suspend or terminate your account immediately if you breach these Terms, fail to pay fees, or if required by law.
              </p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, ISOCOMPLY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA.
              </p>
              <p>
                Our total aggregate liability to you for any claims arising from these Terms or your use of the Service shall not exceed the total fees paid by you in the 12 months preceding the claim.
              </p>
            </Section>

            <Section title="9. Contact">
              <p>
                For any questions regarding these Terms, contact us at:{" "}
                <a href="mailto:legal@isocomply.io" className="text-blue-400 hover:text-blue-300">
                  legal@isocomply.io
                </a>
              </p>
            </Section>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
