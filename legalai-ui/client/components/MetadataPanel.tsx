import React from "react";

interface Props {
  metadata: {
    user_query: string;
    modified_query: string;
    summary: string | null;
  } | null;
}

const MetadataPanel: React.FC<Props> = ({ metadata }) => {
  if (!metadata) return <div className="p-4">Loading metadata...</div>;

  return (
    <div className="p-4 border rounded-xl shadow bg-white dark:bg-gray-900 dark:text-white">
      <h2 className="text-xl font-semibold mb-2">Query Metadata</h2>
      <p><strong>User Query:</strong> {metadata.user_query}</p>
      <p><strong>Modified Query:</strong> {metadata.modified_query}</p>
      <div className="mt-4">
        <h3 className="font-semibold">Summary</h3>
        <p>{metadata.summary || "No summary generated yet."}</p>
      </div>
    </div>
  );
};

export default MetadataPanel;
