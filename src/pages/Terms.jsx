import React from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export const Terms = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Terms & Conditions
          </h1>

          <p className="text-gray-600 mb-6">
            Welcome to <strong>HomeRent</strong>. These Terms & Conditions
            (“Terms”) govern your access to and use of the HomeRent platform,
            including our website, applications, and services. By registering,
            accessing, or using HomeRent, you agree to be legally bound by these
            Terms.
          </p>

          {/* Scrollable Legal Content */}
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                1. Definitions
              </h2>
              <p>
                “Platform” refers to the HomeRent website and services. “User”
                refers to any individual who registers as a Tenant, Landlord, or
                Admin. “Tenant” means a user seeking rental properties.
                “Landlord” means a user listing properties for rent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                2. Eligibility
              </h2>
              <p>
                You must be at least 18 years old and legally capable of entering
                into contracts under Indian law to use HomeRent. By registering,
                you represent that all information provided is accurate and
                truthful.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                3. Account Registration & Security
              </h2>
              <p>
                Users must register using a valid email address and complete
                email verification via OTP. You are responsible for maintaining
                the confidentiality of your login credentials and all activities
                conducted through your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                4. Platform Role & Responsibility
              </h2>
              <p>
                HomeRent acts only as a technology platform. We do not own,
                manage, or verify properties beyond basic checks. Any agreement
                entered between Tenant and Landlord is strictly between those
                parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                5. Payments & Bookings
              </h2>
              <p>
                Booking amounts are paid directly to the Landlord via UPI or
                approved payment methods. HomeRent is not responsible for failed
                payments, refunds, disputes, or bank-related issues unless
                explicitly stated.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                6. Cancellations & Disputes
              </h2>
              <p>
                Tenants may cancel bookings only under permitted conditions
                shown on the platform. HomeRent is not liable for disputes
                between Users and encourages resolution through mutual
                agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                7. Prohibited Activities
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Providing false or misleading information</li>
                <li>Using the platform for unlawful purposes</li>
                <li>Harassment, abuse, or fraud</li>
                <li>Attempting to bypass platform safeguards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                8. Termination
              </h2>
              <p>
                HomeRent reserves the right to suspend or terminate accounts
                that violate these Terms without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                9. Limitation of Liability
              </h2>
              <p>
                HomeRent shall not be liable for indirect, incidental, or
                consequential damages arising from use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                10. Governing Law
              </h2>
              <p>
                These Terms are governed by the laws of India. Any disputes shall
                be subject to the jurisdiction of Indian courts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                11. Acceptance of Terms
              </h2>
              <p>
                By creating an account or using HomeRent, you confirm that you
                have read, understood, and agreed to these Terms & Conditions in
                full.
              </p>
            </section>
          </div>

          {/* Footer CTA */}
          <div className="mt-10 border-t pt-6 text-sm text-gray-600">
            <p>
              If you do not agree with these Terms, please do not use the
              HomeRent platform.
            </p>
            <p className="mt-2">
              Questions? Contact us at{" "}
              <a
                href="mailto:support@homerent.com"
                className="text-indigo-600 font-medium"
              >
                kiransamanta88@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
