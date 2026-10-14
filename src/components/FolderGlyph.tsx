import { useId } from 'react';

type Tone = 'red' | 'blue' | 'gold';
const colors: Record<Tone, string[]> = {
  red: ['#e9a3a7', '#b94450', '#f2c4c7', '#9e3441'],
  blue: ['#9dc5ee', '#5279b9', '#d2e5f8', '#3b5f99'],
  gold: ['#f0d38c', '#c6973d', '#fae8b5', '#a77b2a'],
};

export default function FolderGlyph({ tone = 'red' }: { tone?: Tone }) {
  const id = useId().replace(/:/g, '');
  const [light, dark, rim, back] = colors[tone];
  return <svg className="folder-glyph" viewBox="0 0 44 38" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}front`} x1="22" y1="12" x2="22" y2="35" gradientUnits="userSpaceOnUse"><stop stopColor={light} /><stop offset="1" stopColor={dark} /></linearGradient>
      <linearGradient id={`${id}paper`} x1="21" y1="7" x2="21" y2="25" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#e2e5e8" /></linearGradient>
    </defs>
    <path d="M4 10a4 4 0 0 1 4-4h9l4 4h15a4 4 0 0 1 4 4v18H4V10Z" fill={back} />
    <rect x="11" y="9" width="23" height="21" rx="3" transform="rotate(-9 11 9)" fill={`url(#${id}paper)`} stroke="#f9fafc" />
    <path d="M14 14h12M15 18h15" stroke="#c8cdd3" strokeWidth="1.5" strokeLinecap="round" />
    <g className="folder-glyph-front"><path d="M3 18a5 5 0 0 1 5-5h27a5 5 0 0 1 5 5l-1 12a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5L3 18Z" fill={`url(#${id}front)`} /><path d="M8 14h27" stroke={rim} strokeWidth="1.2" strokeLinecap="round" opacity=".8" /><path d="M10 32h23" stroke={back} strokeOpacity=".25" strokeLinecap="round" /></g>
  </svg>;
}
