import React, { useState, useEffect, useCallback } from 'react';
    import { AnimatePresence, motion } from 'framer-motion';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Loader2, Search, Image as ImageIcon } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';

    const ImageSearchModal = ({ isOpen, onClose, onImageSelect }) => {
      const [query, setQuery] = useState('');
      const [imageData, setImageData] = useState({ url: '', photographerName: '', photographerUsername: '', downloadLocation: '' });
      const [isLoading, setIsLoading] = useState(false);
      const { toast } = useToast();

      useEffect(() => {
        if (isOpen) {
          setQuery('');
          setImageData({ url: '', photographerName: '', photographerUsername: '', downloadLocation: '' });
          setIsLoading(false);
        }
      }, [isOpen]);

      const searchImage = useCallback(async (searchQuery) => {
        if (!searchQuery) return;
        setIsLoading(true);
        setImageData({ url: '', photographerName: '', photographerUsername: '', downloadLocation: '' });
        try {
          const { data, error } = await supabase.functions.invoke('fetch-unsplash-image', {
            body: JSON.stringify({ query: searchQuery }),
          });

          if (error) throw error;

          if (data.error || !data.imageUrl) {
            toast({ title: "Image not found", description: `Could not find an image for "${searchQuery}". Try a different term.`, variant: "destructive" });
            setImageData({ url: '', photographerName: '', photographerUsername: '', downloadLocation: '' });
          } else {
            setImageData({ 
              url: data.imageUrl, 
              photographerName: data.photographerName, 
              photographerUsername: data.photographerUsername,
              downloadLocation: data.downloadLocation
            });
          }
        } catch (error) {
          console.error("Error fetching Unsplash image:", error);
          toast({ title: "Error", description: "Failed to fetch image. Please try again.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }, [toast]);

      const handleSearch = (e) => {
        e.preventDefault();
        searchImage(query);
      };

      const handleUseImage = async () => {
        if (imageData.url) {
          if (imageData.downloadLocation) {
            try {
              const res = await fetch(imageData.downloadLocation);
              const json = await res.json();
              if (json && json.url) {
                // This second fetch triggers the tracked download for Unsplash.
                // We don't need to do anything with the response.
                fetch(json.url);
              }
            } catch (err) {
              console.error("Unsplash tracking error:", err);
            }
          }
          onImageSelect(imageData.url);
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Auto-Generate Event Image</DialogTitle>
              <DialogDescription>
                Search for an image to represent your event.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'birthday party' or 'New York'"
                    className="pl-10 bg-slate-800 border-slate-600 focus:ring-sky-500"
                  />
                </div>
                <Button type="button" onClick={handleSearch} disabled={isLoading || !query}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                </Button>
              </form>

              <div className="flex flex-col">
                <div className="h-64 rounded-lg bg-slate-800/50 flex items-center justify-center border border-dashed border-slate-700 overflow-hidden relative">
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50"
                      >
                        <Loader2 className="h-8 w-8 animate-spin text-sky-300" />
                        <p className="mt-2 text-sm text-gray-400">Searching for image...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {!isLoading && imageData.url && (
                    <motion.img
                      src={imageData.url}
                      alt="Search result"
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    />
                  )}
                  {!isLoading && !imageData.url && (
                    <div className="text-center text-gray-500">
                      <ImageIcon className="mx-auto h-12 w-12" />
                      <p>Image preview will appear here</p>
                    </div>
                  )}
                </div>
                {imageData.url && (
                  <div className="text-right text-xs text-gray-400 mt-1">
                    Photo by <a 
                      href={`https://unsplash.com/@${imageData.photographerUsername}?utm_source=VisualDays&utm_medium=referral`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-white"
                    >
                      {imageData.photographerName}
                    </a> on <a 
                      href="https://unsplash.com?utm_source=VisualDays&utm_medium=referral"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-white"
                    >Unsplash</a>
                  </div>
                )}
              </div>
              <Button type="button" onClick={handleUseImage} disabled={!imageData.url || isLoading} className="w-full bg-sky-600 hover:bg-sky-500">
                Use This Image
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    };

    export default ImageSearchModal;