"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  FileText, Linkedin, Youtube, CheckCircle2, 
  TrendingUp, Users, Target, Zap, ArrowRight 
} from "lucide-react";

const Services = ({data}) => {
  
  // Safely extract content sections from API data
  const contentData = data?.content?.[0];
  const section1 = contentData?.section1?.[0];
  
  // Separate services by flag
  const regularServices = data?.services?.filter((service: any) => service.flag === "Service") || [];
  const fullServices = data?.services?.filter((service: any) => service.flag === "Full_Service") || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-subtle  pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              {section1?.title}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              {section1?.subtitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              {section1?.description}
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="space-y-12">
            {regularServices.map((service: any, index: number) => {
              // Icon mapping based on service index
              const iconMap = [FileText, Linkedin, Youtube];
              const ServiceIcon = iconMap[index % iconMap.length];
              const colors = ["primary", "secondary", "accent"];
              const color = colors[index % colors.length];
              
              return (
              <Card key={index} className="shadow-medium hover:shadow-large transition-all overflow-hidden">
                <div className={`h-2 bg-gradient-${color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 bg-${color}/10 rounded-xl`}>
                        <ServiceIcon className={`w-8 h-8 text-${color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl md:text-3xl mb-2">{service.name}</CardTitle>
                        <p className="text-muted-foreground font-medium">{service.short_description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm md:text-lg py-1 px-3">
                      Starting at ${service.price}/month
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg">{service.description}</p>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-lg md:text-xl mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        What's Included
                      </h4>
                      <ul className="space-y-2">
                        {service.what_included && Array.isArray(service.what_included) && service.what_included.map((item: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{typeof item === "string" ? item : item.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-4 text-lg md:text-xl flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Key Benefits
                      </h4>
                      <div className="space-y-3">
                        {service.key_benefits && Array.isArray(service.key_benefits) && service.key_benefits.map((benefit: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">{typeof benefit === "string" ? benefit : benefit.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="w-full">
                      <Link href="/contact?source=services" className="block">
                        <Button className="bg-gradient-primary w-full sm:w-auto">
                          Get Started with {service.name}
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        </div>
      </section>

      {/* Full Service Option */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          {fullServices.map((fullService: any, index: number) => (
            <Card key={index} className=" shadow-large">
              <CardContent className="p-12">
                <div className="text-center mb-8">
                  <Badge className="mb-4 bg-gradient-primary text-primary-foreground border-0">
                    Recommended
                  </Badge>
                  <h2 className="text-3xl font-bold mb-4">{fullService.name}</h2>
                  <p className="text-xl text-muted-foreground">
                    {fullService.short_description}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {regularServices.slice(0, 3).map((service: any, idx: number) => {
                    const iconMap = [FileText, Linkedin, Youtube];
                    const ServiceIcon = iconMap[idx % iconMap.length];
                    return (
                      <div key={idx} className="text-center p-6 bg-background rounded-xl">
                        <ServiceIcon className="w-8 h-8 text-primary mx-auto mb-3" />
                        <p className="font-semibold">{service.name}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-gradient-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-lg md:text-xl mb-4">Additional Benefits:</h3>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {fullService.additional_benefits && Array.isArray(fullService.additional_benefits) && fullService.additional_benefits.map((benefit: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>{typeof benefit === "string" ? benefit : benefit.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${fullService.price}</span>
                    <span className="text-muted-foreground">/month</span>
                    {fullService.discount_price && (
                      <Badge className="ml-3 bg-accent/10 text-accent border-accent/20">
                        Save ${(fullService.price - fullService.discount_price) * 12}/year
                      </Badge>
                    )}
                  </div>
                  <Link href="/contact?source=services">
                    <Button size="lg" className="bg-gradient-primary shadow-medium">
                      Start {fullService.name}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Services;
