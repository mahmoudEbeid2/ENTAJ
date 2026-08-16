export function RegionBlock({ name, countries }: { name: string; countries: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h3 className="font-sans text-2xl text-entaj-blue sm:text-[32px]">{name}</h3>
      <p className="font-sans text-lg text-entaj-dark-grey sm:text-2xl">{countries}</p>
    </div>
  );
}
