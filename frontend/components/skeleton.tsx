type SkeletonProps = {
  className?: string;
  variant?: "default" | "sky-dark" | "sky-light";
};

const VARIANT_CLASSES: Record<NonNullable<SkeletonProps["variant"]>, string> = {
  default: "bg-gray-200",
  "sky-dark": "bg-sky-400",   // for the header row (sky-500 background)
  "sky-light": "bg-sky-200",  // for body rows (sky-300 background)
};

export default function Skeleton({
  className = "",
  variant = "default",
}: SkeletonProps) {
  return (
    <div
      className={`${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}