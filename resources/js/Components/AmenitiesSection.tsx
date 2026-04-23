import React from 'react';
import { motion } from 'framer-motion';

// Import all icon sets that Filament uses
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';
import * as MiniIcons from '@heroicons/react/20/solid';
import * as MicroIcons from '@heroicons/react/16/solid';

interface Amenity {
  id: number;
  name: string;
  icon: string; // From Laravel database: e.g., "heroicon-o-wifi", "heroicon-s-shield-check"
}

interface Props {
  amenities: Amenity[];
}

/**
 * Helper to convert Filament prefixes to the correct Heroicons React package
 * and format kebab-case to PascalCase (e.g., heroicon-o-shield-check -> ShieldCheckIcon)
 */
function DynamicHeroIcon({ iconName, className }: { iconName: string; className: string }) {
  if (!iconName) return <OutlineIcons.InformationCircleIcon className={className} />;

  // 1. Determine which icon set to use based on the Filament prefix
  let IconSet: any = OutlineIcons; // Default to outline

  if (iconName.startsWith('heroicon-s-')) {
    IconSet = SolidIcons;
  } else if (iconName.startsWith('heroicon-m-')) {
    IconSet = MiniIcons;
  } else if (iconName.startsWith('heroicon-c-')) {
    IconSet = MicroIcons;
  }

  // 2. Clean prefixes to get the base name
  const cleanName = iconName.replace(/^(heroicon-o-|heroicon-s-|heroicon-m-|heroicon-c-|heroicon-)/, '');

  // 3. Convert kebab-case to PascalCase (e.g., shield-check -> ShieldCheck)
  const pascalName = cleanName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  // 4. Append 'Icon' to match React Heroicons exports (e.g., ShieldCheckIcon)
  const iconKey = `${pascalName}Icon`;

  // 5. Try to find the icon in the matched set
  let IconComponent = IconSet[iconKey];

  // 6. Fallback sequence: If it fails in the specific set, check outline, then default to a generic icon
  if (!IconComponent && IconSet !== OutlineIcons) {
      IconComponent = OutlineIcons[iconKey];
  }

  if (!IconComponent) {
    return <OutlineIcons.InformationCircleIcon className={className} />;
  }

  return <IconComponent className={className} />;
}

export default function AmenitiesSection({ amenities =[] }: Props) {
  return (
    <section className="py-24 bg-[#EAE6D6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">
            Amenities
          </span>
          <h2 className="mt-3 text-4xl font-bold text-[#2D5016]">
            Everything You Need
          </h2>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {amenities.map((amenity) => (
            <motion.div
              key={amenity.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="flex flex-col items-center gap-3 p-6 bg-[#F5F2E8] rounded-2xl border border-[#2D5016]/10 hover:border-[#2D5016]/30 hover:shadow-md transition-all cursor-default h-full"
            >
              <div className="p-3 bg-[#2D5016]/10 rounded-xl">
                <DynamicHeroIcon
                  iconName={amenity.icon}
                  className="h-6 w-6 text-[#2D5016]"
                />
              </div>
              <span className="text-sm font-medium text-[#2D5016] text-center">
                {amenity.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
