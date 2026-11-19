"use client";

import { useState } from "react";
import { EVENTS, trackEvent } from "@/lib/analytics/events";
import { withStoreAttribution } from "@/lib/analytics/store-attribution";
import { BETA_LINKS, type BetaPlatform } from "@/lib/site";

const PLATFORMS: { key: BetaPlatform; label: string }[] = [
  { key: "android", label: "Android beta" },
  { key: "ios", label: "iPhone beta" },
];

type Props = {
  location: "hero" | "beta_section";
  tone?: "light" | "dark";
  comingSoonNotice: string;
};

// Before a beta link exists, the button still counts clicks. That measures
// demand for each platform before the beta opens.
export function BetaButtons({ location, tone = "light", comingSoonNotice }: Props) {
  const [showNotice, setShowNotice] = useState(false);

  const buttonClass =
    tone === "light"
      ? "bg-leaf text-white hover:bg-leaf-dark focus-visible:outline-leaf"
      : "bg-white text-ink hover:bg-mist focus-visible:outline-white";
  const tagClass =
    tone === "light" ? "bg-white/15 text-white" : "bg-garden text-leaf";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        {PLATFORMS.map(({ key, label }) => {
          const link = BETA_LINKS[key];
          const className = `inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-full px-6 py-3 text-base font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${buttonClass}`;

          if (link) {
            return (
              <a
                key={key}
                href={link}
                className={className}
                onClick={(event) => {
                  trackEvent(EVENTS.betaButtonClicked, {
                    platform: key,
                    location,
                    available: true,
                  });
                  event.currentTarget.href = withStoreAttribution(
                    link,
                    key,
                    window.location.search,
                  );
                }}
              >
                Join the {label}
              </a>
            );
          }

          return (
            <button
              key={key}
              type="button"
              className={className}
              onClick={() => {
                trackEvent(EVENTS.betaButtonClicked, {
                  platform: key,
                  location,
                  available: false,
                });
                setShowNotice(true);
              }}
            >
              {label}
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tagClass}`}
              >
                Coming soon
              </span>
            </button>
          );
        })}
      </div>
      <p
        role="status"
        className={`mt-3 min-h-6 text-sm ${tone === "light" ? "text-muted" : "text-white/85"}`}
      >
        {showNotice ? comingSoonNotice : ""}
      </p>
    </div>
  );
}
