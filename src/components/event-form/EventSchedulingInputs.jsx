import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FormField } from '@/components/event-form/FormField';
import { TimePicker } from '@/components/ui/time-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const DateInput = ({ value, onChange, ...props }) => {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <input
      type="date"
      value={value || ''}
      onChange={handleChange}
      className={cn(
        "relative w-full p-3 bg-black/30 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all",
        "bg-transparent text-white focus:outline-none appearance-none",
        "text-lg font-mono tracking-wider",
        "[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      )}
      {...props}
    />
  );
};

const EventSchedulingInputs = ({ formData, setFormData, isReadOnly }) => {
  const [isTimePickerOpen, setTimePickerOpen] = useState(false);

  const handleDateChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (newTime) => {
    setFormData(prev => ({ ...prev, time: newTime }));
  };

  const clearTime = (e) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, time: null }));
  };

  const formatTimeForDisplay = (time) => {
    if (!time) return 'Select time';
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <FormField delay={0.15}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-white font-medium flex items-center space-x-2">
            <CalendarIcon size={16} />
            <span>Start Date</span>
          </label>
          <DateInput 
            value={formData.date} 
            onChange={(value) => handleDateChange('date', value)}
            disabled={isReadOnly}
          />
        </div>
        <div className="space-y-2">
          <label className="text-white font-medium flex items-center space-x-2">
            <CalendarIcon size={16} />
            <span>End Date</span>
          </label>
          <DateInput 
            value={formData.end_date} 
            onChange={(value) => handleDateChange('end_date', value)}
            disabled={isReadOnly}
            min={formData.date}
          />
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <label className="text-white font-medium flex items-center space-x-2">
          <Clock size={16} />
          <span>Time</span>
        </label>
        <Popover open={isTimePickerOpen} onOpenChange={setTimePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:text-white",
                !formData.time && "text-white/50",
                "disabled:opacity-70 disabled:cursor-not-allowed"
              )}
              disabled={isReadOnly}
            >
              <Clock className="mr-2 h-4 w-4" />
              <span className="flex-grow">{formatTimeForDisplay(formData.time)}</span>
              {formData.time && !isReadOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={clearTime}
                  aria-label="Clear time"
                >
                  <X
                    className="h-4 w-4 text-white/50 hover:text-white"
                  />
                </Button>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-transparent border-none">
            <TimePicker value={formData.time} onChange={handleTimeChange} />
          </PopoverContent>
        </Popover>
      </div>
    </FormField>
  );
};

export default EventSchedulingInputs;