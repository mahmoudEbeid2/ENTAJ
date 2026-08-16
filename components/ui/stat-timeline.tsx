import Image from "next/image";

// Exact positions traced from Figma (About Us page, node 2:979), local to this
// component's own top-left origin at page coordinate (683, 1272) — i.e. the
// top-left of item 0's numeral. The connector line (172x433 at that same
// scale, native asset size) starts exactly at item 0's dot and ends exactly
// at item 3's dot; each dot sits precisely on the line's curve, not on a
// generic evenly-spaced/margin-offset zigzag. Desktop-only (this design has
// no mobile Figma frame), used at the lg+ breakpoint; smaller screens fall
// back to a simple stacked list.
const LAYOUT = [
  { numeral: { x: 0, y: 0 }, label: { x: 0, y: 44 }, dot: { x: 120, y: 29 } },
  { numeral: { x: 304, y: 122 }, label: { x: 303, y: 165 }, dot: { x: 264, y: 153 } },
  { numeral: { x: 17, y: 272 }, label: { x: 16, y: 316 }, dot: { x: 154, y: 304 } },
  { numeral: { x: 336, y: 422 }, label: { x: 336, y: 465 }, dot: { x: 291, y: 461 } },
] as const;

const LINE_OFFSET = { x: 120, y: 28 };

export function StatTimeline({
  items,
  linePath,
  dotPath,
}: {
  items: { id: number; value: string; label: string }[];
  linePath?: string | null;
  dotPath?: string | null;
}) {
  return (
    <>
      {/* Desktop: pixel-exact reproduction of the Figma zig-zag timeline geometry. */}
      <div className="relative hidden lg:block lg:h-[500px] lg:w-[520px]">
        {linePath ? (
          <Image
            src={linePath}
            alt=""
            width={172}
            height={433}
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{ left: LINE_OFFSET.x, top: LINE_OFFSET.y }}
          />
        ) : null}
        {items.slice(0, 4).map((item, index) => {
          const pos = LAYOUT[index];
          return (
            <div key={item.id}>
              <span
                className="absolute font-expanded text-[40px] leading-none font-semibold whitespace-nowrap text-entaj-dark-grey"
                style={{ left: pos.numeral.x, top: pos.numeral.y }}
              >
                {item.value}
              </span>
              <span
                className="absolute text-base leading-snug whitespace-nowrap text-entaj-dark-grey"
                style={{ left: pos.label.x, top: pos.label.y }}
              >
                {item.label}
              </span>
              {dotPath ? (
                <Image
                  src={dotPath}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden="true"
                  className="absolute size-6"
                  style={{ left: pos.dot.x - 12, top: pos.dot.y - 12 }}
                />
              ) : (
                <span
                  className="absolute size-3 rounded-full bg-entaj-blue"
                  style={{ left: pos.dot.x - 6, top: pos.dot.y - 6 }}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile/tablet fallback: no Figma frame exists below 1440px, so a simple stacked list. */}
      <ul className="relative flex flex-col gap-8 lg:hidden">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4">
            {dotPath ? (
              <Image src={dotPath} alt="" width={24} height={24} className="size-6 shrink-0" aria-hidden="true" />
            ) : (
              <span className="size-3 shrink-0 rounded-full bg-entaj-blue" aria-hidden="true" />
            )}
            <div>
              <span className="block font-expanded text-2xl leading-none font-semibold text-entaj-dark-grey">{item.value}</span>
              <span className="block text-sm text-entaj-dark-grey">{item.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
