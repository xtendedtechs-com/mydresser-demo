import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VTOPhoto {
  id: string;
  user_id: string;
  photo_url: string;
  uploaded_at: string;
  is_active: boolean;
  created_at: string;
}

export const useVTOPhotos = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: photos, isLoading } = useQuery({
    queryKey: ['vto-photos'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('vto_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as VTOPhoto[];
    },
  });

  const uploadPhoto = useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vto-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vto-photos')
        .getPublicUrl(filePath);

      // Save to database
      const { data, error } = await supabase
        .from('vto_photos')
        .insert({ user_id: user.id, photo_url: publicUrl })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vto-photos'] });
      toast({
        title: 'Photo Uploaded',
        description: 'Your VTO photo has been saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('vto_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vto-photos'] });
      toast({
        title: 'Photo Deleted',
        description: 'VTO photo removed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const togglePhotoActive = useMutation({
    mutationFn: async ({ photoId, isActive }: { photoId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('vto_photos')
        .update({ is_active: isActive })
        .eq('id', photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vto-photos'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getRandomActivePhoto = () => {
    const activePhotos = photos?.filter(p => p.is_active) || [];
    if (activePhotos.length === 0) return null;
    return activePhotos[Math.floor(Math.random() * activePhotos.length)];
  };

  return {
    photos: photos || [],
    isLoading,
    uploadPhoto: uploadPhoto.mutate,
    deletePhoto: deletePhoto.mutate,
    togglePhotoActive: togglePhotoActive.mutate,
    getRandomActivePhoto,
    isUploading: uploadPhoto.isPending,
  };
};
