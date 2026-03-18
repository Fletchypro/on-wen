import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Sparkles } from 'lucide-react';
import useEventForm from '@/hooks/useEventForm';
import EventFormFields from '@/components/EventFormFields';
import { useFriends } from '@/hooks/useFriends';
import { useEventTags } from '@/hooks/useEventTags';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { getPageTitle, getMetaDescription, getOGTags, getTwitterTags, getCanonicalURL } from '@/lib/seoHelpers';
import { appPageTitleClass } from '@/lib/utils';

const initialFormData = {
  title: '',
  date: '',
  end_date: '',
  time: '',
  location: '',
  address: '',
  notes: '',
  priority: 1,
  title_size: 16,
  title_color: '#FFFFFF',
  image: '',
  image_position: '50% 50%',
  event_type: 'personal',
  image_query: '',
  repeatNextYear: false,
  visibility: 1,
  show_on_feed: true,
  attendees: [],
  tag_id: null,
};

const AddEvent = ({ addEvent }) => {
  const { user } = useAuth();
  const { profile } = useUserProfile(user);
  const { friends, loading: friendsLoading } = useFriends();
  const { tags, loading: tagsLoading, createTag, deleteTag } = useEventTags();
  const [selectedTag, setSelectedTag] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const ogTags = getOGTags('add-event');
  const twitterTags = getTwitterTags('add-event');

  const {
    formData,
    setFormData,
    handleInputChange,
    handleFieldChange,
    handleImageUpload,
    handleSubmit,
  } = useEventForm(initialFormData, addEvent);

  const friendOptions = (friends ?? []).map(friend => ({
    value: friend.id,
    label:
      `${friend.first_name || ''} ${friend.last_name || ''}`.trim() || friend.email,
  }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const eventData = { ...formData, tag_id: selectedTag ? selectedTag.value : null };
    try {
      await handleSubmit(e, eventData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTag = async (tagId) => {
    await deleteTag(tagId);
    if (selectedTag && selectedTag.value === tagId) {
      setSelectedTag(null);
    }
  };

  const handleAutoGenerate = () => {
    const templates = [
      {
        title: "Dinner with Team",
        location: "The Italian Place",
        notes: "Celebrate the project launch! Don't forget to bring the gift.",
        event_type: "social",
        priority: 1
      },
      {
        title: "Dentist Appointment",
        location: "City Dental Clinic",
        notes: "Regular checkup. Remember to floss beforehand.",
        event_type: "health",
        priority: 2
      },
      {
        title: "Quarterly Review",
        location: "Meeting Room 3B",
        notes: "Prepare slides and performance metrics.",
        event_type: "work",
        priority: 3
      },
      {
        title: "Gym Session",
        location: "Gold's Gym",
        notes: "Leg day. Focus on squats.",
        event_type: "health",
        priority: 1
      },
      {
        title: "Flight to NYC",
        location: "JFK Airport",
        notes: "Flight UA542. Boarding at 3:00 PM.",
        event_type: "travel",
        priority: 3
      }
    ];

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 7));
    
    const randomHour = 9 + Math.floor(Math.random() * 8);
    
    setFormData(prev => ({
      ...prev,
      ...randomTemplate,
      date: futureDate.toISOString().split('T')[0],
      time: `${randomHour.toString().padStart(2, '0')}:00`,
      end_date: '',
      visibility: 1
    }));
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle('add-event')}</title>
        <meta name="description" content={getMetaDescription('add-event')} />
        <link rel="canonical" href={getCanonicalURL('add-event')} />
        
        {Object.entries(ogTags).map(([key, value]) => (
          <meta key={key} property={key} content={value} />
        ))}
        
        {Object.entries(twitterTags).map(([key, value]) => (
          <meta key={key} name={key} content={value} />
        ))}
      </Helmet>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto w-full flex flex-col p-4 sm:p-5 md:p-6 flex-1 h-full min-w-0"
      >
        <div className="flex items-center justify-between mt-6 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className={appPageTitleClass}>Add Event</h1>
            <Button
              type="button"
              onClick={handleAutoGenerate}
              variant="outline"
              size="sm"
              className="gap-2 bg-sky-500/12 border-sky-400/40 hover:bg-sky-500/15 text-sky-100 backdrop-blur-sm"
            >
              <Sparkles size={16} className="text-sky-200" />
              <span className="hidden sm:inline">Auto Generate</span>
            </Button>
          </div>
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain pr-2 -mr-2 pb-[calc(env(safe-area-inset-bottom)+108px)]">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <EventFormFields
              formData={formData}
              setFormData={setFormData}
              handleInputChange={handleInputChange}
              handleFieldChange={handleFieldChange}
              handleImageUpload={handleImageUpload}
              friendOptions={friendOptions}
              friendsLoading={friendsLoading}
              tags={tags}
              tagsLoading={tagsLoading}
              createTag={createTag}
              deleteTag={handleRemoveTag}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              userRole={profile?.role}
              isCreator={true}
              onAutoGenerate={handleAutoGenerate}
            />

            <div className="z-20 pt-4 mb-[env(safe-area-inset-bottom)]">
              <motion.button
                type="submit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600
                         text-white font-semibold flex items-center justify-center space-x-2
                         shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                disabled={isSubmitting}
              >
                <Save size={20} />
                <span>{isSubmitting ? 'Creating...' : 'Create Event'}</span>
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default AddEvent;