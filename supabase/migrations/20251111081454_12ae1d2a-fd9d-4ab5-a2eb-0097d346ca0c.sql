-- Create payments table for tracking brand transactions
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT,
  description TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Admins can manage all payments
CREATE POLICY "Admins can manage payments"
  ON public.payments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Brands can view their own payments
CREATE POLICY "Brands can view their payments"
  ON public.payments
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE created_by = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Brands can insert their own payments (for add funds)
CREATE POLICY "Brands can create payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE created_by = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Add trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add index for faster queries
CREATE INDEX idx_payments_client_id ON public.payments(client_id);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);