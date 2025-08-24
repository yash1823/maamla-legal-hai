import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalResults: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalResults,
  pageSize,
  hasNext,
  hasPrev,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(totalResults / pageSize);
  const currentPageDisplay = currentPage + 1; // Convert from 0-based to 1-based

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range: number[] = [];
    const rangeWithDots: (number | "ellipsis")[] = [];

    // Calculate start and end of visible range
    const start = Math.max(1, currentPageDisplay - delta);
    const end = Math.min(totalPages, currentPageDisplay + delta);

    // Always show first page
    if (start > 1) {
      range.push(1);
      if (start > 2) {
        range.push(-1); // placeholder for ellipsis
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Always show last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        range.push(-1); // placeholder for ellipsis
      }
      range.push(totalPages);
    }

    // Convert placeholders to ellipsis
    range.forEach((page, index) => {
      if (page === -1) {
        rangeWithDots.push("ellipsis");
      } else {
        rangeWithDots.push(page);
      }
    });

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex items-center justify-between space-x-2", className)}>
      {/* Results info */}
      <div className="text-sm text-muted-foreground">
        Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalResults)} of {totalResults.toLocaleString()} results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Number(currentPage) - 1)}
          disabled={!hasPrev}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => (
          page === "ellipsis" ? (
            <div key={`ellipsis-${index}`} className="h-8 w-8 flex items-center justify-center">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <Button
              key={page}
              variant={page === currentPageDisplay ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(Number(page) - 1)} // Convert back to 0-based and ensure number
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          )
        ))}

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Number(currentPage) + 1)}
          disabled={!hasNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function PaginationCompact({
  currentPage,
  totalResults,
  pageSize,
  hasNext,
  hasPrev,
  onPageChange,
  className,
}: PaginationProps) {
  const currentPageDisplay = currentPage + 1;
  const totalPages = Math.ceil(totalResults / pageSize);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="text-sm text-muted-foreground">
        Page {currentPageDisplay} of {totalPages}
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Number(currentPage) - 1)}
          disabled={!hasPrev}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Number(currentPage) + 1)}
          disabled={!hasNext}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
