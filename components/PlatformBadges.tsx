'use client';

import React from 'react';
import { 
  Facebook, 
  Youtube, 
  Instagram, 
  Twitter, 
  Video, 
  Film, 
  Compass, 
  Music2 
} from 'lucide-react';

export default function PlatformBadges() {
  const platforms = [
    { name: 'Facebook', color: 'bg-blue-600', icon: Facebook },
    { name: 'Pinterest', color: 'bg-red-600', icon: Compass },
    { name: 'TikTok', color: 'bg-black', icon: Music2 },
    { name: 'Instagram', color: 'bg-pink-600', icon: Instagram },
    { name: 'YouTube', color: 'bg-red-500', icon: Youtube },
    { name: 'Twitter / X', color: 'bg-slate-900', icon: Twitter },
    { name: 'Películas / 4K', color: 'bg-amber-600', icon: Film, isBadge: true },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
      {platforms.map((p) => {
        const Icon = p.icon;
        return (
          <div
            key={p.name}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm ${p.color} transition-transform hover:scale-105`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{p.name}</span>
          </div>
        );
      })}
    </div>
  );
}
