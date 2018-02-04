
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const socket = io();

recognition.lang = 'en-UK';
recognition.interimResults = false;

document.querySelector('button').addEventListener('click', () => {
  console.log("Listening for input");
  recognition.start();
});

recognition.addEventListener('result', (e) => {
  let last = e.results.length - 1;
  let text = e.results[last][0].transcript;

  console.log("You say: " + text);
  console.log('Confidence: ' + e.results[0][0].confidence);
  socket.emit('chat message', text);
});

recognition.addEventListener('speechend', () => {
  recognition.stop();
});

recognition.onaudiostart = function () {
  console.log('Audio capturing started');
}

recognition.addEventListener('error', (error) => {
  console.log(error);
});

recognition.onaudioend = function () {
  console.log('Audio capturing ended');
}

recognition.onerror = function (event) {
  synthVoice("Sorry, something went wrong. Please say that again");
}

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
    console.log("Bot has finished speaking");
  } catch(error){
    console.log(error);
  }
}

socket.on('bot reply', function (replyText) {
  synthVoice(replyText);
});