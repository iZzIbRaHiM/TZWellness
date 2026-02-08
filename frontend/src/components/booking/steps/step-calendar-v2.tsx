"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useBookingStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepCalendarV2() {
  const { modality, selectedDate, selectedTime, setDateTime, nextStep } = useBookingStore();
  const [localDate, setLocalDate] = useState(selectedDate || "");
  const [localTime, setLocalTime] = useState(selectedTime || "");

  // Fetch available dates directly from Supabase
  const { data: dates, isLoading: loadingDates, error: datesError, refetch: refetchDates } = useQuery({
    queryKey: ["dates-v2"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_available_dates", { days_ahead: 30 });
      if (error) {
        console.error("Dates error:", error);
        throw error;
      }
      return (data || []) as string[];
    },
    retry: 1,
    staleTime: 0,
  });

  // Fetch slots for selected date
  const { data: slotsData, isLoading: loadingSlots } = useQuery({
    queryKey: ["slots-v2", localDate, modality],
    queryFn: async () => {
      if (!localDate) return {};
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_available_slots", {
        start_date: localDate,
        end_date: localDate,
        modality_filter: modality === "phone" ? "virtual" : modality || null,
      });
      if (error) {
        console.error("Slots error:", error);
        throw error;
      }
      return (data || {}) as Record<string, Array<{ start_time: string; end_time: string }>>;
    },
    enabled: !!localDate,
    retry: 1,
    staleTime: 0,
  });

  const slots = localDate && slotsData ? slotsData[localDate] || [] : [];

  const handleContinue = () => {
    if (localDate && localTime) {
      setDateTime(localDate, localTime);
      nextStep();
    }
  };

  if (datesError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">⚠️ Cannot connect to database. Check Supabase credentials.</p>
        <Button onClick={() => refetchDates()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-semibold">Choose Date & Time</h2>

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Select Date</label>
        {loadingDates ? (
          <p className="text-gray-500">Loading dates...</p>
        ) : dates && dates.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {dates.slice(0, 20).map((date: string) => (
              <button
                key={date}
                onClick={() => {
                  setLocalDate(date);
                  setLocalTime("");
                }}
                className={cn(
                  "p-3 rounded border text-sm",
                  localDate === date
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white border-gray-300 hover:border-emerald-500"
                )}
              >
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-red-600">No available dates. Check your weekly_availability table.</p>
        )}
      </div>

      {/* Time Slot Selection */}
      {localDate && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Time for {new Date(localDate + "T00:00:00").toLocaleDateString()}
          </label>
          {loadingSlots ? (
            <p className="text-gray-500">Loading slots...</p>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot: any) => (
                <button
                  key={slot.start_time}
                  onClick={() => setLocalTime(slot.start_time)}
                  className={cn(
                    "p-3 rounded border text-sm",
                    localTime === slot.start_time
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white border-gray-300 hover:border-emerald-500"
                  )}
                >
                  {slot.start_time}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-amber-600">No slots available for this date.</p>
          )}
        </div>
      )}

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        disabled={!localDate || !localTime}
        className="w-full"
        size="lg"
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      {/* Debug Info */}
      <details className="text-xs text-gray-500">
        <summary className="cursor-pointer">Debug Info</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded">
          {JSON.stringify({ dates: dates?.length, localDate, slots: slots.length, localTime }, null, 2)}
        </pre>
      </details>
    </div>
  );
}
