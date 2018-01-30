
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const socket = io();

recognition.lang = 'en-UK';
recognition.interimResults = false;

document.querySelector('button').addEventListener('click', () => {
  recognition.start();
});

recognition.addEventListener('result', (e) => {
  let last = e.results.length - 1;
  let text = e.results[last][0].transcript;

  console.log(text);
  console.log('Confidence: ' + e.results[0][0].confidence);
  socket.emit('chat message', text);
});

recognition.addEventListener('speechend', () => {
  console.log("Listening for input");
  recognition.stop();
});

recognition.addEventListener('error', (err) => {
  console.log(error);
});

function synthVoice(text) {
  try {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    let voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.filter(function (voice) {
      return voice.name == 'Tessa';
    })[0];
    utterance.lang = 'en-US';

    synth.speak(utterance);
  } catch(error){
    console.log(error);
  }
}

socket.on('bot reply', function (replyText) {
  synthVoice(replyText);
});