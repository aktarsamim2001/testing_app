"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, ArrowLeft, ArrowRight, Target, DollarSign, Calendar, FileText } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const campaignSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  type: z.enum(['blogger_outreach', 'linkedin_influencer', 'youtube_campaign']),
  goals: z.string().min(10, "Please describe your campaign goals").max(500),
  target_audience: z.string().optional(),
  budget: z.number().min(100, "Minimum budget is $100"),
  start_date: z.date({ required_error: "Start date is required" }),
  end_date: z.date({ required_error: "End date is required" }),
});

type CampaignFormData = {
  name: string;
  description: string;
  type: 'blogger_outreach' | 'linkedin_influencer' | 'youtube_campaign';
  goals: string;
  target_audience: string;
  budget: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
};

const steps = [
  { id: 1, name: "Basic Info", icon: FileText },
  { id: 2, name: "Goals", icon: Target },
  { id: 3, name: "Budget", icon: DollarSign },
  { id: 4, name: "Timeline", icon: Calendar },
];

export default function CampaignWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    type: "blogger_outreach",
    goals: "",
    target_audience: "",
    budget: "",
    start_date: undefined,
    end_date: undefined,
  });

  useEffect(() => {
    fetchClientId();
  }, [user]);

  const fetchClientId = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('clients')
      .select('id')
      .eq('created_by', user.id)
      .single();

    if (data) {
      setClientId(data.id);
    } else {
      toast({
        title: "Error",
        description: "Client profile not found",
        variant: "destructive",
      });
      router.push('/brand');
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim() || formData.name.length < 3) {
          toast({
            title: "Validation Error",
            description: "Campaign name must be at least 3 characters",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (!formData.goals.trim() || formData.goals.length < 10) {
          toast({
            title: "Validation Error",
            description: "Please describe your campaign goals (at least 10 characters)",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 3:
        const budgetNum = Number(formData.budget);
        if (!formData.budget || isNaN(budgetNum) || budgetNum < 100) {
          toast({
            title: "Validation Error",
            description: "Budget must be at least $100",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 4:
        if (!formData.start_date) {
          toast({
            title: "Validation Error",
            description: "Please select a start date",
            variant: "destructive",
          });
          return false;
        }
        if (!formData.end_date) {
          toast({
            title: "Validation Error",
            description: "Please select an end date",
            variant: "destructive",
          });
          return false;
        }
        if (formData.end_date <= formData.start_date) {
          toast({
            title: "Validation Error",
            description: "End date must be after start date",
            variant: "destructive",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!clientId) {
      toast({
        title: "Error",
        description: "Client profile not found",
        variant: "destructive",
      });
      return;
    }

    if (!validateStep(4)) return;

    try {
      const validatedData = campaignSchema.parse({
        ...formData,
        budget: Number(formData.budget),
        start_date: formData.start_date,
        end_date: formData.end_date,
      });

      setLoading(true);

      // Combine goals and target audience in description
      const fullDescription = `${formData.description}\n\nGoals: ${validatedData.goals}${formData.target_audience ? `\n\nTarget Audience: ${formData.target_audience}` : ''}`;

      const { error } = await supabase.from('campaigns').insert({
        client_id: clientId,
        name: validatedData.name,
        description: fullDescription,
        type: validatedData.type,
        budget: validatedData.budget,
        start_date: format(validatedData.start_date, 'yyyy-MM-dd'),
        end_date: format(validatedData.end_date, 'yyyy-MM-dd'),
        status: 'planning',
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your campaign has been created successfully",
      });

      router.push('/brand');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create campaign",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  if (loading && !clientId) {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-12 mb-8" />
        <div className="grid gap-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-24" />
          <Skeleton className="h-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto">
      <div>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  const isCompleted = currentStep > step.id;
                  const isCurrent = currentStep === step.id;

                  return (
                    <div key={step.id} className="flex flex-col items-center flex-1">
                      <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full border-2 mb-2",
                        isCompleted && "bg-primary border-primary text-primary-foreground",
                        isCurrent && "border-primary text-primary",
                        !isCompleted && !isCurrent && "border-muted text-muted-foreground"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                      </div>
                      <span className={cn(
                        "text-sm font-medium text-center",
                        isCurrent && "text-primary",
                        !isCurrent && "text-muted-foreground"
                      )}>
                        {step.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Content */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentStep === 1 && "Basic Campaign Information"}
                  {currentStep === 2 && "Campaign Goals & Objectives"}
                  {currentStep === 3 && "Budget & Investment"}
                  {currentStep === 4 && "Campaign Timeline"}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Let's start with the basics about your campaign"}
                  {currentStep === 2 && "Define what you want to achieve with this campaign"}
                  {currentStep === 3 && "Set your budget and investment strategy"}
                  {currentStep === 4 && "Choose when your campaign will run"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Campaign Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Summer Product Launch 2025"
                      />
                      <p className="text-xs text-muted-foreground">
                        Choose a descriptive name that helps you identify this campaign
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Campaign Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          <SelectItem value="blogger_outreach">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">Blogger Outreach</span>
                              <span className="text-xs text-muted-foreground">Partner with bloggers for written content</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="linkedin_influencer">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">LinkedIn Influencer</span>
                              <span className="text-xs text-muted-foreground">B2B thought leadership on LinkedIn</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="youtube_campaign">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">YouTube Campaign</span>
                              <span className="text-xs text-muted-foreground">Video content and tutorials</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Campaign Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Provide an overview of your campaign, product, or service..."
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Help creators understand what your campaign is about
                      </p>
                    </div>
                  </>
                )}

                {/* Step 2: Goals */}
                {currentStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="goals">Campaign Goals & Objectives *</Label>
                      <Textarea
                        id="goals"
                        value={formData.goals}
                        onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                        placeholder="What do you want to achieve? (e.g., brand awareness, lead generation, product launches, website traffic...)"
                        rows={5}
                      />
                      <p className="text-xs text-muted-foreground">
                        Be specific about what success looks like for this campaign
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_audience">Target Audience</Label>
                      <Textarea
                        id="target_audience"
                        value={formData.target_audience}
                        onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                        placeholder="Who are you trying to reach? (e.g., Tech professionals, SaaS buyers, B2B decision makers...)"
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Describe your ideal audience demographics and characteristics
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Pro Tips for Setting Goals
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Use SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)</li>
                        <li>Include quantifiable metrics when possible</li>
                        <li>Consider both short-term and long-term objectives</li>
                      </ul>
                    </div>
                  </>
                )}

                {/* Step 3: Budget */}
                {currentStep === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Total Campaign Budget ($) *</Label>
                      <Input
                        id="budget"
                        type="number"
                        min="100"
                        step="100"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="10000"
                      />
                      <p className="text-xs text-muted-foreground">
                        Set your total budget for creator compensation and campaign costs
                      </p>
                    </div>

                    {formData.budget && Number(formData.budget) >= 100 && (
                      <div className="p-4 bg-muted rounded-lg space-y-3">
                        <h4 className="font-medium">Budget Breakdown Estimate</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Creator Compensation (70%)</span>
                            <span className="font-medium">${(Number(formData.budget) * 0.7).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Production & Assets (20%)</span>
                            <span className="font-medium">${(Number(formData.budget) * 0.2).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Platform Fees (10%)</span>
                            <span className="font-medium">${(Number(formData.budget) * 0.1).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Budget Considerations
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Creator fees vary based on audience size and engagement</li>
                        <li>Budget for content production and revisions</li>
                        <li>Consider boosting top-performing content</li>
                        <li>Leave room for unexpected opportunities</li>
                      </ul>
                    </div>
                  </>
                )}

                {/* Step 4: Timeline */}
                {currentStep === 4 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Campaign Start Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.start_date && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={formData.start_date}
                              onSelect={(date) => setFormData({ ...formData, start_date: date })}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Campaign End Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.end_date && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {formData.end_date ? format(formData.end_date, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={formData.end_date}
                              onSelect={(date) => setFormData({ ...formData, end_date: date })}
                              disabled={(date) => !formData.start_date || date <= formData.start_date}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {formData.start_date && formData.end_date && (
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Campaign Duration</h4>
                        <p className="text-sm text-muted-foreground">
                          Your campaign will run for{" "}
                          <span className="font-medium text-foreground">
                            {Math.ceil((formData.end_date.getTime() - formData.start_date.getTime()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Timeline Tips
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Allow 2-4 weeks for creator outreach and onboarding</li>
                        <li>Plan for content creation and review time</li>
                        <li>Schedule around product launches or seasonal events</li>
                        <li>Consider a longer timeline for YouTube video production</li>
                      </ul>
                    </div>

                    {/* Review Summary */}
                    <div className="mt-6 p-6 border rounded-lg space-y-4">
                      <h3 className="text-lg font-semibold">Campaign Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{formData.name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-medium">
                            {formData.type === 'blogger_outreach' && 'Blogger Outreach'}
                            {formData.type === 'linkedin_influencer' && 'LinkedIn Influencer'}
                            {formData.type === 'youtube_campaign' && 'YouTube Campaign'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Budget:</span>
                          <p className="font-medium">${Number(formData.budget).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <p className="font-medium">
                            {formData.start_date && formData.end_date &&
                              `${Math.ceil((formData.end_date.getTime() - formData.start_date.getTime()) / (1000 * 60 * 60 * 24))} days`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={currentStep === 1 ? () => router.push('/brand') : handleBack}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                  </Button>

                  {currentStep < steps.length ? (
                    <Button onClick={handleNext}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? "Creating..." : "Create Campaign"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
      </div>
    </div>
  );
}
