// src/pages/ReadmePage.jsx
import { useLocation } from "react-router-dom";
import './Readme.css';

export default function ReadmePage() {
  const location = useLocation();
  const { readmes } = location.state || { readmes: [] };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      alert("copied to clipboard");
    });
  };

  const handleDownload = (content, repoName) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${repoName}-README.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="readme-page-container">
      <div className="readme-page-header">
        <h1 className="readme-page-title">
          <span className="readme-page-icon">📚</span>
          Generated READMEs
        </h1>
        <p className="readme-page-subtitle">
          Your AI-generated README files are ready for use
        </p>
      </div>

      {readmes.length > 0 ? (
        <div className="readme-list">
          {readmes.map((readme, index) => (
            <div key={readme.repo} className="readme-item card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="readme-item-header">
                <div className="readme-item-title-section">
                  <h2 className="readme-item-title">{readme.repo}</h2>
                  <span className="readme-item-status">✅ Generated</span>
                </div>
                
                <div className="readme-item-actions">
                  <button
                    onClick={() => handleCopy(readme.content)}
                    className="btn-secondary btn-sm"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => handleDownload(readme.content, readme.repo)}
                    className="btn-primary btn-sm"
                  >
                    💾 Download
                  </button>
                </div>
              </div>
              
              <div className="readme-item-content">
                <pre className="readme-item-text">
                  {readme.content}
                </pre>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h2 className="empty-state-title">No READMEs Found</h2>
          <p className="empty-state-description">
            Go back and generate some README files for your repositories.
          </p>
          <button 
            onClick={() => window.history.back()} 
            className="btn-primary"
          >
            ← Go Back
          </button>
        </div>
      )}
    </div>
  );
}
