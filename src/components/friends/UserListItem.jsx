import React, { useState } from 'react';
    import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
    import { Button } from '@/components/ui/button';
    import { getDisplayName, getInitials } from '@/lib/utils';
    import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
    import { cn } from '@/lib/utils';
    import { Ban, Flag, MoreVertical } from 'lucide-react';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
      DropdownMenuSeparator
    } from "@/components/ui/dropdown-menu"
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
    } from "@/components/ui/alert-dialog"
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useFriends } from '@/contexts/FriendsContext';
    import ReportUserDialog from './ReportUserDialog';

    export const UserListItem = ({ user, actions, actionComponent }) => {
      const { toast } = useToast();
      const { refetch } = useFriends();
      const [showBlockConfirm, setShowBlockConfirm] = useState(false);
      const [showReportDialog, setShowReportDialog] = useState(false);
    
      const handleBlockUser = async () => {
        const { error } = await supabase.rpc('block_user', { p_blocked_id: user.id });
        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'User Blocked', description: `You have blocked ${getDisplayName(user)}.` });
          refetch();
        }
        setShowBlockConfirm(false);
      };

      return (
        <>
        <div
          className="p-3 bg-black/20 backdrop-blur-lg rounded-2xl flex items-center gap-4 border border-white/10 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:border-purple-500/50"
        >
          <Avatar className="w-12 h-12 border-2 border-purple-400/50 flex-shrink-0">
            <AvatarImage src={user.avatar_url} alt={getDisplayName(user)} />
            <AvatarFallback className="bg-secondary text-foreground/70 text-lg">{getInitials(user)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow min-w-0">
            <div className="flex flex-col">
              <p className="font-bold text-foreground truncate">{getDisplayName(user)}</p>
              <p className="text-sm text-foreground/60 truncate">@{user.username || 'no_username'}</p>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {actionComponent ? actionComponent :
                actions?.map((action, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(user);
                        }}
                        className={cn("rounded-full hover:bg-white/20 transition-colors duration-200", action.color)}
                      >
                        <action.icon size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))
              }
            </div>
          </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0">
                  <MoreVertical size={18} />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-orange-400 focus:bg-orange-500/10 focus:text-orange-300">
                  <Flag className="mr-2 h-4 w-4" />
                  Report User
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowBlockConfirm(true)} className="text-red-500 focus:bg-red-500/10 focus:text-red-400">
                  <Ban className="mr-2 h-4 w-4" />
                  Block User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <AlertDialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Block {getDisplayName(user)}?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to block this user? They will be removed from your friends, and you will no longer see each other's content or be able to interact.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBlockUser} className="bg-red-600 hover:bg-red-700">
                <Ban className="mr-2 h-4 w-4" />
                Block
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <ReportUserDialog user={user} isOpen={showReportDialog} onOpenChange={setShowReportDialog} />
        </>
      );
    };