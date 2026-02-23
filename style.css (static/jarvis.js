const circle = document.getElementById("circle");
const speakBtn = document.getElementById("speakBtn");
const output = document.getElementById("output");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    output.textContent = "Seu navegador não suporta reconhecimento de voz!";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    // Cria linhas no círculo
    const totalLines = 24;
    for (let i = 0; i < totalLines; i++) {
        const line = document.createElement("div");
        line.classList.add("line");
        line.style.transform = `rotate(${(360/totalLines)*i}deg) translateY(-50%)`;
        circle.appendChild(line);
    }

    function animateLines(duration=500) {
        document.querySelectorAll(".line").forEach(line => {
            line.style.animation = `pulse ${duration}ms infinite alternate`;
        });
        setTimeout(() => {
            document.querySelectorAll(".line").forEach(line => {
                line.style.animation = "pulse 1s infinite alternate";
            });
        }, duration*2);
    }

    speakBtn.onclick = () => {
        recognition.start();
        output.textContent = "Ouvindo...";
        animateLines(300);
    };

    recognition.onstart = () => {
        document.querySelectorAll(".line").forEach(line => {
            line.style.height = "120px";
            line.style.filter = "drop-shadow(0 0 12px #f5d742)";
        });
    };

    recognition.onend = () => {
        document.querySelectorAll(".line").forEach(line => {
            line.style.height = "100px";
            line.style.filter = "drop-shadow(0 0 6px #f5d742)";
        });
    };

    recognition.onresult = async (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        output.textContent = "Você disse: " + command;

        // Comandos web gratuitos
        if (command.includes("pesquisar")) {
            const termo = command.replace("pesquisar", "").trim();
            window.open("https://www.google.com/search?q=" + encodeURIComponent(termo), "_blank");
            return;
        }

        if (command.includes("abrir youtube")) {
            window.open("https://www.youtube.com", "_blank");
            return;
        }

        if (command.includes("abrir gmail")) {
            window.open("https://mail.google.com", "_blank");
            return;
        }

        if (command.includes("alerta")) {
            const msg = command.replace("alerta", "").trim();
            alert("Alerta: " + msg);
            return;
        }

        // Pergunta para OpenAI
        const resp = await fetch("/ask", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({question: command})
        });
        const data = await resp.json();

        // Resposta em voz natural
        const utterance = new SpeechSynthesisUtterance(data.answer);
        utterance.rate = 1;
        utterance.pitch = 1.2;
        utterance.volume = 1;
        utterance.lang = 'pt-BR';

        utterance.onstart = () => animateLines(300);
        utterance.onend = () => animateLines(1000);

        speechSynthesis.speak(utterance);
        output.textContent += "\nJarvis: " + data.answer;
    };
}
