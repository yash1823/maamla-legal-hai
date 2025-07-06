import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Scale,
  Quote,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    if (!docid) {
      setError("No case ID provided.");
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
        err instanceof Error ? err.message : "Failed to load case details"
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
    navigate(-1);
  };

  const handleSummarize = async () => {
    if (!docid) return;
    setIsSummarizing(true);
    try {
      const data = await summarizeCase(docid);
      setSummary(data.summary);
    } catch (e) {
      setSummary("Failed to summarize the case.");
    } finally {
      setIsSummarizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>

        <div className="text-center py-20">
          <FileText className="h-12 w-12 text-muted-foreground mb-3 mx-auto" />
          <h2 className="text-xl font-medium mb-1">Case Not Found</h2>
          <p className="text-muted-foreground">No details available for this case.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      {/* Back Navigation */}
      <Button
        variant="outline"
        onClick={handleBack}
        className="flex items-center gap-2 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Results
      </Button>

      {/* Case Overview Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-2xl font-semibold">
              {caseDetail.title}
            </CardTitle>
            <Badge variant="secondary">{caseDetail.citation_count} citations</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              {caseDetail.court}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(caseDetail.publish_date)}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Full Judgment */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Quote className="h-5 w-5" />
            Full Judgment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="legal-content legal-scroll max-h-[75vh] overflow-y-auto prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: caseDetail.clean_doc }}
          />
        </CardContent>
      </Card>

      {/* Summarize Section */}
      <div className="mt-6">
        <Button
          onClick={handleSummarize}
          disabled={isSummarizing}
          className="flex items-center gap-2 mb-4"
        >
          <Sparkles className="h-4 w-4" />
          {isSummarizing ? "Summarizing..." : "Summarize Case"}
        </Button>

        {summary && (
          <div className="prose dark:prose-invert p-4 border rounded bg-muted/30">
            <strong>Summary:</strong>
            <p>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
