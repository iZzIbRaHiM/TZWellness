"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useBookingStore } from "@/lib/store";
import { servicesApi, Service } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Service features mapping by category for rich display
const serviceFeaturesByCategory: Record<string, string[]> = {
  endocrinology: ["Hormone Testing", "Personalized Treatment", "Long-term Management"],
  diabetes: ["Blood Sugar Monitoring", "Medication Optimization", "Diet Planning"],
  thyroid: ["Comprehensive Testing", "Natural Treatments", "Energy Restoration"],
  pcos: ["Hormone Balance", "Fertility Support", "Weight Management"],
  obesity: ["Metabolic Testing", "Custom Meal Plans", "Behavior Coaching"],
  general: ["Comprehensive Assessment", "Treatment Planning", "Lab Review"],
};

// Default features if category not found
const defaultFeatures = ["Expert Care", "Personalized Treatment", "Follow-up Support"];

export function StepService() {
  const searchParams = useSearchParams();
  const { serviceId, setService, nextStep } = useBookingStore();

  // Fetch services from API
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesApi.getAll(),
  });

  const services = data?.data?.services || [];

  // Pre-select service from URL query param
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam && !serviceId && services.length > 0) {
      const service = services.find((s: Service) => s.slug === serviceParam || s.id === parseInt(serviceParam));
      if (service) {
        setService(service.slug || String(service.id), service.title);
      }
    }
  }, [searchParams, serviceId, setService, services]);

  const handleServiceSelect = (service: Service) => {
    setService(service.slug || String(service.id), service.title);
    // Auto-advance after selection
    setTimeout(() => nextStep(), 300);
  };

  // Get features for a service based on its category
  const getServiceFeatures = (service: Service): string[] => {
    const categoryKey = service.category?.slug || service.category || "general";
    return serviceFeaturesByCategory[categoryKey] || defaultFeatures;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-2">
            What Brings You In?
          </h2>
          <p className="text-gray-600">
            Select the service you'd like to book
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-emerald-600" />
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-2">
            What Brings You In?
          </h2>
          <p className="text-gray-600">
            Select the service you'd like to book
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-red-600">
          <AlertCircle className="h-12 w-12 mb-3" />
          <p className="font-semibold mb-1">Unable to load services</p>
          <p className="text-sm text-gray-600">{error instanceof Error ? error.message : "Please try again later"}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!services || services.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-2">
            What Brings You In?
          </h2>
          <p className="text-gray-600">
            Select the service you'd like to book
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <AlertCircle className="h-12 w-12 mb-3" />
          <p className="font-semibold mb-1">No services available</p>
          <p className="text-sm">Please check back later or contact us directly.</p>
        </div>
      </div>
    );
  }

  // Filter only published services
  const publishedServices = services.filter((s: Service) => s.is_published !== false);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-2">
          What Brings You In?
        </h2>
        <p className="text-gray-600">
          Select the service you'd like to book
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
        {publishedServices.map((service: Service) => {
          const isSelected = serviceId === (service.slug || String(service.id));
          const features = getServiceFeatures(service);
          
          return (
            <div
              key={service.id}
              onClick={() => handleServiceSelect(service)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleServiceSelect(service);
                }
              }}
              role="button"
              tabIndex={0}
              className={cn(
                "cursor-pointer transition-all relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm p-6 h-full",
                "hover:shadow-md active:scale-[0.98]",
                isSelected
                  ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600"
                  : "border-border hover:border-emerald-300 hover:bg-emerald-50/30"
              )}
            >
              {service.is_featured && (
                <Badge className="absolute top-3 right-3 bg-terracotta text-white border-0">
                  Popular
                </Badge>
              )}
              
              {isSelected && (
                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              <div className={cn("pb-3", service.is_featured && "pt-5")}>
                <div className="text-4xl mb-2">{service.icon || "🩺"}</div>
                <h3 className="text-lg font-semibold flex items-center justify-between mb-2">
                  {service.title}
                  {service.duration && (
                    <span className="text-sm font-normal text-gray-500">{service.duration} min</span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
              
                <ul className="space-y-1.5">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-emerald-800/80">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full mr-2.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {service.price && (
                  <p className="text-sm font-semibold text-emerald-700 mt-3">
                    ${service.price}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 flex justify-between items-center border-t">
        <p className="text-sm text-gray-500">
          Not sure? Call us at <span className="font-medium text-emerald-700">(555) 123-4567</span>
        </p>
        {serviceId && (
          <Button onClick={nextStep} className="h-11 px-8">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
