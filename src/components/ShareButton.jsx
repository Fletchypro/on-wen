import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ShareButton = ({ children, ...props }) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title: 'Check out Wen!',
      text: 'I\'m using Wen to organize my life visually with images and smart timelines. You should try it!',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast({
            title: "Sharing failed",
            description: "Could not open the share dialog. Please try again.",
            variant: "destructive",
          });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link Copied!",
          description: "Wen link copied to your clipboard. Share it with your friends!",
        });
      } catch (err) {
        console.error('Failed to copy: ', err);
        toast({
          title: "Copying failed",
          description: "Could not copy the link to your clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button onClick={handleShare} {...props}>
      {children}
    </Button>
  );
};

export default ShareButton;