"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Search,
  UserPlus,
  FileText,
  Rocket,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Clock,
  Shield,
  TrendingUp,
} from "lucide-react";

const HowItWorks = ({data}) => {
  console.log("🟢 [HowItWorks] Component rendering with data:", data);
  
  // Map icons for steps
  const iconMap = {
    0: Search,
    1: UserPlus,
    2: FileText,
    3: Rocket,
    4: BarChart3,
  };

  const iconMapAdvantages = {
    0: Clock,
    1: Shield,
    2: TrendingUp,
  };

  // Extract section data
  const section1 = data?.content?.[0]?.section1?.[0] || {};
  const section2 = data?.content?.[0]?.section2 || [];
  const section3 = data?.content?.[0]?.section3?.[0] || {};
  const section4 = data?.content?.[0]?.section4?.[0] || {};

  // Build steps from section2 data
  const steps = section2.map((item, index) => ({
    icon: iconMap[index] || Search,
    title: item.title || "",
    description: item.description || "",
    details: item.titles?.map((t) => t.text) || [],
    timeline: item.button1Text || "",
  }));

  // Build advantages from section3 cards
  const advantages = section3.cards?.map((card, index) => ({
    icon: iconMapAdvantages[index] || Clock,
    title: card.title || "",
    description: card.description || "",
  })) || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-subtle pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {section1.title || "Our Process"}
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              {section1.subtitle || "From Strategy to Scale in 5 Simple Steps"}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              {section1.description ||
                "A proven methodology that turns partnership opportunities into measurable growth. Transparent, data-driven, and designed for SaaS companies."}
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className=" space-y-8">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="shadow-soft hover:shadow-medium transition-all overflow-hidden group"
              >
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Step Number & Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <step.icon className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <Badge className="absolute -top-2 -right-2 bg-background text-primary border-2 border-primary">
                          {index + 1}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {step.timeline}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground mb-4">
                        {step.description}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-2">
                        {step.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {section3.title || "Why Our Process Works"}
              </h2>
              <p className="text-lg text-muted-foreground">
                {section3.subtitle ||
                  "Built on years of experience scaling SaaS companies"}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => (
                <Card key={index} className="shadow-soft">
                  <CardContent className="pt-8 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <advantage.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">
                      {advantage.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {advantage.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
            {section4.title || "Ready to Get Started?"}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            {section4.subtitle ||
              "Schedule a free consultation to discuss your growth goals and see how we can help"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={section4.button1Url || "/contact"}>
              <Button size="lg" variant="secondary" className="shadow-medium">
                {section4.button1Text || "Schedule Consultation"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href={section4.button2Url || "/pricing"}>
              <Button
                size="lg"
                variant="outline"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
              >
                {section4.button2Text || "View Pricing"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
