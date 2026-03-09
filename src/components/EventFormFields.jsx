import React from 'react';
import EventDetailsInputs from '@/components/event-form/EventDetailsInputs';
import EventSchedulingInputs from '@/components/event-form/EventSchedulingInputs';
import EventType from '@/components/event-form/EventType';
import EventSize from '@/components/event-form/EventSize';
import EventTitleSize from '@/components/event-form/EventTitleSize';
import EventTitleColor from '@/components/event-form/EventTitleColor';
import EventImagePreview from '@/components/event-form/EventImagePreview';
import EventSettings from '@/components/event-form/EventSettings';
import EventTagManager from '@/components/event-form/EventTagManager';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FormField } from '@/components/event-form/FormField';
import { Brush } from 'lucide-react';
import LocationSearch from '@/components/event-form/LocationSearch';
import { MapPin } from 'lucide-react';

const EventFormFields = ({
  formData,
  setFormData,
  handleInputChange,
  handleFieldChange,
  handleImageUpload,
  friendOptions,
  friendsLoading,
  invites,
  tags,
  tagsLoading,
  createTag,
  deleteTag,
  selectedTag,
  setSelectedTag,
  isReadOnly = false,
  isCreator = false,
  userRole,
}) => {
  if (!formData) return null;

  return (
    <>
      <EventDetailsInputs
        formData={formData}
        handleInputChange={handleInputChange}
        handleFieldChange={handleFieldChange}
        isReadOnly={isReadOnly}
      />
      <EventImagePreview
        formData={formData}
        setFormData={setFormData}
        handleImageUpload={handleImageUpload}
      />
      <FormField delay={0.1}>
        <Accordion type="single" collapsible className="w-full bg-white/5 rounded-xl px-4">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="hover:no-underline text-white font-medium">
              <div className="flex items-center space-x-2">
                <Brush size={16} />
                <span>Customize Card Style</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-4">
                <EventTitleSize
                  formData={formData}
                  handleFieldChange={handleFieldChange}
                  isReadOnly={isReadOnly}
                />
                <EventTitleColor
                  formData={formData}
                  handleFieldChange={handleFieldChange}
                  isReadOnly={isReadOnly}
                />
                <EventSize
                  formData={formData}
                  handleFieldChange={handleFieldChange}
                  isReadOnly={isReadOnly}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </FormField>
      <FormField delay={0.2}>
        <label className="text-white font-medium flex items-center space-x-2">
          <MapPin size={16} />
          <span>Location (Optional)</span>
        </label>
        <LocationSearch
          value={formData.location || ''}
          onChange={(value) => handleFieldChange('location', value)}
          disabled={isReadOnly}
        />
      </FormField>
      <FormField delay={0.3}>
        <label className="text-white font-medium flex items-center space-x-2">
          <MapPin size={16} />
          <span>Address (Optional)</span>
        </label>
        <input
          type="text"
          name="address"
          value={formData.address || ''}
          onChange={handleInputChange}
          placeholder="e.g., 'Apt 4B, New York, NY'"
          className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isReadOnly}
        />
      </FormField>
      <EventSchedulingInputs
        formData={formData}
        setFormData={setFormData}
        isReadOnly={isReadOnly}
      />
      <EventType
        formData={formData}
        handleFieldChange={handleFieldChange}
        isReadOnly={isReadOnly}
        userRole={userRole}
      />
      <EventTagManager
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        tags={tags}
        loading={tagsLoading}
        createTag={createTag}
        deleteTag={deleteTag}
        isReadOnly={isReadOnly}
      />
      <EventSettings
        formData={formData}
        handleFieldChange={handleFieldChange}
        friendOptions={friendOptions}
        friendsLoading={friendsLoading}
        invites={invites}
        isReadOnly={isReadOnly}
        handleInputChange={handleInputChange}
        isCreator={isCreator}
      />
    </>
  );
};

export default EventFormFields;