import { useId } from 'react';

export default function RecordSeal({ paused }: { paused: boolean }) {
  const id = useId().replace(/:/g, '');
  return <svg viewBox="0 0 108 108" width="88" height="88" fill="none" aria-hidden="true">
    <defs><linearGradient id={`${id}-paper`} x1="30" y1="18" x2="76" y2="91" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset="1" stopColor="#e5e8f0" /></linearGradient><linearGradient id={`${id}-badge`} x1="65" y1="58" x2="85" y2="88" gradientUnits="userSpaceOnUse"><stop stopColor="#e2cfdb" /><stop offset="1" stopColor="#ae839b" /></linearGradient><filter id={`${id}-shadow`} x="-40%" y="-30%" width="180%" height="180%"><feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#38445d" floodOpacity=".14" /></filter></defs>
    <g filter={`url(#${id}-shadow)`}><path d="M30 14h36l17 18v53a9 9 0 0 1-9 9H30a9 9 0 0 1-9-9V23a9 9 0 0 1 9-9Z" fill={`url(#${id}-paper)`} stroke="#fff" /><path d="M66 14v12a7 7 0 0 0 7 7h10" fill="#dce0e9" /><path d="M34 39h23M34 49h32M34 59h23" stroke="#aeb8c9" strokeWidth="4" strokeLinecap="round" /><circle cx="77" cy="78" r="20" fill={`url(#${id}-badge)`} stroke="#e9dce5" />{paused ? <path d="M72 71v14M81 71v14" stroke="#fff8fc" strokeWidth="3" strokeLinecap="round" /> : <path d="M71 70h12v17l-6-4-6 4V70Z" fill="#fff8fc" />}</g>
  </svg>;
}
