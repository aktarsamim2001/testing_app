-- Add INSERT policy for brands to create campaigns
CREATE POLICY "Brands can create campaigns"
ON campaigns
FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT id FROM clients WHERE created_by = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);