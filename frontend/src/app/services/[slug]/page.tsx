import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ServiceDetail } from "@/components/services/service-detail";
import { FAQSchema } from "@/components/seo/schemas";

// Static service data
const services: Record<string, any> = {
  "diabetes-management": {
    title: "Diabetes Management",
    slug: "diabetes-management",
    short_description:
      "Comprehensive diabetes care with personalized treatment plans.",
    description: `
Our Diabetes Management program provides comprehensive, personalized care for both Type 1 and Type 2 diabetes. 
We focus on achieving optimal blood sugar control while minimizing complications and improving your overall quality of life.

Our holistic approach combines the latest medical treatments with lifestyle modifications, nutrition counseling, 
and continuous monitoring to help you take control of your health.
    `,
    symptoms: `
- Frequent urination and excessive thirst
- Unexplained weight loss or gain
- Fatigue and low energy
- Blurred vision
- Slow-healing wounds
- Numbness or tingling in hands/feet
    `,
    approach: `
We believe in treating the whole person, not just the disease. Our approach includes:

1. **Comprehensive Assessment** - Complete metabolic panel, HbA1c testing, and lifestyle evaluation
2. **Personalized Treatment Plan** - Tailored medication regimens, diet plans, and exercise prescriptions
3. **Continuous Glucose Monitoring** - Real-time tracking for better decision-making
4. **Education & Empowerment** - Teaching you to manage your condition effectively
5. **Ongoing Support** - Regular check-ins and adjustments to optimize outcomes
    `,
    what_to_expect: `
**Initial Consultation (60 minutes)**
- Review of medical history and current medications
- Comprehensive blood work and metabolic testing
- Discussion of symptoms and health goals
- Development of initial treatment plan

**Follow-up Visits (30 minutes)**
- Review of glucose logs and CGM data
- Medication adjustments as needed
- Nutrition and lifestyle coaching
- Progress assessment and plan optimization
    `,
    icon: "🩺",
    duration_minutes: 60,
    price: 200,
    modality: "both",
    faqs: [
      {
        question: "How often will I need to come in for appointments?",
        answer:
          "Initially, we recommend monthly visits until your blood sugar is well-controlled. Once stable, visits can be spaced to every 3-6 months.",
      },
      {
        question: "Will I need to take insulin?",
        answer:
          "Not necessarily. Many patients can manage diabetes with oral medications and lifestyle changes. We'll work together to find the best approach for you.",
      },
      {
        question: "Can diabetes be reversed?",
        answer:
          "Type 2 diabetes can often be put into remission with significant lifestyle changes and weight loss. We'll discuss realistic goals based on your specific situation.",
      },
    ],
    meta_title: "Diabetes Management - Expert Care | TF Wellfare",
    meta_description:
      "Comprehensive diabetes care with personalized treatment plans, blood sugar optimization, and lifestyle coaching. Book your consultation today.",
  },
  // Add more services as needed
};

interface ServicePageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const service = services[params.slug];

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: service.meta_title || service.title,
    description: service.meta_description || service.short_description,
    openGraph: {
      title: service.meta_title || service.title,
      description: service.meta_description || service.short_description,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(services).map((slug) => ({ slug }));
}

export default function ServicePage({ params }: ServicePageProps) {
  const service = services[params.slug];

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <FAQSchema faqs={service.faqs} />
      <div className="container-fluid py-8">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/services" },
            { label: service.title, href: `/services/${params.slug}` },
          ]}
        />
        <ServiceDetail service={service} />
      </div>
    </div>
  );
}
