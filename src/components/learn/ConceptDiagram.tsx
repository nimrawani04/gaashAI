import { memo } from "react";

import type { LessonDiagram } from "@/lib/learn.server";

type Props = {
  diagram: LessonDiagram;
  /** True when the target language is written right-to-left (Kashmiri/Urdu). */
  rtl?: boolean;
};

const W = 640;

function wrap(text: string, max = 22): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = `${line} ${w}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 3);
}

function NodeLabel({
  x,
  y,
  en,
  target,
  rtl,
}: {
  x: number;
  y: number;
  en: string;
  target: string;
  rtl?: boolean;
}) {
  const targetLines = wrap(target, rtl ? 18 : 22);
  return (
    <g>
      <text
        x={x}
        y={y - 6}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-semibold"
      >
        {en}
      </text>
      {targetLines.map((line, i) => (
        <text
          key={i}
          x={x}
          y={y + 12 + i * 18}
          textAnchor="middle"
          direction={rtl ? "rtl" : "ltr"}
          className={`fill-primary text-[14px] ${rtl ? "font-nastaliq" : ""}`}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/**
 * Renders a lesson diagram as SVG with mother-tongue (Nastaliq/RTL) labels.
 * Three layouts: cycle (ring with arrows), flow (left→right or right→left chain)
 * and parts (labelled grid around a central idea).
 */
function ConceptDiagramImpl({ diagram, rtl }: Props) {
  const nodes = diagram.nodes.slice(0, 8);
  if (!nodes.length) return null;

  let body: React.ReactNode = null;
  let height = 320;

  if (diagram.kind === "cycle") {
    const cx = W / 2;
    const cy = 170;
    const r = 118;
    const pts = nodes.map((_, i) => {
      const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
    height = 360;
    body = (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          className="fill-none stroke-border"
          strokeDasharray="6 6"
          strokeWidth={2}
        />
        {pts.map((p, i) => {
          const next = pts[(i + 1) % pts.length];
          const mx = (p.x + next.x) / 2;
          const my = (p.y + next.y) / 2;
          return (
            <polygon
              key={`a${i}`}
              points="-6,-5 7,0 -6,5"
              className="fill-primary/70"
              transform={`translate(${mx} ${my}) rotate(${
                (Math.atan2(next.y - p.y, next.x - p.x) * 180) / Math.PI
              })`}
            />
          );
        })}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={26} className="fill-card stroke-primary" strokeWidth={2} />
            <text
              x={p.x}
              y={p.y + 5}
              textAnchor="middle"
              className="fill-primary text-[13px] font-bold"
            >
              {i + 1}
            </text>
            <NodeLabel
              x={p.x}
              y={p.y + (p.y < cy ? -46 : 62)}
              en={nodes[i].label_en}
              target={nodes[i].label_target}
              rtl={rtl}
            />
          </g>
        ))}
      </g>
    );
  } else if (diagram.kind === "flow") {
    const ordered = rtl ? [...nodes].reverse() : nodes;
    const gap = W / (ordered.length + 0.4);
    height = 90 + ordered.length * 0; // fixed
    height = 210;
    body = (
      <g>
        {ordered.map((n, i) => {
          const x = gap * (i + 0.7);
          const y = 80;
          return (
            <g key={i}>
              <rect
                x={x - gap * 0.42}
                y={y - 30}
                width={gap * 0.84}
                height={60}
                rx={12}
                className="fill-card stroke-primary"
                strokeWidth={2}
              />
              {i < ordered.length - 1 && (
                <line
                  x1={x + gap * 0.44}
                  y1={y}
                  x2={x + gap * 0.96}
                  y2={y}
                  className="stroke-primary/70"
                  strokeWidth={2}
                  markerEnd="url(#cd-arrow)"
                />
              )}
              <NodeLabel x={x} y={y - 2} en={n.label_en} target={n.label_target} rtl={rtl} />
              {n.note_target && (
                <text
                  x={x}
                  y={y + 58}
                  textAnchor="middle"
                  direction={rtl ? "rtl" : "ltr"}
                  className={`fill-muted-foreground text-[12px] ${rtl ? "font-nastaliq" : ""}`}
                >
                  {wrap(n.note_target, 20)[0]}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  } else {
    const cols = nodes.length <= 4 ? 2 : 3;
    const rows = Math.ceil(nodes.length / cols);
    height = 60 + rows * 110;
    const cellW = W / cols;
    body = (
      <g>
        {nodes.map((n, i) => {
          const cIdx = i % cols;
          const col = rtl ? cols - 1 - cIdx : cIdx;
          const row = Math.floor(i / cols);
          const x = cellW * col + cellW / 2;
          const y = 60 + row * 110;
          return (
            <g key={i}>
              <rect
                x={x - cellW * 0.42}
                y={y - 34}
                width={cellW * 0.84}
                height={88}
                rx={12}
                className="fill-muted/50 stroke-border"
                strokeWidth={2}
              />
              <NodeLabel x={x} y={y - 8} en={n.label_en} target={n.label_target} rtl={rtl} />
              {n.note_target && (
                <text
                  x={x}
                  y={y + 44}
                  textAnchor="middle"
                  direction={rtl ? "rtl" : "ltr"}
                  className={`fill-muted-foreground text-[12px] ${rtl ? "font-nastaliq" : ""}`}
                >
                  {wrap(n.note_target, 18)[0]}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  }

  return (
    <figure className="mt-3 overflow-x-auto rounded-lg border border-border bg-background p-3">
      <figcaption className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Diagram · {diagram.title_en}
        </span>
        <span
          dir={rtl ? "rtl" : "ltr"}
          className={`text-sm font-semibold text-primary ${rtl ? "font-nastaliq" : ""}`}
        >
          {diagram.title_target}
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        width="100%"
        role="img"
        aria-label={`${diagram.title_en}: ${nodes.map((n) => n.label_en).join(", ")}`}
        className="min-w-[520px]"
      >
        <defs>
          <marker id="cd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary/70" />
          </marker>
        </defs>
        {body}
      </svg>
    </figure>
  );
}

export const ConceptDiagram = memo(ConceptDiagramImpl);
