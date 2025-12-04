import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, Users, Target, Sparkles, BarChart3, CheckCircle2 } from "lucide-react";

const Home = () => {
  const stats = [
    { label: "Active Campaigns", value: "500+" },
    { label: "Partner Networks", value: "10K+" },
    { label: "ROI Average", value: "340%" },
    { label: "Client Satisfaction", value: "98%" },
  ];

  const features = [
    {
      icon: Users,
      title: "Blogger Outreach",
      description: "Connect with influential bloggers in your niche. Build authentic relationships that drive targeted traffic and quality backlinks.",
    },
    {
      icon: Target,
      title: "LinkedIn Influencers",
      description: "Leverage B2B thought leaders on LinkedIn. Tap into professional networks that convert to high-value customers.",
    },
    {
      icon: Sparkles,
      title: "YouTube Campaigns",
      description: "Partner with YouTube creators who resonate with your audience. Video content that educates and converts.",
    },
  ];

  const benefits = [
    "Data-driven partner selection",
    "End-to-end campaign management",
    "Transparent ROI tracking",
    "Dedicated account manager",
    "Scalable growth strategies",
    "No long-term contracts",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle -z-10" />
        <div className="absolute inset-0 -z-10">
          <Image 
            src="/hero-bg.jpg" 
            alt="hero background" 
            fill
            className="w-full h-full object-cover opacity-5"
            priority
          />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Trusted by 500+ Growing SaaS Companies
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Scale Your SaaS Through
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Strategic Partnerships</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with bloggers, LinkedIn influencers, and YouTube creators who amplify your brand. 
              Data-driven campaigns that convert audiences into customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-gradient-primary shadow-medium hover:shadow-large text-lg h-12 px-8">
                  Start Growing Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="text-lg h-12 px-8">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center shadow-soft hover:shadow-medium transition-all">
                <CardContent className="pt-6">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              Three Powerful Channels
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Multi-Channel Partnership Strategy
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We orchestrate campaigns across the most effective channels for B2B SaaS growth
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="relative group overflow-hidden shadow-soft hover:shadow-large transition-all">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                <CardContent className="pt-8">
                  <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  <Link href="/services" className="inline-flex items-center gap-2 mt-4 text-primary font-medium hover:gap-3 transition-all">
                    Learn more
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                  Why PartnerScale
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  The Partnership Platform Built for SaaS Growth
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We don't just connect you with influencers—we build strategic partnerships 
                  that align with your growth goals and target audience.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                <Link href="/about" className="mt-8 inline-block">
                  <Button variant="outline" size="lg">
                    Learn More About Us
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-soft">
                  <CardContent className="pt-6">
                    <TrendingUp className="w-8 h-8 text-primary mb-3" />
                    <div className="text-2xl font-bold mb-1">5X</div>
                    <p className="text-sm text-muted-foreground">Average traffic increase</p>
                  </CardContent>
                </Card>
                <Card className="shadow-soft mt-8">
                  <CardContent className="pt-6">
                    <BarChart3 className="w-8 h-8 text-secondary mb-3" />
                    <div className="text-2xl font-bold mb-1">$2M+</div>
                    <p className="text-sm text-muted-foreground">Revenue generated</p>
                  </CardContent>
                </Card>
                <Card className="shadow-soft">
                  <CardContent className="pt-6">
                    <Users className="w-8 h-8 text-accent mb-3" />
                    <div className="text-2xl font-bold mb-1">10K+</div>
                    <p className="text-sm text-muted-foreground">Partner network</p>
                  </CardContent>
                </Card>
                <Card className="shadow-soft mt-8">
                  <CardContent className="pt-6">
                    <Target className="w-8 h-8 text-primary mb-3" />
                    <div className="text-2xl font-bold mb-1">92%</div>
                    <p className="text-sm text-muted-foreground">Campaign success rate</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto shadow-large overflow-hidden py-0">
            <div className="bg-gradient-primary p-12 text-center text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Scale Your SaaS?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Join 500+ growing companies leveraging strategic partnerships for exponential growth
              </p>
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="shadow-medium hover:shadow-large">
                  Get Started Today
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

export default Home;
