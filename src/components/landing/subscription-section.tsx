'use client'
import { SubscriptionPlans } from "./subscription-plans";




export function SubscriptionSection() {
  const handlePlanSelect = (planId: string) => {
    // Handle plan selection logic here
    console.log('Selected plan:', planId);
  };

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
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Planuri de abonament
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Alege planul potrivit pentru asociația ta. Toate planurile includ o
            perioadă de probă gratuită de 14 zile.
          </p>
        </div>

        {/* Subscription Plans Component */}
        <SubscriptionPlans onPlanSelect={handlePlanSelect} />

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8 backdrop-blur-sm border border-primary/20">
            <p className="text-muted-foreground mb-6 text-lg">
              Ai nevoie de ceva personalizat sau ai întrebări?
            </p>
            <button className="text-primary hover:text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg">
              Contactează echipa de vânzări
            </button>
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
