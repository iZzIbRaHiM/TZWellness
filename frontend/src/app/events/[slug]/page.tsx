import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EventDetail } from "@/components/events/event-detail";
import { EventSchema } from "@/components/seo/schemas";

// Static events data
const events: Record<string, any> = {
  "diabetes-workshop-new-patients": {
    title: "Understanding Diabetes: A Workshop for New Patients",
    slug: "diabetes-workshop-new-patients",
    description:
      "Learn the fundamentals of diabetes management, including blood sugar monitoring, medication, diet, and lifestyle changes.",
    long_description: `
This comprehensive workshop is designed specifically for newly diagnosed diabetes patients and their family members. 
You'll learn practical skills and knowledge to confidently manage your condition and maintain a high quality of life.

## What You'll Learn

- How diabetes affects your body
- Blood sugar monitoring techniques and target ranges
- Understanding your medications
- Building a diabetes-friendly diet
- Exercise and activity guidelines
- Preventing complications
- When to seek medical help

## Who Should Attend

- Newly diagnosed Type 1 or Type 2 diabetes patients
- Family members and caregivers
- Anyone wanting to refresh their diabetes knowledge

## What to Bring

- Your blood glucose monitor
- A list of your current medications
- Any questions you'd like answered
- A notebook for notes

Refreshments will be provided. All attendees will receive a comprehensive resource packet to take home.
    `,
    category: "Workshop",
    date: "2024-02-15",
    start_time: "10:00",
    end_time: "12:00",
    location: "TF Wellfare Main Clinic",
    address: "123 Wellness Way, Suite 100, Health City, HC 12345",
    is_virtual: false,
    max_attendees: 30,
    registered_count: 18,
    price: 0,
    speaker: {
      name: "Dr. Sarah Mitchell",
      title: "Endocrinologist",
      bio: "Dr. Mitchell has over 15 years of experience in diabetes management and patient education.",
    },
    meta_title:
      "Diabetes Workshop for New Patients | TF Wellfare Events",
    meta_description:
      "Join our free workshop for newly diagnosed diabetes patients. Learn blood sugar monitoring, medication management, diet, and lifestyle tips.",
  },
};

interface EventPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const event = events[params.slug];

  if (!event) {
    return {
      title: "Event Not Found",
    };
  }

  return {
    title: event.meta_title || event.title,
    description: event.meta_description || event.description,
    openGraph: {
      title: event.meta_title || event.title,
      description: event.meta_description || event.description,
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(events).map((slug) => ({ slug }));
}

export default function EventPage({ params }: EventPageProps) {
  const event = events[params.slug];

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <EventSchema
        name={event.title}
        description={event.description}
        startDate={`${event.date}T${event.start_time}:00`}
        endDate={`${event.date}T${event.end_time}:00`}
        location={event.is_virtual ? "Online" : event.address}
        isVirtual={event.is_virtual}
        url={`https://tfwellfare.com/events/${params.slug}`}
      />
      <div className="container-fluid py-8">
        <Breadcrumbs
          items={[
            { label: "Events", href: "/events" },
            { label: event.title, href: `/events/${params.slug}` },
          ]}
        />
        <EventDetail event={event} />
      </div>
    </div>
  );
}
