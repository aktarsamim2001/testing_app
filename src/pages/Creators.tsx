"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { DollarSign, TrendingUp, Clock, Users, CheckCircle, Linkedin, Youtube, FileText } from "lucide-react";

const Creators = () => {
  const stats = [
    {
      icon: DollarSign,
      value: "$100+",
      label: "Per LinkedIn Post",
      description: "Minimum guaranteed earnings"
    },
    {
      icon: TrendingUp,
      value: "$1,500",
      label: "Monthly Potential",
      description: "For just a few hours of work"
    },
    {
      icon: Clock,
      value: "2-3 hrs",
      label: "Per Week",
      description: "Flexible time commitment"
    },
    {
      icon: Users,
      value: "500+",
      label: "Active Campaigns",
      description: "Choose what fits you"
    }
  ];

  const channels = [
    {
      icon: Linkedin,
      name: "LinkedIn Influencers",
      earnings: "$100-300 per post",
      description: "Share SAAS insights with your professional network"
    },
    {
      icon: Youtube,
      name: "YouTube Creators",
      earnings: "$200-500 per video",
      description: "Create product reviews and tutorials"
    },
    {
      icon: FileText,
      name: "Bloggers",
      earnings: "$150-400 per article",
      description: "Write detailed reviews and guides"
    }
  ];

  const benefits = [
    "Choose campaigns that align with your audience",
    "Flexible schedule - work on your own time",
    "Get paid quickly and reliably",
    "Access to exclusive SAAS partnerships",
    "Build your portfolio with quality brands",
    "No minimum follower requirements to start"
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Profile",
      description: "Sign up and showcase your channel, audience, and expertise"
    },
    {
      step: "2",
      title: "Browse Campaigns",
      description: "Find SAAS campaigns that match your niche and interests"
    },
    {
      step: "3",
      title: "Create Content",
      description: "Produce authentic content for your audience"
    },
    {
      step: "4",
      title: "Get Paid",
      description: "Receive payments directly to your account"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-subtle">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="mb-6">
            Turn Your Influence Into Income
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join PartnerScale and earn <span className="text-accent font-bold">$100+ per post</span> promoting 
            quality SAAS products to your audience. Make up to <span className="text-accent font-bold">$1,500/month</span> with 
            just a few hours of work!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?type=creator">
              <Button size="lg" className="bg-gradient-primary shadow-medium hover:shadow-large text-lg px-8">
                Start Earning Today
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="border-border hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-gradient-primary rounded-lg mb-4">
                      <stat.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-3xl font-bold text-primary mb-2">{stat.value}</h3>
                    <p className="font-semibold mb-1">{stat.label}</p>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Channels Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="mb-4">Choose Your Channel</h2>
            <p className="text-xl text-muted-foreground">
              Multiple ways to monetize your influence
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {channels.map((channel, index) => (
              <Card key={index} className="border-border hover:shadow-medium transition-all">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-gradient-secondary rounded-lg mb-4">
                      <channel.icon className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <h4 className="mb-2">{channel.name}</h4>
                    <p className="text-accent font-bold text-lg mb-3">{channel.earnings}</p>
                    <p className="text-muted-foreground">{channel.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Start earning in 4 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-4 shadow-medium">
                    {item.step}
                  </div>
                  <h4 className="mb-2">{item.title}</h4>
                  <p className="text-muted-foreground">{item.description}</p>
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
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="mb-4">Why Join PartnerScale?</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to succeed as a creator
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-primary-foreground">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of creators already earning consistent income through SAAS partnerships. 
            Sign up today and get access to exclusive campaigns!
          </p>
          <Link href="/auth?type=creator">
            <Button size="lg" variant="secondary" className="text-lg px-8 shadow-large">
              Create Your Creator Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Creators;
