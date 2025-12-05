-- Create payment_methods table for storing brand payment methods
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  nickname TEXT,
  -- Card specific fields (encrypted in production)
  card_last4 TEXT,
  card_brand TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  -- Bank account specific fields
  bank_name TEXT,
  bank_account_last4 TEXT,
  -- PayPal specific fields
  paypal_email TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Admins can manage all payment methods
CREATE POLICY "Admins can manage payment methods"
  ON public.payment_methods
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Brands can view their own payment methods
CREATE POLICY "Brands can view their payment methods"
  ON public.payment_methods
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE created_by = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Brands can create their own payment methods
CREATE POLICY "Brands can create payment methods"
  ON public.payment_methods
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE created_by = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Brands can update their own payment methods
CREATE POLICY "Brands can update payment methods"
  ON public.payment_methods
  FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE created_by = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Brands can delete their own payment methods
CREATE POLICY "Brands can delete payment methods"
  ON public.payment_methods
  FOR DELETE
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE created_by = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Add trigger for updated_at
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add index for faster queries
CREATE INDEX idx_payment_methods_client_id ON public.payment_methods(client_id);

-- Function to ensure only one default payment method per client
CREATE OR REPLACE FUNCTION public.ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.payment_methods
    SET is_default = false
    WHERE client_id = NEW.client_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to ensure single default
CREATE TRIGGER ensure_single_default_payment_method_trigger
  BEFORE INSERT OR UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_default_payment_method();