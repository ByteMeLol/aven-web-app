type BrandLogoProps = {
  size?: "small" | "large";
};

export default function BrandLogo({ size = "small" }: BrandLogoProps) {
  const dimensions = size === "large" ? "h-10 w-10" : "h-9 w-9";

  return (
    <img
      src="/pwa-192x192.png"
      alt="Aven"
      className={`${dimensions} rounded-xl object-cover`}
    />
  );
}
