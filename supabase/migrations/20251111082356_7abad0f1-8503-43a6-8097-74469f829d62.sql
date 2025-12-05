-- Create creator_earnings table for tracking creator payments
CREATE TABLE public.creator_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('commission', 'bonus', 'fixed_payment', 'milestone')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'cancelled')),
  payment_date DATE,
  payment_method TEXT,
  transaction_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_earnings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all earnings
CREATE POLICY "Admins can manage creator earnings"
  ON public.creator_earnings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Creators can view their own earnings
CREATE POLICY "Creators can view their earnings"
  ON public.creator_earnings
  FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM public.partners WHERE created_by = auth.uid()
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Brands can view earnings for their campaigns
CREATE POLICY "Brands can view earnings for their campaigns"
  ON public.creator_earnings
  FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE client_id IN (
        SELECT id FROM public.clients WHERE created_by = auth.uid()
      )
    ) OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Add trigger for updated_at
CREATE TRIGGER update_creator_earnings_updated_at
  BEFORE UPDATE ON public.creator_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for faster queries
CREATE INDEX idx_creator_earnings_partner_id ON public.creator_earnings(partner_id);
CREATE INDEX idx_creator_earnings_campaign_id ON public.creator_earnings(campaign_id);
CREATE INDEX idx_creator_earnings_status ON public.creator_earnings(status);
CREATE INDEX idx_creator_earnings_payment_date ON public.creator_earnings(payment_date DESC);