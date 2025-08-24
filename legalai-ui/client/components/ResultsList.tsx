// ResultsList.tsx
import { AlertCircle, FileSearch } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchLoader } from "@/components/ui/enhanced-loader";
import { CaseCard } from "./CaseCard";
import { Pagination, PaginationCompact } from "@/components/ui/pagination";
import { useIsMobile } from "@/hooks/use-mobile";
import type { CaseResult, PaginationInfo } from "@shared/api";

interface ResultsListProps {
  results: CaseResult[];
  pagination?: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onViewDetails: (docid: string) => void;
  onPageChange?: (page: number) => void;
}

export function ResultsList({
  results,
  pagination,
  isLoading,
  error,
  searchQuery,
  onViewDetails,
  onPageChange,
}: ResultsListProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return <SearchLoader query={searchQuery} />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Search Error:</strong> {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!searchQuery) {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        <FileSearch className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-lg sm:text-xl font-medium">
          Search Indian Legal Cases
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
          Enter a query above to explore judgments and precedents.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 sm:py-20 px-4">
        <FileSearch className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-lg sm:text-xl font-medium">No Results Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
          Try different keywords or remove filters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Search Results
          {pagination && (
            <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
              ({pagination.total_results.toLocaleString()} found)
            </span>
          )}
          {!pagination && (
            <span className="ml-2 text-xs sm:text-sm text-muted-foreground">
              ({results.length} found)
            </span>
          )}
        </h2>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {results.map((caseData) => (
          <CaseCard
            key={caseData.docid}
            case={{
              ...caseData,
              docsource: caseData.docsource || "Unknown Court",
            }}
            userQuery={searchQuery}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination && onPageChange && pagination.total_results > pagination.page_size && (
        <div className="mt-8">
          {isMobile ? (
            <PaginationCompact
              currentPage={pagination.current_page}
              totalResults={pagination.total_results}
              pageSize={pagination.page_size}
              hasNext={pagination.has_next}
              hasPrev={pagination.has_prev}
              onPageChange={onPageChange}
              className="justify-center"
            />
          ) : (
            <Pagination
              currentPage={pagination.current_page}
              totalResults={pagination.total_results}
              pageSize={pagination.page_size}
              hasNext={pagination.has_next}
              hasPrev={pagination.has_prev}
              onPageChange={onPageChange}
              className="justify-center"
            />
          )}
        </div>
      )}
    </div>
  );
}
