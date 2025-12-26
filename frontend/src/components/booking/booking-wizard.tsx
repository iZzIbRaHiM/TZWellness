"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookingStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X, Check } from "lucide-react";
import { StepService } from "./steps/step-service";
import { StepIdentity } from "./steps/step-identity";
import { StepModality } from "./steps/step-modality";
import { StepCalendar } from "./steps/step-calendar";
import { StepDetails } from "./steps/step-details";
import { StepSuccess } from "./steps/step-success";
import Link from "next/link";

const steps = [
  { id: 1, title: "Service", description: "What brings you in?" },
  { id: 2, title: "About You", description: "Tell us who you are" },
  { id: 3, title: "Preference", description: "How would you like to meet?" },
  { id: 4, title: "Schedule", description: "Pick your perfect time" },
  { id: 5, title: "Details", description: "A few more things" },
  { id: 6, title: "Done!", description: "Booking confirmed!" },
];

// Slide animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -30 : 30,
    opacity: 0,
  }),
};

export function BookingWizard() {
  const { step, reset, prevStep, canProceed, referenceId, setStep } = useBookingStore();
  const [direction, setDirection] = React.useState(1);
  const prevStepRef = React.useRef(step);

  // Reset booking state when component mounts
  useEffect(() => {
    reset();
  }, []);

  // Track direction for animations
  useEffect(() => {
    setDirection(step > prevStepRef.current ? 1 : -1);
    prevStepRef.current = step;
  }, [step]);

  // Reset wizard when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      if (referenceId) {
        reset();
      }
    };
  }, [referenceId, reset]);

  const progress = (step / (steps.length - 1)) * 100;
  const currentStep = steps[step - 1];
  const isComplete = step === 6;

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Header - Conversational tone */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-serif text-display-sm sm:text-display-md text-emerald-950 mb-3">
            {isComplete ? (
              <>Your Visit is <span className="italic text-terracotta">Confirmed</span></>
            ) : (
              <>Let's Get You <span className="italic text-terracotta">Scheduled</span></>
            )}
          </h1>
          <p className="text-emerald-700/80 text-lg">
            {isComplete
              ? "We can't wait to see you"
              : currentStep.description}
          </p>
        </motion.div>

        {/* Step Pills - Modern indicator */}
        {!isComplete && (
          <div className="flex justify-center gap-2 mb-8">
            {steps.slice(0, -1).map((s) => (
              <motion.button
                key={s.id}
                layout
                onClick={() => s.id < step && setStep(s.id)}
                disabled={s.id >= step}
                className={`relative h-10 rounded-full flex items-center transition-all duration-300 ${
                  s.id === step 
                    ? "bg-emerald-900 text-white px-5 shadow-soft-md cursor-default" 
                    : s.id < step
                    ? "bg-emerald-100 text-emerald-700 px-3 hover:bg-emerald-200 cursor-pointer"
                    : "bg-sand-200 text-emerald-400 px-3 cursor-not-allowed"
                }`}
                title={s.id < step ? `Go back to ${s.title}` : s.title}
              >
                {s.id < step ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-medium">
                    {s.id === step ? s.title : s.id}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Main Glass Card */}
        <motion.div 
          layout
          className="glass-card p-8 sm:p-10 shadow-elevated-md"
        >
          {/* Navigation */}
          {!isComplete && (
            <div className="flex justify-between items-center mb-8">
              {step > 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  className="text-emerald-700 hover:text-emerald-900 -ml-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Button variant="ghost" size="sm" asChild className="text-emerald-600 hover:text-emerald-800 -mr-2">
                <Link href="/">
                  <X className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}

          {/* Step content with slide animation */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {step === 1 && <StepService />}
              {step === 2 && <StepIdentity />}
              {step === 3 && <StepModality />}
              {step === 4 && <StepCalendar />}
              {step === 5 && <StepDetails />}
              {step === 6 && <StepSuccess />}
            </motion.div>
          </AnimatePresence>

          {/* Progress bar at bottom */}
          {!isComplete && (
            <div className="mt-8 pt-6 border-t border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-emerald-600 font-medium">
                  Step {step} of {steps.length - 1}
                </span>
                <span className="text-xs text-emerald-500">
                  {Math.round(progress)}% complete
                </span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </motion.div>

        {/* Help text */}
        {!isComplete && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-emerald-600/70 mt-8"
          >
            Need assistance? Call us at{" "}
            <a
              href="tel:+1234567890"
              className="text-terracotta hover:underline font-medium"
            >
              (123) 456-7890
            </a>
          </motion.p>
        )}
      </div>
    </div>
  );
}
