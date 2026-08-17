import React from "react";

interface PremierLogoProps {
  className?: string;
  variant?: "full" | "symbol" | "white";
  height?: number | string;
}

export const PremierLogo: React.FC<PremierLogoProps> = ({
  className = "h-10 w-auto",
  variant = "full",
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 480 200"
        className="h-full w-auto select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradiente Dourado Metálico do Símbolo */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5EBD9" />
            <stop offset="35%" stopColor="#E2CEB0" />
            <stop offset="70%" stopColor="#C4A87F" />
            <stop offset="100%" stopColor="#9C7F56" />
          </linearGradient>

          {/* Gradiente Dourado Mais Claro para o Globo Central */}
          <linearGradient id="centerGoldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF7EB" />
            <stop offset="50%" stopColor="#E6D3B6" />
            <stop offset="100%" stopColor="#C5A880" />
          </linearGradient>

          {/* Máscara das Linhas Horizontais */}
          <mask id="stripesMask">
            <rect width="480" height="100" fill="white" />
            {/* Linhas horizontais vazadas */}
            <rect y="16" width="480" height="3" fill="black" />
            <rect y="23" width="480" height="3.5" fill="black" />
            <rect y="31" width="480" height="3.5" fill="black" />
            <rect y="39" width="480" height="3.5" fill="black" />
            <rect y="47" width="480" height="3.5" fill="black" />
            <rect y="55" width="480" height="3.5" fill="black" />
            <rect y="63" width="480" height="3.5" fill="black" />
            <rect y="71" width="480" height="3.5" fill="black" />
            <rect y="79" width="480" height="3" fill="black" />
          </mask>
        </defs>

        {/* 1. SÍMBOLO: 5 Globos Sobrepostos com Efeito de Movimento e Linhas */}
        <g mask="url(#stripesMask)" transform="translate(0, 0)">
          {/* Globo 1 (Extrema Esquerda) */}
          <ellipse
            cx="135"
            cy="48"
            rx="32"
            ry="32"
            fill="url(#goldGradient)"
            opacity="0.65"
          />

          {/* Globo 2 (Centro-Esquerda) */}
          <ellipse
            cx="185"
            cy="48"
            rx="35"
            ry="35"
            fill="url(#goldGradient)"
            opacity="0.85"
          />

          {/* Globo 4 (Centro-Direita) */}
          <ellipse
            cx="295"
            cy="48"
            rx="35"
            ry="35"
            fill="url(#goldGradient)"
            opacity="0.85"
          />

          {/* Globo 5 (Extrema Direita) */}
          <ellipse
            cx="345"
            cy="48"
            rx="32"
            ry="32"
            fill="url(#goldGradient)"
            opacity="0.65"
          />

          {/* Globo 3 (Centro Principal - Destaque em Primeiro Plano) */}
          <ellipse
            cx="240"
            cy="48"
            rx="38"
            ry="38"
            fill="url(#centerGoldGradient)"
            opacity="1.0"
          />
        </g>

        {/* 2. TIPOGRAFIA: "PREMIER" */}
        <text
          x="240"
          y="136"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Georgia, 'Times New Roman', 'Playfair Display', serif"
          fontSize="48"
          fontWeight="bold"
          letterSpacing="4"
        >
          PREMIER
        </text>

        {/* 3. LINHA SEPARADORA DOURADA */}
        <line
          x1="82"
          y1="148"
          x2="398"
          y2="148"
          stroke="url(#goldGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* 4. TIPOGRAFIA: "L O G I S T I C S" */}
        <text
          x="240"
          y="172"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="'Inter', 'Montserrat', system-ui, sans-serif"
          fontSize="14"
          fontWeight="400"
          letterSpacing="14"
        >
          LOGISTICS
        </text>
      </svg>
    </div>
  );
};
