import React from "react";

interface PremierLogoProps {
  className?: string;
  variant?: "full" | "horizontal" | "vertical";
}

export const PremierLogo: React.FC<PremierLogoProps> = ({
  className = "h-10 sm:h-11 w-auto",
}) => {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 380 64"
        className="h-full w-auto block overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradiente Dourado Metálico Premier */}
          <linearGradient id="premGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2D6" />
            <stop offset="35%" stopColor="#E5CDA7" />
            <stop offset="70%" stopColor="#C8A676" />
            <stop offset="100%" stopColor="#9E7B4A" />
          </linearGradient>

          <linearGradient id="premGoldCenter" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#F5E3C8" />
            <stop offset="100%" stopColor="#C9A676" />
          </linearGradient>

          {/* Máscara das ranhuras horizontais do símbolo */}
          <mask id="globeStripes">
            <rect width="130" height="64" fill="white" />
            <rect y="8" width="130" height="2" fill="black" />
            <rect y="13" width="130" height="2.2" fill="black" />
            <rect y="18" width="130" height="2.5" fill="black" />
            <rect y="23" width="130" height="2.5" fill="black" />
            <rect y="28" width="130" height="2.5" fill="black" />
            <rect y="33" width="130" height="2.5" fill="black" />
            <rect y="38" width="130" height="2.5" fill="black" />
            <rect y="43" width="130" height="2.5" fill="black" />
            <rect y="48" width="130" height="2.2" fill="black" />
            <rect y="53" width="130" height="2" fill="black" />
          </mask>
        </defs>

        {/* 1. SÍMBOLO: 5 Globos Sobrepostos (Esquerda) */}
        <g mask="url(#globeStripes)" transform="translate(0, 0)">
          {/* Globo 1 (Extrema esquerda) */}
          <ellipse cx="24" cy="31" rx="18" ry="18" fill="url(#premGold)" opacity="0.65" />
          {/* Globo 2 */}
          <ellipse cx="44" cy="31" rx="20" ry="20" fill="url(#premGold)" opacity="0.85" />
          {/* Globo 4 */}
          <ellipse cx="84" cy="31" rx="20" ry="20" fill="url(#premGold)" opacity="0.85" />
          {/* Globo 5 (Extrema direita) */}
          <ellipse cx="104" cy="31" rx="18" ry="18" fill="url(#premGold)" opacity="0.65" />
          {/* Globo 3 (Central em destaque) */}
          <ellipse cx="64" cy="31" rx="22" ry="22" fill="url(#premGoldCenter)" opacity="1.0" />
        </g>

        {/* 2. TEXTO: PREMIER (Grande, Nítido e com Serifas Oficiais) */}
        <text
          x="135"
          y="36"
          fill="#FFFFFF"
          fontFamily="Georgia, 'Times New Roman', 'Playfair Display', serif"
          fontSize="35"
          fontWeight="bold"
          letterSpacing="2.5"
        >
          PREMIER
        </text>

        {/* 3. LINHA SEPARADORA DOURADA */}
        <line
          x1="135"
          y1="43"
          x2="370"
          y2="43"
          stroke="url(#premGold)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* 4. TEXTO: LOGISTICS (Espaçado e Perfeitamente Legível) */}
        <text
          x="252"
          y="56"
          textAnchor="middle"
          fill="#E5CDA7"
          fontFamily="'Inter', 'Segoe UI', Arial, sans-serif"
          fontSize="10"
          fontWeight="600"
          letterSpacing="9"
        >
          LOGISTICS
        </text>
      </svg>
    </div>
  );
};
