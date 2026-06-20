"use client";

import type { LucideIcon } from "lucide-react";

export function FloorPageIntroBanner({
  title,
  message,
  icon: Icon,
}: {
  title: string;
  message: string;
  icon: LucideIcon;
}) {
  return (
    <div className="floor-page-intro-banner" role="status">
      <div className="floor-page-intro-banner__ring" aria-hidden />
      <div className="floor-page-intro-banner__inner">
        <div className="floor-page-intro-banner__copy">
          <p className="floor-page-intro-banner__title">{title}</p>
          <p className="floor-page-intro-banner__text">{message}</p>
        </div>
        <Icon className="floor-page-intro-banner__icon" aria-hidden />
      </div>
    </div>
  );
}
