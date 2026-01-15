"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  Linkedin,
  Youtube,
  FileText,
} from "lucide-react";

const ForCreators = ({ data }) => {
  // Extract sections from API data
  const content = data?.content?.[0] || {};
  const section1 = content.section1?.[0] || {};
  const section2 = content.section2?.[0] || {};
  const section3 = content.section3?.[0] || {};
  const section4 = content.section4?.[0] || {};
  const section5 = content.section5?.[0] || {};

  // Map stats from section1 cards
  const stats = (section1.cards || []).map((card) => ({
    icon: DollarSign,
    value: card.title,
    label: card.description,
    description: card.buttonText,
  }));

  // Map channels from section2 cards
  const channels = (section2.cards || []).map((card) => ({
    icon: Linkedin,
    name: card.title,
    earnings: card.buttonText,
    description: card.description,
  }));

  // Map benefits from section4 titles
  const benefits = (section4.titles || []).map((title) => title.text);

  // Map how it works from section3 cards
  const howItWorks = (section3.cards || []).map((card, idx) => ({
    step: card.icon || String(idx + 1),
    title: card.title,
    description: card.description,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className=" pt-16 sm:pt-24 pb-16 sm:pb-20 bg-gradient-subtle">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            {section1.title || "Turn Your Influence Into Income"}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            <span
              dangerouslySetInnerHTML={{ __html: section1.subtitle || "" }}
            />
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href={section1.button1Url || "/auth?type=creator"}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="bg-gradient-primary shadow-medium hover:shadow-large text-base sm:text-lg h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto"
              >
                {section1.button1Text || "Start Earning Today"}
              </Button>
            </Link>
            <Link
              href={section1.button2Url || "/auth?type=creator"}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                className="text-base sm:text-lg h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto"
              >
                {section1.button2Text || "See How It Works"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border-border hover:border-primary transition-colors"
              >
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 sm:p-3 bg-gradient-primary rounded-lg mb-3 sm:mb-4">
                      <stat.icon className="w-5 sm:w-6 h-5 sm:h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-1 sm:mb-2">
                      {stat.value}
                    </h3>
                    <p className="font-semibold text-sm sm:text-base mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Channels Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              {section2.title}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              {section2.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {channels.map((channel, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-medium transition-all"
              >
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 sm:p-4 bg-gradient-secondary rounded-lg mb-3 sm:mb-4">
                      <channel.icon className="w-6 sm:w-8 h-6 sm:h-8 text-accent-foreground" />
                    </div>
                    <h4 className="mb-2 text-base sm:text-lg font-semibold">
                      {channel.name}
                    </h4>
                    <p className="text-accent font-bold text-base sm:text-lg mb-2 sm:mb-3">
                      {channel.earnings}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {channel.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              {section3.title}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              {section3.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg sm:text-2xl font-bold mb-3 sm:mb-4 shadow-medium">
                    {item.step}
                  </div>
                  <h4 className="mb-2 text-base sm:text-lg font-semibold">
                    {item.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
              {section4.title}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              {section4.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
            {section5.title}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            {section5.subtitle}
          </p>
          <Link href={section5.button1Url || "/creator"}>
            <Button
              size="lg"
              variant="secondary"
              className="text-base sm:text-lg h-10 sm:h-12 px-6 sm:px-8 shadow-large"
            >
              {section5.button1Text || "Create Your Creator Account"}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ForCreators;
