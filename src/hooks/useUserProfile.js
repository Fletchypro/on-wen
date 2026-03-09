import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useUserProfile = (user) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const updateProfile = async (updates) => {
    if (!user) return false;
    setLoading(true);
    try {
      // Check for username uniqueness before updating
      if (updates.username && updates.username !== profile.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('username', updates.username)
          .maybeSingle();

        if (checkError) {
          throw new Error(`Error checking username: ${checkError.message}`);
        }

        if (existingUser) {
          toast({
            variant: 'destructive',
            title: 'Username taken',
            description: 'This username is already in use. Please choose another one.',
          });
          setLoading(false);
          return false;
        }
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      await fetchProfile(); // Refetch to get the latest profile data
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
      console.error('Error updating profile:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file, filePath) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      await fetchProfile(); // Refetch to get the latest profile data
      toast({
        title: 'Avatar Uploaded',
        description: 'Your new avatar has been set.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message,
      });
      console.error('Error uploading avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, refetch: fetchProfile, updateProfile, uploadAvatar };
};