import os
import tempfile
from git import Repo

def clone_and_summarize_repo(repo_url: str) -> str:
    with tempfile.TemporaryDirectory() as tmpdir:
        Repo.clone_from(repo_url, tmpdir)
        summary = ""
        for root, dirs, files in os.walk(tmpdir):
            for file in files:
                path = os.path.join(root, file)
                if file.endswith((".py", ".js", ".ts", ".md", ".json")):
                    with open(path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        summary += f"\n\nFile: {file}\n{content[:500]}"
        return summary[:4000]  



def detect_stack(tmpdir):
    files = os.listdir(tmpdir)
    if 'package.json' in files:
        return 'Node.js'
    elif 'manage.py' in files:
        return 'Django'
    elif 'requirements.txt' in files:
        return 'Python'
    elif 'app.jsx' in files or 'App.jsx' in files:
        return 'React'
    return 'General'


