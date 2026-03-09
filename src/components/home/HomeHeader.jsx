import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, Mail, X, UserPlus, Eye, Settings } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { getDisplayName, getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const SearchResultItem = ({ user, onSelect, onAddFriend, onNavigateToProfile }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddFriendClick = async (e) => {
    e.stopPropagation();
    const success = await onAddFriend(user.id);
    if (success) {
      toast({ title: 'Success', description: `Friend request sent to ${getDisplayName(user)}!` });
    } else {
      toast({ title: 'Error', description: 'Could not send friend request.', variant: 'destructive' });
    }
  };

  const handleRespondClick = (e) => {
    e.stopPropagation();
    navigate('/friends?tab=requests');
  };

  const getAction = () => {
    switch (user.friendship_status) {
      case 'friends':
        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-400 hover:text-purple-300"
            onClick={() => onSelect(user)}
          >
            <Eye size={16} className="mr-2" /> View
          </Button>
        );
      case 'pending_sent':
        return (
          <div className="flex items-center text-sm text-gray-400">
            <span className="italic">Requested</span>
          </div>
        );
      case 'pending_received':
        return <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300" onClick={handleRespondClick}>Respond</Button>;
      default:
        return (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300"
            onClick={handleAddFriendClick}
          >
            <UserPlus size={16} className="mr-2" /> Add
          </Button>
        );
    }
  };

  const handleItemClick = () => {
    if (user.friendship_status === 'friends') {
      onSelect(user);
    } else {
      onNavigateToProfile(user);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={handleItemClick}
      className="flex items-center justify-between p-2 -mx-2 rounded-lg transition-colors cursor-pointer hover:bg-white/10"
    >
      <div className="flex items-center">
        <Avatar className="h-8 w-8 mr-3">
          <AvatarImage src={user.avatar_url} alt={getDisplayName(user)} />
          <AvatarFallback>{getInitials(user)}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">{getDisplayName(user)}</span>
      </div>
      {getAction()}
    </motion.div>
  );
};

const HomeHeader = ({
  onFilterToggle,
  isFiltersVisible,
  onViewFriendCalendar,
  onViewUserProfile,
  eventInvitesCount,
  profile,
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const { searchResults, loading, addFriend, setSearchResults } = useUserSearch(searchQuery);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchActive(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const handleSelectFriend = (friend) => {
    onViewFriendCalendar(friend);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchActive(false);
  };

  const handleNavigateToProfile = (user) => {
    onViewUserProfile(user);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchActive(false);
  };

  const handleFormSubmit = (e) => { e.preventDefault(); };

  const handleInvitesClick = () => { navigate('/friends?tab=invites'); };

  const getGreeting = () => {
    if (profile?.first_name) return `Hey, ${profile.first_name}`;
    return 'Hey, there';
  };

  const getSubtext = () => {
    const today = new Date();
    return `Today is ${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
  };
  
  return (
    <div className="relative p-4 md:p-6 glass-strong z-30 rounded-b-2xl shadow-2xl">
      <div className="specular" />
      <div className="sweep" />
      <motion.div 
          className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_0,_#7c3aed_0%,_transparent_40%)]"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <motion.h1
              className={`text-2xl md:text-3xl font-bold ${theme.headerColor}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {getGreeting()}
            </motion.h1>
            <motion.p
              className="text-sm text-gray-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {getSubtext()}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Avatar 
                onClick={() => navigate('/settings')}
                className="cursor-pointer h-12 w-12 md:h-16 md:w-16 border-2 border-background/50 ring-2 ring-purple-500 hover:ring-4 transition-all duration-300"
            >
              <AvatarImage src={profile?.avatar_url} alt={getDisplayName(profile)} />
              <AvatarFallback>{getInitials(profile)}</AvatarFallback>
            </Avatar>
          </motion.div>
        </div>

        <motion.form
          onSubmit={handleFormSubmit}
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative flex-grow" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="search"
              placeholder="Find Friends"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchActive(true)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/50 text-white placeholder-gray-300 rounded-2xl pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none [&::-webkit-search-cancel-button]:appearance-none"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <AnimatePresence>
              {isSearchActive && searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full rounded-lg p-2 z-[10000] max-h-60 overflow-y-auto bg-black/90 border border-white/10 shadow-lg" /* Increased z-index */
                >
                  {loading && <p className="p-2 text-sm text-center text-gray-400">Searching...</p>}
                  {!loading && searchResults.length > 0 &&
                    searchResults.map((u) => (
                      <SearchResultItem
                        key={u.id}
                        user={u}
                        onSelect={handleSelectFriend}
                        onAddFriend={addFriend}
                        onNavigateToProfile={handleNavigateToProfile}
                      />
                    ))}
                  {!loading && searchResults.length === 0 && (
                    <p className="p-2 text-sm text-center text-gray-400">No users found.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    type="button"
                    onClick={handleInvitesClick}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/50 text-gray-200 hover:bg-white/20"
                    aria-label="View event invites"
                  >
                    <Mail className="h-5 w-5" strokeWidth={1.75} />
                  </Button>
                  {eventInvitesCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                    >
                      {eventInvitesCount}
                    </Badge>
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Event Invites</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              type="button"
              onClick={onFilterToggle}
              variant="ghost"
              size="icon"
              className={`h-10 w-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/50 ${
                isFiltersVisible ? 'bg-white/20 text-white' : 'text-gray-200 hover:bg-white/20'
              }`}
              aria-label="Toggle filters"
            >
              <Filter className="h-5 w-5" strokeWidth={1.75} />
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default HomeHeader;