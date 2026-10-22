function startAtBeginning() {
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  document.documentElement.style.removeProperty("scroll-behavior");
}

try {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (window.location.hash) {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.hash = "";
    history.replaceState(history.state, "", cleanUrl.href);
  }
} catch {
  // The scroll reset below still works when the browser forbids URL updates.
}

window.addEventListener("pageshow", startAtBeginning, { once: true });
startAtBeginning();

const audio = document.getElementById("bgAudio");
const musicButton = document.getElementById("musicButton");
const musicLabel = document.getElementById("musicLabel");
const loader = document.getElementById("loader");
const openInvitationButton = document.getElementById("openInvitation");
const loaderMessage = document.getElementById("loaderMessage");
const loaderHint = document.getElementById("loaderHint");
let invitationStarted = false;

function setMusicState(isPlaying, idleLabel = "Ouvir música") {
  musicButton.setAttribute("aria-pressed", String(isPlaying));
  musicButton.setAttribute("aria-label", isPlaying ? "Pausar música de fundo" : "Tocar música de fundo");
  musicLabel.textContent = isPlaying ? "Pausar música" : idleLabel;
}

function playBackgroundMusic() {
  audio.volume = 0.45;
  try {
    const playback = audio.play();
    setMusicState(true);
    playback.then(() => setMusicState(true)).catch(() => setMusicState(false, "Toque para ouvir"));
  } catch (error) {
    setMusicState(false, "Toque para ouvir");
  }
}

function hideLoader() {
  if (!loader || loader.classList.contains("is-hidden")) return;
  loader.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-ready");
}

openInvitationButton.addEventListener("click", () => {
  if (invitationStarted) return;
  invitationStarted = true;

  // Start playback directly inside the tap/click gesture so mobile browsers allow it.
  playBackgroundMusic();
  loaderMessage.textContent = "A preparar o seu convite";
  loaderHint.textContent = "um momento para guardar";
  loader.classList.add("is-opening");
  window.setTimeout(hideLoader, 2000);
});

musicButton.addEventListener("click", () => {
  if (audio.paused) {
    playBackgroundMusic();
    return;
  }

  audio.pause();
  setMusicState(false);
});

function setCalendarDownload() {
  const eventLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dulce e Edson//Convite Web//PT",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:dulce-edson-casamento-20261212@convite.local",
    `DTSTAMP:${new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}/, "")}`,
    "DTSTART;VALUE=DATE:20261212",
    "DTEND;VALUE=DATE:20261213",
    "SUMMARY:Dulce & Edson — celebração da união",
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  const calendar = new Blob([eventLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  document.getElementById("calendarLink").href = URL.createObjectURL(calendar);
}

setCalendarDownload();

const rsvpForm = document.getElementById("rsvpForm");
const rsvpStatus = document.getElementById("rsvpStatus");

rsvpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = new FormData(rsvpForm);
  const name = String(fields.get("guestName") || "").trim();
  const response = fields.get("attendance") === "yes"
    ? "Confirmo presença"
    : "Não poderei estar presente";
  const note = String(fields.get("guestMessage") || "").trim();
  const message = [
    "Olá! Escrevo sobre o casamento de Dulce e Edson.",
    `Nome: ${name}`,
    `Resposta: ${response}`,
    note ? `Mensagem: ${note}` : ""
  ].filter(Boolean).join("\n");
  const whatsappUrl = `https://wa.me/258843466743?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  rsvpStatus.replaceChildren(document.createTextNode("A mensagem está pronta no WhatsApp. Se não abrir automaticamente, "));
  const fallbackLink = document.createElement("a");
  fallbackLink.href = whatsappUrl;
  fallbackLink.target = "_blank";
  fallbackLink.rel = "noopener noreferrer";
  fallbackLink.textContent = "toque aqui para continuar";
  rsvpStatus.append(fallbackLink, document.createTextNode("."));
});

const giftDialog = document.getElementById("giftDialog");
const openGiftDialogButton = document.getElementById("openGiftDialog");
const closeGiftDialogButton = document.getElementById("closeGiftDialog");

openGiftDialogButton.addEventListener("click", () => {
  if (typeof giftDialog.showModal === "function") giftDialog.showModal();
  else giftDialog.setAttribute("open", "");
});

function closeGiftDialog() {
  if (typeof giftDialog.close === "function") giftDialog.close();
  else giftDialog.removeAttribute("open");
}

closeGiftDialogButton.addEventListener("click", closeGiftDialog);
giftDialog.addEventListener("click", (event) => {
  if (event.target === giftDialog) closeGiftDialog();
});

const revealItems = [...document.querySelectorAll("[data-reveal]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reducedMotion) {
  document.documentElement.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
