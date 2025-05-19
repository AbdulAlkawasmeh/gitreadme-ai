// src/pages/ReadmePage.jsx
import { useLocation } from "react-router-dom";

export default function ReadmePage() {
  const location = useLocation();
  const { readmes } = location.state || { readmes: [] };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Generated READMEs</h1>
      {readmes.length > 0 ? (
        readmes.map((readme) => (
          <div key={readme.repo} className="mb-8 border p-4 rounded bg-gray-50 w-full max-w-4xl">
            <h2 className="text-xl font-semibold mb-2">{readme.repo}</h2>
            <pre className="overflow-x-auto text-sm whitespace-pre-wrap">
              {readme.content}
            </pre>
          </div>
        ))
      ) : (
        <p>No READMEs found. Go back and generate some.</p>
      )}
    </div>
  );
}
