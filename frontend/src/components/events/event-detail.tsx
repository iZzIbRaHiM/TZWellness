"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  User,
  ArrowLeft,
  Share2,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EventDetailProps {
  event: {
    title: string;
    slug: string;
    description: string;
    long_description: string;
    category: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    address?: string;
    is_virtual: boolean;
    max_attendees: number;
    registered_count: number;
    price: number;
    speaker: {
      name: string;
      title: string;
      bio: string;
    };
  };
}

export function EventDetail({ event }: EventDetailProps) {
  const { toast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const spotsLeft = event.max_attendees - event.registered_count;
  const isFull = spotsLeft <= 0;
  const isAlmostFull = spotsLeft <= 5 && !isFull;

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRegistering(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsRegistering(false);
    setIsRegistered(true);

    toast({
      title: "Registration successful!",
      description: "Check your email for confirmation details.",
    });
  };

  // Parse markdown-like content
  const parseContent = (content: string) => {
    const sections = content.split("\n\n").filter(Boolean);
    return sections.map((section, i) => {
      if (section.startsWith("## ")) {
        return (
          <h2
            key={i}
            className="font-serif text-xl font-bold text-emerald-950 mt-6 mb-3"
          >
            {section.replace("## ", "")}
          </h2>
        );
      }
      if (section.startsWith("- ") || section.includes("\n- ")) {
        const items = section.split("\n").filter((s) => s.startsWith("- "));
        return (
          <ul key={i} className="list-disc list-inside space-y-1 my-3">
            {items.map((item, j) => (
              <li key={j} className="text-gray-700">
                {item.replace("- ", "")}
              </li>
            ))}
          </ul>
        );
      }
      return (
        <p key={i} className="text-gray-700 my-3">
          {section}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/events"
        className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to all events
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge
                  variant={
                    event.category === "Workshop"
                      ? "default"
                      : event.category === "Live Q&A"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {event.category}
                </Badge>
                {event.price === 0 && <Badge variant="success">Free</Badge>}
                {event.is_virtual && (
                  <Badge variant="secondary">Virtual Event</Badge>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-950 mb-4">
                {event.title}
              </h1>

              <p className="text-xl text-gray-600">{event.description}</p>
            </div>

            {/* Event image placeholder */}
            <div className="relative h-64 bg-emerald-100 rounded-xl mb-8 flex items-center justify-center">
              <span className="text-8xl">📅</span>
            </div>

            {/* Details */}
            <div className="prose prose-emerald max-w-none">
              {parseContent(event.long_description)}
            </div>

            {/* Speaker */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">About the Speaker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center shrink-0">
                    <User className="h-8 w-8 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-950">
                      {event.speaker.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {event.speaker.title}
                    </p>
                    <p className="text-gray-700">{event.speaker.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(parseISO(event.date), "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.start_time} - {event.end_time}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  {event.is_virtual ? (
                    <Video className="h-5 w-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{event.location}</p>
                    {event.address && (
                      <p className="text-sm text-gray-500">{event.address}</p>
                    )}
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {event.registered_count} / {event.max_attendees} registered
                    </p>
                    {isAlmostFull && (
                      <p className="text-sm text-red-600">
                        Only {spotsLeft} spots left!
                      </p>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="pt-4 border-t">
                  <p className="text-2xl font-bold text-emerald-700">
                    {event.price === 0 ? "Free" : `$${event.price}`}
                  </p>
                </div>

                {/* Registration */}
                {isRegistered ? (
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-800">
                      You're registered!
                    </p>
                    <p className="text-sm text-green-600">
                      Check your email for details
                    </p>
                  </div>
                ) : isFull ? (
                  <Button disabled className="w-full">
                    Event Full
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="cta" className="w-full">
                        {event.price > 0
                          ? `Register - $${event.price}`
                          : "Register Free"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register for Event</DialogTitle>
                        <DialogDescription>{event.title}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleRegister} className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone (optional)</Label>
                          <Input id="phone" type="tel" />
                        </div>
                        <Button
                          type="submit"
                          variant="cta"
                          className="w-full"
                          disabled={isRegistering}
                        >
                          {isRegistering
                            ? "Registering..."
                            : "Complete Registration"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Share */}
                <Button variant="outline" className="w-full mt-4">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
