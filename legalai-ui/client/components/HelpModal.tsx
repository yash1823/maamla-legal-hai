import { useState } from "react";
import { HelpCircle, Search, FileText, Sparkles, Bookmark } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HelpModalProps {
  triggerClassName?: string;
  context?: "search" | "case-detail";
}

export function HelpModal({
  triggerClassName = "",
  context = "search",
}: HelpModalProps) {
  const [open, setOpen] = useState(false);

  const searchHelp = (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">How to Search</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Enter keywords, case names, or legal concepts</li>
          <li>• Use quotation marks for exact phrases: "reasonable doubt"</li>
          <li>• Combine terms with AND/OR: "contract AND breach"</li>
          <li>• Use filters to narrow down by court, year, or citations</li>
        </ul>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Understanding Results</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Results are ranked by relevance to your search</li>
          <li>• Citation count shows how often the case is referenced</li>
          <li>• Click any case to view the full judgment</li>
          <li>• Use filters to refine your search results</li>
        </ul>
      </div>
    </div>
  );

  const caseDetailHelp = (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Reading Judgments</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Full judgment text is displayed with proper formatting</li>
          <li>
            • Use your browser's search (Ctrl/Cmd + F) to find specific terms
          </li>
          <li>• Scroll through the document to read the complete case</li>
          <li>• Citation count shows legal importance and precedent value</li>
        </ul>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Summarization</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Click "Summarize Case" to get an AI-generated summary</li>
          <li>• Summaries highlight key facts, legal issues, and decisions</li>
          <li>• Use summaries to quickly understand case relevance</li>
          <li>• Always read the full text for complete understanding</li>
        </ul>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Navigation</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Use "Back to Results" to return to your search</li>
          <li>• Your search results and filters will be preserved</li>
          <li>• Bookmark important cases for later reference</li>
        </ul>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${triggerClassName}`}
        >
          <HelpCircle className="h-4 w-4" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            How to Use Maamla Legal Hai
          </DialogTitle>
          <DialogDescription>
            Learn how to search and explore Indian legal cases effectively
          </DialogDescription>
        </DialogHeader>

        {context === "search" ? searchHelp : caseDetailHelp}

        <div className="mt-6 p-4 bg-legal-blue-light/30 rounded-lg border">
          <h4 className="font-semibold text-legal-blue mb-2">💡 Pro Tips</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Start with broad terms, then use filters to narrow down</li>
            <li>• Check citation counts to find landmark cases</li>
            <li>• Use AI summaries to quickly assess case relevance</li>
            <li>• Combine multiple search terms for better results</li>
          </ul>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={() => setOpen(false)}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
