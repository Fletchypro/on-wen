import React, { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants, Button } from '@/components/ui/button';

const CustomCalendar = ({ className, classNames, showOutsideDays = true, ...props }) => {
  const [pickedDate, setPickedDate] = useState(props.selected);
  const [currentMonth, setCurrentMonth] = useState(props.selected || new Date());
  const [view, setView] = useState('days'); // 'days', 'months', 'years'

  const years = useMemo(() => {
    const end = new Date().getFullYear();
    const start = 1900;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i).reverse();
  }, []);

  const months = useMemo(() => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ], []);

  const handleYearSelect = (year) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setView('months');
  };

  const handleMonthSelect = (monthIndex) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
    setView('days');
  };

  const handleConfirm = () => {
    if (props.onSelect) {
      props.onSelect(pickedDate);
    }
  };

  const CustomCaption = () => (
    <div className="flex justify-between items-center mb-4">
      <motion.button
        whileTap={{ scale: 0.9 }}
        className={cn(buttonVariants({ variant: 'ghost' }), 'h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10')}
        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1))}
      >
        <ChevronsLeft className="h-4 w-4" />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        className={cn(buttonVariants({ variant: 'ghost' }), 'h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10')}
        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </motion.button>
      <div className="flex gap-2">
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView('months')} className="font-semibold text-white hover:text-purple-300 transition-colors">
          {months[currentMonth.getMonth()]}
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView('years')} className="font-semibold text-white hover:text-purple-300 transition-colors">
          {currentMonth.getFullYear()}
        </motion.button>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        className={cn(buttonVariants({ variant: 'ghost' }), 'h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10')}
        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        className={cn(buttonVariants({ variant: 'ghost' }), 'h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/10')}
        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1))}
      >
        <ChevronsRight className="h-4 w-4" />
      </motion.button>
    </div>
  );

  const viewVariants = {
    enter: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
  };

  return (
    <div className={cn("p-3 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl text-white shadow-2xl w-[320px]", className)}>
      <AnimatePresence mode="wait">
        {view === 'days' && (
          <motion.div key="days" initial="exit" animate="enter" exit="exit" variants={viewVariants} transition={{ duration: 0.2 }}>
            <DayPicker
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              selected={pickedDate}
              onSelect={setPickedDate}
              showOutsideDays={showOutsideDays}
              className="p-0"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                table: "w-full border-collapse space-y-1",
                head_row: "flex justify-around",
                head_cell: "text-white/50 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2 justify-around",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-purple-500/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-white/10 hover:text-white rounded-full transition-colors"),
                day_selected: "bg-purple-600 text-primary-foreground hover:bg-purple-700 hover:text-primary-foreground focus:bg-purple-600 focus:text-primary-foreground rounded-full",
                day_today: "bg-white/10 text-white rounded-full",
                day_outside: "day-outside text-white/40 opacity-50",
                day_disabled: "text-white/30 opacity-50",
                day_hidden: "invisible",
                ...classNames,
              }}
              components={{ Caption: CustomCaption }}
              {...props}
            />
          </motion.div>
        )}
        {view === 'months' && (
          <motion.div key="months" initial="exit" animate="enter" exit="exit" variants={viewVariants} transition={{ duration: 0.2 }} className="p-2">
            <div className="flex justify-between items-center mb-4">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView('days')} className="text-lg font-bold text-white hover:text-purple-300 transition-colors">
                &larr; Back
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView('years')} className="text-lg font-bold text-white hover:text-purple-300 transition-colors">
                {currentMonth.getFullYear()}
              </motion.button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, i) => (
                <motion.button
                  key={month}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMonthSelect(i)}
                  className={cn("p-3 rounded-lg text-center text-sm font-medium transition-colors",
                    i === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear() ? "bg-white/20" : "hover:bg-white/10",
                    i === currentMonth.getMonth() && "bg-purple-600 text-white"
                  )}
                >
                  {month}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {view === 'years' && (
          <motion.div key="years" initial="exit" animate="enter" exit="exit" variants={viewVariants} transition={{ duration: 0.2 }} className="p-2">
            <div className="flex justify-between items-center mb-4">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView('months')} className="text-lg font-bold text-white hover:text-purple-300 transition-colors">
                &larr; Back
              </motion.button>
              <span className="text-lg font-bold text-white/80">Select Year</span>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-[240px] overflow-y-auto pr-2">
              {years.map((year) => (
                <motion.button
                  key={year}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleYearSelect(year)}
                  className={cn("p-2 rounded-lg text-center text-sm font-medium transition-colors",
                    year === new Date().getFullYear() ? "bg-white/20" : "hover:bg-white/10",
                    year === currentMonth.getFullYear() && "bg-purple-600 text-white"
                  )}
                >
                  {year}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="pt-2 mt-2 border-t border-white/10 flex justify-end">
        <Button 
          onClick={handleConfirm}
          disabled={!pickedDate}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <CheckCircle size={16} />
          Confirm
        </Button>
      </div>
    </div>
  );
};

CustomCalendar.displayName = "CustomCalendar";

export { CustomCalendar };