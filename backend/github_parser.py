import os
import tempfile
import json
from git import Repo
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

ALLOWED_EXTENSIONS = (
    ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".go", ".html", ".css", ".json", ".yml", ".yaml"
)
EXCLUDE_DIRS = {
    ".git", "node_modules", "__pycache__", "dist", "build", "venv", ".venv", "env", ".idea", ".vscode"
}

def generate_folder_summary(file_list: list) -> str:
    folders = set()
    for file in file_list:
        parts = file["path"].split("/")[:-1]
        for i in range(1, len(parts)+1):
            folders.add("/".join(parts[:i]))
    return "\n".join(f"- `{t}/`" for t in sorted(folders)) or "*Root project folder only*"

def detect_technologies(file_list: list) -> list:
    tech = set()
    for file in file_list:
        path = file["path"].lower()
        content = file["content"].lower()
        if "package.json" in path or '"react"' in content:
            tech.add("React")
        if "next" in content:
            tech.add("Next.js")
        if "fastapi" in content:
            tech.add("FastAPI")
        if "express" in content or "app.use" in content:
            tech.add("Express.js")
        if "django" in content:
            tech.add("Django")
        if "flask" in content:
            tech.add("Flask")
        if "tailwind" in content:
            tech.add("Tailwind CSS")
        if path.endswith(".ts") or path.endswith(".tsx"):
            tech.add("TypeScript")
        if path.endswith(".py"):
            tech.add("Python")
        if path.endswith(".js") or path.endswith(".jsx"):
            tech.add("JavaScript")
        if path.endswith(".go"):
            tech.add("Go")
    return sorted(list(tech))

def generate_tech_section_with_logos(tech_list):
    devicon_map = {
        "React": "react",
        "Next.js": "nextjs",
        "FastAPI": "fastapi",
        "Express.js": "express",
        "Django": "django",
        "Flask": "flask",
        "Tailwind CSS": "tailwindcss",
        "TypeScript": "typescript",
        "JavaScript": "javascript",
        "Python": "python",
        "Go": "go"
    }
    return "\n".join(
        f'<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/{devicon_map[t]}/{devicon_map[t]}-original.svg" alt="{t}" width="40"/> {t}'
        for t in tech_list if t in devicon_map
    ) or "*Could not detect specific technologies.*"

def clone_and_collect_files(repo_url: str, max_files=30) -> list:
    collected = []
    with tempfile.TemporaryDirectory() as tmpdir:
        Repo.clone_from(repo_url, tmpdir)
        for root, dirs, files in os.walk(tmpdir, topdown=True):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                if file.endswith(ALLOWED_EXTENSIONS):
                    full_path = os.path.join(root, file)
                    relative_path = os.path.relpath(full_path, tmpdir)
                    try:
                        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                            collected.append({
                                "path": relative_path,
                                "content": content[:800],
                            })
                    except Exception:
                        continue
    return collected[:max_files]

def summarize_files_with_llm(file_list: list) -> str:
    file_descriptions = "\n\n".join(f"File: {f['path']}\nCode:\n{f['content']}" for f in file_list)
    prompt = f"""
As a technical writer and senior developer, analyze the following code files and summarize the purpose and functionality of each in concise bullet points.
Return this summary in markdown format with each file name as a subheading.

{file_descriptions}
"""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"File summarization failed: {e}")
        return "*Failed to summarize files.*"
import os
import tempfile
import json
from git import Repo
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

ALLOWED_EXTENSIONS = (
    ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".go", ".html", ".css", ".json", ".yml", ".yaml"
)
EXCLUDE_DIRS = {".git", "node_modules", "__pycache__", "dist", "build", "venv", ".venv", "env", ".idea", ".vscode"}

def generate_folder_summary(file_list: list) -> str:
    folders = set()
    for file in file_list:
        parts = file["path"].split("/")[:-1]  # drop filename
        for i in range(1, len(parts) + 1):
            folders.add("/".join(parts[:i]))
    if not folders:
        return "*Root project folder only*"
    tree = sorted(folders)
    return "\n".join(f"- `{t}/`" for t in tree)

