// ResultsList.tsx
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
      <div className="text-center py-20">
        <FileSearch className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-medium">Search Indian Legal Cases</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Enter a query above to explore judgments and precedents.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-20">
        <FileSearch className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-medium">No Results Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Try different keywords or remove filters.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-foreground">
        Search Results
        <span className="ml-2 text-sm text-muted-foreground">
          ({results.length} found)
        </span>
      </h2>

      <div className="grid gap-6">
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
    </div>
  );
}
