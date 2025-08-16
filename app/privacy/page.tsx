export const metadata = {
  title: "Privacy Policy – Flexicure",
  description: "How Flexicure collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account, book a session, or
          contact us for support.
        </p>

        <h3>Personal Information</h3>
        <ul>
          <li>Name and contact information (email, phone number)</li>
          <li>Account credentials and profile information</li>
          <li>Payment information (processed securely by our payment providers)</li>
          <li>Health information relevant to your physiotherapy treatment</li>
        </ul>

        <h3>Usage Information</h3>
        <ul>
          <li>Information about how you use our platform</li>
          <li>Device information and IP address</li>
          <li>Session recordings and notes (with your consent)</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and improve our physiotherapy services</li>
          <li>Process payments and send receipts</li>
          <li>Communicate with you about your account and appointments</li>
          <li>Ensure platform security and prevent fraud</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties except as described in
          this policy:
        </p>
        <ul>
          <li>With your healthcare providers (therapists) as necessary for treatment</li>
          <li>With service providers who assist in platform operations</li>
          <li>When required by law or to protect our rights</li>
        </ul>

        <h2>Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information, including:</p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Regular security audits and monitoring</li>
          <li>Access controls and authentication requirements</li>
          <li>Secure video conferencing with end-to-end encryption</li>
        </ul>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access and update your personal information</li>
          <li>Request deletion of your account and data</li>
          <li>Opt out of marketing communications</li>
          <li>Request a copy of your data</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:privacy@flexicure.app">privacy@flexicure.app</a>.
        </p>
      </div>
    </div>
  )
}
