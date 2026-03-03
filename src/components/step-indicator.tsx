"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Project", "Type", "Date", "Time", "Details"] as const;

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <nav aria-label="Booking progress" className="w-full px-2">
      <ol className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <li
              key={stepNumber}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex w-full items-center">
                {/* Connector line before */}
                {i > 0 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 transition-colors duration-300",
                      stepNumber <= currentStep
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                )}

                {/* Step circle */}
                <div
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                    isCompleted &&
                      "bg-primary text-primary-foreground",
                    isCurrent &&
                      "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    isUpcoming &&
                      "border-2 border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>

                {/* Connector line after */}
                {i < totalSteps - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 transition-colors duration-300",
                      stepNumber < currentStep
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                )}
              </div>

              {/* Step label */}
              <span
                className={cn(
                  "text-xs font-medium transition-colors duration-300",
                  isCurrent && "text-foreground",
                  isCompleted && "text-foreground",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {STEP_LABELS[i]}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
