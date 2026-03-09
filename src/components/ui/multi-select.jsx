import React from 'react';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Command as CommandPrimitive } from 'cmdk';

const MultiSelect = React.forwardRef(
  ({ options, selected, onChange, className, ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');

    const handleUnselect = (option) => {
      onChange(selected.filter((s) => s.value !== option.value));
    };

    const handleKeyDown = (e) => {
      const input = e.target;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (input.value === '') {
          const newSelected = [...selected];
          newSelected.pop();
          onChange(newSelected);
        }
      }
      if (e.key === 'Escape') {
        input.blur();
      }
    };

    const selectables = options.filter(
      (option) => !selected.some((s) => s.value === option.value)
    );

    return (
      <Command
        onKeyDown={handleKeyDown}
        className="overflow-visible bg-transparent"
      >
        <div className="group border border-white/20 px-3 py-2 text-sm ring-offset-background rounded-xl focus-within:ring-2 focus-within:ring-purple-500">
          <div className="flex gap-1 flex-wrap">
            {selected.map((option) => {
              return (
                <Badge key={option.value} variant="secondary" className="bg-purple-500/80 text-white border-purple-500">
                  {option.label}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUnselect(option);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(option)}
                  >
                    <X className="h-3 w-3 text-white hover:text-foreground" />
                  </button>
                </Badge>
              );
            })}
            <CommandPrimitive.Input
              ref={ref}
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder="Select friends..."
              className="ml-2 bg-transparent outline-none placeholder:text-white/50 flex-1 text-white"
              {...props}
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && selectables.length > 0 ? (
            <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full overflow-auto bg-slate-800/80 backdrop-blur-sm rounded-lg">
                {selectables.map((option) => {
                  return (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        setInputValue('');
                        onChange([...selected, option]);
                      }}
                      className={'cursor-pointer text-white hover:!bg-purple-600/50'}
                    >
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ) : null}
        </div>
      </Command>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };