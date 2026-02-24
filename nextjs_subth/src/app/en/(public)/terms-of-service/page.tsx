import { Metadata } from "next";
import { PublicLayout } from "@/components/layout/server";
import { ArticleBreadcrumb } from "@/features/article";
import { ScrollText, CheckCircle, AlertTriangle, Ban, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | SubTH",
  description: "Terms and conditions for using the SubTH website",
};

export default function TermsOfServicePageEN() {
  return (
    <PublicLayout locale="en">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ArticleBreadcrumb
          items={[{ label: "Terms of Service" }]}
          locale="en"
        />

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: February 2026
        </p>

        {/* Key Points */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">Personal Use Only</h3>
              <p className="text-xs text-muted-foreground">
                Content is for personal use only
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Ban className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">No Redistribution</h3>
              <p className="text-xs text-muted-foreground">
                Do not copy or redistribute content without permission
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">Age 18+</h3>
              <p className="text-xs text-muted-foreground">
                Users must be 18 years or older
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Scale className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">Follow Rules</h3>
              <p className="text-xs text-muted-foreground">
                Users must comply with community guidelines
              </p>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground text-sm">
              By accessing and using SubTH, you agree to be bound by these Terms of Service.
              If you do not agree with any part of these terms, please discontinue use immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>Users must be at least 18 years of age</li>
              <li>Users must have legal capacity to enter into agreements</li>
              <li>Users must not have been previously banned or suspended</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>You must keep your account credentials confidential</li>
              <li>You are responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Account sharing is prohibited</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Permitted Use</h2>
            <p className="text-muted-foreground text-sm mb-2">
              You may use the website to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>Read articles and reviews for personal use</li>
              <li>Use search and browsing features</li>
              <li>Share links to articles (not the content itself)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Prohibited Activities</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>Copying, reproducing, or distributing content without permission</li>
              <li>Using bots, scrapers, or automated tools</li>
              <li>Attempting unauthorized access to systems</li>
              <li>Using the service for illegal purposes</li>
              <li>Interfering with or damaging the service</li>
              <li>Sharing accounts or passwords</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground text-sm">
              All content on this website, including articles, images, and graphics,
              is the property of SubTH or our licensors. Unauthorized use constitutes
              copyright infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Payment and Membership</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>Prices and packages may change without prior notice</li>
              <li>All payments are non-refundable</li>
              <li>Memberships auto-renew unless cancelled before expiration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
            <p className="text-muted-foreground text-sm">
              We reserve the right to suspend or terminate your account immediately
              for any violation of these terms, without notice and without refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Disclaimer</h2>
            <p className="text-muted-foreground text-sm">
              This website is provided "as is" without any warranties, express or implied.
              We are not liable for any damages arising from the use of this website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
            <p className="text-muted-foreground text-sm">
              We reserve the right to modify these terms at any time.
              Continued use of the website after changes constitutes acceptance of the new terms.
            </p>
          </section>
        </div>

        {/* Contact */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50">
          <div className="flex items-start gap-3">
            <ScrollText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                For questions about these terms, please contact{" "}
                <a href="mailto:legal@subth.com" className="text-primary hover:underline">
                  legal@subth.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
