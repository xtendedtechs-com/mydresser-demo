-- Create storage buckets for user files
INSERT INTO storage.buckets (id, name, public) VALUES ('wardrobe-photos', 'wardrobe-photos', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-avatars', 'profile-avatars', true);

-- Create RLS policies for wardrobe photos storage
CREATE POLICY "Users can upload their own wardrobe photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'wardrobe-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own wardrobe photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'wardrobe-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own wardrobe photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'wardrobe-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own wardrobe photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'wardrobe-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for profile avatars storage
CREATE POLICY "Anyone can view profile avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);