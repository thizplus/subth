import { Metadata } from "next";
import { PublicLayout } from "@/components/layout";
import { ArticleBreadcrumb } from "@/features/article";
import { Mail, MessageCircle, Clock, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | SubTH",
  description: "Get in touch with the SubTH team for inquiries, support, or feedback",
};

export default function ContactPageEN() {
  return (
    <PublicLayout locale="en">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ArticleBreadcrumb
          items={[{ label: "Contact Us" }]}
          locale="en"
        />

        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

        <p className="text-lg text-muted-foreground mb-8">
          Have questions, suggestions, or need to report an issue? The SubTH team is here to help.
        </p>

        {/* Contact Methods */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Email</h2>
            </div>
            <p className="text-muted-foreground mb-2">
              For general inquiries and membership support
            </p>
            <a
              href="mailto:support@subth.com"
              className="text-primary hover:underline font-medium"
            >
              support@subth.com
            </a>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Community Chat</h2>
            </div>
            <p className="text-muted-foreground mb-2">
              Connect with other members and our team
            </p>
            <p className="text-sm text-muted-foreground">
              Login to access Chat
            </p>
          </div>
        </div>

        {/* Response Time */}
        <div className="rounded-xl border bg-muted/30 p-6 mb-8">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Response Time</h3>
              <p className="text-sm text-muted-foreground">
                We aim to respond to all messages within 24-48 hours (business days).
                Urgent payment-related issues will receive a response within 12 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Report Issues */}
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Report Content Issues</h3>
              <p className="text-sm text-muted-foreground mb-2">
                If you find inappropriate content, incorrect information, or technical issues,
                please let us know so we can address them.
              </p>
              <a
                href="mailto:report@subth.com"
                className="text-sm text-destructive hover:underline font-medium"
              >
                report@subth.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
