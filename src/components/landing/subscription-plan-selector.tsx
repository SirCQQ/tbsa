"use client";

import React, { useState } from "react";
import { Check, ChevronDown, ChevronRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { Subscription } from "./subscription-plans";

// Helper function to transform billing period for display
const formatBillingPeriod = (period: string): string => {
  const periodLower = period.toLowerCase();
  if (periodLower === "monthly") return "lunar";
  if (periodLower === "yearly") return "anual";
  return periodLower;
};

type SubscriptionPlanSelectorProps = {
  subscriptions: Subscription[];
  selectedPlanId?: string;
  onPlanSelect: (planId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
};

export function SubscriptionPlanSelector({
  subscriptions,
  selectedPlanId,
  onPlanSelect,
  isLoading = false,
  error,
}: SubscriptionPlanSelectorProps) {
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const toggleExpanded = (planId: string) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card
            key={i}
            className="relative animate-pulse h-[180px] border-2 border-gray-200 flex flex-col"
          >
            <CardHeader className="pb-2 flex-1">
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20 flex-shrink-0"></div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4 mt-auto">
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          Nu s-au putut încărca planurile de abonament.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Încearcă din nou
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {subscriptions.map((plan) => {
        const Icon = plan.icon;
        const isSelected = selectedPlanId === plan.id;
        const isExpanded = expandedPlanId === plan.id;

        return (
          <Card
            key={plan.id}
            className={cn(
              "relative transition-all duration-200 cursor-pointer min-h-[180px] flex flex-col",
              isSelected
                ? "border-4 border-blue-500 bg-primary/5 shadow-lg shadow-primary/20"
                : "border-2 border-gray-200 hover:border-gray-300 hover:shadow-md",
              plan.popular && !isSelected && "ring-2 ring-primary/20",
              isExpanded ? "h-auto" : "h-[180px]"
            )}
          >
            {plan.popular && (
              <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground text-xs z-10">
                Cel mai popular
              </Badge>
            )}

            <CardHeader
              className="pb-2 cursor-pointer flex-1"
              onClick={() => toggleExpanded(plan.id)}
            >
              <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      "w-8 h-8 p-1.5 rounded-full flex-shrink-0",
                      isSelected
                        ? "bg-primary/20"
                        : plan.popular
                          ? "bg-primary"
                          : "bg-gray-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-full h-full",
                        isSelected
                          ? "text-primary"
                          : plan.popular
                            ? "text-blue-500"
                            : plan.iconColor
                      )}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base truncate">
                      {plan.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className={cn(
                          "font-medium text-lg",
                          isSelected ? "text-primary" : "text-foreground"
                        )}
                      >
                        {plan.price} RON
                      </span>
                      <span className="truncate">
                        /{formatBillingPeriod(plan.period)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {isSelected && <Check className="w-5 h-5 text-primary" />}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0 pb-4">
                <div className="space-y-4">
                  {/* Description */}
                  {plan.description && (
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  )}

                  {/* Features */}
                  {plan.features.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Funcționalități:
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Select Button */}
                  <Button
                    className="w-full"
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    borderRadius="full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlanSelect(plan.id);
                    }}
                  >
                    {isSelected ? "Selectat" : plan.cta}
                  </Button>
                </div>
              </CardContent>
            )}

            {/* Quick select for collapsed state */}
            {!isExpanded && (
              <CardContent className="pt-0 pb-4 mt-auto">
                <Button
                  className="w-full"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  type="button"
                  borderRadius="full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlanSelect(plan.id);
                  }}
                >
                  {isSelected ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Selectat
                    </div>
                  ) : (
                    "Selectează"
                  )}
                </Button>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
