"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Users, Target, Sparkles, BarChart3, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

interface HomeProps {
  data?: {
    content?: Array<{
      section1?: Array<any>;
      section2?: Array<any>;
      section3?: Array<any>;
      section4?: Array<any>;
    }>;
    meta?: {
      meta_title?: string;
      meta_description?: string;
      meta_feature_image?: string;
    };
    title?: string;
    slug?: string;
    template?: string;
  };
}

const Home = ({ data }: HomeProps) => {
  console.log("🟢 [Home] Component rendering with data:", data);

  // Safely extract content sections from API data
  const contentData = data?.content?.[0] || {};
  const section1 = contentData.section1?.[0] || {};
  const section2 = contentData.section2?.[0] || {};
  const section3 = contentData.section3?.[0] || {};
  const section4 = contentData.section4?.[0] || {};

  console.log("📄 [Home] Section data:", { section1, section2, section3, section4 });

  // Extract stats from section1 with fallback
  const stats = section1?.stats;

  // Extract features from section2 cards with fallback
  const cards = section2?.cards || [];
  const features = cards.length > 0 ? cards : [
    {
      icon: Users,
      title: "Blogger Outreach",
      description: "Connect with influential bloggers in your niche.",
    },
    {
      icon: Target,
      title: "LinkedIn Influencers",
      description: "Leverage B2B thought leaders on LinkedIn.",
    },
    {
      icon: Sparkles,
      title: "YouTube Campaigns",
      description: "Partner with YouTube creators who resonate with your audience.",
    },
  ];

  // Extract steps/benefits from section3 with fallback
  const steps = section3?.steps || [
    { title: "Data-driven partner selection" },
    { title: "End-to-end campaign management" },
    { title: "Transparent ROI tracking" },
    { title: "Dedicated account manager" },
    { title: "Scalable growth strategies" },
    { title: "No long-term contracts" },
  ];

  // Extract stats from section3 with fallback
  const statsSection3 = section3?.stats || [
    { number: "5X", label: "Average traffic increase", icon: "/uploads/icons/image 58.png" },
    { number: "$2M+", label: "Revenue generated", icon: "/uploads/icons/image 59.png" },
    { number: "10K+", label: "Partner network", icon: "/uploads/icons/image 59.png" },
    { number: "92%", label: "Campaign success rate", icon: "/uploads/icons/image 60 (1).png" },
  ];

  // Helper function to render icon - either from lucide or image
  const renderIcon = (iconData: any, index: number) => {
    const iconMap: { [key: string]: any } = {
      Users,
      Target,
      Sparkles,
      TrendingUp,
      BarChart3,
    };

    // If it's a lucide icon component, render it
    if (typeof iconData === "function" || iconData?.render) {
      const IconComponent = iconData;
      return <IconComponent className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />;
    }

    // Otherwise return fallback icon
    return <Users className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />;
  };

  // Helper function to render stat icon - with lucide icon fallback
  // const renderStatIcon = (stat: any, index: number) => {
  //   // Icon mapping for specific stat positions
  //   const statIcons = [TrendingUp, BarChart3, Users, Target];
  //   const defaultIcon = statIcons[index % statIcons.length];

  //   // Don't try to load image, just show lucide icon
  //   // API icons are broken URLs, so skip them entirely
  //   return (
  //     <div className="w-6 sm:w-8 h-6 sm:h-8 text-primary">
  //       {defaultIcon && <defaultIcon className="w-full h-full" />}
  //     </div>
  //   );
  // };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle -z-10" />
        <div className="absolute inset-0 opacity-5 -z-10">
          <Image src={heroImage} alt="" fill className="object-cover" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
              {section1?.title || "Trusted by 500+ Growing SaaS Companies"}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              Scale Your SaaS Through
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Strategic Partnerships</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              {section1?.description || "Connect with bloggers, LinkedIn influencers, and YouTube creators who amplify your brand. Data-driven campaigns that convert audiences into customers."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {section1?.button1Url && (
                <Link href={section1.button1Url} className="w-full sm:w-auto">
                  <Button size="lg" className="bg-gradient-primary shadow-medium hover:shadow-large text-base sm:text-lg h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto">
                    {section1.button1Text || "Start Growing Today"}
                    <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
                  </Button>
                </Link>
              )}
              {section1?.button2Url && (
                <Link href={section1.button2Url} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="text-base sm:text-lg h-10 sm:h-12 px-6 sm:px-8 w-full sm:w-auto">
                    {section1.button2Text || "See How It Works"}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Stats from section1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-12 sm:mt-16 md:mt-20">
            {stats.map((stat: any, index: number) => (
              <Card key={index} className="text-center shadow-soft hover:shadow-medium transition-all">
                <CardContent className="pt-4 sm:pt-6 px-3 sm:px-4">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-1 sm:mb-2">
                    {stat.number || stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview - Section 2 */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <Badge className="mb-3 sm:mb-4 bg-secondary/10 text-secondary border-secondary/20 text-xs sm:text-sm">
              {section2?.subtitle || "Three Powerful Channels"}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              {section2?.title || "Multi-Channel Partnership Strategy"}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {section2?.description || "We orchestrate campaigns across the most effective channels for B2B SaaS growth"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {(cards.length > 0 ? cards : features).map((feature: any, index: number) => (
              <Card key={index} className="relative group overflow-hidden shadow-soft hover:shadow-large transition-all">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6">
                  <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit">
                    {renderIcon(feature.icon, index)}
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                  {feature.buttonText && (
                    <Link href={feature.buttonUrl} className="inline-flex items-center gap-2 mt-4 text-primary font-medium hover:gap-3 transition-all text-sm sm:text-base">
                      {feature.buttonText || "Learn more"}
                      <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Section 3 */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <Badge className="mb-3 sm:mb-4 bg-accent/10 text-accent border-accent/20 text-xs sm:text-sm">
                  {section3?.subtitle || "Why PartnerScale"}
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                  {section3?.title || "The Partnership Platform Built for SaaS Growth"}
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                  {section3?.description || "We don't just connect you with influencers—we build strategic partnerships that align with your growth goals and target audience."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {steps.map((step: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base">{step.title || step.description || step}</span>
                    </div>
                  ))}
                </div>
                {section3?.button1Url && (
                  <Link href={section3.button1Url} className="mt-6 sm:mt-8 inline-block">
                    <Button variant="outline" size="lg" className="h-10 sm:h-12 text-sm sm:text-base">
                      {section3.button1Text || "Learn More About Us"}
                    </Button>
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 auto-rows-max">
                {statsSection3.map((stat: any, index: number) => {
                  // Icon mapping for each stat position
                  const statIcons = [TrendingUp, BarChart3, Users, Target];
                  const StatIcon = statIcons[index % statIcons.length];
                  
                  // Color mapping for each stat position
                  const colorClasses = ["text-primary", "text-secondary", "text-accent", "text-primary"];
                  const colorClass = colorClasses[index % colorClasses.length];
                  
                  // Offset every second card on small screens
                  const offsetClass = (index === 1 || index === 3) ? "sm:mt-8" : "";
                  
                  return (
                    <Card key={index} className={`shadow-soft ${offsetClass}`}>
                      <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                        <StatIcon className={`w-6 sm:w-8 h-6 sm:h-8 ${colorClass} mb-2 sm:mb-3`} />
                        <div className="text-xl sm:text-2xl font-bold mb-1">{stat.number}</div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Section 4 */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
            {section4?.title || "Ready to Scale Your SaaS?"}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            {section4?.subtitle || "Join 500+ growing companies leveraging strategic partnerships for exponential growth"}
          </p>
          {section4?.button1Url && (
            <Link href={section4.button1Url}>
              <Button size="lg" variant="secondary" className="text-base sm:text-lg h-10 sm:h-12 px-6 sm:px-8 shadow-large">
                {section4.button1Text || "Get Started Today"}
                <ArrowRight className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
