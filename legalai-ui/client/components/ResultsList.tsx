import { AlertCircle, FileSearch, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CaseCard } from "./CaseCard";
import type { CaseResult } from "@shared/api";

interface ResultsListProps {
  results: CaseResult[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onViewDetails: (docid: string) => void;
}

export function ResultsList({
  results,
  isLoading,
  error,
  searchQuery,
  onViewDetails,
}: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Searching legal cases...</p>
      </div>
    );
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
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <FileSearch className="h-16 w-16 text-muted-foreground/50" />
        <div>
          <h3 className="text-xl font-medium text-foreground mb-2">
            Search Indian Legal Cases
          </h3>
          <p className="text-muted-foreground max-w-md">
            Enter your search query above to find relevant legal cases,
            judgments, and precedents from Indian courts.
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
        <FileSearch className="h-16 w-16 text-muted-foreground/50" />
        <div>
          <h3 className="text-xl font-medium text-foreground mb-2">
            No Results Found
          </h3>
          <p className="text-muted-foreground max-w-md">
            We couldn't find any cases matching your search criteria. Try
            adjusting your search terms or filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Search Results
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({results.length} {results.length === 1 ? "case" : "cases"} found)
          </span>
        </h2>
      </div>

      <div className="grid gap-6">
        {results.map((caseData) => (
          <CaseCard
            key={caseData.docid}
            case={caseData}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {results.length >= 5 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Showing top {results.length} results. Refine your search for more
            specific results.
          </p>
        </div>
      )}
    </div>
  );
}
