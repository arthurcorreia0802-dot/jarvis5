from flask import Flask, render_template_string, request
import openai
import os

app = Flask(__name__)
openai.api_key = os.environ.get("OPENAI_API_KEY")

@app.route("/")
def home():
    return render_template_string("""
<html>
<head>
    <title>Jarvis HUD</title>
    <link rel="stylesheet" href="/static/style.css">
</head>
<body>
    <div id="circle"></div>
    <button id="speakBtn">Falar com Jarvis</button>
    <div id="output" style="position:absolute; bottom:20px; color:#f5d742; font-size:18px;"></div>

    <script src="/static/jarvis.js"></script>
</body>
</html>
""")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return {"answer": "Não entendi."}

    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=f"Responda curto e direto: {question}",
        max_tokens=60
    )
    answer = response.choices[0].text.strip()
    return {"answer": answer}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
