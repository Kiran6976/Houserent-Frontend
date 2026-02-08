import React from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export const Terms = () => {
  const lastUpdated = "08 Feb 2026"; // ✅ keep a fixed date for compliance

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-indigo-600"
          >
            <Building2 className="w-8 h-8" />
            <span>HomeRent</span>
          </Link>
          <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Please read these Terms carefully before using HomeRent.
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            Welcome to <strong>HomeRent</strong> (“<strong>HomeRent</strong>”, “
            <strong>we</strong>”, “<strong>our</strong>”, or “<strong>us</strong>
            ”). These Terms & Conditions (“<strong>Terms</strong>”) govern your
            access to and use of the HomeRent website, mobile/web applications,
            APIs, dashboards, and related services (collectively, the “
            <strong>Platform</strong>”).
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            By accessing, browsing, registering, or using the Platform, you
            agree that you have read, understood, and accepted these Terms. If
            you do not agree, please do not use the Platform.
          </p>

          {/* Scrollable Legal Content */}
          <div className="space-y-10 text-gray-700 leading-relaxed">
            {/* 1 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                1. Definitions
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Platform</strong>: HomeRent website/app, dashboards,
                  services, and related features.
                </li>
                <li>
                  <strong>User</strong>: Any person who accesses or uses the
                  Platform, including unregistered visitors.
                </li>
                <li>
                  <strong>Tenant</strong>: A User who searches for properties,
                  contacts landlords, or initiates bookings.
                </li>
                <li>
                  <strong>Landlord</strong>: A User who lists a property and
                  receives booking payments or rental-related communications.
                </li>
                <li>
                  <strong>Listing</strong>: A property advertisement created by
                  a Landlord including photos, rent, deposit, booking amount,
                  address/location, and other details.
                </li>
                <li>
                  <strong>Booking</strong>: A transaction/workflow initiated by
                  a Tenant to pay a booking amount (token/advance) for a
                  Listing.
                </li>
                <li>
                  <strong>Payment</strong>: Any payment initiated using UPI,
                  Razorpay, or other supported methods.
                </li>
                <li>
                  <strong>Content</strong>: Any text, images, files, messages,
                  or data uploaded to the Platform by Users or displayed on the
                  Platform.
                </li>
              </ul>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                2. Eligibility and User Representations
              </h2>
              <p>
                You must be at least <strong>18 years old</strong> to register
                or use the Platform. By using HomeRent, you represent and
                warrant that:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  You are legally capable of entering into a binding contract
                  under applicable laws in India.
                </li>
                <li>
                  All information provided by you is accurate, current, and
                  complete.
                </li>
                <li>
                  You will update your information if it changes (e.g., phone,
                  email, address).
                </li>
                <li>
                  You will use the Platform only for lawful purposes and in
                  compliance with these Terms.
                </li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                3. Account Registration, Email Verification, and Security
              </h2>
              <p>
                To access certain features (such as booking or listing), you may
                be required to create an account and verify your email via OTP.
                You agree to keep your login credentials confidential and not
                share them with others.
              </p>
              <p className="mt-3">
                You are responsible for all activities performed under your
                account. If you suspect unauthorized access, you must notify us
                immediately.
              </p>
              <p className="mt-3">
                HomeRent may suspend or terminate accounts that appear to be
                compromised, used fraudulently, or violate these Terms.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                4. Role of HomeRent (Platform Disclaimer)
              </h2>
              <p>
                HomeRent is a <strong>technology platform</strong> that helps
                Tenants discover properties and helps Landlords list properties.
                HomeRent does not own, manage, rent, or sell properties unless
                explicitly stated on the Platform.
              </p>
              <p className="mt-3">
                Any agreement, negotiation, or contract entered between a Tenant
                and a Landlord (including rental agreements, lease terms,
                security deposits, refunds, or cancellations) is strictly between
                those parties. HomeRent is not a party to that agreement and does
                not provide legal, financial, or real estate advice.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                5. Listings, Accuracy, and Verification
              </h2>
              <p>
                Landlords are responsible for providing accurate listing details
                (e.g., rent, deposit, booking amount, location, amenities, images,
                availability). Tenants should verify property details by visiting
                the property and/or confirming information directly with the
                Landlord before making a decision.
              </p>
              <p className="mt-3">
                HomeRent may conduct basic checks, moderation, or content review
                to prevent abuse. However, HomeRent does not guarantee that all
                listings are verified, accurate, legal, safe, or suitable. Users
                are encouraged to act carefully and responsibly.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                6. Booking and Payment Flow
              </h2>
              <p>
                Tenants may initiate a Booking by paying a booking amount as
                specified in the Listing. Depending on the system configuration,
                payments may be initiated via UPI deep-link/QR or via a payment
                gateway (e.g., Razorpay).
              </p>
              <p className="mt-3">
                <strong>Important:</strong> Booking amounts may be sent directly
                to the Landlord (UPI) or processed using payment gateway flows.
                The Platform may display the status of a booking (initiated,
                paid, approved, transferred, cancelled, failed, expired, etc.).
              </p>
              <p className="mt-3">
                Tenants must ensure they are paying the correct amount to the
                correct payee. HomeRent is not responsible for payments made to
                the wrong UPI ID or wrong bank account due to user error.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                7. Booking Status, Confirmation, and Admin Review (if applicable)
              </h2>
              <p>
                Booking status updates may depend on manual confirmation, admin
                review, or automated provider updates. If your system uses manual
                confirmation, the Tenant may mark “I Have Paid” and optionally
                provide UTR/transaction reference.
              </p>
              <p className="mt-3">
                HomeRent may allow admins to approve/verify a booking before it is
                considered “completed”. A booking is only considered finally
                successful if the Platform marks it as <strong>transferred</strong>
                or equivalent final status.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                8. Cancellations and Refunds
              </h2>
              <p>
                Cancellation rules depend on booking status and platform rules.
                Some bookings may be cancellable by the Tenant when still in early
                stages (e.g., initiated/created). Bookings may not be cancellable
                after certain states (e.g., approved/transferred), as those states
                indicate that processing is completed.
              </p>
              <p className="mt-3">
                <strong>Refunds:</strong> If booking amount is paid directly to
                the Landlord (UPI), refund decisions and timelines are between the
                Tenant and Landlord. HomeRent does not guarantee refunds unless
                explicitly offered as part of the Platform’s policy.
              </p>
              <p className="mt-3">
                If a payment gateway (e.g., Razorpay) is used and HomeRent is the
                merchant of record, refunds may be initiated based on your Refund
                Policy (which must be published separately). Processing times may
                vary depending on banks and payment providers.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                9. Tenant Responsibilities
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Verify the property, listing accuracy, and landlord identity
                  before paying any amount.
                </li>
                <li>
                  Use the Platform honestly and avoid creating fake bookings or
                  harassing landlords.
                </li>
                <li>
                  Provide correct payment confirmation (UTR) if required.
                </li>
                <li>
                  Respect property visit rules and communications etiquette.
                </li>
              </ul>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                10. Landlord Responsibilities
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Provide accurate listing details and keep them updated.
                </li>
                <li>
                  Ensure you have legal rights/authority to list the property.
                </li>
                <li>
                  Communicate clearly about rental terms, deposits, and timelines.
                </li>
                <li>
                  Comply with applicable laws including local housing rules.
                </li>
              </ul>
            </section>

            {/* 11 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                11. Prohibited Activities
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Post false, misleading, or fraudulent listings.</li>
                <li>Impersonate another person or entity.</li>
                <li>Use the Platform for illegal activities or scams.</li>
                <li>Attempt to bypass booking or payment safeguards.</li>
                <li>Upload malicious code, viruses, or attempt hacking.</li>
                <li>Harass, threaten, abuse, or discriminate against other users.</li>
                <li>Scrape data, copy listings, or misuse content without permission.</li>
              </ul>
            </section>

            {/* 12 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                12. Content Ownership and License
              </h2>
              <p>
                Users retain ownership of content they upload. By uploading
                content (photos, descriptions, etc.), you grant HomeRent a
                non-exclusive, worldwide, royalty-free license to host, display,
                distribute, and use such content for operating and promoting the
                Platform.
              </p>
              <p className="mt-3">
                You confirm you have necessary rights to upload the content and it
                does not violate any third-party rights.
              </p>
            </section>

            {/* 13 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                13. Privacy and Data Use
              </h2>
              <p>
                Our use of your personal data is governed by our Privacy Policy.
                You should publish a Privacy Policy page explaining data
                collection, processing, cookies, storage, and user rights.
              </p>
            </section>

            {/* 14 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                14. Third-Party Services (UPI, Payment Gateways, and Links)
              </h2>
              <p>
                The Platform may integrate third-party services like UPI apps,
                payment gateways (e.g., Razorpay), email providers, and analytics.
                Those services may have their own terms and policies.
              </p>
              <p className="mt-3">
                HomeRent is not responsible for downtime, failures, or issues
                caused by third-party services.
              </p>
            </section>

            {/* 15 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                15. Disclaimer of Warranties
              </h2>
              <p>
                The Platform is provided on an “as is” and “as available” basis.
                HomeRent makes no warranties that:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>The Platform will be uninterrupted or error-free.</li>
                <li>Listings will always be accurate or verified.</li>
                <li>Payments will always succeed or reflect instantly.</li>
                <li>Users will behave lawfully or fairly.</li>
              </ul>
            </section>

            {/* 16 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                16. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, HomeRent shall not be
                liable for indirect, incidental, special, consequential, or
                punitive damages, including loss of profits, data, goodwill, or
                business interruption.
              </p>
              <p className="mt-3">
                HomeRent’s total liability (if any) for any claim related to your
                use of the Platform shall not exceed the amount of fees paid by
                you to HomeRent (if applicable) in the preceding 3 months.
              </p>
            </section>

            {/* 17 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                17. Indemnity
              </h2>
              <p>
                You agree to indemnify and hold harmless HomeRent and its
                affiliates from any claims, liabilities, damages, losses, and
                expenses arising from your use of the Platform, your violation of
                these Terms, or your violation of any law or third-party rights.
              </p>
            </section>

            {/* 18 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                18. Termination and Suspension
              </h2>
              <p>
                HomeRent may suspend or terminate your account or access to the
                Platform at any time if:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>You violate these Terms.</li>
                <li>You engage in fraud, abuse, or suspicious activities.</li>
                <li>We are required to do so by law or regulatory authorities.</li>
              </ul>
              <p className="mt-3">
                You may stop using the Platform at any time. Some obligations in
                these Terms may survive termination (e.g., indemnity, disclaimers).
              </p>
            </section>

            {/* 19 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                19. Changes to the Terms
              </h2>
              <p>
                We may update these Terms from time to time. If we make material
                changes, we may post the updated Terms on this page and update
                the “Last updated” date. Your continued use of the Platform after
                changes indicates acceptance of the updated Terms.
              </p>
            </section>

            {/* 20 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                20. Governing Law and Jurisdiction
              </h2>
              <p>
                These Terms are governed by the laws of India. Any dispute shall
                be subject to the exclusive jurisdiction of competent courts in
                India (you may specify a city/state if you want).
              </p>
            </section>

            {/* 21 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                21. Contact Information
              </h2>
              <p>
                If you have questions about these Terms or the Platform, contact:
              </p>
              <p className="mt-3">
                Email:{" "}
                <a
                  href="mailto:kiransamanta88@gmail.com"
                  className="text-indigo-600 font-medium"
                >
                  kiransamanta88@gmail.com
                </a>
              </p>
            </section>
          </div>

          {/* Footer CTA */}
          <div className="mt-10 border-t pt-6 text-sm text-gray-600">
            <p>
              By using HomeRent, you confirm that you have read, understood, and
              agree to these Terms & Conditions.
            </p>
            <p className="mt-2">
              If you do not agree, please discontinue use of the Platform.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
