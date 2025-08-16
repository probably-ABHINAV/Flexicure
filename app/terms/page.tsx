export const metadata = {
  title: "Terms of Service – Flexicure",
  description: "Terms and conditions for using the Flexicure platform.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using Flexicure, you accept and agree to be bound by the terms and provision of this
          agreement.
        </p>

        <h2>Description of Service</h2>
        <p>
          Flexicure is a platform that connects patients with licensed physiotherapists for remote consultations and
          treatment planning. We provide:
        </p>
        <ul>
          <li>Secure video conferencing for therapy sessions</li>
          <li>Appointment scheduling and management</li>
          <li>Payment processing and receipts</li>
          <li>Session notes and exercise plan sharing</li>
        </ul>

        <h2>User Responsibilities</h2>
        <h3>For Patients</h3>
        <ul>
          <li>Provide accurate health information</li>
          <li>Follow therapist recommendations and treatment plans</li>
          <li>Maintain confidentiality of your account credentials</li>
          <li>Pay for services as agreed</li>
        </ul>

        <h3>For Therapists</h3>
        <ul>
          <li>Maintain valid professional licenses and certifications</li>
          <li>Provide professional and ethical treatment</li>
          <li>Maintain patient confidentiality</li>
          <li>Follow applicable healthcare regulations</li>
        </ul>

        <h2>Medical Disclaimer</h2>
        <p>
          Flexicure is a platform that facilitates connections between patients and healthcare providers. We do not
          provide medical advice, diagnosis, or treatment. All medical decisions should be made in consultation with
          qualified healthcare professionals.
        </p>

        <h2>Privacy and Data Protection</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and
          protect your information.
        </p>

        <h2>Payment Terms</h2>
        <ul>
          <li>Payments are processed securely through third-party providers</li>
          <li>Refunds are subject to our refund policy</li>
          <li>You are responsible for any applicable taxes</li>
        </ul>

        <h2>Limitation of Liability</h2>
        <p>
          Flexicure shall not be liable for any indirect, incidental, special, consequential, or punitive damages
          resulting from your use of the platform.
        </p>

        <h2>Termination</h2>
        <p>
          We may terminate or suspend your account at any time for violations of these terms or for any other reason at
          our sole discretion.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to
          the platform.
        </p>

        <h2>Contact Information</h2>
        <p>
          For questions about these Terms of Service, contact us at{" "}
          <a href="mailto:legal@flexicure.app">legal@flexicure.app</a>.
        </p>
      </div>
    </div>
  )
}
