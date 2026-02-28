import { Metadata } from "next";
import { PublicLayout } from "@/components/layout/server";
import { ArticleBreadcrumb } from "@/features/article";
import { Users, Shield, Sparkles, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | SubTH",
  description: "SubTH is a premium video review platform with in-depth analysis from our expert editorial team",
};

export default function AboutPageEN() {
  return (
    <PublicLayout locale="en">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <ArticleBreadcrumb
          items={[{ label: "About Us" }]}
          
        />

        <h1 className="text-3xl font-bold mb-6">About SubTH</h1>

        {/* Intro */}
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
          <p className="text-lg text-muted-foreground leading-relaxed">
            SubTH is a premium video review platform focused on quality content and the best user experience.
            We believe viewers deserve complete, accurate information presented professionally.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Expert Team</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Every article is curated and analyzed by the SubTH Editorial Team
              with over 5 years of industry experience.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Quality Content</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              In-depth reviews with summaries, character analysis, key scene highlights,
              and recommendations for different viewer types.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Regular Updates</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              New articles added daily, covering the latest releases
              from top studios and performers.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Safe & Trustworthy</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              High security standards with no malware or adware.
              Member data is encrypted at all times.
            </p>
          </div>
        </div>

        {/* Editorial Team */}
        <div className="rounded-xl border bg-gradient-to-b from-muted/50 to-transparent p-6">
          <h2 className="text-xl font-semibold mb-4">SubTH Editorial Team</h2>
          <p className="text-muted-foreground mb-4">
            Our editorial team consists of experienced writers and analysts specializing in content review and analysis.
            Every article goes through a fact-checking process for accuracy.
          </p>
          <p className="text-sm text-muted-foreground">
            Founded: 2024 | Published Articles: 2,000+
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
