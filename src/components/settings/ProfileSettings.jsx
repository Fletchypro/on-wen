import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Save, Upload, Cake, Edit, X } from 'lucide-react';
import { format } from 'date-fns';
import ImageOptimizer from '@/components/ImageOptimizer';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const ProfileSettings = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useUserProfile(user);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', username: '', birthday: null });
  const [isEditing, setIsEditing] = useState(false);
  const avatarInputRef = useRef(null);

  const resetFormData = () => {
    if (profile) {
      let birthdayDate = null;
      if (profile.birthday) {
        // The date comes as 'YYYY-MM-DD'. To avoid timezone issues, we can parse it like this:
        const dateParts = profile.birthday.split('-');
        birthdayDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      }
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        username: profile.username || '',
        birthday: birthdayDate,
      });
    }
  };

  useEffect(() => {
    resetFormData();
  }, [profile]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file && user) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      await uploadAvatar(file, filePath);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    let birthdayString = null;
    if (formData.birthday) {
      const date = formData.birthday;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      birthdayString = `${year}-${month}-${day}`;
    }
    const updates = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username,
      birthday: birthdayString,
    };

    const success = await updateProfile(updates);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
        setFormData(prev => ({ ...prev, [name]: value.replace(/\s/g, '') }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCancelEdit = () => {
    resetFormData();
    setIsEditing(false);
  };

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="space-y-1">
      <Label className="text-foreground/60 text-sm flex items-center gap-2">{Icon && <Icon size={14}/>} {label}</Label>
      <p className="text-foreground font-medium">{value || 'Not set'}</p>
    </div>
  );

  return (
    <motion.div 
      variants={itemVariants}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground/80 flex items-center gap-2"><User size={22}/> Profile</h2>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-foreground/80 hover:text-white">
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
        )}
      </div>
      <div className="p-4 rounded-2xl glass-light border border-white/10 shadow-lg space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-sky-400/40 overflow-hidden">
            {profile?.avatar_url ? (
                <ImageOptimizer
                    src={profile.avatar_url}
                    alt="User avatar"
                    width={80} // Task 3: Explicit dimensions
                    height={80} // Task 3: Explicit dimensions
                    className="h-full w-full object-cover"
                />
            ) : (
                <AvatarFallback className="bg-secondary text-foreground">
                  {loading ? '...' : <User size={32} />}
                </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-2">
            <Button
              onClick={() => avatarInputRef.current?.click()}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 bg-transparent hover:bg-white/10 border-white/20 text-white font-medium"
              disabled={!user || isEditing}
            >
              <Upload size={18} />
              <span>Profile Image</span>
            </Button>
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarUpload}
              className="hidden"
              accept="image/png, image/jpeg"
            />
            <p className="text-xs text-foreground/60">PNG or JPG, max 2MB.</p>
          </div>
        </div>
        
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form 
              key="edit-form"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onSubmit={handleProfileUpdate} 
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-foreground font-medium">First Name</Label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Your first name"
                    className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-foreground font-medium">Last Name</Label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Your last name"
                    className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">Username</Label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-foreground font-medium flex items-center gap-2"><Cake size={16} /> Birthday</Label>
                <input
                  id="birthday"
                  type="date"
                  value={formData.birthday ? (() => {
                    const d = formData.birthday;
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${y}-${m}-${day}`;
                  })() : ''}
                  min="1900-01-01"
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      birthday: v ? new Date(v + 'T12:00:00') : null,
                    }));
                  }}
                  className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all [color-scheme:dark]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="flex items-center justify-center space-x-2"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 bg-sky-600/90 hover:bg-sky-500 text-white font-medium disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div 
              key="display-info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label className="text-foreground/60 text-sm flex items-center gap-2">Name</Label>
                <p className="text-foreground font-medium">{`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Not set'}</p>
              </div>
              <InfoRow label="Username" value={profile?.username} />
              <InfoRow 
                label="Birthday" 
                value={profile?.birthday ? format(new Date(profile.birthday.replace(/-/g, '/')), 'PPP') : 'Not set'} 
                icon={Cake}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProfileSettings;