"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, CreditCard, Building2, Check, Trash2, Star } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: string;
  is_default: boolean;
  nickname: string | null;
  card_last4: string | null;
  card_brand: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  bank_name: string | null;
  bank_account_last4: string | null;
  paypal_email: string | null;
  status: string;
  created_at: string;
}

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [deleteMethod, setDeleteMethod] = useState<string | null>(null);
  const { toast } = useToast();

  // Add method form state
  const [methodType, setMethodType] = useState("card");
  const [nickname, setNickname] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardBrand, setCardBrand] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClientAndMethods();
  }, []);

  const fetchClientAndMethods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("created_by", user.id)
        .single();

      if (!client) return;

      setClientId(client.id);

      const { data: methodsData, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("client_id", client.id)
        .eq("status", "active")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPaymentMethods(methodsData || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    setSubmitting(true);
    try {
      const methodData: any = {
        client_id: clientId,
        type: methodType,
        nickname: nickname || null,
        is_default: paymentMethods.length === 0, // First method is default
      };

      if (methodType === "card") {
        methodData.card_last4 = cardNumber.slice(-4);
        methodData.card_brand = cardBrand;
        methodData.card_exp_month = parseInt(expMonth);
        methodData.card_exp_year = parseInt(expYear);
      } else if (methodType === "bank_account") {
        methodData.bank_name = bankName;
        methodData.bank_account_last4 = accountNumber.slice(-4);
      } else if (methodType === "paypal") {
        methodData.paypal_email = paypalEmail;
      }

      const { error } = await supabase
        .from("payment_methods")
        .insert(methodData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment method added successfully",
      });

      setAddMethodOpen(false);
      resetForm();
      fetchClientAndMethods();
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_default: true })
        .eq("id", methodId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Default payment method updated",
      });

      fetchClientAndMethods();
    } catch (error) {
      console.error("Error setting default:", error);
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMethod = async () => {
    if (!deleteMethod) return;

    try {
      const { error } = await supabase
        .from("payment_methods")
        .update({ status: "removed" })
        .eq("id", deleteMethod);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment method removed",
      });

      setDeleteMethod(null);
      fetchClientAndMethods();
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setMethodType("card");
    setNickname("");
    setCardNumber("");
    setCardBrand("");
    setExpMonth("");
    setExpYear("");
    setBankName("");
    setAccountNumber("");
    setPaypalEmail("");
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "bank_account":
        return <Building2 className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getMethodDisplay = (method: PaymentMethod) => {
    if (method.type === "card") {
      return (
        <div>
          <p className="font-medium">
            {method.card_brand} •••• {method.card_last4}
          </p>
          <p className="text-sm text-muted-foreground">
            Expires {method.card_exp_month}/{method.card_exp_year}
          </p>
        </div>
      );
    } else if (method.type === "bank_account") {
      return (
        <div>
          <p className="font-medium">{method.bank_name}</p>
          <p className="text-sm text-muted-foreground">
            Account •••• {method.bank_account_last4}
          </p>
        </div>
      );
    } else if (method.type === "paypal") {
      return (
        <div>
          <p className="font-medium">PayPal</p>
          <p className="text-sm text-muted-foreground">{method.paypal_email}</p>
        </div>
      );
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your saved payment methods</p>
        </div>
        <Dialog open={addMethodOpen} onOpenChange={setAddMethodOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>Add a new payment method to your account</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddMethod} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="method-type">Payment Type</Label>
                <Select value={methodType} onValueChange={setMethodType}>
                  <SelectTrigger id="method-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_account">Bank Account</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname (Optional)</Label>
                <Input
                  id="nickname"
                  placeholder="e.g., Business Card"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>

              {methodType === "card" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-brand">Card Brand</Label>
                    <Select value={cardBrand} onValueChange={setCardBrand} required>
                      <SelectTrigger id="card-brand">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Visa">Visa</SelectItem>
                        <SelectItem value="Mastercard">Mastercard</SelectItem>
                        <SelectItem value="American Express">American Express</SelectItem>
                        <SelectItem value="Discover">Discover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exp-month">Exp Month</Label>
                      <Input
                        id="exp-month"
                        type="number"
                        min="1"
                        max="12"
                        placeholder="MM"
                        value={expMonth}
                        onChange={(e) => setExpMonth(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exp-year">Exp Year</Label>
                      <Input
                        id="exp-year"
                        type="number"
                        min={new Date().getFullYear()}
                        placeholder="YYYY"
                        value={expYear}
                        onChange={(e) => setExpYear(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {methodType === "bank_account" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Input
                      id="bank-name"
                      placeholder="e.g., Chase Bank"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      placeholder="Enter account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {methodType === "paypal" && (
                <div className="space-y-2">
                  <Label htmlFor="paypal-email">PayPal Email</Label>
                  <Input
                    id="paypal-email"
                    type="email"
                    placeholder="your@email.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Payment Method"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No payment methods</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first payment method to get started</p>
            <Button onClick={() => setAddMethodOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {getMethodIcon(method.type)}
                  </div>
                  <div>
                    {method.nickname && (
                      <p className="text-sm text-muted-foreground mb-1">{method.nickname}</p>
                    )}
                    {getMethodDisplay(method)}
                  </div>
                  {method.is_default && (
                    <Badge variant="default" className="ml-4">
                      <Check className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!method.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteMethod(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteMethod} onOpenChange={() => setDeleteMethod(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMethod}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
