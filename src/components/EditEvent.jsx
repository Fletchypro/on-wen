import React, { useState, useEffect } from 'react';
    import { useLocation, useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import EventFormFields from '@/components/EventFormFields';
    import { useUserProfile } from '@/hooks/useUserProfile';
    import { Button } from '@/components/ui/button';
    import { ArrowLeft, Save } from 'lucide-react';
    import { useTheme } from '@/contexts/ThemeContext';
    import { useFriends } from '@/hooks/useFriends';
    import { useEventTags } from '@/hooks/useEventTags';
    import useEventForm from '@/hooks/useEventForm';

    const EditEvent = ({ updateEvent }) => {
        const location = useLocation();
        const navigate = useNavigate();
        const { user } = useAuth();
        const { profile } = useUserProfile(user);
        const { theme } = useTheme();

        const [initialEventData, setInitialEventData] = useState(null);
        const [selectedTag, setSelectedTag] = useState(null);
        const [imagePreview, setImagePreview] = useState(null);
        const [isSubmitting, setIsSubmitting] = useState(false);

        const [userRole, setUserRole] = useState('user');
        const { friends, loading: friendsLoading } = useFriends();
        const { tags, loading: tagsLoading, createTag, deleteTag } = useEventTags();

        const {
            formData,
            setFormData,
            handleInputChange,
            handleFieldChange,
            handleImageUpload,
            handleSubmit,
        } = useEventForm(initialEventData, updateEvent);

        useEffect(() => {
          if (profile) {
              setUserRole(profile.role || 'user');
          }
        }, [profile]);
        
        useEffect(() => {
            if (location.state && location.state.eventToEdit) {
                const { attendees, tag_id, ...eventDetails } = location.state.eventToEdit;
                const formattedData = {
                    ...eventDetails,
                    notes: eventDetails.notes || '',
                    time: eventDetails.time ? eventDetails.time.substring(0, 5) : '',
                    visibility: eventDetails.visibility ?? 1,
                    show_on_feed: eventDetails.show_on_feed ?? false,
                    image: eventDetails.image || '',
                    image_position: eventDetails.image_position || 'center center',
                    repeatNextYear: eventDetails.repeatnextyear || false,
                    attendees: [],
                };
                
                if (tag_id && tags) {
                    const tag = tags.find(t => t.id === tag_id);
                    if (tag) {
                        setSelectedTag({ value: tag.id, label: tag.name });
                    }
                }

                setImagePreview(eventDetails.image);
                
                if (attendees && attendees.length > 0) {
                    const attendeeIds = attendees.filter(att => att.id !== user.id).map(att => ({
                        value: att.id,
                        label: `${att.first_name || ''} ${att.last_name || ''}`.trim() || att.email,
                    }));
                    formattedData.attendees = attendeeIds;
                }
                setInitialEventData(formattedData);
            } else if (!location.state) {
                navigate('/dashboard');
            }
        }, [location.state, navigate, user?.id, tags]);
        
        const handleFormSubmit = async (e) => {
            e.preventDefault();
            if (!formData || !user || isSubmitting) return;
            setIsSubmitting(true);
            
            const tagId = selectedTag ? selectedTag.value : null;
            const eventDataWithTag = { ...formData, tag_id: tagId };

            try {
                await handleSubmit(e, eventDataWithTag);
            } finally {
                setIsSubmitting(false);
            }
        };

        if (!formData) {
            return null; 
        }

        const isCreator = formData.user_id === user.id;

        const friendOptions = (friends ?? []).map(friend => ({
            value: friend.id,
            label:
              `${friend.first_name || ''} ${friend.last_name || ''}`.trim() || friend.email,
        }));

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full p-4 md:p-6 text-white"
            >
                <div className="flex items-center mb-6 flex-shrink-0 mt-6">
                    <Button onClick={() => navigate('/dashboard')} variant="ghost" className="mr-2 p-2 h-auto">
                        <ArrowLeft />
                    </Button>
                    <h1 className={`text-3xl font-bold tracking-tight ${theme.headerColor}`}>Edit Event</h1>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain pr-2 -mr-2 pb-[calc(env(safe-area-inset-bottom)+108px)]">
                    <form onSubmit={handleFormSubmit} className="space-y-8">
                        <EventFormFields
                            formData={formData}
                            setFormData={setFormData}
                            handleFieldChange={handleFieldChange}
                            handleInputChange={handleInputChange}
                            handleImageUpload={handleImageUpload}
                            friendOptions={friendOptions}
                            friendsLoading={friendsLoading}
                            tags={tags}
                            tagsLoading={tagsLoading}
                            createTag={createTag}
                            deleteTag={deleteTag}
                            selectedTag={selectedTag}
                            setSelectedTag={setSelectedTag}
                            isCreator={isCreator}
                            userRole={userRole}
                        />

                        <div className="pt-4">
                            <motion.button
                                type="submit"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600
                                         text-white font-semibold flex items-center justify-center space-x-2
                                         shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                disabled={isSubmitting}
                            >
                                <Save size={20} />
                                <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                            </motion.button>
                        </div>
                    </form>
                </div>
            </motion.div>
        );
    };

    export default EditEvent;