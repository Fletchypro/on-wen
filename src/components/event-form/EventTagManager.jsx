import React, { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { FormField } from '@/components/event-form/FormField';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { getTagColor } from '@/lib/utils';

const EventTagManager = ({ selectedTag, setSelectedTag, tags, loading, createTag, deleteTag, isReadOnly }) => {
  const [tagToDelete, setTagToDelete] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleCreate = async () => {
    if (newTagName.trim() === '') return;
    const newTag = await createTag(newTagName.trim());
    if (newTag) {
      setSelectedTag({ value: newTag.id, label: newTag.name });
      setNewTagName('');
      setIsCreating(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete.value);
      setTagToDelete(null);
    }
  };

  const handleRequestDelete = (e, tag) => {
    e.stopPropagation();
    setTagToDelete(tag);
  };

  const handleTagClick = (tag) => {
    if (isReadOnly) return;
    if (selectedTag && selectedTag.value === tag.value) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  const tagOptions = (tags || []).map(tag => ({
    value: tag.id,
    label: tag.name
  }));

  return (
    <>
      <FormField delay={0.5}>
        <label className="text-white font-medium flex items-baseline gap-2">
          <Tag size={16} />
          <span>Create "LIVE TAG"</span>
          <span className="text-xs font-normal opacity-80">(Max 2 per User)</span>
        </label>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {tagOptions.map(tag => (
            <motion.button
              key={tag.value}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`relative p-3 rounded-xl text-white font-medium transition-all group disabled:opacity-70 disabled:cursor-not-allowed ${
                selectedTag?.value === tag.value ? `ring-2 ring-offset-2 ring-offset-background ring-white` : ''
              } ${getTagColor(tag.label)}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isReadOnly}
            >
              <span>{tag.label}</span>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={(e) => handleRequestDelete(e, tag)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/30 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-red-500/80 transition-all"
                >
                  <X size={12} />
                </button>
              )}
            </motion.button>
          ))}
          {!isReadOnly && (
            <motion.button
              type="button"
              onClick={() => setIsCreating(true)}
              className="p-3 rounded-xl text-white font-medium transition-all bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isReadOnly || tags.length >= 2}
            >
              <Plus size={16} />
              <span>Create Tag</span>
            </motion.button>
          )}
        </div>
        
        <AnimatePresence>
          {isCreating && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 pt-2"
            >
              <Input
                type="text"
                placeholder="New tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button type="button" onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">Save</Button>
              <Button type="button" onClick={() => setIsCreating(false)} variant="ghost">Cancel</Button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-white/60 px-2 pt-1">
          When Creating LIVE event TAGS, This Event and any future events you link to this LIVE TAG will Auto Notify and Push CAL invites to any Friends or Non Friends that Subscribe to said TAG.
        </p>
      </FormField>
      
      <AlertDialog open={!!tagToDelete} onOpenChange={(isOpen) => !isOpen && setTagToDelete(null)}>
        <AlertDialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
            <div className="relative rounded-2xl overflow-hidden text-white bg-gradient-to-br from-gray-900 via-red-900/40 to-gray-900 border border-white/10 shadow-2xl backdrop-blur-xl">
                <motion.div 
                    className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0,_#ef4444_0%,_transparent_40%)]"
                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <div className="relative p-8">
                    <AlertDialogHeader className="text-left mb-6">
                        <AlertDialogTitle className="text-3xl font-bold tracking-tight text-red-400">Delete Tag & All Events?</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70 mt-1">
                            Are you sure you want to delete the tag "<span className="font-semibold text-white">{tagToDelete?.label}</span>"? This will permanently delete the tag and ALL of its associated events and group chats. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button onClick={() => setTagToDelete(null)} variant="outline" className="w-full sm:w-auto bg-transparent hover:bg-white/10 border-white/20 text-white font-semibold">Cancel</Button>
                        <Button onClick={handleDeleteConfirm} className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold hover:from-red-700 hover:to-red-900 transition-all">
                            Yes, Delete Everything
                        </Button>
                    </AlertDialogFooter>
                </div>
            </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventTagManager;