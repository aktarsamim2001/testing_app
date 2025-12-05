"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Earning {
  id: string;
  amount: number;
  type: string;
  status: string;
  payment_date: string | null;
  payment_method: string | null;
  transaction_id: string | null;
  description: string | null;
  created_at: string;
  campaigns: {
    name: string;
  };
}

export default function Earnings() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("all");

  // Stats
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);
  const [paidEarnings, setPaidEarnings] = useState(0);
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);

  useEffect(() => {
    fetchPartnerAndEarnings();
  }, [timeRange]);

  const fetchPartnerAndEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get partner ID
      const { data: partner } = await supabase
        .from("partners")
        .select("id")
        .eq("created_by", user.id)
        .single();

      if (!partner) return;

      setPartnerId(partner.id);

      // Build query based on time range
      let query = supabase
        .from("creator_earnings")
        .select(`
          *,
          campaigns (
            name
          )
        `)
        .eq("partner_id", partner.id)
        .order("created_at", { ascending: false });

      // Apply time range filter
      if (timeRange !== "all") {
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
          case "month":
            startDate = startOfMonth(now);
            break;
          case "3months":
            startDate = startOfMonth(subMonths(now, 2));
            break;
          case "6months":
            startDate = startOfMonth(subMonths(now, 5));
            break;
          case "year":
            startDate = startOfMonth(subMonths(now, 11));
            break;
          default:
            startDate = new Date(0);
        }

        query = query.gte("created_at", startDate.toISOString());
      }

      const { data: earningsData, error } = await query;

      if (error) throw error;

      setEarnings(earningsData || []);

      // Calculate stats
      const total = earningsData?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const pending = earningsData?.filter(e => e.status === "pending").reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const paid = earningsData?.filter(e => e.status === "paid").reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      
      const currentMonth = startOfMonth(new Date());
      const thisMonth = earningsData?.filter(e => new Date(e.created_at) >= currentMonth).reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      setTotalEarnings(total);
      setPendingEarnings(pending);
      setPaidEarnings(paid);
      setThisMonthEarnings(thisMonth);
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      processing: "outline",
      cancelled: "destructive",
    };
    
    const labels: Record<string, string> = {
      paid: "Paid",
      pending: "Pending",
      processing: "Processing",
      cancelled: "Cancelled",
    };

    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      commission: "Commission",
      bonus: "Bonus",
      fixed_payment: "Fixed Payment",
      milestone: "Milestone",
    };

    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  // Prepare chart data - earnings over time
  const getChartData = () => {
    if (!earnings.length) return [];

    const monthlyData: Record<string, number> = {};

    earnings.forEach((earning) => {
      const month = format(new Date(earning.created_at), "MMM yyyy");
      monthlyData[month] = (monthlyData[month] || 0) + Number(earning.amount);
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .reverse()
      .slice(-6); // Last 6 months
  };

  // Prepare campaign breakdown
  const getCampaignBreakdown = () => {
    if (!earnings.length) return [];

    const campaignData: Record<string, number> = {};

    earnings.forEach((earning) => {
      const campaign = earning.campaigns?.name || "Unknown";
      campaignData[campaign] = (campaignData[campaign] || 0) + Number(earning.amount);
    });

    return Object.entries(campaignData)
      .map(([campaign, amount]) => ({ campaign, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 campaigns
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground">Track your payments and earnings</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paidEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Successfully paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${thisMonthEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Over Time</CardTitle>
            <CardDescription>Monthly earnings trend</CardDescription>
          </CardHeader>
          <CardContent>
            {getChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No earnings data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Campaigns</CardTitle>
            <CardDescription>Highest earning campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            {getCampaignBreakdown().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getCampaignBreakdown()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="campaign" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No campaign data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All your earnings and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No earnings yet</p>
              <p className="text-sm">Complete campaigns to start earning</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(earning.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>{earning.campaigns?.name || "N/A"}</TableCell>
                    <TableCell>{getTypeBadge(earning.type)}</TableCell>
                    <TableCell className="font-medium">
                      ${Number(earning.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{getStatusBadge(earning.status)}</TableCell>
                    <TableCell>
                      {earning.payment_date ? format(new Date(earning.payment_date), "MMM dd, yyyy") : "—"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{earning.description || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
