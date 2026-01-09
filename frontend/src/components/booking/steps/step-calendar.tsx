"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, parseISO, startOfDay, isSameDay } from "date-fns";
import { useBookingStore } from "@/lib/store";
import { appointmentsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Clock,
  RefreshCw,
  Calendar as CalendarIcon,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Single-clinic mode - clinic name for display
const CLINIC_NAME = "TZ Wellness Health";

export function StepCalendar() {
  const {
    modality,
    selectedDate,
    selectedTime,
    setDateTime,
    nextStep,
    canProceed,
  } = useBookingStore();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Derive internal date from store's selectedDate for proper sync
  const internalSelectedDate = selectedDate ? parseISO(selectedDate) : undefined;

  // Fetch available dates
  const { data: availableDatesData, isLoading: datesLoading } = useQuery({
    queryKey: ["availableDates"],
    queryFn: async () => {
      const response = await appointmentsApi.getAvailableDates(60);
      console.log("📅 Available dates from API:", response.data?.dates);
      return response.data?.dates || [];
    },
    staleTime: 60 * 1000,
  });

  // Fetch available slots for selected date - keyed by formatted date string for stability
  const {
    data: slotsData,
    isLoading: slotsLoading,
    refetch: refetchSlots,
    isRefetching,
  } = useQuery({
    queryKey: ["availableSlots", selectedDate, modality],
    queryFn: async () => {
      if (!selectedDate) return null;
      const response = await appointmentsApi.getAvailableSlots({
        start_date: selectedDate,
        end_date: selectedDate,
        modality: modality === "phone" ? "virtual" : modality || undefined,
      });
      return response.data?.slots?.[selectedDate] || [];
    },
    enabled: !!selectedDate,
    staleTime: 30 * 1000,
  });

  const availableDates = availableDatesData || [];
  const slots = slotsData || [];

  // Check if a date has available slots
  const isDateAvailable = useCallback(
    (dateStr: string) => {
      return availableDates.includes(dateStr);
    },
    [availableDates]
  );

  // Handle date selection - updates store directly
  const handleDateSelect = useCallback((dateStr: string) => {
    console.log("🎯 Date clicked:", dateStr);
    console.log("📋 Available dates:", availableDates);
    console.log("✅ Is available?", availableDates.includes(dateStr));
    
    setDateTime(dateStr, ""); // Clear time when date changes
    
    toast({
      title: "Date selected",
      description: `You selected ${dateStr}`,
    });
  }, [setDateTime, availableDates, toast]);

  // Handle time selection
  const handleTimeSelect = useCallback((time: string) => {
    if (selectedDate) {
      setDateTime(selectedDate, time);
    }
  }, [selectedDate, setDateTime]);

  // Refresh slots (for edge case when slot is taken)
  const handleRefresh = useCallback(async () => {
    const result = await refetchSlots();
    if (result.data && result.data.length === 0) {
      toast({
        title: "No slots available",
        description: "Please select another date.",
        variant: "destructive",
      });
    }
  }, [refetchSlots]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: Date | null; dateStr: string | null; isCurrentMonth: boolean }> = [];

    // Empty cells before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, dateStr: null, isCurrentMonth: false });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = format(date, "yyyy-MM-dd");
      days.push({ date, dateStr, isCurrentMonth: true });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = startOfDay(new Date());

  // Determine if we have a valid selected date
  const hasSelectedDate = !!selectedDate && !!internalSelectedDate;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-emerald-950 mb-2">
          Choose Your Date & Time
        </h2>
        <p className="text-gray-600">
          {internalSelectedDate ? (
            <span className="text-emerald-700 font-medium">
              {format(internalSelectedDate, "EEEE, MMMM d, yyyy")} - Now select a time
            </span>
          ) : (
            "Select a convenient time for your consultation"
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Custom Calendar */}
        <div className="border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Select Date</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-700 font-medium min-w-[140px] text-center">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {datesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day.date || !day.dateStr) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const isPast = day.date < today;
                  const isAvailable = isDateAvailable(day.dateStr);
                  const isSelected = selectedDate === day.dateStr;
                  const isToday = isSameDay(day.date, new Date());
                  const isDisabled = isPast || !isAvailable;

                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("🖱️ Button clicked for:", day.dateStr, "Disabled:", isDisabled);
                        if (!isDisabled) {
                          handleDateSelect(day.dateStr!);
                        }
                      }}
                      disabled={isDisabled}
                      className={cn(
                        "aspect-square rounded-lg text-sm font-medium transition-all relative",
                        "flex items-center justify-center min-h-[40px]",
                        isDisabled && "cursor-not-allowed opacity-40",
                        !isDisabled && "cursor-pointer hover:bg-emerald-200 hover:scale-105 active:scale-95",
                        isSelected && "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md",
                        !isSelected && isAvailable && !isPast && "bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-semibold hover:border-emerald-500",
                        !isAvailable && !isPast && "bg-gray-50 text-gray-400 border border-gray-200",
                        isPast && "bg-gray-100 text-gray-300",
                        isToday && !isSelected && "ring-2 ring-offset-1 ring-emerald-500"
                      )}
                      title={isAvailable ? `Select ${day.dateStr}` : "Not available"}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-100 border-2 border-emerald-300" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200" />
              <span>Unavailable</span>
            </div>
          </div>
          
          {/* Debug info */}
          {!datesLoading && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
              <strong>Debug:</strong> {availableDates.length} available dates loaded
              {availableDates.length > 0 && (
                <div className="mt-1">Next 3: {availableDates.slice(0, 3).join(", ")}</div>
              )}
            </div>
          )}
        </div>

        {/* Time slots */}
        <div className="border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Select Time</h3>
            {hasSelectedDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefetching}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4 mr-1",
                    isRefetching && "animate-spin"
                  )}
                />
                Refresh
              </Button>
            )}
          </div>

          {!hasSelectedDate ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <CalendarIcon className="h-12 w-12 text-gray-300 mb-4" />
              <p>Please select a date first</p>
            </div>
          ) : slotsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
              <p>No available times for this date</p>
              <p className="text-sm">Please select another date</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
              {slots.map((slot) => {
                const isSelected = selectedTime === slot.start_time;
                return (
                  <button
                    key={slot.start_time}
                    onClick={() => handleTimeSelect(slot.start_time)}
                    className={cn(
                      "p-3 rounded-lg border text-center transition-all",
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                    )}
                    aria-pressed={isSelected}
                  >
                    <Clock
                      className={cn(
                        "h-4 w-4 mx-auto mb-1",
                        isSelected ? "text-emerald-600" : "text-gray-400"
                      )}
                    />
                    <span className="text-sm font-medium">
                      {slot.start_time}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {internalSelectedDate && selectedTime && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                <strong>Selected:</strong>{" "}
                {format(internalSelectedDate, "EEEE, MMMM d, yyyy")} at{" "}
                {selectedTime}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6">
        <Button
          onClick={nextStep}
          disabled={!canProceed()}
          className="w-full"
          size="lg"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
