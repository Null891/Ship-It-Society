"use client";

import { useState } from "react";
import { Button, Eyebrow } from "@/components/ui/Button";
import { HudFrame, Readout, Tag, TickBar } from "@/components/ui/Hud";
import { Reveal, RevealLines } from "@/components/motion/Reveal";
import { Annotation } from "@/components/ui/Poster";
import { r3 } from "@/lib/geometry";
import { sections, stages, tools } from "@/content/handbook";

/* ==========================================================================
   01 — The loop.

   A node graph: one hub rail on the left, a fanned edge to every stage, and
   a readout panel on the right that follows whichever stage you are on.

   How the edges stay on the rows without measuring anything: the fan sits in
   its own flex column between the hub and the list, so it is exactly as tall
   as the list. Its viewBox is a plain 100x100 box drawn with
   preserveAspectRatio="none", so a curve ending at y = (i + 0.5) / n lands on
   the vertical centre of row i at any width, at any font size, in any
   language. non-scaling-stroke keeps the hairline a hairline while the box
   is stretched. The edges draw themselves in through the site's shared
   .draw-path / [data-reveal] system, so nothing depends on this file's JS.

   The graph is decoration: the same six stages are an ordered list of real
   text beside it, in order, with their day ranges and what happens in them.
   The SVG and the readout panel are aria-hidden, the panel holds no
   focusable control, and everything the panel prints (the week a stage sits
   in, the tool attached to it) is written out again in the tools list below
   and in section 02.
   ========================================================================== */

const loop = sections.loop;

/** One curve per stage, hub edge to row centre. */
const EDGES = stages.map((_, i) => {
  const y = r3(((i + 0.5) * 100) / stages.length);
  return `M0 50C40 50 46 ${y} 100 ${y}`;
});

