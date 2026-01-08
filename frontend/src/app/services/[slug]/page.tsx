import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ServiceDetail } from "@/components/services/service-detail";
import { FAQSchema } from "@/components/seo/schemas";
import { servicesApi } from "@/lib/api";

interface ServicePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const response = await servicesApi.getBySlug(params.slug);

  if (!response.success || !response.data) {
    return {
      title: "Service Not Found",
    };
  }

  const service = response.data;

  return {
    title: service.meta_title || service.title,
    description: service.meta_description || service.short_description,
    openGraph: {
      title: service.meta_title || service.title,
      description: service.meta_description || service.short_description,
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const response = await servicesApi.getBySlug(params.slug);

  if (!response.success || !response.data) {
    notFound();
  }

  const service = response.data;

  // Mock FAQs for now - can be added to database later
  const mockFaqs = [
    {
      question: "How long does this service take?",
      answer: `This service typically takes ${service.duration_minutes} minutes.`,
    },
    {
      question: "Is this service covered by insurance?",
      answer: "Please contact your insurance provider to verify coverage. We can provide documentation for reimbursement.",
    },
    {
      question: "What should I bring to my appointment?",
      answer: "Please bring a valid ID, insurance card (if applicable), and any relevant medical records or test results.",
    },
  ];

  return (
    <div className="min-h-screen bg-sand-50">
      <FAQSchema faqs={mockFaqs} />
      <div className="container-fluid py-8">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/services" },
            { label: service.title, href: `/services/${params.slug}` },
          ]}
        />
        <ServiceDetail service={{...service, faqs: mockFaqs}} />
      </div>
    </div>
  );
}
