import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Search, UserPlus, FileText, Rocket, BarChart3, 
  CheckCircle2, ArrowRight, Clock, Shield, TrendingUp 
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Discovery & Strategy",
      description: "We start by understanding your SaaS product, target audience, and growth goals through an in-depth consultation.",
      details: [
        "Competitor analysis",
        "Audience research",
        "Channel selection",
        "KPI definition",
      ],
      timeline: "Week 1",
    },
    {
      icon: UserPlus,
      title: "Partner Identification",
      description: "Our team identifies and vets the most relevant influencers, bloggers, and creators aligned with your brand and audience.",
      details: [
        "Influencer database search",
        "Audience match scoring",
        "Authenticity verification",
        "Reach & engagement analysis",
      ],
      timeline: "Week 2",
    },
    {
      icon: FileText,
      title: "Campaign Development",
      description: "We create compelling campaign briefs, negotiate partnerships, and develop content guidelines that resonate with your message.",
      details: [
        "Campaign brief creation",
        "Partnership negotiations",
        "Content guidelines",
        "Timeline scheduling",
      ],
      timeline: "Week 3",
    },
    {
      icon: Rocket,
      title: "Launch & Execution",
      description: "Your campaigns go live across chosen channels with real-time monitoring and optimization for maximum impact.",
      details: [
        "Multi-channel coordination",
        "Content approval process",
        "Launch optimization",
        "Real-time monitoring",
      ],
      timeline: "Week 4+",
    },
    {
      icon: BarChart3,
      title: "Tracking & Optimization",
      description: "Continuous performance tracking with data-driven insights and optimization to improve ROI throughout the campaign.",
      details: [
        "Performance dashboards",
        "A/B testing",
        "Conversion tracking",
        "Monthly reports",
      ],
      timeline: "Ongoing",
    },
  ];

  const advantages = [
    {
      icon: Clock,
      title: "Fast Time to Market",
      description: "Launch your first campaign within 30 days of onboarding",
    },
    {
      icon: Shield,
      title: "Risk Mitigation",
      description: "We vet all partners and ensure brand safety throughout",
    },
    {
      icon: TrendingUp,
      title: "Scalable Growth",
      description: "Start small and scale as you see results - no long-term lock-in",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-subtle py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Our Process
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              From Strategy to Scale in 5 Simple Steps
            </h1>
            <p className="text-xl text-muted-foreground">
              A proven methodology that turns partnership opportunities into measurable growth. 
              Transparent, data-driven, and designed for SaaS companies.
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            {steps.map((step, index) => (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-all overflow-hidden group">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Step Number & Icon */}
                    <div className="shrink-0">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <step.icon className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <Badge className="absolute -top-2 -right-2 bg-background border-2 border-primary">
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
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      
                      <div className="grid sm:grid-cols-2 gap-2">
                        {step.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
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
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Our Process Works</h2>
              <p className="text-lg text-muted-foreground">
                Built on years of experience scaling SaaS companies
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => (
                <Card key={index} className="shadow-soft">
                  <CardContent className="pt-8 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <advantage.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{advantage.title}</h3>
                    <p className="text-muted-foreground">{advantage.description}</p>
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
                Ready to Get Started?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Schedule a free consultation to discuss your growth goals and see how we can help
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" variant="secondary" className="shadow-medium">
                    Schedule Consultation
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                    View Pricing
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

export default HowItWorks;
