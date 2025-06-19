import { Check, Zap, Building2, Crown, Sparkles } from "lucide-react";
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

export function SubscriptionSection() {
  const plans = [
    {
      name: "Starter",
      description: "Perfect pentru asociații mici",
      price: "499",
      period: "lună",
      icon: Building2,
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-500",
      features: [
        "Până la 50 apartamente",
        "Citiri contor apă",
        "Facturare automată",
        "Rapoarte de bază",
        "Suport email",
      ],
      popular: false,
      cta: "Începe perioada de probă",
    },
    {
      name: "Professional",
      description: "Ideal pentru asociații medii",
      price: "1299",
      period: "lună",
      icon: Zap,
      color: "from-primary/30 to-purple-500/30",
      borderColor: "border-primary",
      iconColor: "text-primary",
      features: [
        "Până la 200 apartamente",
        "Toate funcțiile din Starter",
        "Notificări automate",
        "Rapoarte avansate",
        "Suport telefonic",
        "Manager de cont dedicat",
      ],
      popular: true,
      cta: "Cel mai popular",
    },
    {
      name: "Enterprise",
      description: "Pentru asociații mari și complexe",
      price: "1999",
      period: "lună",
      icon: Crown,
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-500",
      features: [
        "Pana la 500 apartamente",
        "Toate funcțiile din Professional",
        "API personalizat",
        "Training echipă",
        "Suport prioritar 24/7",
        "Implementare personalizată",
      ],
      popular: false,
      cta: "Contactează-ne",
    },
  ];

  return (
    <section
      id="subscription"
      className="py-24 bg-gradient-to-br from-purple-50 via-background to-pink-50 dark:from-purple-950 dark:via-background dark:to-pink-950 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Planuri de abonament
            </h2>
            <Sparkles className="h-8 w-8 text-primary ml-3" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Alege planul potrivit pentru asociația ta. Toate planurile includ o
            perioadă de probă gratuită de 14 zile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
                  plan.popular
                    ? "border-primary shadow-xl shadow-primary/20 scale-105 bg-gradient-to-br from-primary/5 to-purple-500/5"
                    : `border-border/50 bg-gradient-to-br ${plan.color} hover:${plan.borderColor}`
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-purple-500 text-white px-4 py-1 shadow-lg animate-bounce">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Cel mai popular
                    </Badge>
                  </div>
                )}

                {/* Decorative corner accent */}
                <div
                  className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${plan.color} rounded-bl-3xl opacity-50`}
                />

                <CardHeader className="text-center pb-8 relative">
                  {/* Icon with animated background */}
                  <div
                    className={`mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className={`h-8 w-8 ${plan.iconColor}`} />
                  </div>

                  <CardTitle className="text-2xl font-bold mb-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>

                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-lg font-semibold text-primary ml-1">
                        RON
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      / {plan.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start space-x-3 group/item"
                      >
                        <div
                          className={`p-1 rounded-full bg-gradient-to-br ${plan.color} group-hover/item:scale-110 transition-transform duration-200`}
                        >
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground group-hover/item:text-primary transition-colors duration-200">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-8">
                  <Button
                    className={`w-full transition-all duration-300 ${
                      plan.popular
                        ? "bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg hover:shadow-xl"
                        : "hover:scale-105"
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    borderRadius="full"
                    size="lg"
                  >
                    {plan.cta}
                    {plan.popular && <Sparkles className="h-4 w-4 ml-2" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8 backdrop-blur-sm border border-primary/20">
            <p className="text-muted-foreground mb-6 text-lg">
              Ai nevoie de ceva personalizat sau ai întrebări?
            </p>
            <Button
              variant="ghost"
              size="lg"
              className="text-primary hover:text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105"
            >
              <Zap className="h-5 w-5 mr-2" />
              Contactează echipa de vânzări
            </Button>
          </div>
        </div>

        {/* Enhanced trust indicators */}
        <div className="mt-20 pt-16 border-t border-border/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-2">
                500+
              </div>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                Asociații active
              </p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                99.9%
              </div>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                Uptime garantat
              </p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                Suport tehnic
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
