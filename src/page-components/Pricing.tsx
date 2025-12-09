"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ArrowRight, Zap } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      partnerships: "1-5",
      price: "499",
      description: "Perfect for early-stage SaaS companies testing partnership marketing",
      features: [
        "1-5 active partnerships",
        "All three channels included",
        "Basic performance reporting",
        "Email support",
        "Self-service dashboard",
        "Content approval process",
      ],
      cta: "Start with Starter",
      popular: false,
    },
    {
      name: "Growth",
      partnerships: "6-15",
      price: "1,299",
      description: "Ideal for growing SaaS companies ready to scale partnerships",
      features: [
        "6-15 active partnerships",
        "All three channels included",
        "Advanced analytics & reporting",
        "Priority support",
        "Monthly strategy call",
        "A/B testing & optimization",
        "Dedicated account manager",
        "Custom campaign briefs",
      ],
      cta: "Choose Growth",
      popular: true,
    },
    {
      name: "Scale",
      partnerships: "16-30",
      price: "2,499",
      description: "Complete solution for established SaaS companies seeking maximum impact",
      features: [
        "16-30 active partnerships",
        "All three channels included",
        "Real-time dashboard & analytics",
        "Priority support",
        "Bi-weekly strategy sessions",
        "Multi-variate testing",
        "Dedicated team of specialists",
        "Custom integrations",
        "Monthly business reviews",
      ],
      cta: "Choose Scale",
      popular: false,
    },
    {
      name: "Enterprise",
      partnerships: "31+",
      price: "Custom",
      description: "Tailored solutions for high-volume partnership programs",
      features: [
        "31+ active partnerships",
        "All three channels included",
        "White-label dashboard",
        "24/7 priority support",
        "Weekly strategy sessions",
        "API access & integrations",
        "Dedicated success team",
        "Custom contract terms",
        "Quarterly business reviews",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const addOns = [
    { 
      name: "Fully Managed Partnerships", 
      price: "$2,499/month",
      description: "Let our team handle everything from partner outreach to campaign execution and reporting"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-subtle pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Transparent Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Flexible Pricing That Scales With You
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Pay based on the number of active partnerships you manage. All plans include a one-time onboarding fee of $500.
            </p>
            <Badge className="bg-accent/10 text-accent border-accent/20 text-base px-4 py-2">
              One-time onboarding fee: $500
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative shadow-soft hover:shadow-large transition-all ${
                  plan.popular ? 'border-2 border-primary shadow-large' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-primary text-primary-foreground border-0 shadow-medium px-4 py-1">
                      <Zap className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {plan.partnerships} partnerships
                    </Badge>
                  </div>
                  <div className="mt-2">
                    {plan.price === "Custom" ? (
                      <span className="text-3xl font-bold">{plan.price}</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/contact" className="block">
                    <Button 
                      className={`w-full ${
                        plan.popular ? 'bg-gradient-primary shadow-medium' : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Premium Add-on Service</h2>
              <p className="text-lg text-muted-foreground">
                Want us to handle everything? Upgrade to our fully managed service
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              {addOns.map((addOn, index) => (
                <Card key={index} className="shadow-large border-2 border-primary/20 hover:border-primary/40 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-2xl mb-2">{addOn.name}</h3>
                        <p className="text-muted-foreground mb-4">{addOn.description}</p>
                        <p className="text-3xl font-bold text-primary">{addOn.price}</p>
                      </div>
                      <Link href="/contact">
                        <Button className="whitespace-nowrap" size="lg">
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Common Questions</h2>
            
            <div className="space-y-6">
              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">Can I switch plans later?</h3>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! You can upgrade or downgrade at any time. Changes take effect at your next billing cycle.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">What's your cancellation policy?</h3>
                  <p className="text-sm text-muted-foreground">
                    No long-term contracts. You can cancel anytime with 30 days notice. We'll wrap up active campaigns professionally.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">Do you offer custom enterprise packages?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! For companies with unique needs or larger budgets, we create fully customized solutions. Contact us to discuss.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto shadow-large overflow-hidden">
            <div className="bg-gradient-primary p-12 text-center text-primary-foreground">
              <h2 className="text-3xl font-bold mb-4">
                Not Sure Which Plan is Right?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Schedule a free consultation and we'll help you choose the perfect plan for your goals
              </p>
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="shadow-medium">
                  Talk to Our Team
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
