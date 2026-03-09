import { useState, useCallback, useEffect } from 'react';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useNavigate } from 'react-router-dom';

    const useEventForm = (initialState, onSubmitCallback) => {
      const { user } = useAuth();
      const navigate = useNavigate();
      
      const [formData, setFormData] = useState(initialState);
      const [imageFile, setImageFile] = useState(null);

      useEffect(() => {
        setFormData(initialState);
        setImageFile(null);
      }, [initialState]);

      const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : value
        }));
      }, []);
      
      const handleFieldChange = useCallback((name, value) => {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }, []);

      const handleImageUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onload = (event) => {
            setFormData(prev => ({ ...prev, image: event.target.result })); 
          };
          reader.readAsDataURL(file);
        } else {
          setImageFile(null);
          setFormData(prev => ({ ...prev, image: '' }));
        }
      }, []);

      const uploadImageToStorage = useCallback(async (file) => {
        if (!file) return null;

        const sanitizedFileName = file.name.replace(/[\u202F]/g, '-');
        const fileName = `${user.id}/${Date.now()}-${sanitizedFileName}`;
        const { data, error } = await supabase.storage
          .from('event_images')
          .upload(fileName, file);

        if (error) {
          console.error('Image Upload Failed', error.message);
          return null;
        }

        const { data: { publicUrl } } = supabase.storage.from('event_images').getPublicUrl(fileName);
        return publicUrl;
      }, [user]);

      const handleSubmit = useCallback(async (e, eventDataWithTag) => {
        e.preventDefault();
        
        const finalFormData = eventDataWithTag || formData;

        if (!finalFormData || !finalFormData.title || !finalFormData.date) {
          console.error("Missing information", "Please fill in the title and start date fields.");
          return;
        }

        if (finalFormData.end_date && new Date(finalFormData.end_date) < new Date(finalFormData.date)) {
          console.error("Invalid date range", "End date cannot be before the start date.");
          return;
        }

        let imageUrl = finalFormData.image;
        if (imageFile) {
          imageUrl = await uploadImageToStorage(imageFile);
          if (!imageUrl) return;
        } else if (imageUrl && !imageUrl.startsWith('http')) {
            const { data: { publicUrl } } = supabase.storage.from('event_images').getPublicUrl(imageUrl);
            imageUrl = publicUrl;
        }

        const cleanedData = { ...finalFormData };
        if (cleanedData.end_date === '') {
          cleanedData.end_date = null;
        }
        if (cleanedData.time === '') {
          cleanedData.time = null;
        }

        const { image_query, attendees, ...eventData } = { ...cleanedData, image: imageUrl };
        const inviteeIds = attendees ? attendees.map(a => a.value) : [];
        const tagId = eventData.tag_id;
        
        if (finalFormData.id) {
            await onSubmitCallback(finalFormData.id, eventData, inviteeIds, tagId);
        } else {
            const finalEventData = { ...eventData, user_id: user.id };
            await onSubmitCallback(finalEventData, inviteeIds, tagId);
        }
        navigate('/dashboard');
      }, [formData, imageFile, onSubmitCallback, uploadImageToStorage, user, navigate]);

      return {
        formData,
        setFormData,
        handleInputChange,
        handleFieldChange,
        handleImageUpload,
        handleSubmit,
      };
    };

    export default useEventForm;