"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { appointmentsApi } from "@/lib/api";

const stats = [
  { value: "10,000+", label: "Patients Treated" },
  { value: "98%", label: "Patient Satisfaction" },
  { value: "15+", label: "Years Experience" },
];

export function HeroSection() {
  const router = useRouter();
  const [nextSlot, setNextSlot] = useState<{ date: string; time: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNextAvailableSlot = async () => {
      try {
        const response = await appointmentsApi.getAvailableDates(14);
        if (response.success && response.data?.dates && response.data.dates.length > 0) {
          const firstDate = response.data.dates[0];
          
          // Fetch slots for the first available date
          const slotsResponse = await appointmentsApi.getAvailableSlots({
            start_date: firstDate,
            end_date: firstDate,
            modality: "both"
          });
          
          if (slotsResponse.success && slotsResponse.data?.slots) {
            // Get slots for the first date
            const dateSlots = slotsResponse.data.slots[firstDate];
            if (dateSlots && dateSlots.length > 0) {
              const firstSlot = dateSlots[0];
              setNextSlot({
                date: firstDate,
                time: firstSlot.start_time
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching next available slot:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNextAvailableSlot();
  }, []);

  const formatSlotDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const formatSlotTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleBookClick = () => {
    if (nextSlot) {
      router.push(`/appointments?date=${nextSlot.date}&time=${nextSlot.time}`);
    } else {
      router.push('/appointments');
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-sand-100"
      aria-labelledby="hero-heading"
    >
      {/* Background decoration - subtle organic shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.4, 0.3] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.08, 1],
            opacity: [0.2, 0.3, 0.2] 
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-terracotta-100 rounded-full blur-3xl" 
        />
      </div>

      <div className="container-fluid relative py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="text-center lg:text-left"
          >
            {/* Trust badge */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass-card text-emerald-800 text-sm font-medium mb-8"
            >
              <Star className="h-4 w-4 fill-terracotta text-terracotta" aria-hidden="true" />
              <span>Trusted by 2,000+ Patients on Their Metabolic Journey</span>
            </motion.div>

            {/* Main headline - Editorial typography */}
            <h1
              id="hero-heading"
              className="font-serif text-display-lg lg:text-display-xl text-emerald-950 mb-6"
            >
              Nurture Your Health &{" "}
              <span className="italic text-terracotta">Reclaim Your Vitality</span>
            </h1>

            <p className="text-lg text-emerald-800/80 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              We offer specialized care for prediabetes, diabetes, fatty liver disease, and obesity.
              Our approach is grounded in Lifestyle Medicine, which focuses on reducing the burden of lifestyle-related chronic metabolic conditions and autoimmune diseases such as rheumatoid arthritis, systemic lupus erythematosus (SLE), and thyroid disorders.
              Through evidence-based lifestyle interventions, we aim not only to manage disease but to enhance overall health, improve quality of life, and promote longevity.
            </p>

            {/* Value props */}
            <ul className="space-y-4 mb-10 text-left max-w-md mx-auto lg:mx-0">
              {[
                "Balance Blood Sugar & Hormones Naturally",
                "Prevent & Reverse Chronic Conditions",
                "Personalized Nutrition & Lifestyle Plans",
              ].map((prop, index) => (
                <motion.li
                  key={index}
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 text-emerald-900"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle
                      className="h-4 w-4 text-emerald-600"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="font-medium">{prop}</span>
                </motion.li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild variant="cta" size="xl">
                <Link href="/appointments">
                  <Calendar className="mr-2 h-5 w-5" aria-hidden="true" />
                  Book Your Consultation
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href="/about">
                  Learn About Our Approach
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Hero Image with Blob Shape */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative lg:pl-8"
          >
            {/* Floating blob-shaped image container */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Blob shape mask */}
                <div className="absolute inset-0 blob-shape bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-elevated-lg">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer backdrop-blur-sm"
                      >
                        <Play className="h-10 w-10 ml-1" />
                      </motion.div>
                      <p className="font-serif text-xl italic">Watch Our Story</p>
                    </div>
                  </div>
                </div>

                {/* Decorative rings */}
                <div className="absolute -inset-4 border-2 border-emerald-200/30 blob-shape animate-blob" style={{ animationDelay: "-2s" }} />
                <div className="absolute -inset-8 border border-emerald-100/20 blob-shape animate-blob" style={{ animationDelay: "-4s" }} />
              </div>

              {/* Floating appointment card */}
              <motion.div
                initial={{ y: 30, x: 20 }}
                animate={{ y: 0, x: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-6 -left-6 glass-card p-4 shadow-elevated-md max-w-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-emerald-900">
                      Next Available
                    </div>
                    <div className="text-sm text-emerald-700/70">
                      {isLoading ? (
                        "Loading..."
                      ) : nextSlot ? (
                        `${formatSlotDate(nextSlot.date)}, ${formatSlotTime(nextSlot.time)}`
                      ) : (
                        "Check availability"
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="ml-auto flex-shrink-0"
                    onClick={handleBookClick}
                    disabled={isLoading}
                  >
                    Book
                  </Button>
                </div>
              </motion.div>

              {/* Floating rating badge */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="absolute -top-4 -right-4 glass-card p-3 shadow-elevated-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-terracotta text-terracotta" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-emerald-900">5.0</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
