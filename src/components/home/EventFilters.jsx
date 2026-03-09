import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronDown, Tag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePickerPopover from '@/components/ui/date-picker-popover';
import { startOfMonth, format } from 'date-fns';

const EventFilters = ({ filter, setFilter, events, setSelectedMonth, tags, tagFilter, setTagFilter, isFriendView }) => {
  const [openTagPopover, setOpenTagPopover] = useState(false);

  const handleMonthChange = (date) => {
    if (date) {
      setSelectedMonth(startOfMonth(date));
    }
  };

  return (
    <motion.div 
      className="p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full bg-white/20 border-white/20 rounded-full">
            <SelectValue placeholder="Upcoming" />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-white/40 backdrop-blur-sm border-white/20 text-white">
            <SelectItem value="all">Upcoming</SelectItem>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="past">Past Events</SelectItem>
          </SelectContent>
        </Select>

        {filter === 'month' && (
          <DatePickerPopover
            value={startOfMonth(new Date())}
            onChange={handleMonthChange}
            trigger={
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-white/20 border-white/20 rounded-full">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{format(startOfMonth(new Date()), 'MMMM yyyy')}</span>
              </Button>
            }
          />
        )}

        {!isFriendView && (
          <Popover open={openTagPopover} onOpenChange={setOpenTagPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openTagPopover}
                className="w-full justify-between bg-white/20 border-white/20 rounded-full"
              >
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  {tagFilter
                    ? tags.find((tag) => tag.id === tagFilter)?.name
                    : "Tag"}
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 rounded-xl bg-white/40 backdrop-blur-sm border-white/20 text-white">
              <Command className="rounded-xl bg-transparent">
                <CommandInput placeholder="Search tags..." className="bg-white/10 border-white/20 text-white placeholder-gray-300" />
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setTagFilter(null);
                      setOpenTagPopover(false);
                    }}
                    className="data-[state=selected]:bg-white/30 data-[state=selected]:text-white rounded-full"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        tagFilter === null ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Tags
                  </CommandItem>
                  {tags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => {
                        setTagFilter(tag.id);
                        setOpenTagPopover(false);
                      }}
                      className="data-[state=selected]:bg-white/30 data-[state=selected]:text-white rounded-full"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          tagFilter === tag.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </motion.div>
  );
};

export default EventFilters;