import { Calendar, FileText, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CaseResult } from "@shared/api";

interface CaseCardProps {
  case: CaseResult;
  onViewDetails: (docid: string) => void;
}

export function CaseCard({ case: caseData, onViewDetails }: CaseCardProps) {
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

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground mb-2">
              {caseData.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Scale className="h-4 w-4" />
                <span className="truncate">{caseData.docsource}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(caseData.date)}</span>
              </div>
            </div>
          </div>
          {caseData.numcites !== undefined && (
            <Badge variant="secondary" className="shrink-0">
              {caseData.numcites} citations
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        <div className="text-sm text-muted-foreground leading-relaxed">
          <p className="line-clamp-4">{caseData.snippet}</p>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          onClick={() => onViewDetails(caseData.docid)}
          className="w-full flex items-center gap-2"
          variant="default"
        >
          <FileText className="h-4 w-4" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
