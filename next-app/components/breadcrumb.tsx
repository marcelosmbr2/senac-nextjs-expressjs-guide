"use client"

import React from "react"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter((s) => Boolean(s) && s !== "admin" && s !== "customer")

  function renderSeparator(index: number) {
    if (index + 1 < segments.length) {
      return <BreadcrumbSeparator className="hidden md:block" />
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.length > 0 && (
          <BreadcrumbSeparator className="hidden md:block" />
        )}
        {segments.map((routename: string, index: number) => (
          <React.Fragment key={routename}>
            <BreadcrumbItem>
              <BreadcrumbPage>{routename}</BreadcrumbPage>
            </BreadcrumbItem>
            {renderSeparator(index)}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
