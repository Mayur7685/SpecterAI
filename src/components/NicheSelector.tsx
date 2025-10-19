'use client';

import { NICHE_PROFILES, NicheId } from '@/lib/niches';

interface NicheSelectorProps {
  selectedNiche: NicheId;
  onSelect: (nicheId: NicheId) => void;
  disabled?: boolean;
}

export default function NicheSelector({ selectedNiche, onSelect, disabled }: NicheSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Select Compliance Focus</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Choose the industry or document profile for tailored analysis.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {NICHE_PROFILES.map((profile) => {
          const isActive = profile.id === selectedNiche;
          return (
            <button
              key={profile.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(profile.id)}
              className={`relative overflow-hidden rounded-2xl border text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400
                ${isActive
                  ? 'border-transparent bg-gradient-to-br from-blue-600/90 to-indigo-500/80 text-white shadow-xl shadow-blue-500/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-lg'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className={`absolute inset-0 pointer-events-none ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'} bg-gradient-to-br from-white/5 to-transparent`} />
              <div className="relative p-5 flex flex-col h-full space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${isActive ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'}`} aria-hidden>
                    {profile.icon}
                  </div>
                  {isActive ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide bg-white/90 text-blue-700 dark:text-blue-700 px-2 py-0.5 rounded-full">Selected</span>
                  ) : profile.id === 'general' ? (
                    <span className="text-[10px] font-medium text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">Default</span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <h4 className={`text-base font-semibold ${isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{profile.name}</h4>
                  <p className={`text-sm leading-relaxed ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {profile.description}
                  </p>
                </div>
                <div className="mt-auto">
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>Focus Highlights</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.focusAreas.slice(0, 3).map((area) => (
                      <span
                        key={area}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${isActive
                          ? 'border-white/40 bg-white/10 text-white'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
