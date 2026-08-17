import React from "react";

interface PremierLogoProps {
  className?: string;
}

export const PremierLogo: React.FC<PremierLogoProps> = ({
  className = "h-14 sm:h-16 w-auto",
}) => {
  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 320 155"
        className="h-full w-auto block"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradiente Dourado Metálico Original Premier */}
          <linearGradient id="origGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBF4E6" />
            <stop offset="35%" stopColor="#E2CEB0" />
            <stop offset="70%" stopColor="#C4A87F" />
            <stop offset="100%" stopColor="#9C7F56" />
          </linearGradient>

          <linearGradient id="origGoldCenter" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#EAD8BE" />
            <stop offset="100%" stopColor="#C5A880" />
          </linearGradient>

          {/* Máscara de Ranhuras Horizontais dos Globos */}
          <mask id="origStripes">
            <rect width="320" height="75" fill="white" />
            <rect y="12" width="320" height="2.2" fill="black" />
            <rect y="18" width="320" height="2.6" fill="black" />
            <rect y="24" width="320" height="2.8" fill="black" />
            <rect y="30" width="320" height="2.8" fill="black" />
            <rect y="36" width="320" height="2.8" fill="black" />
            <rect y="42" width="320" height="2.8" fill="black" />
            <rect y="48" width="320" height="2.8" fill="black" />
            <rect y="54" width="320" height="2.6" fill="black" />
            <rect y="60" width="320" height="2.2" fill="black" />
          </mask>
        </defs>

        {/* 1. SÍMBOLO NO TOPO: 5 Globos Sobrepostos (Disposição Original) */}
        <g mask="url(#origStripes)">
          {/* Globo 1 (Extrema Esquerda) */}
          <ellipse cx="85" cy="36" rx="22" ry="22" fill="url(#origGold)" opacity="0.65" />
          {/* Globo 2 (Centro-Esquerda) */}
          <ellipse cx="120" cy="36" rx="25" ry="25" fill="url(#origGold)" opacity="0.85" />
          {/* Globo 4 (Centro-Direita) */}
          <ellipse cx="200" cy="36" rx="25" ry="25" fill="url(#origGold)" opacity="0.85" />
          {/* Globo 5 (Extrema Direita) */}
          <ellipse cx="235" cy="36" rx="22" ry="22" fill="url(#origGold)" opacity="0.65" />
          {/* Globo 3 (Central em Destaque) */}
          <ellipse cx="160" cy="36" rx="28" ry="28" fill="url(#origGoldCenter)" opacity="1.0" />
        </g>

        {/* 2. TEXTO CENTRAL: PREMIER (Fonte Serifada Original, Caixa Alta, Branco) */}
        <text
          x="160"
          y="102"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Georgia, 'Times New Roman', 'Playfair Display', serif"
          fontSize="44"
          fontWeight="bold"
          letterSpacing="3.5"
        >
          PREMIER
        </text>

        {/* 3. LINHA SEPARADORA DOURADA HORIZONTAL */}
        <line
          x1="45"
          y1="114"
          x2="275"
          y2="114"
          stroke="url(#origGold)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* 4. TEXTO INFERIOR: L O G I S T I C S (Espaçamento Amplo Original) */}
        <text
          x="160"
          y="136"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Inter', 'Montserrat', 'Segoe UI', Arial, sans-serif"
          fontSize="13"
          fontWeight="500"
          letterSpacing="13"
        >
          LOGISTICS
        </text>
      </svg>
    </div>
  );
};
