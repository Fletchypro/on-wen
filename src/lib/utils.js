import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Main screen hero titles — frosted specular gradient */
export const appPageTitleClass =
  'text-4xl md:text-5xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-slate-100 to-slate-400 [filter:drop-shadow(0_0_32px_rgba(255,255,255,0.12))]';

/** Section / panel titles */
export const appSectionTitleClass =
  'text-2xl md:text-3xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white/95 via-slate-200 to-slate-500 [filter:drop-shadow(0_0_24px_rgba(255,255,255,0.08))]';

export function getInitials(user) {
  if (!user) return '';
  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getDisplayName(user) {
  if (!user) return 'Guest';
  const firstName = user.first_name || user.firstName;
  const lastName = user.last_name || user.lastName;
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  return firstName || user.username || 'Anonymous';
}

const tagColors = [
    'bg-blue-500/80', 'bg-slate-500/80', 'bg-green-500/80', 'bg-yellow-500/80', 
    'bg-red-500/80', 'bg-pink-500/80', 'bg-indigo-500/80', 'bg-teal-500/80'
];

const tagColorMap = new Map();
let colorIndex = 0;

export function getTagColor(tagName) {
    if (!tagName) {
        return 'bg-gray-500/80';
    }
    if (!tagColorMap.has(tagName)) {
        tagColorMap.set(tagName, tagColors[colorIndex]);
        colorIndex = (colorIndex + 1) % tagColors.length;
    }
    return tagColorMap.get(tagName);
}