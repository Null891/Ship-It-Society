"use client";

import * as React from "react";

/* ==========================================================================
   Shared-element morph across a navigation.

   React ships <ViewTransition> in the build Next vendors for the App Router,
   but @types/react does not describe it yet, and browsers without the View
   Transitions API ignore it entirely. This wrapper resolves it at runtime and
   falls back to rendering the children untouched, so the feature is additive:
   where it works the project cover morphs into its case study, and where it
   does not the navigation is simply instant.
   ========================================================================== */

type ViewTransitionComponent = React.ComponentType<{
  name?: string;
  children: React.ReactNode;
}>;

const ViewTransition = (
  React as unknown as { ViewTransition?: ViewTransitionComponent }
).ViewTransition;

export function Morph({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  if (!ViewTransition) return <>{children}</>;
  return <ViewTransition name={name}>{children}</ViewTransition>;
}
