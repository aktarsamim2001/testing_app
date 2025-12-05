"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  payment_method: string | null;
  description: string | null;
  transaction_id: string | null;
  created_at: string;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const { toast } = useToast();

  // Add funds form state
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClientAndPayments();
  }, []);

  const fetchClientAndPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get client ID
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("created_by", user.id)
        .single();

      if (!client) return;

      setClientId(client.id);

      // Fetch payments
      const { data: paymentsData, error } = await supabase
        .from("payments")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPayments(paymentsData || []);

      // Fetch payment methods
      const { data: methodsData } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("client_id", client.id)
        .eq("status", "active")
        .order("is_default", { ascending: false });

      setPaymentMethods(methodsData || []);
      
      // Set default payment method
      const defaultMethod = methodsData?.find(m => m.is_default);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id);
      }

      // Calculate balance and total spent
      const credits = paymentsData?.filter(p => p.type === "credit").reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const debits = paymentsData?.filter(p => p.type === "debit").reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      
      setBalance(credits - debits);
      setTotalSpent(debits);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    setSubmitting(true);
    try {
      const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
      let paymentMethodDisplay = "card";
      
      if (selectedMethod) {
        if (selectedMethod.type === "card") {
          paymentMethodDisplay = `${selectedMethod.card_brand} •••• ${selectedMethod.card_last4}`;
        } else if (selectedMethod.type === "bank_account") {
          paymentMethodDisplay = `${selectedMethod.bank_name} •••• ${selectedMethod.bank_account_last4}`;
        } else if (selectedMethod.type === "paypal") {
          paymentMethodDisplay = selectedMethod.paypal_email;
        }
      }

      const { error } = await supabase
        .from("payments")
        .insert({
          client_id: clientId,
          amount: parseFloat(amount),
          type: "credit",
          status: "completed",
          payment_method: paymentMethodDisplay,
          description: `Added funds via ${paymentMethodDisplay}`,
          transaction_id: `TXN-${Date.now()}`,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `$${amount} added to your account`,
      });

      setAddFundsOpen(false);
      setAmount("");
      fetchClientAndPayments();
    } catch (error) {
      console.error("Error adding funds:", error);
      toast({
        title: "Error",
        description: "Failed to add funds",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === "credit" ? "default" : "secondary"}>
        {type === "credit" ? "Credit" : "Debit"}
      </Badge>
    );
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
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage your account balance and view transaction history</p>
        </div>
        <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Funds</DialogTitle>
              <DialogDescription>Add funds to your account balance</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                {paymentMethods.length > 0 ? (
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger id="payment-method">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.type === "card" && `${method.card_brand} •••• ${method.card_last4}`}
                          {method.type === "bank_account" && `${method.bank_name} •••• ${method.bank_account_last4}`}
                          {method.type === "paypal" && method.paypal_email}
                          {method.is_default && " (Default)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No payment methods saved. Please add one in{" "}
                    <a href="/brand/payment-methods" className="text-primary underline">
                      Payment Methods
                    </a>
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting || paymentMethods.length === 0 || !selectedPaymentMethod}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Add ${amount || "0.00"}</>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">All-time campaign spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View all your payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Add funds to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(payment.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{payment.transaction_id}</TableCell>
                    <TableCell>{getTypeBadge(payment.type)}</TableCell>
                    <TableCell className={payment.type === "credit" ? "text-green-600" : "text-red-600"}>
                      {payment.type === "credit" ? "+" : "-"}${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="capitalize">{payment.payment_method || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="max-w-xs truncate">{payment.description || "N/A"}</TableCell>
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
