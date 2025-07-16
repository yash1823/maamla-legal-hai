// CaseCard.tsx
import { useState } from "react";
import { Calendar, FileText, Scale, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RelevanceLoader } from "@/components/ui/enhanced-loader";
import { BookmarkButton } from "./BookmarkButton";
import type { CaseResult } from "@shared/api";
import { getRelevance } from "@/lib/api";

interface CaseCardProps {
  case: CaseResult;
  onViewDetails: (docid: string) => void;
  userQuery?: string;
}

export function CaseCard({
  case: caseData,
  onViewDetails,
  userQuery,
}: CaseCardProps) {
  const [relevance, setRelevance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleRelevance = async () => {
    if (!userQuery) {
      setRelevance("No search query provided.");
      return;
    }
    setIsLoading(true);
    setRelevance(null);
    try {
      const data = await getRelevance(userQuery, caseData.docid);
      setRelevance(data.explanation);
    } catch {
      setRelevance("Could not fetch relevance.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md border-l-4 border-primary/30">
      <CardHeader className="pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2">
              {caseData.title}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Scale className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">{caseData.docsource}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                {formatDate(caseData.date)}
              </div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-xs sm:text-sm self-start sm:self-auto"
          >
            {caseData.numcites} cites
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0 px-3 sm:px-6">
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 sm:line-clamp-4">
          {caseData.snippet}
        </p>

        <div className="mt-3 space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRelevance}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-xs sm:text-sm h-8 sm:h-9"
                >
                  {isLoading ? (
                    <RelevanceLoader query={userQuery} />
                  ) : (
                    <>
                      <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">
                        Why is this relevant?
                      </span>
                      <span className="sm:hidden">Relevance</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm">
                <div className="text-sm">
                  <p className="font-medium mb-1">AI Relevance Analysis</p>
                  <p>
                    Get an AI explanation of how this case relates to your
                    search query{userQuery ? `: "${userQuery}"` : "."}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {relevance && (
            <div className="text-xs mt-2 p-2 border rounded bg-muted/30 prose dark:prose-invert">
              <strong>Relevance:</strong>
              <p>{relevance}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 flex gap-2 px-3 sm:px-6 pb-3 sm:pb-6">
        <Button
          onClick={() => onViewDetails(caseData.docid)}
          className="flex-1 flex items-center gap-2 h-8 sm:h-10 text-xs sm:text-sm"
        >
          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">View Details</span>
          <span className="sm:hidden">View</span>
        </Button>
        <BookmarkButton
          docid={caseData.docid}
          title={caseData.title}
          court={caseData.docsource}
          date={caseData.date}
          className="h-8 sm:h-10 px-2 sm:px-3"
        />
      </CardFooter>
    </Card>
  );
}
