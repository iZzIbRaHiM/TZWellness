"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Clock, Video, MapPin, Loader2, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { servicesApi, categoriesApi, Service, ServiceCategory } from "@/lib/api";

export function ServicesGrid() {
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch services from API
  const { data: servicesData, isLoading: servicesLoading, isError: servicesError } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesApi.getAll(),
  });

  // Fetch categories from API
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["service-categories"],
    queryFn: () => categoriesApi.getAll(),
  });

  const services = servicesData?.data?.services || [];
  const apiCategories = categoriesData?.data || [];

  // Build categories array with "all" option
  const categories = [
    { id: "all", name: "All Services" },
    ...apiCategories.map((cat: ServiceCategory) => ({ id: cat.slug, name: cat.name })),
  ];

  // Filter services by category
  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((s: Service) => s.category?.slug === activeCategory || s.category === activeCategory);

  // Loading state
  if (servicesLoading || categoriesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin mb-3 text-emerald-600" />
        <p>Loading services...</p>
      </div>
    );
  }

  // Error state
  if (servicesError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-red-600">
        <AlertCircle className="h-12 w-12 mb-3" />
        <p className="font-semibold mb-1">Unable to load services</p>
        <p className="text-sm text-gray-600">Please try again later</p>
      </div>
    );
  }

  // Empty state
  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-3" />
        <p className="font-semibold mb-1">No services available</p>
        <p className="text-sm">Please check back later or contact us directly.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Category tabs */}
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="mb-8"
      >
        <TabsList className="mx-auto flex w-fit">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Services grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service: Service, index: number) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card variant="interactive" className="h-full flex flex-col relative">
              {service.is_featured && (
                <Badge className="absolute top-4 right-4" variant="success">
                  Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.short_description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {/* Meta info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  {service.duration_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                  )}
                  {service.modality === "both" && (
                    <>
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        <span>Virtual</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>In-Person</span>
                      </div>
                    </>
                  )}
                  {service.modality === "virtual" && (
                    <div className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      <span>Virtual Only</span>
                    </div>
                  )}
                  {service.modality === "in-person" && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>In-Person Only</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                {service.price && (
                  <div className="text-lg font-semibold text-emerald-700 mb-4">
                    {formatPrice(service.price)}
                    {service.price_note && (
                      <span className="text-sm font-normal text-gray-500">
                        {" "}
                        {service.price_note}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
              <div className="p-6 pt-0 mt-auto flex gap-2">
                <Button asChild variant="default" className="flex-1">
                  <Link href="/book">Book Now</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/services/${service.slug}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
