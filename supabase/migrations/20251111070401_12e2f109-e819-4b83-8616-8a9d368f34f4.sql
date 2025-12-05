-- Add brand and creator roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'brand';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'creator';

-- Update handle_new_user function to handle role selection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  
  -- Get role from metadata, default to 'user'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user')::app_role;
  
  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- If brand, create client record
  IF user_role = 'brand' THEN
    INSERT INTO public.clients (
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      status,
      created_by
    )
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'New Company'),
      NEW.raw_user_meta_data->>'full_name',
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      'active',
      NEW.id
    );
  END IF;
  
  -- If creator, create partner record
  IF user_role = 'creator' THEN
    INSERT INTO public.partners (
      name,
      email,
      channel_type,
      platform_handle,
      created_by
    )
    VALUES (
      NEW.raw_user_meta_data->>'full_name',
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'channel_type', 'blogger')::channel_type,
      NEW.raw_user_meta_data->>'platform_handle',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update RLS policies for brands to manage their own data
CREATE POLICY "Brands can view their own client data"
ON public.clients
FOR SELECT
TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Brands can update their own client data"
ON public.clients
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Update RLS policies for creators to manage their own data
CREATE POLICY "Creators can view their own partner data"
ON public.partners
FOR SELECT
TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Creators can update their own partner data"
ON public.partners
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Brands can view campaigns for their client
CREATE POLICY "Brands can view their campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE created_by = auth.uid()
  ) OR has_role(auth.uid(), 'admin')
);

-- Creators can view campaigns they're assigned to
CREATE POLICY "Creators can view assigned campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT campaign_id FROM public.campaign_partners 
    WHERE partner_id IN (
      SELECT id FROM public.partners WHERE created_by = auth.uid()
    )
  ) OR has_role(auth.uid(), 'admin')
);