import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import FriendList from '@/components/friends/FriendList';
import RequestList from '@/components/friends/RequestList';
import PendingList from '@/components/friends/PendingList';
import EventInvites from '@/components/friends/EventInvites';
import SearchUsers from '@/components/friends/SearchUsers';
import FriendTabs from '@/components/friends/FriendTabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useEventInvites } from '@/hooks/useEventInvites';
import { supabase } from '@/lib/customSupabaseClient';
import { startConversation as startNewConversation } from '@/hooks/useFriendRequests';
import { Users, UserPlus, Clock, Search, Mail, Inbox } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import EventJoinRequests from '@/components/friends/EventJoinRequests';
import { useDebounce } from '@/hooks/useDebounce';
import { appPageTitleClass } from '@/lib/utils';

const FriendsPage = ({ onRequestsHandled, onSelectConversation, onViewFriendCalendar, onViewUserProfile }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'invites';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pending, setPending] = useState([]);
  
  // useEventInvites refetchInvites is now stable due to useCallback in the hook
  const { invites, loading: invitesLoading, handleInvite, refetchInvites } = useEventInvites();
  
  const [joinRequests, setJoinRequests] = useState([]);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/friends?tab=${tabId}`, { replace: true });
  };

  const fetchJoinRequests = useCallback(async () => {
    if (!user) return;
    setJoinRequestsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_event_join_requests_for_creator', { p_creator_id: user.id });
      if (error) throw error;
      setJoinRequests(data || []);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      // Silent fail is better than crash loops
    } finally {
      setJoinRequestsLoading(false);
    }
  }, [user]);

  const handleJoinRequest = async (requestId, status) => {
    const rpcName = status === 'accepted' ? 'accept_event_join_request' : 'decline_event_join_request';
    try {
      const { error } = await supabase.rpc(rpcName, { p_request_id: requestId });
      if (error) throw error;
      toast({ title: 'Success', description: `Request ${status}.` });
      fetchJoinRequests();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('get_user_friendships', { p_user_id: user.id });
      
      if (error) throw error;

      const acceptedFriends = (data || [])
        .filter(f => f.status === 'accepted')
        .map(f => f.friend_profile);
      
      const receivedRequests = (data || [])
        .filter(f => f.status === 'pending_received')
        .map(item => ({
            id: item.id,
            user1: item.friend_profile
        }));

      const sentRequests = (data || [])
          .filter(f => f.status === 'pending_sent')
          .map(item => ({
              id: item.id,
              user2: item.friend_profile
          }));

      setFriends(acceptedFriends);
      setRequests(receivedRequests);
      setPending(sentRequests);
      
      // Safely call the callback if provided
      if (typeof onRequestsHandled === 'function') {
          onRequestsHandled();
      }
    } catch (error) {
      console.error('Error fetching friends:', error.message);
      // Prevent infinite error toasts by logging to console mostly
    }
  }, [user, onRequestsHandled]);

  // Consolidate initial data fetching and subscriptions
  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchJoinRequests();
      refetchInvites();

      const channel = supabase.channel('friendships-page-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships', filter: `or(user_id_1.eq.${user.id},user_id_2.eq.${user.id})` }, () => {
             fetchFriends();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'event_invites', filter: `invitee_id=eq.${user.id}` }, () => {
             refetchInvites();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'event_join_requests' }, () => {
          fetchJoinRequests();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      }
    }
    // refetchInvites and fetchFriends are now stable thanks to useCallback in hooks/components
  }, [user, fetchFriends, refetchInvites, fetchJoinRequests]);

  const handleSearch = useCallback(async (query) => {
    if (!user) return;
    setSearchLoading(true);
    
    if (query.trim() === '') {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('search_users_with_friendship_status', {
        p_search_term: query,
        p_current_user_id: user.id
      });
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearchLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    handleSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, handleSearch]);

  const sendRequest = async (receiverId) => {
    try {
      const { data: existingFriendship, error: checkError } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(user_id_1.eq.${user.id},user_id_2.eq.${receiverId}),and(user_id_1.eq.${receiverId},user_id_2.eq.${user.id})`)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingFriendship) {
        toast({ title: 'Request status', description: "You already have a friendship or pending request with this user." });
        return;
      }

      const { error } = await supabase.from('friendships').insert({
        user_id_1: user.id,
        user_id_2: receiverId,
        status: 'pending'
      });

      if (error) throw error;
      
      toast({ title: 'Success', description: 'Friend request sent!' });
      // Refresh search results to show updated status
      handleSearch(debouncedSearchQuery);
      fetchFriends();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };
  
  const handleFriendRequest = async (requestId, status) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: status })
        .eq('id', requestId);
      
      if (error) throw error;
      
      toast({ title: 'Success', description: `Request ${status === 'accepted' ? 'accepted' : 'declined'}.` });
      fetchFriends();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      const { error } = await supabase.from('friendships').delete().eq('id', requestId);
      if(error) throw error;
      toast({ title: 'Success', description: 'Request cancelled.' });
      fetchFriends();
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const unfriend = async (friendId) => {
    try {
      const { error } = await supabase.rpc('remove_friend', { p_friend_id: friendId });
      if (error) throw error;
      toast({ title: 'Success', description: 'Friend removed.' });
      fetchFriends();
    } catch (error) {
      toast({ title: 'Error unfriending', description: error.message, variant: 'destructive' });
    }
  };

  const startConversation = async (friend) => {
    try {
        const conversation = await startNewConversation(user.id, friend.id);
        if (conversation) {
            onSelectConversation(conversation);
        }
    } catch (error) {
        toast({ title: 'Error Starting Chat', description: error.message, variant: 'destructive' });
    }
  };

  const handleSelectFriend = (friend) => {
    onViewFriendCalendar(friend);
  };

  const handleViewProfile = (profile) => {
    onViewUserProfile(profile);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'invites': return <EventInvites invites={invites} handleInvite={handleInvite} loading={invitesLoading} />;
      case 'join_requests': return <EventJoinRequests requests={joinRequests} handleRequest={handleJoinRequest} loading={joinRequestsLoading} />;
      case 'friends': return <FriendList friends={friends} onUnfriend={unfriend} onStartChat={startConversation} onSelectFriend={handleSelectFriend} />;
      case 'requests': return <RequestList requests={requests} onHandleRequest={handleFriendRequest} onViewProfile={handleViewProfile} />;
      case 'pending': return <PendingList requests={pending} onCancelRequest={cancelRequest} />;
      case 'search': return (
          <SearchUsers 
            query={searchQuery}
            onSearchChange={setSearchQuery}
            results={searchResults}
            onSendRequest={sendRequest}
            loading={searchLoading}
          />
        );
      default: return null;
    }
  };

  const counts = {
      friends: friends.length,
      requests: requests.length,
      pending: pending.length,
      invites: invites.filter(i => i.status === 'pending').length,
      join_requests: joinRequests.length
  };

  const tabs = [
    { id: 'invites', label: 'Event Invites', icon: Mail, count: counts.invites },
    { id: 'join_requests', label: 'Join Requests', icon: Inbox, count: counts.join_requests },
    { id: 'friends', label: 'My Friends', icon: Users, count: counts.friends },
    { id: 'requests', label: 'Friend Requests', icon: UserPlus, count: counts.requests },
    { id: 'pending', label: 'Pending', icon: Clock, count: counts.pending },
    { id: 'search', label: 'Find Friends', icon: Search, count: 0 }
  ];

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="p-4 md:p-6 pb-24 md:pb-6 space-y-6 max-w-5xl mx-auto w-full h-full flex flex-col text-white"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div className="flex-shrink-0" variants={itemVariants}>
        <div className="mb-6 mt-10">
          <h1 className={appPageTitleClass}>
            Inbox & Friends
          </h1>
        </div>
        <FriendTabs tabs={tabs} activeTab={activeTab} setActiveTab={handleTabChange} />
      </motion.div>
      <motion.div 
        className="flex-1 overflow-hidden glass-strong p-4 md:p-6"
        variants={itemVariants}
      >
        <div className="h-full overflow-y-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                >
                    {renderTabContent()}
                </motion.div>
            </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FriendsPage;