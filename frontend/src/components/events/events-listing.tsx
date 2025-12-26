"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isAfter,
  startOfToday,
} from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  CalendarDays,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { EventSchema } from "@/components/seo/schemas";
import { eventsApi, Event, EventCategory } from "@/lib/api";

type ViewMode = "list" | "calendar";

export function EventsListing() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch events from API
  const { data: eventsData, isLoading, isError } = useQuery({
    queryKey: ["events", activeCategory],
    queryFn: () => eventsApi.getAll({
      category: activeCategory !== "All" ? activeCategory : undefined,
      status: "upcoming",
    }),
  });

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["event-categories"],
    queryFn: () => eventsApi.getCategories(),
  });

  const events = eventsData?.data?.results || [];
  const apiCategories = categoriesData?.data || [];
  const categories = ["All", ...apiCategories.map((cat: EventCategory) => cat.name)];

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event: Event) => {
      const matchesCategory =
        activeCategory === "All" || event.category?.name === activeCategory;
      return matchesCategory;
    });
  }, [events, activeCategory]);

  // Get events for the current month (calendar view)
  const monthEvents = useMemo(() => {
    return filteredEvents.filter((event: Event) => {
      const eventDate = parseISO(event.start_datetime);
      return isSameMonth(eventDate, currentMonth);
    });
  }, [filteredEvents, currentMonth]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3 text-emerald-600" />
        <p>Loading events...</p>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-red-600">
        <AlertCircle className="h-12 w-12 mb-3" />
        <p className="font-semibold mb-1">Unable to load events</p>
        <p className="text-sm text-gray-600">Please try again later</p>
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Calendar className="h-16 w-16 mb-4 text-gray-300" />
        <p className="font-semibold mb-1">No events scheduled</p>
        <p className="text-sm">Check back soon for upcoming events and workshops.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters and view toggle */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        {/* Category tabs */}
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full md:w-auto overflow-auto"
        >
          <TabsList className="flex w-full md:w-auto">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="whitespace-nowrap">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* View toggle */}
        <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              viewMode === "list"
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            List
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              viewMode === "calendar"
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <CalendarDays className="h-4 w-4" />
            Calendar
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-6">
        Showing {filteredEvents.length} event{filteredEvents.length !== 1 && "s"}
      </p>

      {viewMode === "list" ? (
        <ListView events={filteredEvents} />
      ) : (
        <CalendarView
          events={monthEvents}
          currentMonth={currentMonth}
          onMonthChange={(delta) =>
            setCurrentMonth(delta > 0 ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1))
          }
        />
      )}
    </div>
  );
}

// List View Component
function ListView({ events }: { events: any[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <AnimatePresence mode="popLayout">
        {events.map((event: Event, index: number) => (
          <motion.div
            key={event.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <EventCard event={event} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Calendar View Component
function CalendarView({
  events,
  currentMonth,
  onMonthChange,
}: {
  events: any[];
  currentMonth: Date;
  onMonthChange: (delta: number) => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    events.forEach((event) => {
      const dateKey = format(parseISO(event.start_datetime), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-emerald-950">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Leading empty cells */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Calendar days */}
        {daysInMonth.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateKey] || [];
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={dateKey}
              className={cn(
                "aspect-square border rounded-lg p-2 relative",
                isToday && "border-emerald-500 bg-emerald-50",
                dayEvents.length > 0 && "cursor-pointer hover:shadow-md transition-shadow"
              )}
            >
              <div
                className={cn(
                  "text-sm font-medium mb-1",
                  isToday ? "text-emerald-700" : "text-gray-700"
                )}
              >
                {format(day, "d")}
              </div>
              {dayEvents.length > 0 && (
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-[10px] bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded truncate"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-gray-500 px-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Events list below calendar */}
      {events.length > 0 && (
        <div className="mt-8">
          <h4 className="font-semibold text-emerald-950 mb-4">
            Events in {format(currentMonth, "MMMM")}
          </h4>
          <div className="space-y-4">
            {events.map((event: Event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Event Card Component
interface EventCardProps {
  event: any;
  compact?: boolean;
}

function EventCard({ event, compact = false }: EventCardProps) {
  const eventDate = parseISO(event.start_datetime);
  const spotsLeft = event.spots_left;
  const isFull = event.is_full;

  return (
    <Link href={`/events/${event.slug}`}>
      <Card variant="interactive" className={cn("h-full", compact && "flex-row items-center")}>
        <CardHeader className={cn(compact && "py-3")}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="secondary" className="shrink-0">
              {event.category?.name || "Event"}
            </Badge>
            {isFull && (
              <Badge variant="destructive" className="shrink-0">Full</Badge>
            )}
            {!isFull && spotsLeft !== null && spotsLeft <= 5 && (
              <Badge variant="warning" className="shrink-0">
                {spotsLeft} spots left
              </Badge>
            )}
          </div>
          <CardTitle className={cn(compact ? "text-base" : "text-xl")}>
            {event.title}
          </CardTitle>
          {!compact && (
            <CardDescription className="line-clamp-2">
              {event.short_description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className={cn(compact && "py-3")}>
          <div className="space-y-2 text-sm">
            {/* Date & Time */}
            <div className="flex items-center gap-2 text-emerald-700">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{format(eventDate, "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{format(eventDate, "h:mm a")}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-emerald-700">
              {event.modality === "virtual" ? (
                <>
                  <Video className="h-4 w-4 shrink-0" />
                  <span>Virtual Event</span>
                </>
              ) : event.modality === "in_person" ? (
                <>
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{event.location || "In-Person"}</span>
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Hybrid Event</span>
                </>
              )}
            </div>

            {/* Attendees */}
            {event.max_attendees && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4 shrink-0" />
                <span>
                  {event.current_attendees || 0} / {event.max_attendees} registered
                </span>
              </div>
            )}

            {/* Price */}
            {!compact && (
              <div className="pt-2 mt-2 border-t">
                {event.is_free ? (
                  <span className="font-semibold text-emerald-700">Free Event</span>
                ) : (
                  <span className="font-semibold text-emerald-700">
                    ${event.price}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
