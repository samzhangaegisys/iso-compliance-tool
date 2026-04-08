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

const cookieTypes = [
  {
    name: "Essential Cookies",
    required: true,
    description: "These cookies are necessary for the Service to function and cannot be disabled.",
    examples: [
      { name: "session", purpose: "Maintains your login session", duration: "Session" },
      { name: "csrf_token", purpose: "Prevents cross-site request forgery attacks", duration: "Session" },
      { name: "__stripe_sid", purpose: "Used by Stripe for payment security", duration: "30 minutes" },
    ],
  },
  {
    name: "Functional Cookies",
    required: false,
    description: "These cookies enable enhanced functionality and personalisation.",
    examples: [
      { name: "ui_preferences", purpose: "Remembers your UI preferences (e.g., sidebar state)", duration: "1 year" },
      { name: "last_organisation", purpose: "Remembers your most recently accessed organisation", duration: "30 days" },
    ],
  },
  {
    name: "Analytics Cookies",
    required: false,
    description: "These cookies help us understand how visitors use the Service so we can improve it.",
    examples: [
      { name: "ph_session", purpose: "PostHog session analytics (self-hosted, EU region)", duration: "1 year" },
      { name: "ph_distinct_id", purpose: "PostHog anonymous user identifier", duration: "1 year" },
    ],
  },
  {
    name: "Marketing Cookies",
    required: false,
    description: "These cookies are used to deliver relevant advertising. We currently use minimal marketing cookies.",
    examples: [
      { name: "_gcl_au", purpose: "Google Ads conversion tracking", duration: "3 months" },
    ],
  },
];

export default function CookiesPage() {
  return (
    <PageLayout>
      <section className="relative overflow-hidden py-16" style={{ backgroundColor: "#0a0f1e" }}>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
          >
            Cookie Policy
          </h1>
          <p className="text-slate-400">Last updated: 1 April 2026</p>
        </div>
      </section>

      <section className="py-16 bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 lg:p-10">
            <Section title="What are cookies?">
              <p>
                Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
              </p>
              <p>
                ISOComply uses cookies and similar technologies (such as local storage) to operate the Service, remember your preferences, and understand how you use the platform.
              </p>
            </Section>

            <Section title="Cookies we use">
              <p>We use four categories of cookies:</p>
            </Section>

            {cookieTypes.map((type) => (
              <div key={type.name} className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <h3
                    className="font-semibold text-white"
                    style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
                  >
                    {type.name}
                  </h3>
                  {type.required ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
                      Always active
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/50">
                      Optional
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mb-4">{type.description}</p>
                <div className="rounded-xl border border-slate-700/50 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-700/50">
                        <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Cookie</th>
                        <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Purpose</th>
                        <th className="text-left px-4 py-2.5 text-slate-400 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {type.examples.map((cookie) => (
                        <tr key={cookie.name} className="border-b border-slate-800/50 last:border-0">
                          <td className="px-4 py-2.5 font-mono text-slate-300">{cookie.name}</td>
                          <td className="px-4 py-2.5 text-slate-400">{cookie.purpose}</td>
                          <td className="px-4 py-2.5 text-slate-500">{cookie.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <Section title="How to manage cookies">
              <p>
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-slate-300">Cookie banner:</strong> When you first visit, our cookie banner lets you accept or decline non-essential cookies.</li>
                <li><strong className="text-slate-300">Browser settings:</strong> Most browsers allow you to block or delete cookies through their settings. Note that blocking essential cookies will prevent the Service from working.</li>
                <li><strong className="text-slate-300">Opt-out tools:</strong> For analytics cookies, you can opt out via <a href="https://posthog.com/privacy" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">PostHog&apos;s privacy controls</a>.</li>
              </ul>
            </Section>

            <Section title="Third-party cookies">
              <p>
                Some cookies are set by third-party services we use (Stripe, PostHog, Google). We recommend reviewing their privacy policies to understand how they use cookies:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><a href="https://stripe.com/privacy" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a></li>
                <li><a href="https://posthog.com/privacy" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">PostHog Privacy Policy</a></li>
              </ul>
            </Section>

            <Section title="Contact">
              <p>
                For questions about our use of cookies, contact us at{" "}
                <a href="mailto:privacy@isocomply.io" className="text-blue-400 hover:text-blue-300">
                  privacy@isocomply.io
                </a>.
              </p>
            </Section>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
