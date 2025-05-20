from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from github_parser import clone_and_summarize_repo
from readme_generator import generate_readme
from dotenv import load_dotenv
import os
load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://gitreadme-ai1.onrender.com/genera"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
 
class GenerateReadmeRequest(BaseModel):
    github_url: str

github_access_token = None

@app.get("/")
async def root():
    return 

@app.post("/github/callback")
async def github_callback(data: CodeRequest):
    print(f"Received code: {data.code}")
    global github_access_token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "code": data.code,
            },
        )
        github_access_token = token_response.json()["access_token"]
    return {"message": "GitHub token stored"}


@app.get("/github/repos")
async def get_github_repos():
    if not github_access_token:
        raise HTTPException(status_code=401, detail="GitHub not connected")

    async with httpx.AsyncClient() as client:
        repos_response = await client.get(
            "https://api.github.com/user/repos",
            headers={"Authorization": f"Bearer {github_access_token}"}
        )
        return {"repos": repos_response.json()}
        
@app.post("/generate-readme/")
async def generate_readme_endpoint(request: GenerateReadmeRequest):
    try:
        repo_url = request.github_url
        print(f"Cloning and summarizing: {repo_url}")
        summary = clone_and_summarize_repo(repo_url)
        print(f"Summary complete. Generating README...")
        readme = await generate_readme(summary)
        print(f"README generated successfully.")
        return {"readme": readme}
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
