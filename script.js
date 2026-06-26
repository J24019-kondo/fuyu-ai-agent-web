const micBtn = document.getElementById('mic-btn');
const statusDiv = document.getElementById('status');

// ブラウザ標準の音声認識（Web Speech API）を準備
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    statusDiv.innerText = "お使いのブラウザは音声認識に対応していません。";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
        recognition.start();
        statusDiv.innerText = "🎤 聞いてるよ...（お話ししてください）";
    });

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        statusDiv.innerText = `認識結果: 「${text}」`;
        
        // 🤖 ここで返答を喋らせる（音声合成）
        const uttr = new SpeechSynthesisUtterance(`${text}、って言いましたね！`);
        uttr.lang = 'ja-JP';
        window.speechSynthesis.speak(uttr);
    };

    recognition.onerror = (event) => {
        statusDiv.innerText = `エラーが発生しました: ${event.error}`;
    };

    recognition.onend = () => {
        if (statusDiv.innerText.startsWith("🎤")) {
            statusDiv.innerText = "待機中...";
        }
    };
}