"use client"

import Link from "next/link"
import { ComponentPropsWithoutRef } from "react"

type GoHomeButtonProps = ComponentPropsWithoutRef<"a"> & {
  /** override the label (defaults to “← Home”) */
  label?: string
}

/**
 * A simple “Go Home” button you can drop anywhere.
 */
export default function GoHomeButton({
  label = "← Home",
  className,
  ...anchorProps
}: GoHomeButtonProps) {
  return (
    <Link href="/" legacyBehavior>
      <a
        className={`bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg ${className || ""}`}
        {...anchorProps}
      >
        {label}
      </a>
    </Link>
  )
}
