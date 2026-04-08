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

const subProcessors = [
  { name: "Amazon Web Services", purpose: "Cloud infrastructure and storage", location: "United Kingdom (eu-west-2)" },
  { name: "Stripe", purpose: "Payment processing", location: "United States / EU" },
  { name: "Postmark", purpose: "Transactional email delivery", location: "United States" },
  { name: "PostHog", purpose: "Product analytics", location: "EU (self-hosted)" },
  { name: "Intercom", purpose: "Customer support", location: "United States" },
];

export default function DpaPage() {
  return (
    <PageLayout>
      <section className="relative overflow-hidden py-16" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Data Processing Agreement
          </h1>
          <p className="text-slate-400">Last updated: 1 April 2026 · Version 2.1</p>
        </div>
      </section>

      <section className="py-16 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 lg:p-10">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 mb-10">
              <p className="text-sm text-blue-300">
                This Data Processing Agreement (&ldquo;DPA&rdquo;) forms part of the Terms of Service between ISOComply Ltd (&ldquo;Processor&rdquo;) and the customer (&ldquo;Controller&rdquo;). By using the ISOComply Service, you agree to this DPA. A countersigned copy is available upon request for enterprise customers.
              </p>
            </div>

            <Section title="1. Definitions">
              <p>
                In this DPA, terms such as &ldquo;personal data,&rdquo; &ldquo;processing,&rdquo; &ldquo;controller,&rdquo; &ldquo;processor,&rdquo; and &ldquo;data subject&rdquo; have the meanings given in the UK GDPR and EU GDPR (&ldquo;Data Protection Legislation&rdquo;). &ldquo;Customer Data&rdquo; means all personal data processed by ISOComply on behalf of the Controller in connection with the Service.
              </p>
            </Section>

            <Section title="2. Controller–Processor Relationship">
              <p>
                The parties acknowledge that with regard to the processing of Customer Data:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>The <strong className="text-slate-300">Customer</strong> is the data controller.</li>
                <li><strong className="text-slate-300">ISOComply Ltd</strong> is the data processor, acting only on documented instructions from the Controller.</li>
              </ul>
              <p>
                ISOComply shall not process Customer Data for any purpose other than providing the Service, and shall immediately inform the Controller if, in ISOComply&apos;s opinion, any instruction infringes Data Protection Legislation.
              </p>
            </Section>

            <Section title="3. Processing Details">
              <p>
                <strong className="text-slate-300">Subject matter:</strong> Provision of ISO compliance management software.
              </p>
              <p>
                <strong className="text-slate-300">Duration:</strong> For the term of the subscription agreement, plus 30 days for data export.
              </p>
              <p>
                <strong className="text-slate-300">Nature and purpose:</strong> Storage, organisation, and display of compliance documentation and user account data.
              </p>
              <p>
                <strong className="text-slate-300">Types of personal data:</strong> Employee names, job titles, email addresses, and any personal data included in compliance documents uploaded by the Controller.
              </p>
              <p>
                <strong className="text-slate-300">Categories of data subjects:</strong> Controller&apos;s employees, contractors, and other staff involved in the compliance programme.
              </p>
            </Section>

            <Section title="4. Security Measures">
              <p>
                ISOComply implements and maintains appropriate technical and organisational measures to protect Customer Data, including:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>AES-256 encryption at rest and TLS 1.3 in transit</li>
                <li>Multi-factor authentication for all staff with system access</li>
                <li>Role-based access controls with least-privilege principles</li>
                <li>Annual penetration testing by a CREST-accredited firm</li>
                <li>SOC 2 Type II certification, renewed annually</li>
                <li>Immutable audit logs for all data access events</li>
                <li>Formal incident response and breach notification procedures</li>
              </ul>
            </Section>

            <Section title="5. Sub-processors">
              <p>
                The Controller hereby provides general authorisation for ISOComply to engage the following sub-processors:
              </p>
              <div className="rounded-xl border border-slate-700/50 overflow-hidden mt-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-slate-700/50">
                      <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Sub-processor</th>
                      <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Purpose</th>
                      <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subProcessors.map((sp) => (
                      <tr key={sp.name} className="border-b border-slate-800/50 last:border-0">
                        <td className="px-4 py-2.5 text-slate-300 font-medium">{sp.name}</td>
                        <td className="px-4 py-2.5 text-slate-400">{sp.purpose}</td>
                        <td className="px-4 py-2.5 text-slate-500">{sp.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                ISOComply will notify the Controller of any intended changes to sub-processors with at least 14 days&apos; notice, giving the Controller the opportunity to object.
              </p>
            </Section>

            <Section title="6. Data Subject Rights">
              <p>
                ISOComply shall promptly notify the Controller if it receives a request from a data subject exercising their rights under Data Protection Legislation. ISOComply shall provide reasonable assistance to the Controller in responding to data subject rights requests. ISOComply will not respond directly to data subjects except on the Controller&apos;s documented instructions.
              </p>
            </Section>

            <Section title="7. Breach Notification">
              <p>
                ISOComply shall notify the Controller without undue delay, and in any event within 72 hours, after becoming aware of a personal data breach affecting Customer Data. The notification shall include all information required by Article 33(3) UK GDPR to the extent reasonably available.
              </p>
            </Section>

            <Section title="8. Data Deletion and Return">
              <p>
                Upon expiry or termination of the Service, ISOComply shall, at the Controller&apos;s election, delete or return all Customer Data within 30 days. ISOComply shall certify deletion in writing upon request. Residual copies in encrypted backups will be deleted within 90 days.
              </p>
            </Section>

            <Section title="9. Contact">
              <p>
                For DPA-related enquiries or to request a countersigned copy:{" "}
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
