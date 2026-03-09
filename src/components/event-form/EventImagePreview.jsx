import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Image, X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sparkles, Calendar, Clock } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import ImageSearchModal from '@/components/event-form/ImageSearchModal';
    import { format } from 'date-fns';
    import { FormField } from '@/components/event-form/FormField';

    const sizeLevels = [
      { value: 0, label: 'Micro', height: 56 },
      { value: 1, label: 'Small', height: 80 },
      { value: 2, label: 'Medium', height: 128 },
      { value: 3, label: 'Large', height: 176 }
    ];

    const ArrowButton = ({ icon: Icon, onClick, className, disabled }) => (
      <button
        type="button"
        onClick={onClick}
        className={`absolute p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all z-20 ${className}`}
        disabled={disabled}
      >
        <Icon size={16} />
      </button>
    );

    const EventImagePreview = ({ formData, setFormData, handleImageUpload }) => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const selectedSize = sizeLevels.find(s => s.value === formData.priority) || sizeLevels[1];
      const displayImage = formData.image;
      const titleSize = formData.title_size || 16;
      const titleColor = formData.title_color || '#FFFFFF';

      const handlePositionChange = (axis, direction) => {
        const currentPosition = formData.image_position || '50% 50%';
        const [xStr, yStr] = currentPosition.split(' ');
        let x = parseFloat(xStr);
        let y = parseFloat(yStr);
        const step = 5; // 5% step

        if (axis === 'x') {
          x = Math.max(0, Math.min(100, x + direction * step));
        } else {
          y = Math.max(0, Math.min(100, y + direction * step));
        }

        setFormData(prev => ({ ...prev, image_position: `${x}% ${y}%` }));
      };

      const handleClearImage = () => {
        setFormData(prev => ({ ...prev, image: '' }));
      };

      const handleImageSelect = (imageUrl) => {
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setIsModalOpen(false);
      };

      const formatDateRange = () => {
        const { date, end_date } = formData;
        if (!date) return null;

        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0); // Adjust for timezone issues with 'new Date()'
        
        if (end_date && end_date !== date) {
            const endDate = new Date(end_date);
            endDate.setUTCHours(0, 0, 0, 0);
            if (startDate.getMonth() === endDate.getMonth()) {
                return `${format(startDate, 'MMM d')} - ${format(endDate, 'd')}`;
            }
            return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
        }
        
        return format(startDate, 'E, MMM d');
      };
      
      const formatTime = () => {
        const { time } = formData;
        if (!time) return null;
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(hours, minutes);
        return format(date, 'p');
      };

      const dateString = formatDateRange();
      const timeString = formatTime();

      return (
        <FormField delay={0}>
          <div className="flex justify-between items-center">
            <label className="text-white font-medium flex items-center space-x-2">
              <Image size={16} />
              <span>Add Cover Image *</span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white/10 text-white hover:bg-white/20 text-xs h-8"
              onClick={() => setIsModalOpen(true)}
            >
              <Sparkles size={14} className="mr-2" />
              Auto Generate
            </Button>
          </div>

          {displayImage ? (
            <motion.div
              className="relative group rounded-xl overflow-hidden bg-black/30"
              animate={{ height: selectedSize.height }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <img 
                src={displayImage} 
                alt="Event preview" 
                className="absolute w-full h-full object-cover"
                style={{ objectPosition: formData.image_position || '50% 50%' }}
              />
              <div className="absolute inset-0 bg-black/30" />
              
              <div className="absolute p-4 inset-0 flex flex-col justify-between">
                <h3 
                  className="font-bold"
                  style={{ 
                    fontSize: `${titleSize}px`, 
                    lineHeight: `${titleSize * 1.2}px`,
                    color: titleColor,
                  }}
                >
                  {formData.title || 'Event Title'}
                </h3>
                 {(dateString || timeString) && (
                  <div className="flex items-center gap-x-3 text-white/90 text-xs font-medium self-start bg-black/40 p-1.5 rounded-lg backdrop-blur-sm">
                    {dateString && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{dateString}</span>
                      </div>
                    )}
                    {timeString && (
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{timeString}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowButton icon={ArrowUp} onClick={() => handlePositionChange('y', -1)} className="top-2 left-1/2 -translate-x-1/2" />
                <ArrowButton icon={ArrowDown} onClick={() => handlePositionChange('y', 1)} className="bottom-2 left-1/2 -translate-x-1/2" />
                <ArrowButton icon={ArrowLeft} onClick={() => handlePositionChange('x', -1)} className="top-1/2 -translate-y-1/2 left-2" />
                <ArrowButton icon={ArrowRight} onClick={() => handlePositionChange('x', 1)} className="top-1/2 -translate-y-1/2 right-2" />
              </div>

              <button
                type="button"
                onClick={handleClearImage}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X size={16} />
              </button>
            </motion.div>
          ) : (
            <div className="relative border-2 border-dashed border-white/30 rounded-xl p-6 text-center">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <p className="text-white/70">Tap to upload an image</p>
            </div>
          )}

          <ImageSearchModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onImageSelect={handleImageSelect}
          />
        </FormField>
      );
    };

    export default EventImagePreview;