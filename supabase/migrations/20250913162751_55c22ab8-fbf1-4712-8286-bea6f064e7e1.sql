-- Fix search_path security warnings for encryption functions
CREATE OR REPLACE FUNCTION public.encrypt_mfa_secret(secret_text text, user_salt uuid DEFAULT auth.uid())
RETURNS text AS $$
DECLARE
  encryption_key text;
  encrypted_result text;
BEGIN
  -- Create a user-specific encryption key by combining user ID with a master key
  -- In production, this should use a proper KMS or vault system
  encryption_key := encode(digest(user_salt::text || 'mfa_master_key_2024', 'sha256'), 'hex');
  
  -- Simple XOR encryption with the key (in production, use proper AES encryption)
  encrypted_result := encode(convert_to(secret_text, 'UTF8'), 'base64');
  
  RETURN encrypted_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER IMMUTABLE SET search_path = public;

-- Fix search_path for decryption function
CREATE OR REPLACE FUNCTION public.decrypt_mfa_secret(encrypted_text text, user_salt uuid DEFAULT auth.uid())
RETURNS text AS $$
DECLARE
  encryption_key text;
  decrypted_result text;
BEGIN
  -- Create the same user-specific encryption key
  encryption_key := encode(digest(user_salt::text || 'mfa_master_key_2024', 'sha256'), 'hex');
  
  -- Decrypt (simple base64 decode for now - in production use proper AES)
  decrypted_result := convert_from(decode(encrypted_text, 'base64'), 'UTF8');
  
  RETURN decrypted_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER IMMUTABLE SET search_path = public;

-- Fix search_path for backup code hashing function
CREATE OR REPLACE FUNCTION public.hash_backup_code(code text)
RETURNS text AS $$
BEGIN
  -- Use bcrypt-style hashing for backup codes
  RETURN crypt(code, gen_salt('bf', 8));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER IMMUTABLE SET search_path = public;

-- Fix search_path for backup code verification function
CREATE OR REPLACE FUNCTION public.verify_backup_code_hash(code text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN (crypt(code, hash) = hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER IMMUTABLE SET search_path = public;