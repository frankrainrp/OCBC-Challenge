import { useId, useRef } from 'react';
import type { PointerEvent } from 'react';

type SceneState = 'input' | 'result' | 'verify' | 'paused' | 'recorded';

export default function TrustScene({ state = 'input', tone = 'slate', compact = false, findings = 0 }: { state?: SceneState; tone?: 'slate' | 'blue' | 'gold'; compact?: boolean; findings?: number }) {
  const id = useId().replace(/:/g, '');
  const target = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const fill = tone === 'blue' ? ['#a3c6ed', '#6e97d4', '#416cb6'] : tone === 'gold' ? ['#f4dfa4', '#d5b361', '#a78234'] : ['#c9c4da', '#9892b3', '#555267'];
  const labels: Record<SceneState, string> = { input: '等待核验', result: findings ? `${findings} 条待核实线索` : '仍需独立核实', verify: '等待你的确认', paused: '已暂停处理', recorded: '已记录你的确认' };

  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      target.current?.style.setProperty('--rotate-x', `${-y * 9}deg`);
      target.current?.style.setProperty('--rotate-y', `${x * 12}deg`);
    });
  }

  function reset() {
    cancelAnimationFrame(frame.current);
    target.current?.style.setProperty('--rotate-x', '0deg');
    target.current?.style.setProperty('--rotate-y', '0deg');
  }

  return <div className={`trust-scene ${compact ? 'compact' : ''}`} data-state={state} ref={target} onPointerMove={tilt} onPointerLeave={reset} aria-hidden="true">
    <svg className="trust-object" viewBox="0 0 360 300" fill="none">
      <defs>
        <linearGradient id={`${id}-back`} x1="170" y1="84" x2="180" y2="255" gradientUnits="userSpaceOnUse"><stop stopColor={tone === 'blue' ? '#88a6d0' : tone === 'gold' ? '#d2b26a' : '#777485'} /><stop offset="1" stopColor={tone === 'blue' ? '#315790' : tone === 'gold' ? '#8e6b2c' : '#383744'} /></linearGradient>
        <linearGradient id={`${id}-front`} x1="180" y1="139" x2="180" y2="258" gradientUnits="userSpaceOnUse"><stop stopColor={fill[0]} /><stop offset=".28" stopColor={fill[1]} /><stop offset="1" stopColor={fill[2]} /></linearGradient>
        <linearGradient id={`${id}-paper`} x1="120" y1="51" x2="145" y2="220" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" /><stop offset=".72" stopColor="#f0f1f6" /><stop offset="1" stopColor="#cfd2df" /></linearGradient>
        <linearGradient id={`${id}-fold`} x1="167" y1="58" x2="187" y2="80" gradientUnits="userSpaceOnUse"><stop stopColor="#e9ebf1" /><stop offset="1" stopColor="#fff" /></linearGradient>
        <linearGradient id={`${id}-seal`} x1="154" y1="151" x2="197" y2="219" gradientUnits="userSpaceOnUse"><stop stopColor="#f3f1f8" /><stop offset="1" stopColor="#b4aecb" /></linearGradient>
        <linearGradient id={`${id}-rim`} x1="85" y1="140" x2="280" y2="140" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity=".15" /><stop offset=".5" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity=".15" /></linearGradient>
        <filter id={`${id}-shadow`} x="-40%" y="-100%" width="180%" height="300%"><feGaussianBlur stdDeviation="10" /></filter>
        <filter id={`${id}-sheet-shadow`} x="-30%" y="-20%" width="160%" height="170%"><feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#32334e" floodOpacity=".17" /></filter>
        <filter id={`${id}-seal-shadow`} x="-30%" y="-20%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="1.4" floodColor="#343047" floodOpacity=".25" /></filter>
      </defs>
      <ellipse className="object-shadow" cx="180" cy="263" rx="104" ry="12" fill="#4b526b" opacity=".2" filter={`url(#${id}-shadow)`} />
      <g className="folder-body">
        <path d="M62 112c0-14 8-23 23-23h51c8 0 12 5 17 11l8 10h111c14 0 23 8 23 23v101c0 16-9 25-25 25H85c-16 0-23-9-23-25V112Z" fill={`url(#${id}-back)`} />
        <g className="sheet sheet-left"><g transform="rotate(-13 133 137)" filter={`url(#${id}-sheet-shadow)`}>
          <path d="M93 51h66l25 25v135a10 10 0 0 1-10 10H93a10 10 0 0 1-10-10V61a10 10 0 0 1 10-10Z" fill={`url(#${id}-paper)`} stroke="#fafaff" strokeWidth="1.5" />
          <path d="M159 51v17c0 6 3 9 9 9h16" fill={`url(#${id}-fold)`} />
          <path d="M100 76h35M100 89h51M100 102h42" stroke="#c9cbd6" strokeWidth="5" strokeLinecap="round" />
          <rect x="99" y="123" width="56" height="35" rx="6" fill="#e6e6ee" /><path d="M109 136h32M109 146h21" stroke="#c5c7d1" strokeWidth="3" strokeLinecap="round" />
        </g></g>
        <g className="sheet sheet-right"><g transform="rotate(11 232 142)" filter={`url(#${id}-sheet-shadow)`}>
          <path d="M193 60h61l23 23v132a10 10 0 0 1-10 10h-74a10 10 0 0 1-10-10V70a10 10 0 0 1 10-10Z" fill={`url(#${id}-paper)`} stroke="#fafaff" strokeWidth="1.5" />
          <path d="M254 60v16c0 6 2 8 8 8h15" fill={`url(#${id}-fold)`} />
          <path d="M199 87h35M199 100h47M199 113h37" stroke="#ccd0db" strokeWidth="5" strokeLinecap="round" />
          <rect x="199" y="135" width="48" height="24" rx="6" fill="#ead7dc" /><path d="M209 147h27" stroke="#b98996" strokeWidth="3" strokeLinecap="round" />
        </g></g>
        <g className="message-slip" filter={`url(#${id}-sheet-shadow)`}><rect x="136" y="103" width="76" height="85" rx="13" fill="#fcfcff" transform="rotate(-3 136 103)" /><path d="M153 122h37M153 132h29M153 142h34" stroke="#bac5d7" strokeWidth="4" strokeLinecap="round" /></g>
        <g className="folder-front">
          <path d="M54 160c-1-15 7-24 22-24h207c15 0 23 9 22 24l-6 73c-1 17-10 25-27 25H86c-17 0-26-8-27-25l-5-73Z" fill={`url(#${id}-front)`} />
          <path d="M76 137h206c14 0 22 8 21 23" stroke={`url(#${id}-rim)`} strokeWidth="2" />
          <path d="M69 160l5 71c1 9 5 14 14 16" stroke="#fff" strokeOpacity=".1" strokeWidth="2" strokeLinecap="round" />
          <path d="M91 254h178" stroke="#302e47" strokeOpacity=".2" strokeWidth="2" strokeLinecap="round" />
          <g filter={`url(#${id}-seal-shadow)`}><path d="M178 159c11 8 22 9 27 10v20c0 18-12 30-27 37-16-7-27-19-27-37v-20c6-1 17-3 27-10Z" fill={`url(#${id}-seal)`} stroke="#f3f0ff" strokeOpacity=".55" />
            <path d="M178 170c7 4 13 6 17 7v13c0 11-7 19-17 24-10-5-17-13-17-24v-13c5-1 10-3 17-7Z" fill={tone === 'blue' ? '#6383b4' : tone === 'gold' ? '#9b8055' : '#7c748f'} opacity=".8" />
            <path d="M174 183c0-6 10-7 11-1 1 4-6 5-6 9" stroke="#f1eef8" strokeWidth="3" strokeLinecap="round" /><circle cx="179" cy="199" r="1.8" fill="#f1eef8" />
          </g>
        </g>
      </g>
    </svg>
    {!compact && <div className="scene-status"><span />{labels[state]}</div>}
  </div>;
}
