"use client";

import { useState, useSyncExternalStore } from "react";
import { EVENTS, trackEvent } from "@/lib/analytics/events";
import { getAttribution } from "@/lib/analytics/attribution-store";
import { storeDestination, withStoreAttribution } from "@/lib/analytics/store-attribution";
import { APPLE_PROVIDER_TOKEN, BETA_LINKS, type BetaPlatform } from "@/lib/site";

const PLATFORMS: { key: BetaPlatform; label: string }[] = [
  { key: "android", label: "Android beta" },
  { key: "ios", label: "iPhone beta" },
];

type Props = {
  location: "hero" | "beta_section";
  tone?: "light" | "dark";
  comingSoonNotice: string;
};

// The saved source changes only on a full page load, so nothing needs to subscribe.
const noSubscription = () => () => {};

// Before a beta link exists, the button still counts clicks as beta_button_click.
// That measures demand for each platform before the beta opens. A click on a real
// link counts as store_click instead, so the two never mix.
export function BetaButtons({ location, tone = "light", comingSoonNotice }: Props) {
  const [showNotice, setShowNotice] = useState(false);
  // The server has no saved source, so its links carry none. The browser adds it after load.
  const attribution = useSyncExternalStore(noSubscription, getAttribution, () => null);

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
            // The href itself carries the source. So a link opened in a new tab keeps it.
            // A copied link keeps it too. Only a click sends store_click.
            // destination keeps TestFlight and App Store clicks apart.
            const destination = storeDestination(link);
            return (
              <a
                key={key}
                href={withStoreAttribution(link, attribution, APPLE_PROVIDER_TOKEN)}
                className={className}
                onClick={() =>
                  trackEvent(EVENTS.storeClicked, {
                    platform: key,
                    location,
                    ...(destination ? { destination } : {}),
                  })
                }
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
