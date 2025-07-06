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
import type { CaseResult } from "@shared/api";
import { getRelevance } from "@/lib/api";

interface CaseCardProps {
  case: CaseResult;
  onViewDetails: (docid: string) => void;
  userQuery?: string;
}

export function CaseCard({ case: caseData, onViewDetails, userQuery }: CaseCardProps) {
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
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1 line-clamp-2">
              {caseData.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Scale className="h-4 w-4" />
                {caseData.docsource}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(caseData.date)}
              </div>
            </div>
          </div>
          <Badge variant="secondary">{caseData.numcites} cites</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-4">
          {caseData.snippet}
        </p>

        <div className="mt-3 space-y-2">
          {/*
          <Button
            variant="outline"
            size="sm"
            onClick={handleRelevance}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            {isLoading ? "Loading..." : "Why is this relevant?"}
          </Button>

          {relevance && (
            <div className="text-xs mt-2 p-2 border rounded bg-muted/30 prose dark:prose-invert">
              <strong>Relevance:</strong>
              <p>{relevance}</p>
            </div>
          )}
          */}
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          onClick={() => onViewDetails(caseData.docid)}
          className="w-full flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
