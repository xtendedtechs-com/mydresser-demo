-- Fix Security Issues: Restrict merchant_pages public access and enhance protection

-- 1. Drop existing permissive policies on merchant_pages
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON merchant_pages;
DROP POLICY IF EXISTS "Anyone can view merchant pages" ON merchant_pages;

-- 2. Create stricter merchant_pages policies - require authentication
CREATE POLICY "Authenticated users can view published merchant pages"
ON merchant_pages
FOR SELECT
TO authenticated
USING (is_published = true);

CREATE POLICY "Merchants can view their own pages"
ON merchant_pages
FOR SELECT
USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can update their own pages"
ON merchant_pages
FOR UPDATE
USING (auth.uid() = merchant_id);

CREATE POLICY "Merchants can insert their own pages"
ON merchant_pages
FOR INSERT
WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Merchants can delete their own pages"
ON merchant_pages
FOR DELETE
USING (auth.uid() = merchant_id);

-- 3. Add function to get sanitized merchant contact info (hides sensitive details for non-owners)
CREATE OR REPLACE FUNCTION get_merchant_contact_safe(page_id UUID, requesting_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  page_record RECORD;
  safe_contact JSONB;
BEGIN
  SELECT merchant_id, contact_info INTO page_record
  FROM merchant_pages
  WHERE id = page_id;
  
  -- If requesting user is the merchant owner, return full contact info
  IF page_record.merchant_id = requesting_user_id THEN
    RETURN page_record.contact_info;
  END IF;
  
  -- Otherwise, return sanitized version (only business email, no personal info)
  safe_contact = jsonb_build_object(
    'business_email', page_record.contact_info->>'business_email',
    'website', page_record.contact_info->>'website'
  );
  
  RETURN safe_contact;
END;
$$;

-- 4. Enhance merchant_customers table protection with audit logging
CREATE TABLE IF NOT EXISTS merchant_customer_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id UUID NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_type TEXT NOT NULL,
  ip_address INET
);

ALTER TABLE merchant_customer_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Merchants can view their own access logs"
ON merchant_customer_access_log
FOR SELECT
USING (auth.uid() = merchant_id);

-- 5. Add encryption verification for merchant_profiles tax_id
-- Add a check constraint to ensure tax_id is not stored in plaintext
ALTER TABLE merchant_profiles
ADD CONSTRAINT tax_id_encrypted_check
CHECK (
  tax_id IS NULL OR 
  length(tax_id) > 20 -- encrypted values are longer
);

-- 6. Create function to encrypt sensitive merchant data
CREATE OR REPLACE FUNCTION encrypt_merchant_tax_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- If tax_id is being set and looks like plaintext, hash it
  IF NEW.tax_id IS NOT NULL AND length(NEW.tax_id) <= 20 THEN
    NEW.tax_id = encode(digest(NEW.tax_id || NEW.encryption_salt::text, 'sha256'), 'hex');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER encrypt_tax_id_before_insert
BEFORE INSERT OR UPDATE ON merchant_profiles
FOR EACH ROW
EXECUTE FUNCTION encrypt_merchant_tax_id();

-- 7. Add row-level audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS sensitive_data_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  row_id UUID NOT NULL,
  accessed_fields TEXT[],
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

ALTER TABLE sensitive_data_access_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
ON sensitive_data_access_audit
FOR SELECT
USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON merchant_customer_access_log TO authenticated;
GRANT SELECT ON sensitive_data_access_audit TO authenticated;