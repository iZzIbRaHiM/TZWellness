"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { servicesApi, Service } from "@/lib/api";

export function ServicesSection() {
  // Fetch services from API
  const { data, isLoading } = useQuery({
    queryKey: ["services-home"],
    queryFn: () => servicesApi.getAll({ featured: true }),
  });

  const services = (data?.data?.services || []).slice(0, 4);
  return (
    <section className="py-24 bg-sand-100" aria-labelledby="services-heading">
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2
            id="services-heading"
            className="font-serif text-display-sm sm:text-display-md text-emerald-950 mb-4"
          >
            Our <span className="italic text-terracotta">Specialized</span> Services
          </h2>
          <p className="text-lg text-emerald-700/80">
            Expert care for metabolic and hormonal conditions. Each service is
            designed with your complete wellness in mind.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-emerald-600" />
            <p>Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p>No featured services available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service: Service, index: number) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  variant="interactive"
                  className="h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-white to-sand-50"
                >
                  {service.is_featured && (
                    <Badge className="absolute top-4 right-4 bg-terracotta text-white border-0" variant="default">
                      Featured
                    </Badge>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-emerald-700/70">
                      {service.short_description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-3 text-sm text-emerald-800/80">
                      {service.modality && (
                        <p><strong>Format:</strong> {service.modality}</p>
                      )}
                      {service.duration_minutes && (
                        <p><strong>Duration:</strong> {service.duration_minutes} minutes</p>
                      )}
                      {service.price && (
                        <p className="text-lg font-semibold text-emerald-700">
                          ${service.price}
                          {service.price_note && <span className="text-xs font-normal text-gray-500 ml-1">({service.price_note})</span>}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto">
                    <Link
                      href={`/services/${service.slug}`}
                      className="group inline-flex items-center text-emerald-700 hover:text-terracotta font-medium transition-colors duration-200"
                    >
                      Learn More
                      <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-14"
        >
          <Button asChild variant="outline" size="lg">
            <Link href="/services">
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