def detect_technologies(file_list: list) -> list:
    tech = set()
    for file in file_list:
        path = file["path"].lower()
        content = file["content"].lower()

        # Infer from file paths or contents
        if "package.json" in path or '"react"' in content:
            tech.add("React")
        if "next" in content:
            tech.add("Next.js")
        if "fastapi" in content:
            tech.add("FastAPI")
        if "express" in content or "app.use" in content:
            tech.add("Express.js")
        if "django" in content:
            tech.add("Django")
        if "flask" in content:
            tech.add("Flask")
        if "tailwind" in content:
            tech.add("Tailwind CSS")
        if path.endswith(".ts") or path.endswith(".tsx"):
            tech.add("TypeScript")
        if path.endswith(".py"):
            tech.add("Python")
        if path.endswith(".js") or path.endswith(".jsx"):
            tech.add("JavaScript")
        if path.endswith(".go"):
            tech.add("Go")

    return sorted(list(tech))

def clone_and_collect_files(repo_url: str, max_files=30) -> list:
    collected = []

    with tempfile.TemporaryDirectory() as tmpdir:
        Repo.clone_from(repo_url, tmpdir)

        for root, dirs, files in os.walk(tmpdir, topdown=True):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                if file.endswith(ALLOWED_EXTENSIONS):
                    full_path = os.path.join(root, file)
                    relative_path = os.path.relpath(full_path, tmpdir)
                    try:
                        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                            content = f.read()
                            collected.append({
                                "path": relative_path,
                                "content": content[:800],
                            })
                    except Exception:
                        continue

    return collected[:max_files]

def build_scoring_prompt(file_list: list) -> str:
    files_block = "\n\n".join(
        f"File: {f['path']}\nContent:\n{f['content']}" for f in file_list
    )

    return f"""
You are a senior software engineer reviewing a codebase.

Here are {len(file_list)} files from a GitHub repository.  
Each file contains a snippet of its code.

Please rank the **top 8 files** that are **most critical to the main logic or functionality** of the project.  
Ignore config, test, or auto-generated files unless they are essential.

Return your response in **valid JSON** in this format:

[
  {{ "file": "path/to/file.py", "score": 9 }},
  ...
]

Here are the files:
{files_block}
"""

def score_files_with_llm(file_list: list) -> list:
    prompt = build_scoring_prompt(file_list)

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        content = response.choices[0].message.content
        parsed = json.loads(content)
        top_files = [f["file"] for f in parsed]
        return [f for f in file_list if f["path"] in top_files]

    except Exception as e:
        print(f"LLM scoring failed: {e}")
        return file_list[:5]
        
def clone_and_summarize_repo(repo_url: str) -> dict:
    """Full pipeline: clone repo → score → return rich summary with title/sections"""
    file_list = clone_and_collect_files(repo_url)
    ranked_files = score_files_with_llm(file_list)

    repo_name = repo_url.rstrip("/").split("/")[-1].replace("-", " ").title()

    file_sections = []
    for file in ranked_files:
        ext = file["path"].split(".")[-1]
        file_sections.append(f"\n\n### 📄 `{file['path']}`\n```{ext}\n{file['content']}\n```")

    file_summary_block = "\n".join(file_sections)

    summary = f"""# 🧠 {repo_name}

A significant source code summary for the `{repo_name}` repository based on logical relevance.

---

## ☁️ Overview

This repository contains multiple components. The following summary highlights the most significant files that contribute to the core logic of the application.

---

## 🧾 Key Files (Auto-Ranked by LLM)

{file_summary_block}

---

## 🧠 Core Logic Insight

These files likely represent the most meaningful areas of the codebase — such as routing, data models, main frontend components, or application logic. Less relevant files like config, tests, or generated assets have been excluded.

---

## 🗂️ Folder Structure (Implied from Paths)

{generate_folder_summary(ranked_files)}

---

"""
    return {
        "summary": summary[:4000]  # Safe for LLM input
    }






def generate_folder_summary(file_list: list) -> str:
    folders = set()
    for file in file_list:
        parts = file["path"].split("/")[:-1]  # drop filename
        for i in range(1, len(parts)+1):
            folders.add("/".join(parts[:i]))
    if not folders:
        return "*Root project folder only*"

    tree = sorted(folders)
    return "\n".join(f"- `{t}/`" for t in tree)
