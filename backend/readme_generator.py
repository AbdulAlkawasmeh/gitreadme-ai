import os
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1"
)

def generate_readme(project_summary: str) -> str:
    prompt = f"""
You're a talented technical writer and GitHub README.md generator.

Create a beautifully formatted, expressive, and engaging README for the following project. Use **markdown formatting**, headers, lists, and add **emojis** to make it visually appealing. Write like you're explaining it to both developers and curious tech enthusiasts. Include the following sections:

1. 📌 Project Title and Description  
2. ⚙️ Features  
3. 🛠️ Tech Stack  
4. 🏗️ Architecture Overview (brief if possible)  
5. 🚀 Getting Started (Install + Run steps)  
6. 🧪 How to Test  
7. 🧠 How it Works  
8. 🤝 Contributing  
9. 🪪 License  
10. 🙋 About the Author

Feel free to add extra flair, emojis, or Bitmoji-style expressiveness.

Project summary:
{project_summary}
"""

    response = client.chat.completions.create(
    model="openai/gpt-3.5-turbo",  
    messages=[{"role": "user", "content": prompt}],
    temperature=0.7,
)

    return response.choices[0].message.content

