"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import {
  submitFrontEnquiry,
  resetEnquiryState,
} from "@/store/slices/frontEnquirySlice";

const Contact = ({ data }) => {
  const searchParams = useSearchParams();
  let source = searchParams.get("source") || "Contact";
  source = source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const enquiry = useSelector((state: any) => state.frontEnquiry);
  const frontSettings = useSelector((state: any) => state.frontSettings?.data);
  console.log("🟢 [Contact] frontSettings:", frontSettings);

  // Safely extract content sections from API data
  const contentData = data?.content?.[0];
  const section1 = contentData?.section1?.[0];
  const section2 = contentData?.section2?.[0];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    service: "",
    budget: "",
    message: "",
  });
  type Errors = {
    name?: string;
    email?: string;
    company?: string;
    website?: string;
    service?: string;
    budget?: string;
    message?: string;
  };
  const [errors, setErrors] = useState<Errors>({});

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Enter a valid email address.";
    if (!formData.company.trim())
      newErrors.company = "Company Name is required.";
    if (!formData.website.trim()) newErrors.website = "Website is required.";
    else if (!/^https?:\/\/.+\..+/.test(formData.website))
      newErrors.website = "Enter a valid website URL.";
    if (!formData.service) newErrors.service = "Service Interest is required.";
    if (!formData.budget) newErrors.budget = "Monthly Budget is required.";
    if (!formData.message.trim())
      newErrors.message = "Please tell us about your goals.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(resetEnquiryState());
    const payload = {
      source,
      name: formData.name,
      email: formData.email,
      company: formData.company,
      website: formData.website,
      service_interest: formData.service,
      monthly_budget: formData.budget,
      description: formData.message,
    };
    const resultAction = await dispatch(submitFrontEnquiry(payload));
    if (submitFrontEnquiry.fulfilled.match(resultAction)) {
      toast({
        title: "Message Sent!",
        description: resultAction.payload?.message || "",
        variant: "success",
      });
      setFormData({
        name: "",
        email: "",
        company: "",
        website: "",
        service: "",
        budget: "",
        message: "",
      });
    } else {
      toast({
        title: "Submission Failed",
        description: enquiry.error || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const updated = { ...prev };
      // Re-validate only the changed field
      if (field === "name") {
        updated.name = !value.trim() ? "Full Name is required." : "";
      }
      if (field === "email") {
        if (!value.trim()) updated.email = "Email is required.";
        else if (!/^\S+@\S+\.\S+$/.test(value))
          updated.email = "Enter a valid email address.";
        else updated.email = "";
      }
      if (field === "company") {
        updated.company = !value.trim() ? "Company Name is required." : "";
      }
      if (field === "website") {
        if (!value.trim()) updated.website = "Website is required.";
        else if (!/^https?:\/\/.+\..+/.test(value))
          updated.website = "Enter a valid website URL.";
        else updated.website = "";
      }
      if (field === "service") {
        updated.service = !value ? "Service Interest is required." : "";
      }
      if (field === "budget") {
        updated.budget = !value ? "Monthly Budget is required." : "";
      }
      if (field === "message") {
        updated.message = !value.trim()
          ? "Please tell us about your goals."
          : "";
      }
      return updated;
    });
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

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">{section2?.title}</h2>
                <p className="text-muted-foreground mb-8">
                  {section2?.description}
                </p>
              </div>

              <Card className="shadow-soft">
                <CardContent className="pt-6 space-y-6">
                  {/* Dynamic contact info from frontSettings */}
                  {frontSettings && (
                    <>
                      {frontSettings.email && (
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Mail className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold mb-1">Email</p>
                            <a
                              href={`mailto:${frontSettings.email}`}
                              className="text-sm text-muted-foreground hover:text-primary"
                            >
                              {frontSettings.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {frontSettings.phone && (
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Phone className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold mb-1">Phone</p>
                            <a
                              href={`tel:${frontSettings.phone}`}
                              className="text-sm text-muted-foreground hover:text-primary"
                            >
                              {frontSettings.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {frontSettings.address && (
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <MapPin className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold mb-1">Address</p>
                            <p className="text-sm text-muted-foreground">
                              {frontSettings.address}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-soft bg-gradient-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">
                    {section2?.expectTitle}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {section2?.titles?.map((item: any, index: number) => (
                      <li key={index}>• {item.text}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-3">
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="John Doe"
                        />
                        {errors.name && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleChange("email", e.target.value)
                          }
                          placeholder="john@company.com"
                        />
                        {errors.email && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) =>
                            handleChange("company", e.target.value)
                          }
                          placeholder="Your SaaS Company"
                        />
                        {errors.company && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.company}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">
                          Website <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) =>
                            handleChange("website", e.target.value)
                          }
                          placeholder="https://yourcompany.com"
                        />
                        {errors.website && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.website}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service">
                          Service Interest{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.service}
                          onValueChange={(value) =>
                            handleChange("service", value)
                          }
                        >
                          <SelectTrigger id="service">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blogger">
                              Blogger Outreach
                            </SelectItem>
                            <SelectItem value="linkedin">
                              LinkedIn Marketing
                            </SelectItem>
                            <SelectItem value="youtube">
                              YouTube Campaigns
                            </SelectItem>
                            <SelectItem value="full">
                              Full-Service Package
                            </SelectItem>
                            <SelectItem value="consultation">
                              Just Exploring
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.service && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.service}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget">
                          Monthly Budget <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.budget}
                          onValueChange={(value) =>
                            handleChange("budget", value)
                          }
                        >
                          <SelectTrigger id="budget">
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="starter">
                              $2,500 - $5,000
                            </SelectItem>
                            <SelectItem value="growth">
                              $5,000 - $10,000
                            </SelectItem>
                            <SelectItem value="enterprise">$10,000+</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.budget && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.budget}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Tell Us About Your Goals{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          handleChange("message", e.target.value)
                        }
                        placeholder="What are your main growth challenges? What are you hoping to achieve with partnership marketing?"
                        rows={5}
                      />
                      {errors.message && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-primary shadow-medium hover:shadow-large"
                      disabled={enquiry.loading}
                    >
                      {enquiry.loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <>
                          <Send className="mr-2 w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
