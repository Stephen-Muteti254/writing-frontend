const Terms = () => {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-foreground font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing and using AcademicHub, you accept and agree to be bound by these Terms and 
              Conditions. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. User Accounts</h2>
            <p>To use certain features of our platform, you must register for an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. User Responsibilities</h2>
            <h3 className="text-xl font-semibold text-foreground">For Clients:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide clear and accurate order requirements</li>
              <li>Pay for services as agreed</li>
              <li>Review submitted work in a timely manner</li>
              <li>Use the platform for legitimate academic purposes</li>
            </ul>
            <h3 className="text-xl font-semibold text-foreground mt-4">For Writers:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide original, high-quality work</li>
              <li>Meet agreed deadlines</li>
              <li>Maintain professional communication</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Payment Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All payments are processed securely through our platform</li>
              <li>Funds are held in escrow until work is approved</li>
              <li>Platform fees apply to all transactions</li>
              <li>Refunds are subject to our refund policy</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Intellectual Property</h2>
            <p>
              Upon full payment, clients receive ownership of the completed work. Writers retain the 
              right to showcase completed work in their portfolio (with client permission).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Prohibited Activities</h2>
            <p>Users may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Submit plagiarized or non-original work</li>
              <li>Engage in fraudulent activities</li>
              <li>Circumvent platform fees</li>
              <li>Harass or abuse other users</li>
              <li>Share account credentials</li>
              <li>Use the platform for illegal purposes</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Dispute Resolution</h2>
            <p>
              In case of disputes between clients and writers, AcademicHub will facilitate mediation. 
              Our decision in disputes is final and binding.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Account Suspension</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms, including 
              but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Repeated policy violations</li>
              <li>Fraudulent activity</li>
              <li>Multiple client complaints</li>
              <li>Blind bidding (for writers)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Limitation of Liability</h2>
            <p>
              AcademicHub serves as a platform connecting clients and writers. We are not responsible 
              for the quality of work or disputes between users, though we will assist in resolution.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the platform 
              after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. Contact Information</h2>
            <p>
              For questions about these terms, contact us at:
            </p>
            <p>
              Email: legal@academichub.com<br />
              Address: 123 Academic Street, New York, NY 10001
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
