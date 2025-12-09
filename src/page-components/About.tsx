"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Target, Users, TrendingUp, Award, ArrowRight, Heart, Lightbulb, Zap } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Results-Driven",
      description: "Every partnership is measured by ROI. We're obsessed with delivering tangible growth metrics.",
    },
    {
      icon: Heart,
      title: "Authentic Relationships",
      description: "We build genuine partnerships, not transactional deals. Quality over quantity, always.",
    },
    {
      icon: Lightbulb,
      title: "Innovation First",
      description: "We stay ahead of marketing trends and leverage cutting-edge tools to maximize campaign performance.",
    },
    {
      icon: Zap,
      title: "Speed & Agility",
      description: "Fast execution without compromising quality. We move at the pace of modern SaaS.",
    },
  ];

  const stats = [
    { number: "500+", label: "SaaS Companies Scaled" },
    { number: "10K+", label: "Partnership Network" },
    { number: "$50M+", label: "Revenue Generated" },
    { number: "340%", label: "Average ROI" },
  ];

  const team = [
    {
      role: "Partnership Strategy",
      description: "Ex-growth marketers from top SaaS companies who understand what drives B2B conversions",
    },
    {
      role: "Influencer Relations",
      description: "Seasoned relationship managers with deep networks across all major platforms",
    },
    {
      role: "Data Analytics",
      description: "Performance experts who turn campaign metrics into actionable growth insights",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-subtle py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              About PartnerScale
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Built by SaaS Marketers, For SaaS Marketers
            </h1>
            <p className="text-xl text-muted-foreground">
              We started PartnerScale because we were frustrated by traditional marketing agencies 
              that didn't understand the unique challenges of scaling SaaS businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-soft">
              <CardContent className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                  <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    PartnerScale was founded in 2019 by a team of growth marketers who had successfully scaled 
                    multiple SaaS companies from seed stage to Series B and beyond. We saw a massive gap in 
                    the market: while content marketing and paid ads were well-understood, partnership marketing 
                    remained an untapped goldmine for most SaaS companies.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Traditional agencies treated influencer marketing as a one-size-fits-all solution. They'd 
                    pitch the same Instagram influencers to B2B SaaS companies that they'd pitch to consumer 
                    brands. We knew this was wrong.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    So we built PartnerScale specifically for SaaS companies. We focus on the channels that 
                    actually drive B2B conversions: thought leaders on LinkedIn, niche bloggers with highly 
                    engaged audiences, and YouTube educators who build trust through in-depth reviews.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Today, we've helped over 500 SaaS companies scale through strategic partnerships, 
                    generating over $50M in attributable revenue. Our network spans 10,000+ vetted partners 
                    across every major B2B vertical.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Impact in Numbers</h2>
              <p className="text-lg text-muted-foreground">
                Real results from real partnerships
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="shadow-soft">
                  <CardContent className="pt-8 text-center">
                    <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
              <p className="text-lg text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-all">
                  <CardContent className="pt-8">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                        <value.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Expertise */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Expert Team</h2>
              <p className="text-lg text-muted-foreground">
                Specialists who understand SaaS growth inside and out
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="shadow-soft">
                  <CardContent className="pt-8 text-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Award className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold mb-3">{member.role}</h3>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto shadow-large overflow-hidden">
            <div className="bg-gradient-primary p-12 text-center text-primary-foreground">
              <h2 className="text-3xl font-bold mb-4">
                Let's Grow Together
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Ready to leverage the power of strategic partnerships for your SaaS?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" variant="secondary" className="shadow-medium">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                    See How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;
