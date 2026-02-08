import React from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export const RefundPolicy = () => {
  const lastUpdated = "February 8, 2026"; // set a fixed date (recommended for Razorpay reviews)

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

          <span className="text-sm text-gray-500">Last updated: {lastUpdated}</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Refund & Cancellation Policy
          </h1>
          <p className="text-gray-600 mb-8">
            This Refund & Cancellation Policy explains how cancellations and refunds
            work on <strong>HomeRent</strong>. By using HomeRent, you agree to this policy,
            along with our{" "}
            <Link to="/terms" className="text-indigo-600 font-medium hover:underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-indigo-600 font-medium hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <div className="space-y-8 text-gray-700 leading-relaxed">
            {/* 1 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                1. What payments are made on HomeRent?
              </h2>
              <p>
                HomeRent enables tenants to pay a <strong>booking amount</strong> to a landlord
                to express confirmed intent to rent a property. The booking amount is shown
                on the property page and is paid using supported payment methods (e.g., UPI).
              </p>
              <p className="mt-3">
                Unless explicitly stated otherwise, HomeRent is a technology platform and does not
                guarantee property availability or acceptance by a landlord.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                2. Cancellation by Tenant (Before Payment)
              </h2>
              <p>
                If you initiate a booking but <strong>do not complete payment</strong>, you can
                cancel the booking from your account (if the cancellation option is available).
                In such cases, no refund is applicable because payment was not completed.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                3. Cancellation by Tenant (After Payment)
              </h2>
              <p>
                If you have already paid the booking amount, refund eligibility depends on:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  Whether the landlord has <strong>accepted/confirmed</strong> your booking request.
                </li>
                <li>
                  Whether the payment has been <strong>transferred/settled</strong> to the landlord.
                </li>
                <li>
                  The reason for cancellation and any evidence provided (if requested).
                </li>
              </ul>

              <div className="mt-4 rounded-xl bg-gray-50 border p-4">
                <p className="font-semibold text-gray-900 mb-1">
                  Important:
                </p>
                <p>
                  When funds are transferred directly to a landlord, refunds (if applicable) may require
                  the landlord’s approval and cooperation. HomeRent may assist with coordination, but
                  cannot guarantee refunds unless HomeRent explicitly holds the funds or states otherwise.
                </p>
              </div>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                4. Cancellation / Rejection by Landlord
              </h2>
              <p>
                A landlord may reject a booking request for reasons including, but not limited to:
                mismatch of requirements, property availability, or verification concerns.
              </p>
              <p className="mt-3">
                If the landlord rejects a booking after payment, the landlord may choose to refund the
                booking amount fully or partially. HomeRent may provide communication tools and logs to
                help both parties, but the final refund action depends on the payment flow and settlement.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                5. Refund Timelines
              </h2>
              <p>
                If a refund is approved and initiated, typical timelines are:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>
                  <strong>Refund initiation:</strong> within 2–7 business days after approval/confirmation.
                </li>
                <li>
                  <strong>Bank/UPI processing:</strong> additional 3–10 business days depending on your bank/provider.
                </li>
              </ul>
              <p className="mt-3">
                These timelines are estimates. Actual settlement depends on banks, UPI apps, and payment providers.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                6. Non-Refundable Scenarios
              </h2>
              <p>Refunds may be refused (to the extent allowed by law) in cases including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>False claims, fraud, abuse, or suspicious activity.</li>
                <li>Violation of our Terms & Conditions.</li>
                <li>
                  Booking amount paid and later cancelled after landlord confirmation where the landlord
                  has already committed or incurred costs (if applicable).
                </li>
                <li>Any chargebacks/disputes raised without first contacting support (where required).</li>
              </ul>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                7. Disputes & Chargebacks
              </h2>
              <p>
                If you believe there is an error, please contact us first. If a chargeback or dispute is initiated
                through your bank/payment provider, HomeRent may request additional information and may suspend the
                account during investigation, where allowed by law.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                8. How to request a refund
              </h2>
              <p>
                To request support regarding cancellation/refund, email us with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Your registered email address</li>
                <li>Booking ID / Transaction reference (UTR if available)</li>
                <li>Property title/location</li>
                <li>A short explanation and any relevant screenshots</li>
              </ul>

              <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                <p className="font-semibold text-gray-900">Support Email</p>
                <a
                  href="mailto:kirsamanta88@gmail.com"
                  className="text-indigo-700 font-medium hover:underline"
                >
                  kiransamanta88@gmail.com
                </a>
                <p className="text-sm text-gray-600 mt-2">
                  We aim to respond within 24–72 business hours.
                </p>
              </div>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                9. Policy Updates
              </h2>
              <p>
                We may update this policy from time to time. The latest version will be available on this page.
                Continued use of HomeRent after changes means you accept the updated policy.
              </p>
            </section>
          </div>

          <div className="mt-10 border-t pt-6 text-sm text-gray-600">
            <p>
              If you do not agree with this policy, please do not use HomeRent.
            </p>
            <p className="mt-2">
              Related:{" "}
              <Link to="/terms" className="text-indigo-600 font-medium hover:underline">
                Terms
              </Link>{" "}
              •{" "}
              <Link to="/privacy" className="text-indigo-600 font-medium hover:underline">
                Privacy
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
