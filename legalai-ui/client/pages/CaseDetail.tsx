import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Scale,
  Quote,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookmarkButton } from "@/components/BookmarkButton";
import { getCaseDetail, summarizeCase } from "@/lib/api";
import type { CaseDetail } from "@shared/api";

function transformCaseDetail(raw: any): CaseDetail {
  return {
    title: raw.title,
    citation_count: raw.numcites || 0,
    court: raw.docsource || "Unknown Court",
    date: raw.date || raw.publishdate || "",
    publish_date: raw.publishdate || "",
    clean_doc: raw.doc || "No document found",
  };
}

export default function CaseDetailPage() {
  const { docid } = useParams<{ docid: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    if (!docid) {
      setError("No case ID provided");
      setIsLoading(false);
      return;
    }

    fetchCaseDetail(docid);
  }, [docid]);

  const fetchCaseDetail = async (caseId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const raw = await getCaseDetail(caseId);
      const transformed = transformCaseDetail(raw);
      setCaseDetail(transformed);
    } catch (err) {
      console.error("Error fetching case detail:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load case details",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleBack = () => {
    // If we have search state, navigate back to search page with restored state
    if (location.state?.searchState) {
      navigate("/", { state: { searchState: location.state.searchState } });
    } else {
      navigate(-1);
    }
  };

  const handleSummarize = async () => {
    if (!docid) return;
    setIsSummarizing(true);
    try {
      const data = await summarizeCase(docid);
      setSummary(data.summary);
    } catch (e) {
      setSummary("Failed to summarize.");
    } finally {
      setIsSummarizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex flex-col items-center justify-center py-12 sm:py-24 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm sm:text-base">
              Loading case details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="mb-4 sm:mb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 text-sm sm:text-base"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Results</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          <Alert variant="destructive" className="max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Results
            </Button>
          </div>
          <div className="text-center py-24">
            <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-foreground mb-2">
              Case Not Found
            </h2>
            <p className="text-muted-foreground">
              The requested case could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        {/* Navigation */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2 text-sm sm:text-base"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Results</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Case Header */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <CardTitle className="text-lg sm:text-2xl font-bold leading-tight flex-1">
                  {caseDetail.title}
                </CardTitle>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Badge
                    variant="secondary"
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                  >
                    {caseDetail.citation_count} citations
                  </Badge>
                  <BookmarkButton
                    docid={docid!}
                    title={caseDetail.title}
                    court={caseDetail.court}
                    date={caseDetail.publish_date}
                    className="text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-medium text-sm sm:text-base">
                    {caseDetail.court}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">
                    Published {formatDate(caseDetail.publish_date)}
                  </span>
                </div>
              </div>

              {/* Summarize Button at the top */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  size="lg"
                  className="bg-legal-blue hover:bg-legal-blue/90 w-full sm:w-auto text-sm sm:text-base"
                >
                  {isSummarizing ? "Summarizing..." : "✨ Summarize Case"}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Display */}
        {summary && (
          <Card className="mb-8 bg-legal-blue-light/30 border-legal-blue/20">
            <CardHeader>
              <CardTitle className="text-lg text-legal-blue">
                Case Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert">{summary}</div>
            </CardContent>
          </Card>
        )}

        {/* Case Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Quote className="h-5 w-5" />
              Full Judgment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="legal-content legal-scroll max-h-screen overflow-y-auto prose dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: caseDetail.clean_doc }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
