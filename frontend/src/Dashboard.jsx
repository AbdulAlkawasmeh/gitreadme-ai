// src/pages/Dashboard.jsx
import { useUser, UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useUser();
  const [repos, setRepos] = useState([]);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [generatedReadmes, setGeneratedReadmes] = useState({});
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      if (user && user.externalAccounts?.length > 0) {
        const githubAccount = user.externalAccounts.find(
          (acc) => acc.provider === "github"
        );
        if (githubAccount) {
          const username = githubAccount.username;
          console.log(`🎉 GitHub Username: ${username}`);

          try {
            setLoadingRepos(true);
            const response = await axios.get(
              `https://api.github.com/users/${username}/repos`
            );
            setRepos(response.data);
          } catch (err) {
            console.error("GitHub fetch error:", err);
          } finally {
            setLoadingRepos(false);
          }
        }
      }
    };

    fetchRepos();
  }, [user]);

  const toggleSelectRepo = (repoName) => {
    setSelectedRepos((prev) =>
      prev.includes(repoName)
        ? prev.filter((name) => name !== repoName)
        : [...prev, repoName]
    );
  };

  const handleGenerateReadmes = async () => {
    if (selectedRepos.length === 0) {
      alert("Please select at least one repo!");
      return;
    }

    try {
      setLoadingGenerate(true);
      const readmes = {};
      for (const repoName of selectedRepos) {
        const response = await axios.post(
          "https://gitreadme-ai.onrender.com/generate-readme/",
          {
            github_url: `https://github.com/${user.externalAccounts.find(
              (acc) => acc.provider === "github"
            ).username}/${repoName}`,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        readmes[repoName] = response.data.readme;
      }
      setGeneratedReadmes(readmes);
    } catch (err) {
      console.error("Error generating READMEs:", err);
      alert(" Failed to generate READMEs");
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("copied to clipboard");
    });
  };

  const handleDownload = (text, repoName) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${repoName}-README.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            Welcome to your Dashboard
            <span className="dashboard-emoji">🚀</span>
          </h1>
          <p className="dashboard-subtitle">
            Select repositories to generate professional README files
          </p>
        </div>
        <div className="user-section">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {loadingRepos ? (
        <div className="loading-section">
          <div className="spinner-large"></div>
          <p className="loading-text">Loading your repositories...</p>
        </div>
      ) : (
        <>
          <div className="repos-section">
            <h2 className="section-title">
              <span className="section-icon">📁</span>
              Select Repositories
            </h2>
            <p className="section-subtitle">
              Choose which repositories you'd like to generate READMEs for
            </p>
            
            <div className="repo-grid">
              {repos.map((repo) => (
                <div key={repo.id} className={`repo-card ${selectedRepos.includes(repo.name) ? 'selected' : ''}`}>
                  <div className="repo-checkbox">
                    <input
                      type="checkbox"
                      id={`repo-${repo.id}`}
                      checked={selectedRepos.includes(repo.name)}
                      onChange={() => toggleSelectRepo(repo.name)}
                      className="repo-checkbox-input"
                    />
                    <label htmlFor={`repo-${repo.id}`} className="repo-checkbox-label"></label>
                  </div>
                  
                  <div className="repo-content">
                    <div className="repo-header">
                      <h3 className="repo-name">{repo.name}</h3>
                      <span className="repo-visibility">{repo.private ? '🔒' : '🌐'}</span>
                    </div>
                    
                    {repo.description && (
                      <p className="repo-description">{repo.description}</p>
                    )}
                    
                    <div className="repo-meta">
                      <span className="repo-language">{repo.language || 'No language'}</span>
                      <span className="repo-stars">⭐ {repo.stargazers_count}</span>
                    </div>
                    
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-link"
                    >
                      View on GitHub →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="action-section">
              <button
                onClick={handleGenerateReadmes}
                disabled={loadingGenerate || selectedRepos.length === 0}
                className={`generate-button ${loadingGenerate ? 'loading' : ''}`}
              >
                {loadingGenerate ? (
                  <>
                    <div className="spinner"></div>
                    Generating {selectedRepos.length} README{selectedRepos.length !== 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    ✨ Generate {selectedRepos.length} README{selectedRepos.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
              
              {selectedRepos.length > 0 && (
                <p className="selection-count">
                  {selectedRepos.length} repository{selectedRepos.length !== 1 ? 'ies' : 'y'} selected
                </p>
              )}
            </div>
          </div>

          {Object.keys(generatedReadmes).length > 0 && (
            <div className="results-section animate-fade-in">
              <div className="results-header">
                <h2 className="results-title">
                  <span className="results-icon">✨</span>
                  Generated READMEs
                </h2>
                <p className="results-subtitle">
                  Your AI-generated README files are ready!
                </p>
              </div>
              
              <div className="readme-grid">
                {Object.entries(generatedReadmes).map(([repoName, content]) => (
                  <div key={repoName} className="readme-card card">
                    <div className="readme-card-header">
                      <div className="readme-title-section">
                        <h3 className="readme-card-title">{repoName}</h3>
                        <span className="readme-status">✅ Generated</span>
                      </div>
                      
                      <div className="readme-actions">
                        <button
                          onClick={() => handleCopy(content)}
                          className="btn-secondary btn-sm"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={() => handleDownload(content, repoName)}
                          className="btn-primary btn-sm"
                        >
                          💾 Download
                        </button>
                        <button
                          onClick={() => setPreviewContent(content)}
                          className="btn-purple btn-sm"
                        >
                          👁️ Preview
                        </button>
                      </div>
                    </div>
                    
                    <div className="readme-card-content">
                      <pre className="readme-preview">
                        {content}
                      </pre>
                    </div>
                  </div>
                ))}
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
        </>
      )}
    </div>
  );
}
