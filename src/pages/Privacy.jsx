import React from "react";
import { Link } from "react-router-dom";
import { Building2, ShieldCheck } from "lucide-react";

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-indigo-600"
          >
            <Building2 className="w-8 h-8" />
            <span>HomeRent</span>
          </Link>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString("en-IN")}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Privacy Policy
            </h1>
          </div>

          <p className="text-gray-600 mb-8">
            At <strong>HomeRent</strong>, we value your privacy and are committed
            to protecting your personal information. This Privacy Policy
            explains how we collect, use, store, and protect your data when you
            use our platform.
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            {/* 1 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                1. Information We Collect
              </h2>
              <p>
                We collect the following types of information when you register
                or use HomeRent:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Full name, age, and address</li>
                <li>Email address and phone number</li>
                <li>User role (Tenant or Landlord)</li>
                <li>Login credentials (encrypted)</li>
                <li>Property listings and booking details</li>
                <li>Payment references such as UTR or transaction status</li>
              </ul>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                2. Payment Information
              </h2>
              <p>
                HomeRent does <strong>not</strong> store your bank account,
                debit card, credit card, or UPI PIN details.
              </p>
              <p className="mt-2">
                Payments are processed securely through third-party payment
                providers such as <strong>Razorpay</strong> and UPI-based
                banking systems. We may receive limited transaction details
                such as:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Transaction ID / UTR</li>
                <li>Payment status (success / failed / pending)</li>
                <li>Payment timestamp</li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                3. How We Use Your Information
              </h2>
              <p>
                We use your data to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Create and manage user accounts</li>
                <li>Enable property listings and bookings</li>
                <li>Facilitate communication between tenants and landlords</li>
                <li>Process payments and booking confirmations</li>
                <li>Prevent fraud and unauthorized activity</li>
                <li>Improve platform performance and user experience</li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                4. Data Sharing & Disclosure
              </h2>
              <p>
                We do <strong>not</strong> sell or rent your personal data to
                third parties.
              </p>
              <p className="mt-2">
                Your information may be shared only in the following cases:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>With payment processors like Razorpay for transactions</li>
                <li>With landlords or tenants involved in a booking</li>
                <li>To comply with legal or regulatory requirements</li>
                <li>To prevent fraud, abuse, or security threats</li>
              </ul>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                5. Data Security
              </h2>
              <p>
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Encrypted passwords</li>
                <li>Secure authentication (JWT)</li>
                <li>Restricted database access</li>
                <li>HTTPS-only communication</li>
              </ul>
              <p className="mt-2">
                While we take strong precautions, no online system is 100%
                secure. Users are advised to protect their login credentials.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                6. Cookies & Tracking
              </h2>
              <p>
                HomeRent may use cookies or local storage to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Maintain login sessions</li>
                <li>Improve platform usability</li>
                <li>Analyze anonymous usage patterns</li>
              </ul>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                7. User Rights
              </h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access your personal data</li>
                <li>Request correction of incorrect information</li>
                <li>Request account deletion (subject to legal obligations)</li>
                <li>Withdraw consent for future communications</li>
              </ul>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                8. Data Retention
              </h2>
              <p>
                We retain your information only as long as necessary to provide
                our services or comply with legal obligations.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                9. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Changes
                will be posted on this page with an updated revision date.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                10. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or your
                data, you can contact us at:
              </p>
              <p className="mt-2 font-medium">
                📧 Email:{" "}
                <a
                  href="mailto:support@homerent.com"
                  className="text-indigo-600 hover:underline"
                >
                  kiransamanta88@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
