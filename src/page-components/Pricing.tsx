"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ArrowRight, Zap } from "lucide-react";

const Pricing = ({data}) => {
  console.log("🟢 [Pricing] Component rendering with data:", data);
  
  // Safely extract content sections from API data
  const contentData = data?.content?.[0];
  const section1 = contentData?.section1?.[0];
  const section2 = contentData?.section2?.[0];
  const section3 = contentData?.section3?.[0];
  const section4 = contentData?.section4?.[0];
  
  // Separate subscriptions into normal plans and add-ons
  const allSubscriptions = data?.subscriptions || [];
  const plans = allSubscriptions.filter((plan: any) => plan.flag === "Normal");
  const addOns = allSubscriptions.filter((plan: any) => plan.flag === "AddOn");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-subtle pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {section1?.title}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              {section1?.subtitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              {section1?.button1Text}
            </p>
            <Badge className="bg-accent/10 text-accent border-accent/20 text-base px-4 py-2">
              {section1?.button2Text}
            </Badge>
            <p className="text-base md:text-sm text-muted-foreground mt-10 max-w-2xl mx-auto">
              {section1?.description}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan: any, index: number) => (
              <Card
                key={index}
                className={`relative shadow-soft hover:shadow-large transition-all flex flex-col h-full min-h-[520px] ${
                  plan.popular ? "border-2 border-primary shadow-large" : ""
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
                        <span className="text-3xl font-bold">
                          ${plan.price}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /month
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col flex-grow">
                  <ul className="space-y-3">
                    {plan.features && Array.isArray(plan.features) && plan.features.map((feature: any, idx: number) => {
                      const featureText = typeof feature === "string" ? feature : feature.title;
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{featureText}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-auto pt-5">
                    <Link href="/contact?source=pricing" className="block">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-primary shadow-medium"
                            : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        Get Started
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {section2?.title}
              </h2>
              <p className="text-lg text-muted-foreground">
                {section2?.subtitle}
              </p>
            </div>

            <div className="">
              {addOns.map((addOn: any, index: number) => (
                <Card
                  key={index}
                  className="shadow-large border-2 border-primary/20 hover:border-primary/40 transition-all"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-2xl mb-2">
                          {addOn.name}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {addOn.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        <Link href="/contact?source=pricing">
                        <Button className="whitespace-nowrap" size="lg">
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                         <p className="text-2xl font-bold text-primary">
                          ${addOn.price}/month
                        </p>
                      </div>
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
        <div className="container mx-auto px-4 sm:px-6">
          <div className="">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {section3?.title}
            </h2>

            <div className="space-y-6">
              {section3?.titles?.map((faq: any, index: number) => (
                <Card key={index} className="shadow-soft">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {faq.text}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
            {section4?.title}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            {section4?.description}
          </p>
          {section4?.button1Url && (
            <Link href={section4.button1Url}>
              <Button size="lg" variant="secondary" className="shadow-medium">
                {section4.button1Text}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Pricing;
