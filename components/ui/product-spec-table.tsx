import Image from "next/image";
import Link from "next/link";

export interface ProductSpecRow {
  id: number;
  name: string;
  spec?: string | null;
  description?: string | null;
}

function RowBullet({ className = "h-[15px] w-[13px] shrink-0" }: { className?: string }) {
  return (
    <Image
      src="/assets/icons/icon-row-bullet.svg"
      alt=""
      width={15}
      height={17}
      className={className}
      aria-hidden="true"
    />
  );
}

export function ProductSpecTable({ products }: { products: ProductSpecRow[] }) {
  return (
    <>
      {/* Below lg: the desktop grid's column minimums (600px combined) don't fit
          mobile/tablet viewports, so each row renders as a stacked card instead. */}
      <div className="flex flex-col gap-3 lg:hidden">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="block rounded-2xl bg-entaj-light-grey px-5 py-4 transition-colors duration-200 hover:bg-entaj-light-grey/70"
          >
            <div className="flex items-start gap-2">
              <RowBullet className="mt-1.5 h-[15px] w-[13px] shrink-0" />
              <span className="font-expanded text-base font-bold break-words text-entaj-blue">
                {product.name}
              </span>
            </div>
            {product.spec ? (
              <p className="mt-2 font-expanded text-sm font-bold break-words text-entaj-dark-grey">
                {product.spec}
              </p>
            ) : null}
            {product.description ? (
              <p className="mt-1 font-expanded text-sm break-words text-entaj-dark-grey">
                {product.description}
              </p>
            ) : null}
          </Link>
        ))}
      </div>

      {/* lg and up: original 3-column grid, unchanged. */}
      <div
        className="hidden overflow-x-auto lg:grid"
        style={{
          gridTemplateColumns: "minmax(220px,1.6fr) minmax(160px,1.3fr) minmax(220px,2fr)",
          gridTemplateRows: `repeat(${products.length}, auto)`,
        }}
      >
        <div className="bg-entaj-light-grey" style={{ gridColumn: 2, gridRow: `1 / span ${products.length}` }} />
        {products.map((product, index) => (
          <Link key={product.id} href={`/products/${product.id}`} className="contents group">
            <div
              className="flex min-h-[52px] items-center gap-2 py-3 pr-3 align-top group-hover:text-entaj-blue/80"
              style={{ gridColumn: 1, gridRow: index + 1 }}
            >
              <RowBullet />
              <span className="font-expanded text-[19px] font-bold text-entaj-blue">{product.name}</span>
            </div>
            <div
              className="flex min-h-[52px] items-center px-6 py-3 font-expanded text-[19px] font-bold text-entaj-dark-grey"
              style={{ gridColumn: 2, gridRow: index + 1 }}
            >
              {product.spec}
            </div>
            <div
              className="flex min-h-[52px] items-center py-3 pl-6 font-expanded text-lg text-entaj-dark-grey"
              style={{ gridColumn: 3, gridRow: index + 1 }}
            >
              {product.description}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
