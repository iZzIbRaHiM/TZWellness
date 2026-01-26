"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  Leaf, 
  Heart,
  Activity,
  BookOpen,
  Video,
  Apple,
  Brain,
  Target,
  Sparkles,
} from "lucide-react";

const packages = [
  {
    id: "reversal-plan",
    name: "MY REVERSAL PLAN",
    tagline: "Foundation for Healing",
    price: "Contact for pricing",
    duration: "3 Months",
    bestFor: [
      "Pre-diabetes",
      "New onset diabetes mellitus",
      "Fatty liver (initial stages)",
      "General health optimization",
    ],
    includes: [
      { icon: Apple, text: "3-month personalized nutrition plan" },
      { icon: Calendar, text: "2 follow-up sessions (at 1.5 & 3 months)" },
      { icon: Heart, text: "Bone broth recipe for gut healing" },
      { icon: BookOpen, text: "4 rules of correct eating guide" },
      { icon: Activity, text: "Yoga sessions - 3 per week" },
      { icon: Brain, text: "Meditation sessions - 2 per week" },
      { icon: Target, text: "Reversal tracker notebook" },
    ],
    color: "emerald",
    gradient: "from-emerald-50 to-teal-50",
    badgeColor: "bg-emerald-600",
  },
  {
    id: "reset-journey",
    name: "MY RESET JOURNEY",
    tagline: "Complete Transformation",
    price: "Contact for pricing",
    duration: "6 to 9 Months",
    bestFor: [
      "Long-duration diabetes",
      "Advanced fatty liver disease",
      "Significant weight reduction goals",
      "Autoimmune diseases",
    ],
    includes: [
      { icon: Sparkles, text: "Everything in MY REVERSAL PLAN" },
      { icon: Apple, text: "Extended 6-9 month nutrition plan" },
      { icon: Calendar, text: "Additional follow-up sessions" },
      { icon: Heart, text: "Advanced metabolic protocols" },
      { icon: BookOpen, text: "Comprehensive lifestyle guides" },
      { icon: Activity, text: "Enhanced yoga & movement therapy" },
      { icon: Brain, text: "Advanced meditation & stress management" },
      { icon: Target, text: "Extended reversal tracking & analytics" },
    ],
    color: "emerald",
    gradient: "from-emerald-600 to-emerald-800",
    badgeColor: "bg-terracotta",
    featured: true,
  },
];

export function PackagesSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-sand-50 via-white to-emerald-50">
      <div className="container-fluid">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-0">
            Healing Packages
          </Badge>
          <h2 className="font-serif text-display-sm lg:text-display-md text-emerald-950 mb-4">
            Choose Your <span className="italic text-terracotta">Healing Journey</span>
          </h2>
          <p className="text-lg text-emerald-700/80">
            Structured programs designed to reverse disease and restore your health naturally. 
            Each package includes personalized care, lifestyle coaching, and continuous support.
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card 
                className={`h-full relative overflow-hidden border-2 ${
                  pkg.featured 
                    ? "border-terracotta shadow-elevated-lg" 
                    : "border-emerald-200 shadow-elevated-sm hover:shadow-elevated-md"
                } transition-all duration-300`}
              >
                {/* Featured Badge */}
                {pkg.featured && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-terracotta text-white px-6 py-1 text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Card Header with Gradient */}
                <CardHeader className={`bg-gradient-to-br ${pkg.featured ? pkg.gradient : 'from-emerald-50 to-white'} ${pkg.featured ? 'text-white' : 'text-emerald-950'} pb-8`}>
                  <div className="space-y-2">
                    <CardTitle className={`font-serif text-3xl ${pkg.featured ? 'text-white' : 'text-emerald-950'}`}>
                      {pkg.name}
                    </CardTitle>
                    <CardDescription className={pkg.featured ? 'text-emerald-100' : 'text-emerald-700'}>
                      {pkg.tagline}
                    </CardDescription>
                    <div className="flex items-baseline gap-2 pt-4">
                      <span className={`text-sm font-medium ${pkg.featured ? 'text-emerald-100' : 'text-emerald-700'}`}>
                        Duration:
                      </span>
                      <span className={`text-2xl font-bold ${pkg.featured ? 'text-white' : 'text-emerald-900'}`}>
                        {pkg.duration}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-8 pb-6">
                  {/* Best For Section */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-emerald-950 mb-3 flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-emerald-600" />
                      Best For:
                    </h4>
                    <ul className="space-y-2">
                      {pkg.bestFor.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                          <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Includes Section */}
                  <div>
                    <h4 className="font-semibold text-emerald-950 mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-terracotta" />
                      What's Included:
                    </h4>
                    <ul className="space-y-3">
                      {pkg.includes.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <li key={i} className="flex items-start gap-3 text-sm text-emerald-700">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span className="pt-1">{item.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-6 border-t bg-sand-50">
                  <Button 
                    asChild 
                    variant={pkg.featured ? "cta" : "default"}
                    size="lg" 
                    className="w-full"
                  >
                    <Link href="/appointments">
                      <Calendar className="mr-2 h-5 w-5" />
                      Book Consultation
                    </Link>
                  </Button>
                  <p className="text-xs text-center text-emerald-600">
                    Free initial consultation • Personalized plan • Medical supervision
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-emerald-700/80 mb-4">
            Not sure which package is right for you?
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/appointments">
              Schedule a Free Consultation
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
