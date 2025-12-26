import { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BlogGrid } from "@/components/blog/blog-grid";

export const metadata: Metadata = {
  title: "Health Blog",
  description:
    "Expert health insights, wellness tips, and the latest research in metabolic and hormonal health from TF Wellfare.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <div className="container-fluid py-8">
        <Breadcrumbs items={[{ label: "Blog", href: "/blog" }]} />

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-emerald-950 mb-4">
            Health &amp; <span className="text-terracotta">Wellness</span> Blog
          </h1>
          <p className="text-lg text-gray-600">
            Evidence-based insights and practical tips to help you live your
            healthiest life. Written by our team of medical experts.
          </p>
        </div>

        <BlogGrid />
      </div>
    </div>
  );
}
