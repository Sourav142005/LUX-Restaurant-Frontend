import React, { useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * LuciAvatar Component
 * 
 * Attempts to render the official Luci devil-mascot image at /images/luci-avatar.png.
 * If the asset is missing or fails to load, gracefully falls back to an elegant
 * gold-and-black circular framed luxury badge featuring the "L" monogram and gold accents.
 */
export default function LuciAvatar({ size = "md", className = "" }) {
  const [imgError, setImgError] = useState(false);

  // Size mappings
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg"
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full border border-[#D4AF7C]/60 bg-gradient-to-br from-[#2B1F14] via-[#141414] to-[#0B0B0B] shadow-md shadow-black/40 overflow-hidden select-none ${currentSize} ${className}`}
      aria-label="Luci Avatar"
    >
      {!imgError ? (
        <img
          src="/images/luci-avatar.png"
          alt="Luci"
          className="h-full w-full object-cover rounded-full"
          onError={() => setImgError(true)}
          loading="eager"
        />
      ) : (
        /* Graceful Luxury Fallback Frame */
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#1C150E] via-[#0D0D0D] to-[#050505] relative">
          {/* Subtle gold inner ring */}
          <div className="absolute inset-0.5 rounded-full border border-[#D4AF7C]/30" />
          
          {/* Luxury Monogram */}
          <span className="font-serif font-black tracking-tighter text-[#D4AF7C] drop-shadow-[0_1px_3px_rgba(212,175,124,0.4)]">
            L
          </span>
          
          {/* Subtle gold sparkle accent */}
          <Sparkles
            size={size === "sm" ? 8 : size === "lg" ? 14 : 10}
            className="absolute top-1 right-1 text-[#E6C894] opacity-80"
          />
        </div>
      )}
    </div>
  );
}

