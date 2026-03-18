import React, { useState, useRef } from 'react';
    import { motion } from 'framer-motion';
    import { Tag, CheckCircle, PlusCircle, MessageSquare, UserMinus, UserCheck } from 'lucide-react';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { getDisplayName } from '@/lib/utils';
    import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
    import ImageLightbox from '@/components/ImageLightbox';
    import { useFriendCount } from '@/hooks/useFriendCount';
    import { Button } from '@/components/ui/button';

    const FriendCalendarHeader = ({
      friendProfile,
      friendship,
      friendTags,
      onSubscriptionClick,
      onSendMessage,
      onRemoveFriend
    }) => {
      const [lightboxImage, setLightboxImage] = useState(null);
      const avatarRef = useRef(null);
      const [originRect, setOriginRect] = useState(null);
      const { friendCount } = useFriendCount(friendProfile?.id);

      const handleAvatarClick = () => {
        if (friendProfile?.avatar_url && avatarRef.current) {
          setOriginRect(avatarRef.current.getBoundingClientRect());
          setLightboxImage(friendProfile.avatar_url);
        }
      };

      const handleCloseLightbox = () => {
        setLightboxImage(null);
      };

      return (
        <>
          <ImageLightbox 
            src={lightboxImage} 
            alt={getDisplayName(friendProfile)} 
            onClose={handleCloseLightbox}
            originRect={originRect}
          />
          <div className="relative p-4 rounded-2xl glass-strong text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/12 via-transparent to-transparent opacity-50" />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <div className="flex items-center space-x-4">
                    <motion.div
                        ref={avatarRef}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                        style={{ visibility: lightboxImage ? 'hidden' : 'visible' }}
                        onClick={handleAvatarClick}
                        className="cursor-pointer flex-shrink-0"
                    >
                        <Avatar className="h-20 w-20 border-4 border-white/20 shadow-lg">
                            <AvatarImage src={friendProfile?.avatar_url} alt={getDisplayName(friendProfile)} />
                            <AvatarFallback className="text-3xl bg-white/10">{friendProfile?.first_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                    </motion.div>

                    <div className="flex-grow">
                        <motion.h1
                            className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {getDisplayName(friendProfile)}
                        </motion.h1>
                        <motion.p
                            className="text-sm text-gray-400"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            @{friendProfile?.username || 'user'}
                        </motion.p>
                        <motion.div
                            className="text-sm text-gray-300 mt-1"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                           <span>{friendCount} {friendCount === 1 ? 'Friend' : 'Friends'}</span>
                        </motion.div>
                    </div>

                    <motion.div 
                        className="flex items-center gap-2 flex-shrink-0"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        {friendship?.status === 'accepted' && (
                            <>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button onClick={onSendMessage} size="icon" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold">
                                                <MessageSquare className="h-5 w-5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Send Message</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button onClick={onRemoveFriend} variant="destructive" size="icon" className="bg-red-500/80 hover:bg-red-500 rounded-full">
                                                <UserMinus className="h-5 w-5" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>Remove Friend</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </>
                        )}
                        {friendship?.status === 'pending_received' && (
                             <Button variant="secondary" disabled className="rounded-full font-semibold text-sm">
                                <UserCheck className="mr-2 h-4 w-4" /> Pending
                            </Button>
                        )}
                    </motion.div>
                </div>
                
                {friendTags && friendTags.tags.length > 0 && (
                  <motion.div
                    className="mt-4 pt-4 border-t border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300 mb-3">
                      <Tag size={16} />
                      <span>Public Event Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {friendTags.tags.map(tag => {
                        const isSubscribed = friendTags.subscriptions.includes(tag.id);
                        return (
                          <TooltipProvider key={tag.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.button
                                  onClick={() => onSubscriptionClick(tag)}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${isSubscribed ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30' : 'bg-white/10 text-gray-200 border border-white/20 hover:bg-white/20'}`}
                                  whileHover={{ y: -2 }}
                                >
                                  {isSubscribed ? <CheckCircle size={14} /> : <PlusCircle size={14} />}
                                  <span>{tag.name}</span>
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isSubscribed ? 'Click to Unsubscribe' : 'Click to Subscribe'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
            </motion.div>
          </div>
        </>
      );
    };

    export default FriendCalendarHeader;