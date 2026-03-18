import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DatePickerPopover = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="px-3 py-2 bg-sky-600 text-white rounded">
          {date || "Pick Date"}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-2 bg-black/80 rounded-xl"
        align="start"
        onPointerDown={(e) => e.stopPropagation()} // prevent immediate close
      >
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setOpen(false); // close popover after picking
          }}
          className="bg-transparent text-white text-lg p-2 rounded focus:outline-none"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerPopover;