import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, Clock, UserPlus } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, getDisplayName } from '@/lib/utils';
import { FormField } from '@/components/event-form/FormField';

const AttendeeList = ({ title, icon, attendees, onRemove, isCreator }) => (
  <div>
    <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center">
      {icon}
      <span className="ml-2">{title}</span>
    </h4>
    {attendees.length > 0 ? (
      <ul className="space-y-2">
        <AnimatePresence>
          {attendees.map(attendee => (
            <motion.li
              key={attendee.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center justify-between bg-white/5 p-2 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={attendee.avatar_url} />
                  <AvatarFallback>{getInitials(attendee)}</AvatarFallback>
                </Avatar>
                <span className="text-white font-medium">{getDisplayName(attendee)}</span>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    ) : (
      <p className="text-white/50 text-sm italic">No one here yet.</p>
    )}
  </div>
);

const EventInviteManager = ({ friends, selectedFriends, setSelectedFriends, eventToEdit, isReadOnly }) => {
  const acceptedAttendees = eventToEdit?.attendees?.filter(a => a.status === 'accepted' && a.id !== eventToEdit.user_id) || [];
  const pendingInvitees = eventToEdit?.attendees?.filter(a => a.status === 'pending') || [];
  const creator = eventToEdit?.attendees?.find(a => a.id === eventToEdit.user_id);

  const friendOptions = friends.map(friend => ({
    value: friend.id,
    label: getDisplayName(friend),
  }));

  return (
    <FormField delay={0.3}>
      <div className="space-y-4">
        <div>
          <label className="text-white font-medium flex items-center space-x-2 mb-2">
            <UserPlus size={16} />
            <span>Invite Friends</span>
          </label>
          <MultiSelect
            options={friendOptions}
            selected={selectedFriends}
            onChange={setSelectedFriends}
            placeholder="Select friends to invite..."
            className="w-full"
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-4 p-4 glass-light rounded-xl border border-white/10">
          {creator && (
            <AttendeeList
              title="Creator"
              icon={<CheckCircle className="text-green-400" size={16} />}
              attendees={[creator]}
            />
          )}
          <AttendeeList
            title="Accepted"
            icon={<CheckCircle className="text-green-400" size={16} />}
            attendees={acceptedAttendees}
          />
          <AttendeeList
            title="Pending"
            icon={<Clock className="text-yellow-400" size={16} />}
            attendees={pendingInvitees}
          />
        </div>
      </div>
    </FormField>
  );
};

export default EventInviteManager;