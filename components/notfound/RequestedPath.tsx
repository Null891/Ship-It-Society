"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

/* ==========================================================================
   The address the visitor asked for, as a readout.

   Hydration-safe by construction. The 404 page can be prerendered once and
   served for every unknown address, so whatever the server printed for the
   path would be wrong for most visitors, and printing usePathname() straight
   into the first client render would mismatch it. The server snapshot below
   is `false`, so the server and the hydrating client both render the dash;
   the real path replaces it in the render right after hydration.
   ========================================================================== */

const noop = () => () => {};

function display(pathname: string): string {
  try {
    return decodeURI(pathname);
  } catch {
    return pathname; // malformed escapes print as sent
  }
}

export function RequestedPath() {
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  return (
    <span className="block break-all" translate="no">
      {hydrated && pathname ? display(pathname) : "—"}
    </span>
  );
}
