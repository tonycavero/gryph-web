'use client';

import React from 'react';
import { Play, Sparkles, Heart, Film, ArrowUpRight } from 'lucide-react';

interface HeroDeckProps {
  onSelectSample?: (url: string) => void;
}

export default function HeroDeck({ onSelectSample }: HeroDeckProps) {
  const cards = [
    {
      id: 1,
      title: 'Aesthetic Pin',
      platform: 'Pinterest',
      badge: 'Design UI',
      gradient: 'from-rose-500 via-pink-600 to-purple-600',
      rotation: '-rotate-12 translate-y-6',
      sampleUrl: 'https://pin.it/2qs4gIH2I',
      author: '@studio.design',
      stats: '12.4k',
    },
    {
      id: 2,
      title: 'Reels & Stories',
      platform: 'Instagram',
      badge: 'Trending',
      gradient: 'from-amber-400 via-rose-500 to-indigo-600',
      rotation: '-rotate-6 translate-y-2',
      sampleUrl: 'https://www.instagram.com',
      author: '@creative.motion',
      stats: '45.1k',
    },
    {
      id: 3,
      title: 'Cinematic 4K',
      platform: 'Masterpiece',
      badge: '4K Ultra HD',
      gradient: 'from-zinc-900 via-neutral-800 to-black',
      rotation: 'rotate-0 -translate-y-2',
      isCenter: true,
      sampleUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
      author: '@blender.foundation',
      stats: '1.2M',
    },
    {
      id: 4,
      title: 'Viral Clips',
      platform: 'Facebook',
      badge: 'Popular',
      gradient: 'from-blue-600 via-indigo-600 to-sky-500',
      rotation: 'rotate-6 translate-y-2',
      sampleUrl: 'https://www.facebook.com',
      author: '@cinema.vault',
      stats: '89.3k',
    },
    {
      id: 5,
      title: 'TikTok Sin Marca',
      platform: 'TikTok',
      badge: 'Sin Marca',
      gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
      rotation: 'rotate-12 translate-y-6',
      sampleUrl: 'https://www.tiktok.com/@tiktok/video/7106594312292453675',
      author: '@tiktok',
      stats: '2.4M',
    },
  ];

  return (
    <div className="relative w-full max-w-4xl mx-auto my-10 py-6 select-none">
      {/* Floating Figma Cursor Badges */}
      <div className="absolute -top-4 left-4 sm:left-12 z-20 animate-bounce duration-1000 hidden sm:flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg shadow-blue-500/30">
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        <span>@coplin</span>
        <svg width="14" height="14" className="w-3.5 h-3.5 fill-white -rotate-45" viewBox="0 0 24 24">
          <path d="M3 3l7 18 3-7 7-3L3 3z" />
        </svg>
      </div>

      <div className="absolute -top-2 right-4 sm:right-16 z-20 animate-pulse hidden sm:flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg shadow-emerald-500/30">
        <span>@andrea</span>
        <svg width="14" height="14" className="w-3.5 h-3.5 fill-white -rotate-45" viewBox="0 0 24 24">
          <path d="M3 3l7 18 3-7 7-3L3 3z" />
        </svg>
      </div>

      {/* Cards Deck */}
      <div className="relative h-56 sm:h-64 flex items-center justify-center">
        {cards.map((c, idx) => (
          <div
            key={c.id}
            onClick={() => onSelectSample && onSelectSample(c.sampleUrl)}
            style={{ zIndex: c.isCenter ? 15 : 10 - Math.abs(2 - idx) }}
            className={`card-deck-item absolute w-36 sm:w-48 h-48 sm:h-60 rounded-3xl p-3 sm:p-4 bg-gradient-to-br ${c.gradient} text-white shadow-card-deck cursor-pointer border border-white/20 flex flex-col justify-between ${c.rotation}`}
          >
            {/* Top card header */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                {c.badge}
              </span>
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Middle play icon */}
            <div className="self-center my-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/25 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                {c.isCenter ? (
                  <Film className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                )}
              </div>
            </div>

            {/* Bottom card info */}
            <div>
              <p className="text-[11px] text-white/70 font-medium">{c.author}</p>
              <h5 className="text-xs sm:text-sm font-bold tracking-tight text-white line-clamp-1">
                {c.title}
              </h5>
              <div className="flex items-center gap-1 text-[10px] text-white/60 mt-1">
                <Heart className="w-3 h-3 fill-white/40 text-transparent" />
                <span>{c.stats}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
