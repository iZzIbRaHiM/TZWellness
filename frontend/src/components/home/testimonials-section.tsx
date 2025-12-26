"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote, BadgeCheck, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { testimonialsApi, Testimonial } from "@/lib/api";

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const response = await testimonialsApi.getAll();
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const testimonials = data || [];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-sand-100">
        <div className="container-fluid flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </section>
    );
  }

  if (error || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-sand-100" aria-labelledby="testimonials-heading">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2
            id="testimonials-heading"
            className="font-serif text-display-sm sm:text-display-md text-emerald-950 mb-4"
          >
            Real Stories, <span className="italic text-terracotta">Real Results</span>
          </h2>
          <p className="text-lg text-emerald-700/80">
            See what our patients have to say about their experience with TF
            Wellfare Medical Clinic.
          </p>
        </motion.div>

        {/* Desktop grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="lg:hidden">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <TestimonialCard testimonial={testimonials[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={next}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <Card variant="interactive" className="h-full bg-white">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < testimonial.rating
                  ? "text-terracotta fill-terracotta"
                  : "text-sand-300"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Quote */}
        <div className="relative flex-1 mb-4">
          <Quote
            className="absolute -top-2 -left-2 h-8 w-8 text-emerald-100"
            aria-hidden="true"
          />
          <p className="text-emerald-800/80 relative z-10 leading-relaxed">{testimonial.content}</p>
        </div>

        {/* Author */}
        <div className="flex items-center justify-between pt-4 border-t border-sand-200">
          <div>
            <div className="font-medium text-emerald-900 flex items-center gap-2">
              {testimonial.patient_name}
              {testimonial.is_verified && (
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              )}
            </div>
            <div className="text-sm text-emerald-600/70">{testimonial.location}</div>
          </div>
          <div className="text-right">
            {testimonial.service_name && (
              <Badge variant="secondary" className="mb-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                {testimonial.service_name}
              </Badge>
            )}
            <div className="text-xs text-emerald-500/70">
              {formatDate(testimonial.created_at)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
