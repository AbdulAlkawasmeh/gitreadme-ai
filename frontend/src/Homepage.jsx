// src/pages/HomePage.jsx
import './Homepage.css';
import { SignInButton } from '@clerk/clerk-react';
import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Typewriter } from "react-simple-typewriter";

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [readme, setReadme] = useState('');
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

  const handleGenerateCustom = async () => {
    if (!repoUrl) {
      alert("Please enter a GitHub repo URL!");
      return;
    }

    setLoadingCustom(true);
    try {
      const response = await axios.post(
        'https://gitreadme-ai.onrender.com/generate-readme/',
        { github_url: repoUrl },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setReadme(response.data.readme);
      setTimeout(() => {
        document.getElementById("custom-readme")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } catch (err) {
      console.error(err);
      alert("Failed to generate README");
    } finally {
      setLoadingCustom(false);
    }
  };

  const handleGithubLoginClick = () => {
    setLoadingGithub(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(readme).then(() => {
      alert("copied to clipboard");
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
    <div className="homepage-container">
      <h1 className="text-4xl font-bold mb-4">GitREADME Generator</h1>

      <div className="homepage-typing-text">
        <Typewriter
          words={['Tired of writing README files? 🤯', 'We have the solution for you... 🚀']}
          loop={false}
          cursor
          cursorStyle="|"
          typeSpeed={70}
          deleteSpeed={50}
          delaySpeed={1500}
        />
      </div>

      <div className="homepage-cards">
        <div className="homepage-card">
          <h2 className="text-2xl font-semibold mb-4">Paste GitHub Repo URL</h2>
          <input
            type="text"
            placeholder="https://github.com/username/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full border rounded px-4 py-2 mb-4"
          />
          <button
            onClick={handleGenerateCustom}
            disabled={loadingCustom}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 w-full"
          >
            {loadingCustom ? "Generating..." : "Generate README"}
          </button>
        </div>

        <div className="homepage-card">
          <h2 className="text-2xl font-semibold mb-4">Login with GitHub/GitLab</h2>
          <SignInButton mode="modal">
            <button
              onClick={handleGithubLoginClick}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full"
            >
              {loadingGithub ? "Redirecting..." : "Login & Fetch Repos"}
            </button>
          </SignInButton>
        </div>
      </div>

      {readme && (
        <div id="custom-readme" className="homepage-readme">
          <h2 className="text-2xl font-bold mb-6">Generated README</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleCopy}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >
              Copy
            </button>
            <button
              onClick={handleDownload}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Download
            </button>
            <button
              onClick={() => setPreviewContent(readme)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              Preview
            </button>
          </div>

          <div className="prose max-w-none">
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              maxWidth: '100%',
              overflowWrap: 'break-word'
            }}>
              {readme}
            </pre>
          </div>
        </div>
      )}

      {previewContent && (
        <div className="modal-overlay">
          <div className="modal">
            <button
              onClick={() => setPreviewContent(null)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              Close
            </button>
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            <div className="preview-content">
              <ReactMarkdown>{previewContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
