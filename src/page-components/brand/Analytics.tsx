"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  MousePointer, 
  Eye,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Calendar
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

type Campaign = {
  id: string;
  name: string;
  type: string;
  status: string;
  budget: number;
  start_date: string;
  end_date: string;
};

type AnalyticsData = {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  engagement_rate: number;
};

type CampaignMetrics = {
  campaign_id: string;
  campaign_name: string;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_spend: number;
  total_revenue: number;
  roi: number;
  ctr: number;
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

export default function BrandAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetrics[]>([]);

  useEffect(() => {
    fetchData();
  }, [user, selectedCampaign, dateRange]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch client ID
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('created_by', user.id)
        .single();

      if (!clientData) {
        toast({
          title: "Error",
          description: "Client profile not found",
          variant: "destructive",
        });
        return;
      }

      // Fetch campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      setCampaigns(campaignsData || []);

      // Calculate date range
      const endDate = new Date();
      let startDate = subDays(endDate, 30);
      
      if (dateRange === "7d") startDate = subDays(endDate, 7);
      if (dateRange === "90d") startDate = subDays(endDate, 90);
      if (dateRange === "month") {
        startDate = startOfMonth(endDate);
      }

      // Fetch analytics data
      let analyticsQuery = supabase
        .from('campaign_analytics')
        .select('*, campaigns!inner(name)')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: true });

      if (selectedCampaign !== "all") {
        analyticsQuery = analyticsQuery.eq('campaign_id', selectedCampaign);
      } else {
        const campaignIds = campaignsData?.map(c => c.id) || [];
        if (campaignIds.length > 0) {
          analyticsQuery = analyticsQuery.in('campaign_id', campaignIds);
        }
      }

      const { data: analytics } = await analyticsQuery;

      // Group by date and aggregate
      const groupedData: Record<string, AnalyticsData> = {};
      
      analytics?.forEach(record => {
        const dateKey = record.date;
        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {
            date: dateKey,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            spend: 0,
            revenue: 0,
            engagement_rate: 0
          };
        }
        
        groupedData[dateKey].impressions += record.impressions || 0;
        groupedData[dateKey].clicks += record.clicks || 0;
        groupedData[dateKey].conversions += record.conversions || 0;
        groupedData[dateKey].spend += Number(record.spend) || 0;
        groupedData[dateKey].revenue += Number(record.revenue) || 0;
      });

      const aggregatedData = Object.values(groupedData).map(d => ({
        ...d,
        engagement_rate: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0
      }));

      setAnalyticsData(aggregatedData);

      // Calculate campaign metrics
      const metricsMap: Record<string, CampaignMetrics> = {};
      
      analytics?.forEach(record => {
        const campaignId = record.campaign_id;
        const campaignName = (record.campaigns as any)?.name || 'Unknown';
        
        if (!metricsMap[campaignId]) {
          metricsMap[campaignId] = {
            campaign_id: campaignId,
            campaign_name: campaignName,
            total_impressions: 0,
            total_clicks: 0,
            total_conversions: 0,
            total_spend: 0,
            total_revenue: 0,
            roi: 0,
            ctr: 0
          };
        }
        
        metricsMap[campaignId].total_impressions += record.impressions || 0;
        metricsMap[campaignId].total_clicks += record.clicks || 0;
        metricsMap[campaignId].total_conversions += record.conversions || 0;
        metricsMap[campaignId].total_spend += Number(record.spend) || 0;
        metricsMap[campaignId].total_revenue += Number(record.revenue) || 0;
      });

      const metrics = Object.values(metricsMap).map(m => ({
        ...m,
        roi: m.total_spend > 0 ? ((m.total_revenue - m.total_spend) / m.total_spend) * 100 : 0,
        ctr: m.total_impressions > 0 ? (m.total_clicks / m.total_impressions) * 100 : 0
      }));

      setCampaignMetrics(metrics);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totals = analyticsData.reduce((acc, curr) => ({
    impressions: acc.impressions + curr.impressions,
    clicks: acc.clicks + curr.clicks,
    conversions: acc.conversions + curr.conversions,
    spend: acc.spend + curr.spend,
    revenue: acc.revenue + curr.revenue
  }), { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 });

  const roi = totals.spend > 0 ? ((totals.revenue - totals.spend) / totals.spend) * 100 : 0;
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const conversionRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div>
          <header className="mb-6">
            <h2 className="text-xl font-semibold">Campaign Analytics</h2>
            
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger className="w-[200px]">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </header>

          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total ROI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{roi.toFixed(1)}%</div>
                    <TrendingUp className={`w-8 h-8 ${roi >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  {roi >= 0 ? (
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <ArrowUp className="w-3 h-3 mr-1" /> Positive return
                    </p>
                  ) : (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <ArrowDown className="w-3 h-3 mr-1" /> Negative return
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">${totals.spend.toLocaleString()}</div>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Campaign investment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">${totals.revenue.toLocaleString()}</div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total earned</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{totals.conversions.toLocaleString()}</div>
                    <Target className="w-8 h-8 text-accent" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {conversionRate.toFixed(2)}% conversion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">CTR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{ctr.toFixed(2)}%</div>
                    <MousePointer className="w-8 h-8 text-secondary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totals.clicks.toLocaleString()} clicks
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList>
                <TabsTrigger value="performance">Performance Over Time</TabsTrigger>
                <TabsTrigger value="campaigns">Campaign Comparison</TabsTrigger>
                <TabsTrigger value="breakdown">Metrics Breakdown</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Track your campaign metrics over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                          labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="impressions" 
                          stroke="hsl(var(--primary))" 
                          name="Impressions"
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="clicks" 
                          stroke="hsl(var(--accent))" 
                          name="Clicks"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="conversions" 
                          stroke="hsl(var(--secondary))" 
                          name="Conversions"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue vs Spend</CardTitle>
                    <CardDescription>Compare your investment with returns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                          formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                        <Legend />
                        <Bar dataKey="spend" fill="hsl(var(--destructive))" name="Spend" />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="campaigns" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Performance Comparison</CardTitle>
                    <CardDescription>Compare ROI across all campaigns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={campaignMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="campaign_name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                        <Legend />
                        <Bar dataKey="roi" fill="hsl(var(--primary))" name="ROI %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaignMetrics.map((metric) => (
                    <Card key={metric.campaign_id}>
                      <CardHeader>
                        <CardTitle className="text-base">{metric.campaign_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">ROI:</span>
                          <span className={`font-medium ${metric.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {metric.roi.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">CTR:</span>
                          <span className="font-medium">{metric.ctr.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Conversions:</span>
                          <span className="font-medium">{metric.total_conversions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Spend:</span>
                          <span className="font-medium">${metric.total_spend.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Revenue:</span>
                          <span className="font-medium">${metric.total_revenue.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Impressions Distribution</CardTitle>
                      <CardDescription>Where your impressions come from</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={campaignMetrics}
                            dataKey="total_impressions"
                            nameKey="campaign_name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {campaignMetrics.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Distribution</CardTitle>
                      <CardDescription>Revenue by campaign</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={campaignMetrics}
                            dataKey="total_revenue"
                            nameKey="campaign_name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {campaignMetrics.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* No Data State */}
            {analyticsData.length === 0 && !loading && (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your campaign performance by adding analytics data
                  </p>
                  <Badge variant="outline">Campaign analytics will appear here</Badge>
                </CardContent>
              </Card>
            )}
          </div>
      </div>
    </div>
  );
}
