/**
 * Themes: same ids for saved prefs.
 * - atmosphere: "R G B" for ambient glow (CSS var --theme-atmosphere)
 */
export const themes = [
  { name: 'System', id: 'default', gradient: 'from-black via-slate-500/22 to-[#1C1C1E]', headerColor: 'text-white/95', swatch: 'from-slate-500 to-slate-950', atmosphere: '148 163 184' },
  { name: 'Graphite', id: 'twilight', gradient: 'from-black via-zinc-500/28 to-[#1C1C1E]', headerColor: 'text-white/92', swatch: 'from-zinc-400 to-zinc-950', atmosphere: '161 161 170' },
  { name: 'Apricot', id: 'sunrise', gradient: 'from-black via-amber-600/38 to-[#1C1C1E]', headerColor: 'text-amber-50/92', swatch: 'from-amber-400 to-amber-950', atmosphere: '245 158 11' },
  { name: 'Teal', id: 'ocean', gradient: 'from-black via-teal-600/40 to-[#1C1C1E]', headerColor: 'text-teal-50/90', swatch: 'from-teal-400 to-teal-950', atmosphere: '20 184 166' },
  { name: 'Red', id: 'crimson', gradient: 'from-black via-red-600/36 to-[#1C1C1E]', headerColor: 'text-red-50/90', swatch: 'from-red-500 to-red-950', atmosphere: '239 68 68' },
  { name: 'Green', id: 'forest', gradient: 'from-black via-green-600/38 to-[#1C1C1E]', headerColor: 'text-green-50/90', swatch: 'from-green-500 to-green-950', atmosphere: '34 197 94' },
  { name: 'Orange', id: 'sunset', gradient: 'from-black via-orange-600/38 to-[#1C1C1E]', headerColor: 'text-orange-50/90', swatch: 'from-orange-500 to-orange-950', atmosphere: '249 115 22' },
  { name: 'Indigo', id: 'nebula', gradient: 'from-black via-indigo-600/40 to-[#1C1C1E]', headerColor: 'text-indigo-50/90', swatch: 'from-indigo-500 to-indigo-950', atmosphere: '99 102 241' },
  { name: 'Mint', id: 'mint', gradient: 'from-black via-cyan-500/36 to-[#1C1C1E]', headerColor: 'text-cyan-50/90', swatch: 'from-cyan-400 to-cyan-950', atmosphere: '34 211 238' },
  { name: 'Purple', id: 'amethyst', gradient: 'from-black via-purple-600/38 to-[#1C1C1E]', headerColor: 'text-purple-50/90', swatch: 'from-purple-500 to-purple-950', atmosphere: '168 85 247' },
  { name: 'Sky', id: 'coral-reef', gradient: 'from-black via-sky-600/40 to-[#1C1C1E]', headerColor: 'text-sky-50/90', swatch: 'from-sky-400 to-sky-950', atmosphere: '14 165 233' },
  { name: 'Blue', id: 'midnight-city', gradient: 'from-black via-blue-600/44 to-[#1C1C1E]', headerColor: 'text-blue-50/92', swatch: 'from-blue-500 to-blue-950', atmosphere: '59 130 246' },
  { name: 'Gold', id: 'golden-hour', gradient: 'from-black via-yellow-600/34 to-[#1C1C1E]', headerColor: 'text-yellow-50/88', swatch: 'from-yellow-500 to-amber-950', atmosphere: '234 179 8' },
  { name: 'Emerald', id: 'emerald-isle', gradient: 'from-black via-emerald-600/38 to-[#1C1C1E]', headerColor: 'text-emerald-50/90', swatch: 'from-emerald-500 to-emerald-950', atmosphere: '16 185 129' },
  { name: 'Pink', id: 'ruby-glow', gradient: 'from-black via-pink-600/36 to-[#1C1C1E]', headerColor: 'text-pink-50/90', swatch: 'from-pink-500 to-pink-950', atmosphere: '236 72 153' },
  { name: 'Sapphire', id: 'sapphire', gradient: 'from-black via-blue-700/42 to-[#1C1C1E]', headerColor: 'text-blue-100/90', swatch: 'from-blue-600 to-indigo-950', atmosphere: '37 99 235' },
  { name: 'Lavender', id: 'lavender-fields', gradient: 'from-black via-violet-500/36 to-[#1C1C1E]', headerColor: 'text-violet-50/90', swatch: 'from-violet-400 to-violet-950', atmosphere: '139 92 246' },
  { name: 'Noir', id: 'cosmic-dust', gradient: 'from-black via-zinc-800/42 to-[#0A0A0A]', headerColor: 'text-white/88', swatch: 'from-zinc-600 to-black', atmosphere: '82 82 91' },
  { name: 'Ice', id: 'arctic-dawn', gradient: 'from-black via-slate-400/32 to-[#1C1C1E]', headerColor: 'text-slate-100/92', swatch: 'from-slate-300 to-slate-800', atmosphere: '203 213 225' },
  { name: 'Bronze', id: 'volcano', gradient: 'from-black via-amber-800/36 to-[#1C1C1E]', headerColor: 'text-amber-100/88', swatch: 'from-amber-700 to-stone-950', atmosphere: '180 83 9' },
];

export const THEME_STORAGE_KEY = 'wen-theme';
