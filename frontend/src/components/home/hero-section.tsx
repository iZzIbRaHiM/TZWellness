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

          {/* Hero Visual Element - Organic Breathing Blob */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="relative lg:pl-8 flex items-center justify-center"
          >
            {/* Organic blob container */}
            <div className="relative w-full max-w-lg aspect-square">
              {/* SVG Morphing Blob */}
              <svg
                viewBox="0 0 500 500"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
                  </linearGradient>
                  <filter id="blobGlow">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Morphing blob path */}
                <motion.path
                  fill="url(#blobGradient)"
                  filter="url(#blobGlow)"
                  initial={{
                    d: "M250,100 C305,100 350,120 380,160 C410,200 420,250 400,300 C380,350 340,385 280,395 C220,405 160,390 120,350 C80,310 70,250 85,195 C100,140 150,100 210,100 C230,100 240,100 250,100 Z"
                  }}
                  animate={{
                    d: [
                      // Keyframe 1: Starting shape - slightly compressed top
                      "M250,100 C305,100 350,120 380,160 C410,200 420,250 400,300 C380,350 340,385 280,395 C220,405 160,390 120,350 C80,310 70,250 85,195 C100,140 150,100 210,100 C230,100 240,100 250,100 Z",
                      
                      // Keyframe 2: Expand right, compress left
                      "M250,95 C310,95 365,115 395,155 C425,195 435,245 415,295 C395,345 355,380 290,390 C225,400 165,385 125,345 C85,305 75,250 90,195 C105,140 155,95 215,95 C235,95 245,95 250,95 Z",
                      
                      // Keyframe 3: Expand bottom, compress top
                      "M250,105 C300,105 345,125 375,165 C405,205 415,255 395,310 C375,365 330,400 270,405 C210,410 155,395 115,355 C75,315 65,255 80,200 C95,145 145,105 205,105 C225,105 240,105 250,105 Z",
                      
                      // Keyframe 4: Expand left, compress right  
                      "M250,100 C295,100 335,120 365,160 C395,200 405,250 385,305 C365,360 320,390 265,398 C210,406 160,391 125,351 C90,311 80,251 95,196 C110,141 160,100 220,100 C235,100 245,100 250,100 Z",
                      
                      // Keyframe 5: Gentle squeeze all around
                      "M250,102 C303,102 348,122 378,162 C408,202 418,252 398,302 C378,352 338,387 278,396 C218,405 163,390 123,350 C83,310 73,250 88,195 C103,140 153,102 213,102 C233,102 243,102 250,102 Z",
                      
                      // Keyframe 6: Expand top right, compress bottom left
                      "M250,98 C308,98 355,118 385,158 C415,198 425,248 405,298 C385,348 345,383 283,393 C221,403 166,388 126,348 C86,308 76,248 91,193 C106,138 156,98 216,98 C236,98 246,98 250,98 Z",
                      
                      // Return to start
                      "M250,100 C305,100 350,120 380,160 C410,200 420,250 400,300 C380,350 340,385 280,395 C220,405 160,390 120,350 C80,310 70,250 85,195 C100,140 150,100 210,100 C230,100 240,100 250,100 Z"
                    ]
                  }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1]
                  }}
                />
                
                {/* Secondary subtle layer for depth */}
                <motion.path
                  fill="rgba(16, 185, 129, 0.3)"
                  initial={{
                    d: "M250,120 C295,120 335,138 360,172 C385,206 393,248 378,288 C363,328 330,355 285,363 C240,371 195,360 163,330 C131,300 123,253 135,210 C147,167 185,120 230,120 C240,120 245,120 250,120 Z"
                  }}
                  animate={{
                    d: [
                      "M250,120 C295,120 335,138 360,172 C385,206 393,248 378,288 C363,328 330,355 285,363 C240,371 195,360 163,330 C131,300 123,253 135,210 C147,167 185,120 230,120 C240,120 245,120 250,120 Z",
                      "M250,118 C298,118 340,136 365,170 C390,204 398,246 383,286 C368,326 333,353 288,361 C243,369 198,358 166,328 C134,298 126,251 138,208 C150,165 188,118 233,118 C243,118 248,118 250,118 Z",
                      "M250,122 C293,122 333,140 358,174 C383,208 391,250 376,290 C361,330 328,357 283,365 C238,373 193,362 161,332 C129,302 121,255 133,212 C145,169 183,122 228,122 C238,122 245,122 250,122 Z",
                      "M250,120 C296,120 336,138 361,172 C386,206 394,248 379,288 C364,328 331,355 286,363 C241,371 196,360 164,330 C132,300 124,253 136,210 C148,167 186,120 231,120 C241,120 246,120 250,120 Z",
                      "M250,121 C294,121 334,139 359,173 C384,207 392,249 377,289 C362,329 329,356 284,364 C239,372 194,361 162,331 C130,301 122,254 134,211 C146,168 184,121 229,121 C239,121 245,121 250,121 Z",
                      "M250,119 C297,119 337,137 362,171 C387,205 395,247 380,287 C365,327 332,354 287,362 C242,370 197,359 165,329 C133,299 125,252 137,209 C149,166 187,119 232,119 C242,119 247,119 250,119 Z",
                      "M250,120 C295,120 335,138 360,172 C385,206 393,248 378,288 C363,328 330,355 285,363 C240,371 195,360 163,330 C131,300 123,253 135,210 C147,167 185,120 230,120 C240,120 245,120 250,120 Z"
                    ]
                  }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1],
                    delay: 0.3
                  }}
                />
              </svg>

              {/* Floating appointment card */}
              <motion.div
                initial={{ y: 30, x: -20, opacity: 0 }}
                animate={{ y: 0, x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-6 -left-6 glass-card p-4 shadow-elevated-md max-w-xs z-10"
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
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
