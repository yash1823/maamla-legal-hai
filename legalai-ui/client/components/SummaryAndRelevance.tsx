import React, { useState } from "react";
import axios from "axios";

interface Props {
  docid: string;
}

const SummaryAndRelevance: React.FC<Props> = ({ docid }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [relevance, setRelevance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    const res = await axios.post(`/summarize/${docid}`);
    setSummary(res.data.summary);
    setLoading(false);
  };

  const fetchRelevance = async () => {
    setLoading(true);
    const res = await axios.get(`/relevance/${docid}`);
    setRelevance(res.data.relevance);
    setLoading(false);
  };

  return (
    <div className="mt-4 space-y-4">
      <button onClick={fetchSummary} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Generate Summary
      </button>
      {summary && (
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">{summary}</div>
      )}
      <button onClick={fetchRelevance} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
        Check Relevance
      </button>
      {relevance && (
        <div className="p-3 bg-green-100 dark:bg-green-800 rounded text-sm">{relevance}</div>
      )}
      {loading && <p className="text-gray-500">Processing...</p>}
    </div>
  );
};

export default SummaryAndRelevance;
