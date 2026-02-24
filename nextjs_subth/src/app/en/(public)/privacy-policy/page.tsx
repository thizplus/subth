import { Metadata } from "next";
import { PublicLayout } from "@/components/layout/server";
import { ArticleBreadcrumb } from "@/features/article";
import { Shield, Lock, Eye, Trash2, Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | SubTH",
  description: "SubTH privacy policy and personal data protection guidelines",
};

export default function PrivacyPolicyPageEN() {
  return (
    <PublicLayout locale="en">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ArticleBreadcrumb
          items={[{ label: "Privacy Policy" }]}
          locale="en"
        />

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: February 2026
        </p>

        {/* Key Points */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">Data Encryption</h3>
              <p className="text-xs text-muted-foreground">
                All data encrypted with SSL/TLS
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Eye className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">No Data Sales</h3>
              <p className="text-xs text-muted-foreground">
                We never sell data to third parties
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Trash2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">Right to Delete</h3>
              <p className="text-xs text-muted-foreground">
                Request account deletion anytime
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg border">
            <Bell className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium text-sm">Change Notifications</h3>
              <p className="text-xs text-muted-foreground">
                Advance notice of policy changes
              </p>
            </div>
          </div>
        </div>

        {/* Policy Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>Account information: email, username, password (encrypted)</li>
              <li>Usage data: viewing history, articles read</li>
              <li>Payment information: processed through secure third-party providers</li>
              <li>Technical data: IP address, browser type, device</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Data</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>Provide and improve our services</li>
              <li>Recommend content matching your interests</li>
              <li>Communicate about your account and payments</li>
              <li>Maintain system security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
            <p className="text-muted-foreground text-sm">
              We do not sell, rent, or share your personal information with third parties for marketing purposes.
              Data may be shared with essential service providers (e.g., payment processors)
              under strict confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Your Rights</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              <li>Access and download your data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of promotional emails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Security</h2>
            <p className="text-muted-foreground text-sm">
              We use industry-standard security measures including SSL/TLS encryption,
              two-factor authentication (2FA), and regular security audits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
            <p className="text-muted-foreground text-sm">
              We use essential cookies for website functionality such as login and theme settings.
              You can configure your browser to reject cookies, but this may affect some features.
            </p>
          </section>
        </div>

        {/* Warrant Canary */}
        <div className="mt-8 rounded-xl border border-green-500/20 bg-green-500/5 p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2 text-green-700 dark:text-green-300">
                Warrant Canary
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Since its founding, SubTH has never received any court orders or government requests
                to disclose user data or install surveillance systems (backdoors).
              </p>
              <p className="text-xs text-muted-foreground">
                Last updated: February 2026
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            For privacy-related questions, please contact{" "}
            <a href="mailto:privacy@subth.com" className="text-primary hover:underline">
              privacy@subth.com
            </a>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
