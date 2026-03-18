import React from 'react';
import { Repeat, Lock, Users, UserCheck, AlarmClock as UserClock, Rss, Globe, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { MultiSelect } from '@/components/ui/multi-select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FormField } from '@/components/event-form/FormField';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';

const InviteList = ({ title, invites, icon: Icon }) => (
  <div className="space-y-2">
    <h3 className="text-white font-medium flex items-center space-x-2">
      <Icon size={16} />
      <span>{title}</span>
    </h3>
    {invites.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {invites.map(invitee => (
          <div key={invitee.id} className="flex items-center space-x-2 bg-white/10 p-2 rounded-lg">
            <Avatar className="h-6 w-6">
              <AvatarImage src={invitee.avatar_url} alt={`${invitee.first_name} ${invitee.last_name}`} />
              <AvatarFallback>{invitee.first_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-white">{`${invitee.first_name} ${invitee.last_name}`}</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-xs text-white/60 px-2">No {title.toLowerCase()} yet.</p>
    )}
  </div>
);

const VisibilityOption = ({ value, selectedValue, onChange, icon: Icon, label, description, isReadOnly }) => (
  <Button
    type="button"
    variant="ghost"
    onClick={() => !isReadOnly && onChange('visibility', value)}
    className={`flex-1 flex flex-col items-center justify-center p-3 h-auto rounded-lg transition-all text-center
      ${selectedValue === value ? 'bg-sky-500/25 border-sky-400/50' : 'bg-white/10 border-transparent'}
      border hover:bg-sky-500/15`}
    disabled={isReadOnly}
  >
    <Icon size={20} className={`mb-1 ${selectedValue === value ? 'text-sky-300' : 'text-white/70'}`} />
    <span className="font-semibold text-sm text-white">{label}</span>
    <p className="text-xs text-white/60 mt-1">{description}</p>
  </Button>
);

const EventSettings = ({ formData, handleFieldChange, friendOptions, friendsLoading, invites, isReadOnly, handleInputChange, isCreator }) => {
  const visibility = formData.visibility;

  return (
    <>
      <FormField delay={0.6}>
        <label className="text-white font-medium flex items-center space-x-2 mb-2">
          <Shield size={16} />
          <span>Event Visibility</span>
        </label>
        <div className="flex items-stretch justify-between gap-2 p-2 rounded-xl bg-white/10">
          <VisibilityOption
            value={0}
            selectedValue={visibility}
            onChange={handleFieldChange}
            icon={Lock}
            label="Private"
            description="Only invited"
            isReadOnly={isReadOnly}
          />
          <VisibilityOption
            value={1}
            selectedValue={visibility}
            onChange={handleFieldChange}
            icon={Users}
            label="Friends"
            description="Visible to friends"
            isReadOnly={isReadOnly}
          />
          <VisibilityOption
            value={2}
            selectedValue={visibility}
            onChange={handleFieldChange}
            icon={Globe}
            label="Public"
            description="Visible to anyone"
            isReadOnly={isReadOnly}
          />
        </div>
        <p className="text-xs text-white/60 px-2 pt-1">
          {visibility === 0 && "Private events are only visible to you and people you invite."}
          {visibility === 1 && "Friends events are visible to your friends. You can still invite anyone."}
          {visibility === 2 && "Public events can be seen by anyone on the platform."}
        </p>
      </FormField>

      {(visibility === 1 || visibility === 2) && (
        <FormField delay={0.62}>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/10">
            <label htmlFor="feed-switch" className="text-white font-medium flex items-center space-x-2">
              <Rss size={16} className={formData.show_on_feed ? "text-blue-400" : "text-gray-400"} />
              <span>Show on Friends' Feed</span>
            </label>
            <Switch
              id="feed-switch"
              name="show_on_feed"
              checked={formData.show_on_feed}
              onCheckedChange={(checked) => handleFieldChange('show_on_feed', checked)}
              disabled={isReadOnly}
            />
          </div>
          <p className="text-xs text-white/60 px-2 pt-1 flex items-center">
            {formData.show_on_feed
              ? "This event will appear in your friends' event feed."
              : "This event will not be shown in your friends' feed."}
            <Popover>
              <PopoverTrigger asChild>
                 <img alt="Information icon in a blue speech bubble" className="w-5 h-5 ml-2 cursor-help" src="https://horizons-cdn.hostinger.com/acb8a4e4-bfc7-419c-8d89-b4b0d3ddb388/a1b0f57869289e1de9806b3ceb3b7bba.png" />
              </PopoverTrigger>
              <PopoverContent className="w-auto max-w-xs">
                <p className="text-sm">Swipe right from home page to view Friends Social Feed</p>
              </PopoverContent>
            </Popover>
          </p>
        </FormField>
      )}
      
      <FormField delay={0.55}>
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/10">
          <label htmlFor="repeat-switch" className="text-white font-medium flex items-center space-x-2">
            <Repeat size={16} />
            <span>Same Time Next Year?</span>
          </label>
          <Switch
            id="repeat-switch"
            name="repeatNextYear"
            checked={formData.repeatNextYear}
            onCheckedChange={(checked) => handleFieldChange('repeatNextYear', checked)}
            disabled={isReadOnly}
          />
        </div>
      </FormField>

      <FormField delay={0.65}>
        <label className="text-white font-medium flex items-center space-x-2">
            <Users size={16} />
            <span>Invite Friends</span>
        </label>
        <MultiSelect
            name="attendees"
            options={friendOptions || []}
            selected={formData.attendees || []}
            onChange={(selected) => handleFieldChange('attendees', selected)}
            className="w-full"
            disabled={friendsLoading || isReadOnly}
        />
        {friendsLoading && <p className="text-xs text-white/60 px-2 pt-1">Loading friends...</p>}
      </FormField>

      {invites && (
        <FormField delay={0.68} className="p-4 rounded-xl bg-white/10 space-y-4">
          <InviteList title="Accepted" invites={invites.accepted} icon={UserCheck} />
          <InviteList title="Pending" invites={invites.pending} icon={UserClock} />
        </FormField>
      )}

      <FormField delay={0.7}>
        <label className="text-white font-medium">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Add any additional notes..."
          rows={3}
          className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
          disabled={isReadOnly}
        />
      </FormField>
    </>
  );
};

export default EventSettings;