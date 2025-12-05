"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  FileText, Linkedin, Youtube, CheckCircle2, 
  TrendingUp, Users, Target, Zap, ArrowRight 
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: FileText,
      title: "Blogger Outreach",
      tagline: "Build Authority Through Content",
      description: "Connect with influential bloggers and content creators in your niche to amplify your brand message and drive targeted traffic.",
      features: [
        "Targeted blogger identification & vetting",
        "Relationship building & negotiation",
        "Content collaboration management",
        "Guest post & sponsored content",
        "Backlink strategy & SEO benefits",
        "Performance tracking & reporting",
      ],
      benefits: [
        "Boost domain authority",
        "Drive referral traffic",
        "Build brand credibility",
        "Improve SEO rankings",
      ],
      pricing: "Starting at $2,499/mo",
      color: "primary",
    },
    {
      icon: Linkedin,
      title: "LinkedIn Influencer Marketing",
      tagline: "Reach Decision Makers Where They Are",
      description: "Partner with LinkedIn thought leaders and industry experts to reach B2B decision-makers and drive high-quality leads.",
      features: [
        "B2B influencer identification",
        "Thought leadership partnerships",
        "Sponsored content campaigns",
        "Employee advocacy programs",
        "Lead generation tracking",
        "Account-based marketing (ABM)",
      ],
      benefits: [
        "Access C-level executives",
        "Generate qualified leads",
        "Build professional credibility",
        "Shorten sales cycles",
      ],
      pricing: "Starting at $3,499/mo",
      color: "secondary",
    },
    {
      icon: Youtube,
      title: "YouTube Campaign Management",
      tagline: "Engage Through Video Storytelling",
      description: "Collaborate with YouTube creators to produce authentic video content that educates, entertains, and converts viewers into customers.",
      features: [
        "Creator discovery & vetting",
        "Campaign strategy & scripting",
        "Sponsorship negotiations",
        "Product integration guidelines",
        "Video performance analytics",
        "Conversion optimization",
      ],
      benefits: [
        "Massive reach potential",
        "Higher engagement rates",
        "Trust through authenticity",
        "Long-term content value",
      ],
      pricing: "Starting at $4,999/mo",
      color: "accent",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-subtle py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Our Services
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Multi-Channel Partnership Solutions
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose the channels that align with your growth goals, or leverage all three 
              for maximum impact. Each service is designed to scale with your business.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-12 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="shadow-medium hover:shadow-large transition-all overflow-hidden">
                <div className={`h-2 bg-gradient-${service.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-${service.color}/10 rounded-xl`}>
                        <service.icon className={`w-8 h-8 text-${service.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-3xl mb-2">{service.title}</CardTitle>
                        <p className="text-muted-foreground font-medium">{service.tagline}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg py-1 px-3">
                      {service.pricing}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg">{service.description}</p>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        What's Included
                      </h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Key Benefits
                      </h4>
                      <div className="space-y-3">
                        {service.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link href="/contact">
                      <Button className="bg-gradient-primary">
                        Get Started with {service.title}
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

      {/* Full Service Option */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto shadow-large">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <Badge className="mb-4 bg-gradient-primary text-primary-foreground border-0">
                  Recommended
                </Badge>
                <h2 className="text-3xl font-bold mb-4">Full-Service Partnership Suite</h2>
                <p className="text-xl text-muted-foreground">
                  Maximize your growth with an integrated multi-channel strategy
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-background rounded-xl">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="font-semibold">Blogger Outreach</p>
                </div>
                <div className="text-center p-6 bg-background rounded-xl">
                  <Linkedin className="w-8 h-8 text-secondary mx-auto mb-3" />
                  <p className="font-semibold">LinkedIn Marketing</p>
                </div>
                <div className="text-center p-6 bg-background rounded-xl">
                  <Youtube className="w-8 h-8 text-accent mx-auto mb-3" />
                  <p className="font-semibold">YouTube Campaigns</p>
                </div>
              </div>

              <div className="bg-gradient-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
                <h3 className="font-semibold mb-4">Additional Benefits:</h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {[
                    "Unified reporting dashboard",
                    "Cross-channel synergy",
                    "Priority support",
                    "Quarterly strategy reviews",
                    "Custom audience insights",
                    "20% cost savings vs individual",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                <div className="mb-4">
                  <span className="text-3xl font-bold">$8,999</span>
                  <span className="text-muted-foreground">/month</span>
                  <Badge className="ml-3 bg-accent/10 text-accent border-accent/20">
                    Save $1,998/mo
                  </Badge>
                </div>
                <Link href="/contact">
                  <Button size="lg" className="bg-gradient-primary shadow-medium">
                    Start Full-Service Package
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Services;
