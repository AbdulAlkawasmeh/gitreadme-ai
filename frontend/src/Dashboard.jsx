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
      alert("❌ Failed to generate READMEs");
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("README copied to clipboard ✅");
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
    <div className="homepage-container">
      <UserButton afterSignOutUrl="/" />
      <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard 👋</h1>

      {loadingRepos ? (
        <p>Loading repos...</p>
      ) : (
        <>
          <h2 className="text-xl mb-4">Select your GitHub Repos:</h2>
          <ul className="repo-grid">
            {repos.map((repo) => (
              <li key={repo.id} className="repo-card">
                <input
                  type="checkbox"
                  checked={selectedRepos.includes(repo.name)}
                  onChange={() => toggleSelectRepo(repo.name)}
                  className="mr-2"
                />
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {repo.name}
                </a>
              </li>
            ))}
          </ul>

          <button
            onClick={handleGenerateReadmes}
            disabled={loadingGenerate}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 mt-4"
          >
            {loadingGenerate ? "Generating..." : "Generate READMEs"}
          </button>

          {Object.keys(generatedReadmes).length > 0 && (
            <>
              <h2 className="text-2xl font-semibold mt-10 mb-6">📄 Generated READMEs</h2>
              <div className="readme-grid">
                {Object.entries(generatedReadmes).map(([repoName, content]) => (
                  <div key={repoName} className="readme-card">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold">{repoName}</h3>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleCopy(content)}
                          className="text-sm bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                        >
                          📋 Copy
                        </button>
                        <button
                          onClick={() => handleDownload(content, repoName)}
                          className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          💾 Download
                        </button>
                        <button
                          onClick={() => setPreviewContent(content)}
                          className="text-sm bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
                        >
                          👁️ Preview
                        </button>
                      </div>
                    </div>
                    <pre style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      maxHeight: "400px",
                      overflowY: "auto",
                      padding: "1rem",
                      backgroundColor: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "0.875rem"
                    }}>
                      {content}
                    </pre>
                  </div>
                ))}
              </div>
            </>
          )}

          {previewContent && (
            <div className="modal-overlay">
              <div className="modal">
                <button
                  onClick={() => setPreviewContent(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded"
                >
                  ❌ Close
                </button>
                <h2 className="text-xl font-bold mb-4">👁️ Preview</h2>
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
