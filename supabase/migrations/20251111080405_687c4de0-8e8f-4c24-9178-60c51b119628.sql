-- Create campaign analytics table for tracking performance metrics
CREATE TABLE public.campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend NUMERIC DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, date)
);

-- Enable RLS
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Admins can manage analytics
CREATE POLICY "Admins can manage campaign analytics"
ON public.campaign_analytics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Brands can view their campaign analytics
CREATE POLICY "Brands can view their campaign analytics"
ON public.campaign_analytics
FOR SELECT
USING (
  campaign_id IN (
    SELECT id FROM campaigns 
    WHERE client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Brands can insert/update analytics for their campaigns
CREATE POLICY "Brands can manage their campaign analytics"
ON public.campaign_analytics
FOR INSERT
WITH CHECK (
  campaign_id IN (
    SELECT id FROM campaigns 
    WHERE client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Brands can update their campaign analytics"
ON public.campaign_analytics
FOR UPDATE
USING (
  campaign_id IN (
    SELECT id FROM campaigns 
    WHERE client_id IN (
      SELECT id FROM clients WHERE created_by = auth.uid()
    )
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_campaign_analytics_updated_at
  BEFORE UPDATE ON public.campaign_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_campaign_analytics_campaign_date ON public.campaign_analytics(campaign_id, date DESC);