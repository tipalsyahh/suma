const synth = window.speechSynthesis;
let utterance = null;
let isPlaying = false;
let isMuted = true;

function getText() {
  const beritaEl = document.getElementById("berita");
  if (!beritaEl) return "";

  let text = "";
  Array.from(beritaEl.childNodes).forEach(node => {
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node.classList.contains("home") || node.classList.contains("load-more"))
    ) return;

    text += node.innerText || node.textContent || "";
  });

  return text.trim();
}

function playVoice() {
  if (isMuted) return;

  const text = getText();
  if (!text) return;

  if (synth.speaking || synth.pending) synth.cancel();

  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "id-ID";

  utterance.onend = () => {
    isPlaying = false;
  };

  utterance.onerror = () => {
    isPlaying = false;
  };

  synth.speak(utterance);
  if (synth.paused) synth.resume();

  isPlaying = true;
}

function stopVoice() {
  if (synth.speaking || synth.pending) synth.cancel();
  isPlaying = false;
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("voiceToggle");
  if (!btn) return;

  isMuted = true;
  stopVoice();

  if (btn) {
    btn.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
  }

  btn.addEventListener("click", () => {
    if (isMuted) {
      isMuted = false;
      if (btn) {
        btn.innerHTML = '<i class="bi bi-volume-up"></i>';
      }
      playVoice();
    } else {
      isMuted = true;
      if (btn) {
        btn.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
      }
      stopVoice();
    }
  });

  if (!synth.getVoices().length) {
    synth.onvoiceschanged = () => {};
  }
});

window.addEventListener("beforeunload", () => synth.cancel());

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopVoice();
});
