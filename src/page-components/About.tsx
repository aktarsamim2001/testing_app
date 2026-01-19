"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Target, Users, TrendingUp, Award, ArrowRight, Heart, Lightbulb, Zap, Briefcase, Network, BarChart3 } from "lucide-react";

const About = ({data}) => {  
  // Safely extract content sections from API data
  const contentData = data?.content?.[0];
  const section1 = contentData?.section1?.[0];
  const section2 = contentData?.section2?.[0];
  const section3 = contentData?.section3?.[0];
  const section4 = contentData?.section4?.[0];
  const section5 = contentData?.section5?.[0];
  const section6 = contentData?.section6?.[0];

  // Extract data from API
  const values = section4?.titles;
  const stats = section3?.cards;
  const team = section5?.titles;

  // Helper to render values with icon fallback
  const renderValueIcon = (valueData: any, index: number) => {
    const iconMap = [Target, Heart, Lightbulb, Zap];
    const IconComponent = iconMap[index % iconMap.length];
    return <IconComponent className="w-6 h-6 text-primary" />;
  };

  // Helper to render team icons with fallback
  const renderTeamIcon = (teamData: any, index: number) => {
    const iconMap = [Briefcase, Network, BarChart3];
    const IconComponent = iconMap[index % iconMap.length];
    return <IconComponent className="w-6 h-6 text-primary-foreground" />;
  };

  return (
    <div className="h-full">
      {/* Hero Section */}
      <section className="bg-gradient-subtle pt-16 sm:pt-24 pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
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

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
            <Card className="shadow-soft">
              <CardContent className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                  <h2 className="text-3xl font-bold mb-6">{section2?.title}</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {section2?.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{section3?.title}</h2>
              <p className="text-lg text-muted-foreground">
                {section3?.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat: any, index: number) => (
                <Card key={index} className="shadow-soft">
                  <CardContent className="pt-8 text-center">
                    <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                      {stat.title || stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.description || stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{section4?.title}</h2>
              <p className="text-lg text-muted-foreground">
                {section4?.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value: any, index: number) => (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-all">
                  <CardContent className="pt-8">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                        {renderValueIcon(value, index)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{value.text || value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
      </section>

      {/* Team Expertise */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{section5?.title}</h2>
              <p className="text-lg text-muted-foreground">
                {section5?.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member: any, index: number) => (
                <Card key={index} className="shadow-soft">
                  <CardContent className="pt-8 text-center">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                      {renderTeamIcon(member, index)}
                    </div>
                    <h3 className="text-lg font-bold mb-3">{member.text || member.role}</h3>
                    <p className="text-sm text-muted-foreground">{member.icon || member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
            {section6?.title}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary-foreground/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
            {section6?.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {section6?.button1Url && (
              <Link href={section6.button1Url}>
                <Button size="lg" variant="secondary" className="shadow-medium">
                  {section6.button1Text}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            )}
            {section6?.button2Url && (
              <Link href={section6.button2Url}>
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                  {section6.button2Text}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
