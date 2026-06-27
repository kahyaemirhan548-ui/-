import React from 'react';

interface OperatorAvatarProps {
  skinId: string;
  className?: string;
  glow?: boolean;
}

export default function OperatorAvatar({ skinId, className = 'w-24 h-24', glow = true }: OperatorAvatarProps) {
  const getAvatarColors = () => {
    switch (skinId) {
      case 'skin-desert':
        return {
          helmet: '#D2B48C', // Tan
          visor: '#FF7F50', // Coral/orange glow
          skin: '#FFE4C4',
          armor: '#8B5A2B', // Dark brown
          strap: '#4A2F13',
          glowColor: 'rgba(255, 127, 80, 0.4)',
          camoSpots: ['#A0522D', '#CD853F', '#8FBC8F']
        };
      case 'skin-arctic':
        return {
          helmet: '#E8F1F5', // Ice white
          visor: '#00BFFF', // Cyan glow
          skin: '#F5FFFA',
          armor: '#708090', // Slate gray
          strap: '#2F4F4F',
          glowColor: 'rgba(0, 191, 255, 0.4)',
          camoSpots: ['#B0C4DE', '#D3D3D3', '#778899']
        };
      case 'skin-cyber':
        return {
          helmet: '#1C1C1C', // Matte black
          visor: '#FF00FF', // Purple/magenta neon glow
          skin: '#FFF0F5',
          armor: '#333333', // Deep charcoal
          strap: '#9400D3',
          glowColor: 'rgba(255, 0, 255, 0.5)',
          camoSpots: ['#4B0082', '#000000', '#FF00FF']
        };
      case 'skin-classic':
      default:
        return {
          helmet: '#3B5323', // Olive green
          visor: '#39FF14', // Neon lime green glow
          skin: '#FFE0B2',
          armor: '#1E2F1C', // Dark forest green
          strap: '#111827',
          glowColor: 'rgba(57, 255, 20, 0.4)',
          camoSpots: ['#2F4F4F', '#556B2F', '#000000']
        };
    }
  };

  const colors = getAvatarColors();

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Glow Effect behind Avatar */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-full blur-xl transition-all duration-500 scale-90"
          style={{ backgroundColor: colors.glowColor }}
        />
      )}
      
      {/* SVG Canvas */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial visor shine */}
          <linearGradient id="visorShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="40%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
          </linearGradient>
          {/* Armor metallic linear gradient */}
          <linearGradient id="armorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* BACKGROUND HELO RING */}
        <circle cx="50" cy="50" r="46" fill="none" stroke={colors.visor} strokeWidth="1" strokeDasharray="3 5" opacity="0.4" />
        <circle cx="50" cy="50" r="43" fill="none" stroke={colors.visor} strokeWidth="0.5" opacity="0.2" />

        {/* EARS & COMMUNICATIONS HEADSET */}
        {/* Left Earpiece */}
        <rect x="18" y="44" width="8" height="16" rx="3" fill="#1F2937" stroke="#111827" strokeWidth="1" />
        <rect x="22" y="48" width="4" height="8" rx="1" fill={colors.visor} opacity="0.6" />
        <path d="M 22 40 Q 50 15 78 40" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />

        {/* Right Earpiece */}
        <rect x="74" y="44" width="8" height="16" rx="3" fill="#1F2937" stroke="#111827" strokeWidth="1" />
        <rect x="74" y="48" width="4" height="8" rx="1" fill={colors.visor} opacity="0.6" />

        {/* Headset Mic Boom */}
        <path d="M 22 56 Q 30 65 42 62" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
        <circle cx="42" cy="62" r="2.5" fill="#1F2937" />
        <circle cx="42" cy="62" r="1" fill={colors.visor} />

        {/* CHILD AGENT FACE */}
        <circle cx="50" cy="50" r="25" fill={colors.skin} />
        {/* Blushing cheeks (Anime/Chibi style) */}
        <ellipse cx="36" cy="55" rx="4" ry="2" fill="#FFA07A" opacity="0.5" />
        <ellipse cx="64" cy="55" rx="4" ry="2" fill="#FFA07A" opacity="0.5" />

        {/* HELMET */}
        {/* Main Dome */}
        <path d="M 24 44 C 24 16, 76 16, 76 44 C 76 45, 24 45, 24 44 Z" fill={colors.helmet} />
        {/* Helmet Rim/Brim */}
        <path d="M 22 42 Q 50 45 78 42 L 78 45 Q 50 49 22 45 Z" fill={colors.strap} />

        {/* Helmet Camouflage Spots */}
        <ellipse cx="36" cy="24" rx="5" ry="3" fill={colors.camoSpots[0]} transform="rotate(-15 36 24)" />
        <ellipse cx="62" cy="22" rx="6" ry="4" fill={colors.camoSpots[1]} transform="rotate(25 62 22)" />
        <ellipse cx="48" cy="18" rx="4" ry="2" fill={colors.camoSpots[2]} />
        <ellipse cx="28" cy="34" rx="3" ry="5" fill={colors.camoSpots[1]} transform="rotate(45 28 34)" />
        <ellipse cx="70" cy="34" rx="4" ry="3" fill={colors.camoSpots[0]} transform="rotate(-30 70 34)" />

        {/* Helmet NVG Mount Plate */}
        <rect x="44" y="22" width="12" height="10" rx="1.5" fill="#1F2937" />
        <rect x="47" y="25" width="6" height="4" fill="#374151" />

        {/* EYE VISOR (Special Ops Night-Vision Goggles / Tech Goggles) */}
        {/* Visor Frame */}
        <path d="M 26 44 C 26 44, 30 52, 41 52 C 45 52, 47 48, 50 48 C 53 48, 55 52, 59 52 C 70 52, 74 44, 74 44 L 74 40 C 74 40, 68 36, 50 36 C 32 36, 26 40, 26 40 Z" fill="#111827" />
        {/* Glowing Visor Glass */}
        <path d="M 28 43 C 28 43, 31 50, 41 50 C 44 50, 46 47, 50 47 C 54 47, 56 50, 59 50 C 69 50, 72 43, 72 43 L 72 41 C 72 41, 67 38, 50 38 C 33 38, 28 41, 28 41 Z" fill={colors.visor} />
        {/* Visor shine gradient */}
        <path d="M 28 43 C 28 43, 31 50, 41 50 C 44 50, 46 47, 50 47 C 54 47, 56 50, 59 50 C 69 50, 72 43, 72 43 L 72 41 C 72 41, 67 38, 50 38 C 33 38, 28 41, 28 41 Z" fill="url(#visorShine)" color={colors.visor} opacity="0.6" />
        {/* Tech Goggles horizontal sweep lines */}
        <line x1="30" y1="44" x2="70" y2="44" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.5" strokeDasharray="5 2" />

        {/* TACTICAL CHEEK STRAPS */}
        <path d="M 27 45 L 34 62 L 38 61 L 30 45 Z" fill={colors.strap} />
        <path d="M 73 45 L 66 62 L 62 61 L 70 45 Z" fill={colors.strap} />

        {/* TACTICAL BALLISTIC VEST & COLLAR */}
        {/* Under shirt collar */}
        <path d="M 40 70 L 50 78 L 60 70 Z" fill="#1F2937" />
        {/* Neck */}
        <rect x="44" y="65" width="12" height="10" fill={colors.skin} />

        {/* Ballistic Vest Shoulder Straps */}
        <rect x="30" y="72" width="8" height="12" rx="2" fill={colors.armor} />
        <rect x="62" y="72" width="8" height="12" rx="2" fill={colors.armor} />

        {/* Main Chest Armor */}
        <path d="M 26 78 C 26 78, 28 95, 28 100 L 72 100 C 72 95, 74 78, 74 78 L 60 76 L 50 82 L 40 76 Z" fill={colors.armor} />
        <path d="M 26 78 C 26 78, 28 95, 28 100 L 72 100 C 72 95, 74 78, 74 78 L 60 76 L 50 82 L 40 76 Z" fill="url(#armorGradient)" />

        {/* Chest Camo Spots */}
        <ellipse cx="36" cy="88" rx="4" ry="2" fill={colors.camoSpots[2]} />
        <ellipse cx="64" cy="90" rx="5" ry="2.5" fill={colors.camoSpots[0]} transform="rotate(15 64 90)" />
        <ellipse cx="48" cy="94" rx="4" ry="2" fill={colors.camoSpots[1]} transform="rotate(-15 48 94)" />

        {/* Chest Tactical Pouches / Pockets */}
        <rect x="34" y="82" width="10" height="12" rx="1.5" fill="#111827" />
        <rect x="36" y="80" width="6" height="3" fill={colors.strap} />
        <rect x="56" y="82" width="10" height="12" rx="1.5" fill="#111827" />
        <rect x="58" y="80" width="6" height="3" fill={colors.strap} />

        {/* Center Zipper/Molle webbing line */}
        <line x1="50" y1="84" x2="50" y2="100" stroke="#111827" strokeWidth="2.5" />
        <line x1="47" y1="88" x2="53" y2="88" stroke="#374151" strokeWidth="1" />
        <line x1="47" y1="92" x2="53" y2="92" stroke="#374151" strokeWidth="1" />
        <line x1="47" y1="96" x2="53" y2="96" stroke="#374151" strokeWidth="1" />

        {/* Rank/Badge Insignia (Chibi glowing star) */}
        <polygon points="50,74 51,77 54,77 52,79 53,82 50,80 47,82 48,79 46,77 49,77" fill={colors.visor} />
      </svg>
    </div>
  );
}
