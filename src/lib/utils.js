import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

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
    'bg-blue-500/80', 'bg-purple-500/80', 'bg-green-500/80', 'bg-yellow-500/80', 
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