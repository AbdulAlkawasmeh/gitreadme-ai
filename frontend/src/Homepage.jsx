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
      {/* Hero Section */}
      <div className="hero-section animate-fade-in">
        <div className="hero-content">
          <h1 className="hero-title">
            GitREADME Generator
            <span className="hero-emoji">📝</span>
          </h1>
          <p className="hero-subtitle">
            Transform your GitHub repositories into professional README files with AI
          </p>
          
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
        </div>
      </div>

      {/* Action Cards */}
      <div className="homepage-cards">
        <div className="homepage-card card animate-fade-in">
          <div className="card-icon">🔗</div>
          <h2 className="card-title">Quick Generate</h2>
          <p className="card-description">
            Paste any GitHub repository URL and get an instant README
          </p>
          <div className="input-group">
            <input
              type="text"
              placeholder="https://github.com/username/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="repo-input"
            />
            <button
              onClick={handleGenerateCustom}
              disabled={loadingCustom}
              className={`btn-success w-full ${loadingCustom ? 'animate-pulse' : ''}`}
            >
              {loadingCustom ? (
                <>
                  <div className="spinner"></div>
                  Generating...
                </>
              ) : (
                <>
                  ✨ Generate README
                </>
              )}
            </button>
          </div>
        </div>

        <div className="homepage-card card animate-fade-in">
          <div className="card-icon">👤</div>
          <h2 className="card-title">Bulk Generate</h2>
          <p className="card-description">
            Login with GitHub to generate READMEs for multiple repositories
          </p>
          <SignInButton mode="modal">
            <button
              onClick={handleGithubLoginClick}
              className={`btn-primary w-full ${loadingGithub ? 'animate-pulse' : ''}`}
            >
              {loadingGithub ? (
                <>
                  <div className="spinner"></div>
                  Redirecting...
                </>
              ) : (
                <>
                  🚀 Login & Fetch Repos
                </>
              )}
            </button>
          </SignInButton>
        </div>
      </div>

      {readme && (
        <div id="custom-readme" className="homepage-readme animate-fade-in">
          <div className="readme-header">
            <h2 className="readme-title">✨ Generated README</h2>
            <p className="readme-subtitle">Your AI-generated README is ready!</p>
          </div>
          
          <div className="action-buttons">
            <button
              onClick={handleCopy}
              className="btn-secondary"
            >
              📋 Copy
            </button>
            <button
              onClick={handleDownload}
              className="btn-success"
            >
              💾 Download
            </button>
            <button
              onClick={() => setPreviewContent(readme)}
              className="btn-purple"
            >
              👁️ Preview
            </button>
          </div>

          <div className="readme-content">
            <pre className="readme-text">
              {readme}
            </pre>
          </div>
        </div>
      )}

      {previewContent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">📖 README Preview</h2>
              <button
                onClick={() => setPreviewContent(null)}
                className="btn-danger modal-close"
              >
                ✕ Close
              </button>
            </div>
            <div className="preview-content">
              <ReactMarkdown>{previewContent}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
