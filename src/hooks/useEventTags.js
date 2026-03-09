import { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from "@/components/ui/use-toast";

    export const useEventTags = () => {
        const { user } = useAuth();
        const { toast } = useToast();
        const [tags, setTags] = useState([]);
        const [loading, setLoading] = useState(true);

        const fetchTags = useCallback(async () => {
            if (!user) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('event_tags')
                    .select('*')
                    .eq('user_id', user.id);
                
                if (error) {
                    if (error.message.includes('Failed to fetch')) return;
                    throw error;
                }
                setTags(data);
            } catch (error) {
                 console.error("Error fetching event tags:", error);
            } finally {
                setLoading(false);
            }
        }, [user]);

        useEffect(() => {
            fetchTags();
        }, [fetchTags]);

        const createTag = async (tagName) => {
            if (!user) return null;

            if (tags.length >= 2) {
                toast({
                    title: "Tag Limit Reached",
                    description: "You can only create a maximum of two event tags.",
                    variant: "destructive",
                });
                return null;
            }

            const { data, error } = await supabase
                .from('event_tags')
                .insert({ user_id: user.id, name: tagName })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // unique_violation
                    toast({
                        title: "Tag already exists",
                        description: `You already have a tag named "${tagName}".`,
                        variant: "destructive",
                    });
                } else {
                    console.error("Error creating tag:", error);
                    toast({
                        title: "Error",
                        description: "Could not create tag.",
                        variant: "destructive",
                    });
                }
                return null;
            } else {
                toast({
                    title: "Tag created!",
                    description: `Successfully created the "${tagName}" tag.`,
                });
                setTags(prevTags => [...prevTags, data]);
                return data;
            }
        };

        const deleteTagAndEvents = async (tagId) => {
            if (!user) return;
    
            const { error } = await supabase.rpc('delete_tag_and_events', { p_tag_id: tagId });
    
            if (error) {
                console.error("Error deleting tag and events:", error);
                toast({
                    title: "Error",
                    description: "Could not delete the tag and its associated events. Please try again.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Tag Deleted!",
                    description: "The tag and all its events have been successfully removed.",
                });
                setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
            }
        };

        return { tags, loading, createTag, deleteTag: deleteTagAndEvents, fetchTags };
    };