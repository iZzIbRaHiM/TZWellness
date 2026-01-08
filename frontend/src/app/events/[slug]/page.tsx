import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EventDetail } from "@/components/events/event-detail";
import { EventSchema } from "@/components/seo/schemas";
import { eventsApi } from "@/lib/api";

interface EventPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const response = await eventsApi.getBySlug(params.slug);

  if (!response.success || !response.data) {
    return {
      title: "Event Not Found",
    };
  }

  const event = response.data;

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

export default async function EventPage({ params }: EventPageProps) {
  const response = await eventsApi.getBySlug(params.slug);

  if (!response.success || !response.data) {
    notFound();
  }

  const event = response.data;

  // Format event data to match component expectations
  const formattedEvent = {
    ...event,
    date: event.start_date.split('T')[0],
    start_time: event.start_date.split('T')[1]?.substring(0, 5) || "00:00",
    end_time: event.end_date.split('T')[1]?.substring(0, 5) || "00:00",
    location: event.location_name || "TZ Wellness Center",
    address: event.location_address || "",
    is_virtual: event.modality === 'virtual',
    registered_count: event.current_participants,
    max_attendees: event.max_participants,
    price: 0,
    category: event.category?.name || "Event",
    long_description: event.description,
  };

  const isVirtual = event.modality === 'virtual';
  const locationString = isVirtual ? "Online" : (event.location_address || event.location_name || "TZ Wellness Center");

  return (
    <div className="min-h-screen bg-sand-50">
      <EventSchema
        name={event.title}
        description={event.description || event.title}
        startDate={event.start_date}
        endDate={event.end_date}
        location={locationString}
        isVirtual={isVirtual}
        url={`https://tzwellness.com/events/${params.slug}`}
      />
      <div className="container-fluid py-8">
        <Breadcrumbs
          items={[
            { label: "Events", href: "/events" },
            { label: event.title, href: `/events/${params.slug}` },
          ]}
        />
        <EventDetail event={formattedEvent} />
      </div>
    </div>
  );
}
