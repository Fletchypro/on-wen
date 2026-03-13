import React from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, Ticket, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogOverlay, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Detail view for external (API) events in Discover. Shows date, time, location,
 * a "Buy tickets" button (opens ticket site), and "Add to calendar".
 */
const ExternalEventDetailDialog = ({ event, isOpen, onClose, onAddToCalendar }) => {
  const controls = useAnimation();

  React.useEffect(() => {
    if (isOpen) controls.start('visible');
  }, [isOpen, controls]);

  const handleClose = async () => {
    await controls.start('hidden');
    onClose();
  };

  if (!event) return null;

  const date = event.date || '';
  const time = event.time || '';
  const formattedDate = date
    ? format(parseISO(`${date}T00:00:00`), 'EEEE, MMM d, yyyy')
    : 'Date not set';
  const formattedTime = time
    ? format(parseISO(`1970-01-01T${time}`), 'h:mm a')
    : 'Time not set';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AnimatePresence>
        {isOpen && (
          <>
            <DialogOverlay as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <DialogContent
              as={motion.div}
              variants={{ hidden: { y: '100%', opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              initial="hidden"
              animate={controls}
              exit="hidden"
              transition={{ type: 'spring', damping: 40, stiffness: 400 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg w-full mx-auto gap-0 p-0 !rounded-t-2xl overflow-hidden glass-strong border-t border-white/20"
            >
              <div className="md:col-span-1 h-36 relative overflow-hidden">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: event.image_position || '50% 50%' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-600/80 via-purple-700/80 to-indigo-800/80" />
                )}
                <div className="absolute inset-0 bg-black/40" />
              </div>

              <div className="p-6 flex flex-col gap-4 text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold tracking-tighter">{event.title}</DialogTitle>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span>{formattedTime}</span>
                    </div>
                  </div>
                </DialogHeader>

                {event.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  {(() => {
                    const buyTicketsUrl = event.source === 'ticketmaster' && event.id
                      ? `https://www.ticketmaster.com/event/${String(event.id).replace(/^tm-/, '')}`
                      : event.external_url;
                    return buyTicketsUrl ? (
                      <Button
                        asChild
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold gap-2"
                      >
                        <a href={buyTicketsUrl} target="_blank" rel="noopener noreferrer">
                          <Ticket className="w-4 h-4" />
                          Buy tickets
                        </a>
                      </Button>
                    ) : null;
                  })()}
                  {onAddToCalendar && (
                    <Button
                      variant="outline"
                      className="flex-1 border-white/20 hover:bg-white/10 gap-2"
                      onClick={() => {
                        onAddToCalendar(event);
                        handleClose();
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add to calendar
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default ExternalEventDetailDialog;
