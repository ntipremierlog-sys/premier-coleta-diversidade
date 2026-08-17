import React from "react";
import Image from "next/image";

interface PremierLogoProps {
  className?: string;
  variant?: "full" | "symbol" | "white";
  height?: number | string;
}

export const PremierLogo: React.FC<PremierLogoProps> = ({
  className = "h-11 w-auto",
}) => {
  return (
    <div className={`flex items-center select-none ${className}`}>
      {/* Imagem Oficial em Alta Resolução */}
      <img
        src="/premier-logo.jpg"
        alt="Premier Logistics"
        className="h-full w-auto object-contain rounded-md shadow-sm"
        style={{ maxHeight: "100%" }}
      />
    </div>
  );
};
