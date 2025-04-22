from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from backend.github_parser import clone_and_summarize_repo
from backend.llm_generator import generate_readme

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-readme/")
async def generate_readme_api(repo_url: str = Body(...)):
    try:
        summary = clone_and_summarize_repo(repo_url)
        readme = generate_readme(summary)
        return {"readme": readme}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
