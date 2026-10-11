import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Trung's signature mark — replaces the old Evil Rabbit logo.
 * Black ink on transparent; invert in dark mode so it stays visible.
 */
export function TrungLogo({
  className,
  alt = "Trung",
  priority = false,
}: {
  className?: string
  alt?: string
  priority?: boolean
}) {
  return (
    <Image
      src="/images/trung-signature.png"
      alt={alt}
      width={480}
      height={292}
      priority={priority}
      className={cn("h-6 w-auto dark:invert", className)}
    />
  )
}
