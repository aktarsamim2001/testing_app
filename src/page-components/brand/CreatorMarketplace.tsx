"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Youtube, Linkedin, BookOpen, Users, TrendingUp, Mail, Search } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Partner {
  id: string;
  name: string;
  email: string;
  channel_type: "blogger" | "linkedin" | "youtube";
  platform_handle: string | null;
  follower_count: number | null;
  engagement_rate: number | null;
  category: string[] | null;
  notes: string | null;
}

export default function CreatorMarketplace() {
  const router = useRouter();
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [channelTypeFilter, setChannelTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [followerRange, setFollowerRange] = useState([0, 500000]);
  const [engagementRange, setEngagementRange] = useState([0, 10]);

  // Extract unique categories from all partners
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchPartners();
  }, [user, router]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, channelTypeFilter, categoryFilter, followerRange, engagementRange, partners]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("follower_count", { ascending: false, nullsFirst: false });

      if (error) throw error;

      setPartners(data || []);
      
      // Extract unique categories
      const categories = new Set<string>();
      data?.forEach(partner => {
        partner.category?.forEach((cat: string) => categories.add(cat));
      });
      setAvailableCategories(Array.from(categories).sort());
    } catch (error: any) {
      toast.error("Failed to fetch creators");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...partners];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.platform_handle?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Channel type filter
    if (channelTypeFilter !== "all") {
      filtered = filtered.filter(p => p.channel_type === channelTypeFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category?.includes(categoryFilter));
    }

    // Follower count filter
    filtered = filtered.filter(p => {
      const count = p.follower_count || 0;
      return count >= followerRange[0] && count <= followerRange[1];
    });

    // Engagement rate filter
    filtered = filtered.filter(p => {
      const rate = p.engagement_rate || 0;
      return rate >= engagementRange[0] && rate <= engagementRange[1];
    });

    setFilteredPartners(filtered);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setChannelTypeFilter("all");
    setCategoryFilter("all");
    setFollowerRange([0, 500000]);
    setEngagementRange([0, 10]);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <Youtube className="h-5 w-5 text-red-500" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5 text-blue-600" />;
      case "blogger":
        return <BookOpen className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const formatNumber = (num: number | null) => {
    if (!num) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <Skeleton className="h-10 w-96 mb-2" />
        <Skeleton className="h-5 w-80 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Discover Creators</h1>
          <p className="text-muted-foreground">Find and connect with creators across multiple channels</p>
        </div>

        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine your search to find the perfect creators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or handle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Channel Type */}
              <div className="space-y-2">
                <Label>Channel Type</Label>
                <Select value={channelTypeFilter} onValueChange={setChannelTypeFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="blogger">Bloggers</SelectItem>
                    <SelectItem value="linkedin">LinkedIn Influencers</SelectItem>
                    <SelectItem value="youtube">YouTubers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Follower Count Range */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Follower Count</Label>
                <span className="text-sm text-muted-foreground">
                  {formatNumber(followerRange[0])} - {formatNumber(followerRange[1])}
                </span>
              </div>
              <Slider
                min={0}
                max={500000}
                step={10000}
                value={followerRange}
                onValueChange={setFollowerRange}
                className="w-full"
              />
            </div>

            {/* Engagement Rate Range */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Engagement Rate (%)</Label>
                <span className="text-sm text-muted-foreground">
                  {engagementRange[0]}% - {engagementRange[1]}%
                </span>
              </div>
              <Slider
                min={0}
                max={10}
                step={0.5}
                value={engagementRange}
                onValueChange={setEngagementRange}
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={applyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button onClick={resetFilters} variant="outline">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            Showing {filteredPartners.length} of {partners.length} creators
          </p>
        </div>

        {/* Creators Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading creators...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No creators found matching your filters</p>
            <Button onClick={resetFilters} variant="outline">Reset Filters</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(partner.channel_type)}
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                    </div>
                  </div>
                  {partner.platform_handle && (
                    <CardDescription className="font-mono text-sm">
                      {partner.platform_handle}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Users className="h-3 w-3" />
                        <span>Followers</span>
                      </div>
                      <p className="font-semibold text-lg">
                        {formatNumber(partner.follower_count)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <TrendingUp className="h-3 w-3" />
                        <span>Engagement</span>
                      </div>
                      <p className="font-semibold text-lg">
                        {partner.engagement_rate ? `${partner.engagement_rate}%` : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Categories */}
                  {partner.category && partner.category.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {partner.category.slice(0, 3).map((cat, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                      {partner.category.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{partner.category.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Contact */}
                  <div className="pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = `mailto:${partner.email}`}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Creator
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
