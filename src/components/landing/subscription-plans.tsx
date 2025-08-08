import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { SubscriptionParsed } from "@/hooks/use-get-subsriptions";

type SubscriptionPlansProps = {
  onPlanSelect?: (planId: string) => void;
  subscriptions: SubscriptionParsed[];
  isLoading: boolean;
  error: Error | null;
};

export function SubscriptionPlans({
  onPlanSelect,
  subscriptions,
  isLoading = false,
  error,
}: SubscriptionPlansProps) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-8 mt-16 min-h-[500px]">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="relative animate-pulse min-w-[300px]">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full h-10 bg-gray-200 rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center mt-16">
        <p className="text-red-600 mb-4">
          Nu s-au putut încărca planurile de abonament.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Încearcă din nou
        </Button>
      </div>
    );
  }

  // Plans display
  return (
    <div className="grid md:grid-cols-3 gap-8 mt-16">
      {subscriptions.map((plan) => {
        const Icon = plan.icon;

        return (
          <Card
            key={plan.id}
            className={`relative bg-gradient-to-br ${plan.color} backdrop-blur-xl border-2 ${plan.borderColor} hover:scale-[1.02] transition-all duration-300 ${
              plan.popular ? "ring-2 ring-primary/50" : ""
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                Cel mai popular
              </Badge>
            )}

            <CardHeader className="text-center pb-4">
              <div
                className={`w-12 h-12 ${plan.iconColor} mx-auto mb-4 p-2 rounded-full bg-white/20 backdrop-blur-sm`}
              >
                <Icon className="w-full h-full" />
              </div>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">{plan.price} RON</span>
                <span className="text-muted-foreground ml-2">
                  /{plan.period.toLowerCase()}
                </span>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    Până la {plan.maxApartments} apartamente
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    Până la {plan.maxBuildings} clădiri
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">
                    Până la {plan.maxUsers} utilizatori
                  </span>
                </li>
              </ul>
              {/* Preset the price per apartment per Month with this subscription plan */}
              <div className="text-center mt-6">
                <span className="text-sm font-bold">
                  Cu doar{" "}
                  {(parseInt(plan.price) / (plan.maxApartments || 50)).toFixed(
                    2
                  )}{" "}
                  RON* / apartament / {plan.period.toLowerCase()}
                </span>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                borderRadius="full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => onPlanSelect?.(plan.id)}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
