import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
  try {
    setLoading(true);
    const response = await axios.post(
      'http://localhost:8000/generate-readme/',
      JSON.stringify({ github_url: repoUrl }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    setReadme(response.data.readme);
  } catch (error) {
    console.error("❌ Error calling backend:", error);
    alert('Something went wrong 😢');
  } finally {
    setLoading(false);
  }
};

  const handleCopy = () => {
    navigator.clipboard.writeText(readme).then(() => {
      alert('README copied to clipboard! ✅');
    });
  };

  const handleDownload = () => {
    const blob = new Blob([readme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-6 font-sans bg-gray-100 text-gray-900">
      <div className="w-full max-w-4xl p-12 rounded-2xl shadow-md bg-white text-center flex flex-col items-center justify-center h-full min-h-[80vh]">
        <h1 className="text-4xl font-bold mb-12">📝 GitREADME Generator</h1>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-12 w-full">
          <input
            type="text"
            placeholder="Enter GitHub repo URL..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="flex-grow px-4 py-3 border rounded-lg w-full max-w-xl"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {loading ? 'Generating...' : 'Generate README'}
          </button>
        </div>

        {readme && (
          <div className="mt-10 text-left w-full">
            <div className="flex justify-end gap-4 mb-6">
              <button
                onClick={handleCopy}
                className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded-lg"
              >
                📋 Copy
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg"
              >
                💾 Download
              </button>
            </div>

            <div className="prose max-w-none p-6 rounded-lg shadow bg-white text-gray-900">
              <ReactMarkdown
                children={readme}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return !inline ? (
                      <SyntaxHighlighter language="javascript" PreTag="div" {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...props}>{children}</code>
                    );
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;