import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)
def generate_readme(summary_data: dict, tone: str = "Professional") -> str:
    project_summary = summary_data.get("summary", "")
    project_stack = summary_data.get("project_stack", "General")

    prompt = f"""
    You are a highly skilled technical writer and GitHub README.md generator.

    Act as if you are creating a professional-quality README for a **{project_stack}** project.

    Write in a **{tone} tone**. Use **markdown formatting**, headers, lists, and add **emojis** to make it visually appealing. 

    Additionally, add **Shields.io badges with logos for the tech stack** under the **"Tech Stack"** section.  
    Example badge format:
    `![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)`

    You are explaining this to both **developers and curious tech enthusiasts**.

    - include a detailed breakdown of the system architecture
    - Summarize top logic-heavy files (name, purpose, logic)
    - Detect technologies/frameworks and show them as badges
    - If possible, extract the main author or top contributors from git logs or metadata


    The README should include the following sections (all are mandatory for each repo):

    1. 📌 Project Title and Description  (summarize what the repo is about)
    2. ⚙️ Features  
    3. 🛠️ Tech Stack (with badge images for each technology)  
    4. 🏗️ Architecture Overview (brief if possible)  
    6. 🚀 Getting Started (Install + Run steps)  
    7. 🧪 How to Test  
    8. 🧠 How it Works  
    9. 🤝 Contributing  
    10. 🪪 License  
    

    Here’s the project summary for reference:
    {project_summary}
    """

    response = client.chat.completions.create(
        model="openai/gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    return response.choices[0].message.content
