type BrandProps = {
  compact?: boolean;
};

export function Brand({ compact = false }: BrandProps) {
  return (
    <Link className="brand" href="/" aria-label="Chorezy home">
      <Image
        className="brand__mark"
        src="/brand/logo-color.png"
        alt=""
        width="48"
        height="48"
      />
      <span className="brand__name">Chorezy</span>
      {!compact && <span className="brand__tag">Local help, made easier</span>}
    </Link>
  );
}
import Image from "next/image";
import Link from "next/link";
