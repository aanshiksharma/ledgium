"use client"

import { useEffect, useMemo } from "react"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import { useIsMobile } from "@/hooks/use-mobile"

import { useExpenses } from "@/features/expenses"

export function ExpensePagination() {
  const { total, filters, setFilters } = useExpenses()
  const isMobile = useIsMobile()

  useEffect(() => {
    setFilters((prev) => ({ ...prev, offset: 0 }))
  }, [filters.limit])

  const pageCount = useMemo(() => Math.ceil(total / filters.limit), [filters])
  const currentPage = useMemo(
    () => (filters.offset + filters.limit) / filters.limit,
    [filters]
  )

  return (
    <section
      className={`flex items-center justify-between gap-4 text-sm ${isMobile ? "flex-col-reverse" : ""}`}
    >
      <div
        className={`flex items-center justify-center gap-4 text-secondary-foreground ${isMobile ? "flex-1" : ""}`}
      >
        <p>
          {filters.offset + 1}-{Math.min(filters.offset + filters.limit, total)}{" "}
          of {total}
        </p>

        <Label>Rows per page</Label>
        <Select
          name="offset"
          defaultValue={String(filters.limit)}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, limit: Number(value) }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Pagination className={`items-center gap-4 ${isMobile ? "flex-1" : ""}`}>
        {pageCount > 5 && (
          <p>
            Page {currentPage} of {pageCount}
          </p>
        )}

        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={filters.offset === 0}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: prev.offset - prev.limit,
                }))
              }
            />
          </PaginationItem>

          {Array.from(new Array(pageCount)).map((_, index) => {
            if (pageCount > 5 && index === 2)
              return (
                <PaginationItem key={index}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            if (
              (pageCount > 5 && (index < 2 || index > pageCount - 3)) ||
              pageCount < 6
            )
              return (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={
                      Math.floor(filters.offset / filters.limit) === index
                    }
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        offset: filters.limit * index,
                      }))
                    }
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              )
          })}

          <PaginationItem>
            <PaginationNext
              disabled={
                Math.min(filters.offset + filters.limit, total) !==
                filters.offset + filters.limit
              }
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  offset: prev.offset + prev.limit,
                }))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </section>
  )
}
