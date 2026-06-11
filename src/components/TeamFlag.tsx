import { ISO2_BY_CODE } from "@/lib/flags";

type Props = {
  code: string; // código FIFA (COL, MEX, ...)
  fallback?: string; // emoji guardado en BD, por si no hay imagen
  size?: "sm" | "md";
};

/** Bandera del país como imagen real (flagcdn.com), con emoji de respaldo. */
export function TeamFlag({ code, fallback, size = "sm" }: Props) {
  const iso = ISO2_BY_CODE[code];
  if (!iso) return <span>{fallback ?? ""}</span>;
  const cls =
    size === "md"
      ? "inline-block h-[18px] w-[27px] rounded-[3px]"
      : "inline-block h-[14px] w-[21px] rounded-[2px]";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
      alt={`Bandera ${code}`}
      loading="lazy"
      className={`${cls} object-cover align-[-2px] shadow-sm ring-1 ring-black/15`}
    />
  );
}