export function Loop() {
  const [active, setActive] = useState(0);
  const stage = stages[active];

  return (
    <section className="pt-28 md:pt-40" aria-labelledby="loop-title">
      <div className="edge">
        <div className="grid12 items-end gap-y-6">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow index={1}>{loop.eyebrow}</Eyebrow>
            <RevealLines
              lines={loop.title}
              id="loop-title"
              className="optical mt-5 text-3xl font-normal"
            />
            <p className="pretty mt-6 max-w-[48ch] text-base text-[var(--stage-muted)]">
              {loop.intro}
            </p>
          </div>

          <div className="col-span-4 flex items-baseline gap-8 md:col-span-4 md:col-start-9 md:justify-end">
            <Readout label="Stages" valueClassName="text-2xl font-light">
              {String(stages.length).padStart(2, "0")}
            </Readout>
            <Readout label="Tools on it" valueClassName="text-2xl font-light">
              {String(tools.length).padStart(2, "0")}
            </Readout>
          </div>
        </div>

        <div className="grid12 mt-12 items-start md:mt-16">
          {/* The graph: hub rail, fan, stage list. */}
          <div className="col-span-4 md:col-span-8">
            <div className="flex items-stretch">
              {/* Hub */}
              <div className="relative w-[38px] shrink-0 sm:w-[54px]">
                <div className="chamfer-line flex h-full items-center justify-center [--cut:var(--cut-sm)] sm:[--cut:var(--cut)]">
                  <span className="mono-label rotate-180 text-[var(--stage-muted)] [writing-mode:vertical-rl]">
                    {loop.hubLabel}
                  </span>
                </div>
                <span
                  aria-hidden
                  className="absolute right-[-3px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 bg-marigold"
                />
              </div>

              {/* Fan */}
              <Reveal className="relative w-[26px] shrink-0 sm:w-[56px] md:w-[92px]">
                <svg
                  aria-hidden
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full overflow-visible"
                  fill="none"
                >
                  {EDGES.map((d, i) => (
                    <path
                      key={d}
                      d={d}
                      pathLength={1}
                      vectorEffect="non-scaling-stroke"
                      stroke={
                        i === active
                          ? "var(--color-marigold)"
                          : "var(--stage-line-strong)"
                      }
                      strokeWidth={i === active ? 1.5 : 1}
                      className="draw-path"
                      style={{ "--draw-i": i } as React.CSSProperties}
                    />
                  ))}
                </svg>
              </Reveal>

              {/* The stages, in order. */}
              <ol className="grid flex-1 grid-rows-6">
                {stages.map((s, i) => (
                  <li
                    key={s.id}
                    data-active={i === active}
                    className="group relative flex flex-col justify-center rule-t pl-4 first:border-t-0 sm:pl-6"
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse") setActive(i);
                    }}
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-[var(--stage-line-strong)] transition-colors duration-[var(--dur-fast)] group-data-[active=true]:h-2.5 group-data-[active=true]:w-2.5 group-data-[active=true]:bg-marigold"
                    />
                    <button
                      type="button"
                      aria-pressed={i === active}
                      onClick={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 text-left"
                    >
                      <span className="mono-label text-[var(--stage-subtle)] group-data-[active=true]:text-marigold">
                        {s.index}
                      </span>
                      <span className="text-lg font-medium tracking-[-0.018em]">
                        {s.title}
                      </span>
                      <span className="mono-label text-[var(--stage-muted)]">
                        {s.range}
                      </span>
                    </button>
                    <p className="pretty max-w-[46ch] pb-4 text-sm text-[var(--stage-muted)]">
                      {s.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* What runs on the path, as real text with real links. */}
            <div className="rule-t mt-10 pt-6">
              <Annotation className="text-[var(--stage-subtle)]">
                {loop.toolsTitle}
              </Annotation>
              <dl className="mt-5 grid gap-x-6 gap-y-7 sm:grid-cols-3">
                {tools.map((tool) => (
                  <div key={tool.name}>
                    <dt>
                      <Button variant="quiet" href={tool.url} size="sm">
                        {tool.name}
                      </Button>
                    </dt>
                    <dd className="mt-1">
                      <span className="mono-label block text-[var(--stage-subtle)]">
                        {tool.where}
                      </span>
                      <span className="pretty mt-2 block text-sm text-[var(--stage-muted)]">
                        {tool.contribution}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* The readout. Decoration over the list: nothing here is only here. */}
          <div
            aria-hidden
            className="col-span-4 mt-10 md:col-span-3 md:col-start-10 md:mt-0 md:sticky md:top-28"
          >
            <HudFrame size={10} className="min-h-[320px] bg-[var(--stage-panel)] p-5">
              <div className="flex items-center justify-between gap-3">
                <Annotation className="text-[var(--stage-subtle)]">
                  {loop.panelLabel}
                </Annotation>
                <span className="mono-label tnum text-[var(--stage-muted)]">
                  {stage.index} / {String(stages.length).padStart(2, "0")}
                </span>
              </div>

              <p className="mt-5 text-2xl font-light tracking-[-0.03em]">
                {stage.title}
              </p>
              <TickBar
                total={stages.length}
                filled={active + 1}
                height={14}
                className="mt-4"
              />

              <div className="mt-6 space-y-5">
                <Readout label="Sits in" valueClassName="text-base">
                  {stage.weekLabel} · {stage.weekTitle}
                </Readout>
                <Readout label="Days" valueClassName="text-base">
                  {stage.range}
                </Readout>
                <Readout label="That week" valueClassName="text-sm">
                  <span className="pretty block text-[var(--stage-muted)]">
                    {stage.weekSummary}
                  </span>
                </Readout>
                {stage.tool && (
                  <div className="rule-t pt-5">
                    <Tag tone="accent">{stage.tool.name}</Tag>
                    <p className="pretty mt-3 text-sm text-[var(--stage-muted)]">
                      {stage.tool.blurb}
                    </p>
                  </div>
                )}
              </div>
            </HudFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
