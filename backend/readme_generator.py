import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

def generate_readme(project_summary: str, project_stack: str = "General", tone: str = "Professional") -> str:
    """
    Generate a README using OpenRouter AI with optional project stack and tone.

    Args:
        project_summary (str): Text summary of the repository.
        project_stack (str): Type of project (Node.js, Django, React, etc.)
        tone (str): Desired writing tone (Professional, Friendly, Casual, Corporate)

    Returns:
        str: Generated README content
    """

    prompt = f"""
You are a highly skilled technical writer and GitHub README.md generator.

Act as if you are creating a professional-quality README for a **{project_stack}** project.

Write in a **{tone} tone**. Use **markdown formatting**, headers, lists, and add **emojis** to make it visually appealing. 

👉 Additionally, add **Shields.io badges with logos for the tech stack** under the **"Tech Stack"** section.  
Example badge format:
`![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)`

You are explaining this to both **developers and curious tech enthusiasts**.

The README should include the following sections:

1. 📌 Project Title and Description  
2. ⚙️ Features  
3. 🛠️ Tech Stack (with badge images for each technology)  
4. 🏗️ Architecture Overview (brief if possible)  
5. 🚀 Getting Started (Install + Run steps)  
6. 🧪 How to Test  
7. 🧠 How it Works  
8. 🤝 Contributing  
9. 🪪 License  
10. 🙋 About the Author

Be creative, fun, and informative. Feel free to add extra flair, emojis, or Bitmoji-style expressiveness.

Here’s the project summary for reference:
{project_summary}
"""

    response = client.chat.completions.create(
        model="openai/gpt-3.5-turbo",  
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    return response.choices[0].message.content
