// Target Date: October 10, 2026 at 2:00 PM (14:00)
const TARGET_DATE = new Date('October 10, 2026 14:00:00').getTime();

// Countdown Timer logic
function updateCountdown() {
    const now = new Date().getTime();
    const difference = TARGET_DATE - now;

    if (difference < 0) {
        const text = currentLang === 'en' ? "The Feast Has Begun! ⚡" : "¡El Banquete ha comenzado! ⚡";
        document.getElementById('countdown').innerHTML = `<div class="time-block" style="grid-column: span 4; font-weight: bold; font-size: 1.2rem; color: var(--burgundy);">${text}</div>`;
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
}

// Start interval
setInterval(updateCountdown, 1000);
updateCountdown();

// ----------------------------------------------------
// Custom Canvas Confetti System (Wizardry Sparkles)
// ----------------------------------------------------
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationId = null;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class ConfettiParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 6 + 3;
        this.speedX = Math.random() * 8 - 4;
        this.speedY = Math.random() * -12 - 4; // upward spark
        this.gravity = 0.25;
        this.color = ['#7D0C0C', '#D29A15', '#FAF0D7', '#2C1E11', '#ff9900'][Math.floor(Math.random() * 5)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 8 - 4;
        this.opacity = 1;
    }

    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        if (this.y > canvas.height) {
            this.opacity = 0;
        } else {
            this.opacity -= 0.008;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * this.size, Math.sin((18 + i * 72) * Math.PI / 180) * this.size);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (this.size / 2), Math.sin((54 + i * 72) * Math.PI / 180) * (this.size / 2));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

class WandSparkParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.gravity = 0.05;
        this.color = ['#FFE885', '#D29A15', '#FAF0D7', '#ffbb00'][Math.floor(Math.random() * 4)];
        this.opacity = 1;
    }

    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.025;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = Math.max(this.opacity, 0);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Mouse Wand Spark Trail Listener
let lastMouseTime = 0;
window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastMouseTime > 40) {
        lastMouseTime = now;
        particles.push(new WandSparkParticle(e.clientX, e.clientY));
        if (!animationId) {
            animateConfetti();
        }
    }
});

function startConfetti() {
    const startX = canvas.width / 2;
    const startY = canvas.height * 0.7;

    for (let i = 0; i < 120; i++) {
        particles.push(new ConfettiParticle(startX, startY));
    }

    if (!animationId) {
        animateConfetti();
    }
}

function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.opacity > 0);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    if (particles.length > 0) {
        animationId = requestAnimationFrame(animateConfetti);
    } else {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// ----------------------------------------------------
// Magical Sound Synthesizer (Web Audio API)
// ----------------------------------------------------
let audioCtx = null;
let isAudioPlaying = false;
let audioLoopTimeout = null;

const audioToggleBtn = document.getElementById('audio-toggle');
const audioIcon = document.getElementById('audio-icon');

// Whimsical HP-style celesta melody frequencies (Hz)
const MELODY = [
    { note: 493.88, duration: 0.4 }, // B4
    { note: 659.25, duration: 0.6 }, // E5
    { note: 783.99, duration: 0.3 }, // G5
    { note: 739.99, duration: 0.3 }, // F#5
    { note: 659.25, duration: 0.5 }, // E5
    { note: 987.77, duration: 0.7 }, // B5
    { note: 880.00, duration: 0.8 }, // A5
    { note: 739.99, duration: 0.8 }, // F#5
];

function playCelestaNote(freq, duration) {
    if (!audioCtx || !isAudioPlaying) return;

    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.error("Audio error", e);
    }
}

function startMelodyLoop(noteIndex = 0) {
    if (!isAudioPlaying) return;

    const noteInfo = MELODY[noteIndex % MELODY.length];
    playCelestaNote(noteInfo.note, noteInfo.duration);

    const nextIndex = noteIndex + 1;
    const delay = noteInfo.duration * 1000 + 150;
    audioLoopTimeout = setTimeout(() => startMelodyLoop(nextIndex), delay);
}

if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        isAudioPlaying = !isAudioPlaying;

        if (isAudioPlaying) {
            audioToggleBtn.classList.add('playing');
            audioIcon.className = 'fa-solid fa-volume-high';
            startMelodyLoop(0);
        } else {
            audioToggleBtn.classList.remove('playing');
            audioIcon.className = 'fa-solid fa-volume-xmark';
            if (audioLoopTimeout) clearTimeout(audioLoopTimeout);
        }
    });
}

// ----------------------------------------------------
// Translation Engine
// ----------------------------------------------------
const TRANSLATIONS = {
    en: {
        owl_post: "O.W.L. POST",
        title: "Elena is turning <span class=\"magic-highlight\">ONE</span>",
        subtitle: "We are pleased to inform you that you have been invited to celebrate a magical first year of life. Dust off your spellbooks and prepare your wands!",
        timer_heading: "Hogwarts Express Departs In:",
        days: "Days",
        hours: "Hours",
        minutes: "Mins",
        seconds: "Secs",
        feast_title: "Date",
        feast_date: "Saturday, October 10, 2026",
        feast_time: "At 2 O'clock in the afternoon",
        hall_title: "Location",
        hall_loc: "2530 W Atlantic Ave",
        hall_details: "Waukegan, IL 60085",
        attire_title: "Attire",
        attire_text: "Costumes Welcome!",
        attire_sub: "Wear any costume or fun outfit of your choice!",
        accio_calendar: "Accio Calendar",
        marauders_map: "Marauder's Map",
        gringotts_title: "Gringotts Education Vault",
        gringotts_text: "If you wish to honor Elena with a gift to help her save for future tuition (college/Hogwarts!), please consider contributing directly to her 529 fund:",
        gringotts_visit: "Visit",
        gringotts_enter: "and enter code:",
        copy_code: "Copy",
        copied: "Copied! 🪄",
        rsvp_title: "Attending the Feast?",
        rsvp_subtitle: "Reply by owl post! (Enter your name and confirm your attendance below.)",
        rsvp_placeholder: "Your Name(s)",
        rsvp_yes: "Attending!",
        rsvp_no: "Send Howler",
        footer_text: "Mischief Managed &hearts; Solemnly Sworn",
        feedback_yes: "Alohomora! Your response is received. We are so excited to celebrate with you! 🎈⚡",
        feedback_no: "Alas! A Howler has been sent. We will miss you at the Great Hall feast! 🍰",
        sending_owl: "Sending Owl Post... 🦉⏳",
        owl_lost: "Oops! Your Owl got lost. Please cast again. 🦉💥"
    },
    es: {
        owl_post: "CORREO LECHUZA",
        title: "Elena cumple <span class=\"magic-highlight\">UN AÑO</span>",
        subtitle: "Nos complace informarle que ha sido invitado a celebrar un año mágico de vida. ¡Despolve sus libros de hechizos y prepare sus varitas!",
        timer_heading: "El Expreso de Hogwarts parte en:",
        days: "Días",
        hours: "Horas",
        minutes: "Mins",
        seconds: "Segs",
        feast_title: "Fecha",
        feast_date: "Sabado, 10 de Octubre de 2026",
        feast_time: "A las 2 en punto de la tarde",
        hall_title: "Ubicación",
        hall_loc: "2530 W Atlantic Ave",
        hall_details: "Waukegan, IL 60085",
        attire_title: "Vestimenta",
        attire_text: "¡Disfraces bienvenidos!",
        attire_sub: "¡Ven con el disfraz o atuendo divertido que prefieras!",
        accio_calendar: "Accio Calendario",
        marauders_map: "Mapa del Merodeador",
        gringotts_title: "Bóveda de Gringotts",
        gringotts_text: "Si desea honrar a Elena con un regalo para ayudarla a ahorrar para su futura educación (¡universidad/Hogwarts!), considere contribuir directamente a su fondo 529:",
        gringotts_visit: "Visite",
        gringotts_enter: "e ingrese el código:",
        copy_code: "Copiar",
        copied: "¡Copiado! 🪄",
        rsvp_title: "¿Asistirá al Banquete?",
        rsvp_subtitle: "¡Responda por correo de lechuza! (Ingrese su nombre y confirme su asistencia a continuación.)",
        rsvp_placeholder: "Tu(s) Nombre(s)",
        rsvp_yes: "¡Asistiré!",
        rsvp_no: "Enviar Vociferador",
        footer_text: "Travesura Realizada &hearts; Juramento Solemne",
        feedback_yes: "¡Alohomora! Tu respuesta ha sido recibida. ¡Estamos muy emocionados de celebrar contigo! 🎈⚡",
        feedback_no: "¡Alas! Se ha enviado un Vociferador. ¡Te extrañaremos en el banquete del Gran Comedor! 🍰",
        sending_owl: "Enviando Correo Lechuza... 🦉⏳",
        owl_lost: "¡Oops! Tu lechuza se perdió. Por favor lanza de nuevo. 🦉💥"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll("[data-translate]").forEach(elem => {
        const key = elem.getAttribute("data-translate");
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            elem.innerHTML = TRANSLATIONS[lang][key];
        }
    });

    const nameInput = document.getElementById('guest-name');
    if (nameInput) {
        nameInput.placeholder = TRANSLATIONS[lang]['rsvp_placeholder'];
    }

    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-es').classList.toggle('active', lang === 'es');

    updateCountdown();

    const savedRsvp = localStorage.getItem('elena-rsvp');
    if (savedRsvp) {
        showRsvpFeedback(savedRsvp === 'yes');
    }
}

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-es').addEventListener('click', () => setLanguage('es'));

// ----------------------------------------------------
// Add to Calendar Generator (.ics File format)
// ----------------------------------------------------
document.getElementById('calendar-btn').addEventListener('click', () => {
    const event = {
        title: currentLang === 'en' ? "Elena's Magical 1st Birthday Feast! ⚡" : "¡El Banquete Mágico de Elena! ⚡",
        description: currentLang === 'en' 
            ? "We are pleased to inform you that you have been invited to celebrate a magical first year of life. Costumes welcome! Dust off your spellbooks and prepare your wands!"
            : "Nos complace informarle que ha sido invitado a celebrar un año mágico de vida. ¡Disfraces bienvenidos! ¡Despolve sus libros de hechizos y prepare sus varitas!",
        location: "2530 W Atlantic Ave, Waukegan, IL 60085",
        startDate: "20261010T190000Z", // Saturday Oct 10, 2026 at 2:00 PM CDT (19:00 UTC)
        endDate: "20261010T220000Z"   // Saturday Oct 10, 2026 at 5:00 PM CDT (22:00 UTC)
    };

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Hogwarts Invitation//EN",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@elenallagun.com`,
        `DTSTAMP:20260601T000000Z`,
        `DTSTART:${event.startDate}`,
        `DTEND:${event.endDate}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description}`,
        `LOCATION:${event.location}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', currentLang === 'en' ? 'Elenas_Magical_First_Birthday.ics' : 'Banquete_Magico_Elena.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    startConfetti();
});

// ----------------------------------------------------
// RSVP Action logic with Web3Forms
// ----------------------------------------------------
const yesBtn = document.getElementById('rsvp-yes');
const noBtn = document.getElementById('rsvp-no');
const guestNameInput = document.getElementById('guest-name');
const feedbackContainer = document.getElementById('rsvp-feedback');
const feedbackMessage = feedbackContainer.querySelector('.feedback-message');
const WEB3FORMS_ACCESS_KEY = "94efdaf5-d649-4c81-a5e6-12082b9fb85d";

const savedRsvp = localStorage.getItem('elena-rsvp');
const savedName = localStorage.getItem('elena-guest-name');
if (savedRsvp) {
    if (savedName) {
        guestNameInput.value = savedName;
        guestNameInput.disabled = true;
    }
    showRsvpFeedback(savedRsvp === 'yes');
}

guestNameInput.addEventListener('input', () => {
    guestNameInput.classList.remove('error');
});

yesBtn.addEventListener('click', () => handleRsvpSubmission(true));
noBtn.addEventListener('click', () => handleRsvpSubmission(false));

async function handleRsvpSubmission(isAttending) {
    const guestName = guestNameInput.value.trim();
    
    if (!guestName) {
        guestNameInput.classList.add('error');
        guestNameInput.focus();
        return;
    }

    setLoadingState(true);
    feedbackContainer.className = 'rsvp-feedback success';
    feedbackMessage.innerHTML = TRANSLATIONS[currentLang]['sending_owl'];
    feedbackContainer.classList.remove('hidden');

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                access_key: WEB3FORMS_ACCESS_KEY,
                subject: `HOGWARTS RSVP: Elena's 1st Birthday - ${isAttending ? 'Attending the Feast! ⚡' : 'Sent a Howler 😔'}`,
                from_name: "Elena Hogwarts Express",
                wizard_name: guestName,
                attending_feast: isAttending ? "Yes" : "No"
            })
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
            localStorage.setItem('elena-rsvp', isAttending ? 'yes' : 'no');
            localStorage.setItem('elena-guest-name', guestName);
            guestNameInput.disabled = true;
            
            showRsvpFeedback(isAttending);
            if (isAttending) {
                startConfetti();
            }
        } else {
            throw new Error(result.message || "Failed to send Owl Post");
        }
    } catch (error) {
        console.error("RSVP Submission Error:", error);
        feedbackContainer.className = 'rsvp-feedback failure';
        feedbackMessage.innerHTML = TRANSLATIONS[currentLang]['owl_lost'];
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    yesBtn.disabled = isLoading;
    noBtn.disabled = isLoading;
    guestNameInput.disabled = isLoading;
    if (isLoading) {
        yesBtn.style.opacity = '0.5';
        noBtn.style.opacity = '0.5';
    } else {
        yesBtn.style.opacity = '1';
        noBtn.style.opacity = '1';
    }
}

function showRsvpFeedback(isYes) {
    feedbackContainer.className = 'rsvp-feedback';
    if (isYes) {
        feedbackContainer.classList.add('success');
        feedbackMessage.innerHTML = TRANSLATIONS[currentLang]['feedback_yes'];
        yesBtn.classList.add('hidden');
        noBtn.classList.remove('hidden');
    } else {
        feedbackContainer.classList.add('failure');
        feedbackMessage.innerHTML = TRANSLATIONS[currentLang]['feedback_no'];
        noBtn.classList.add('hidden');
        yesBtn.classList.remove('hidden');
    }
    feedbackContainer.classList.remove('hidden');
}

// ----------------------------------------------------
// Copy 529 Code to Clipboard
// ----------------------------------------------------
const copyBtn = document.getElementById('copy-code-btn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const codeText = document.getElementById('vault-code').innerText;
        navigator.clipboard.writeText(codeText).then(() => {
            const span = copyBtn.querySelector('[data-translate]');
            copyBtn.classList.add('copied');
            if (span) span.innerText = currentLang === 'en' ? 'Copied! 🪄' : '¡Copiado! 🪄';
            
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                if (span) span.innerText = TRANSLATIONS[currentLang]['copy_code'];
            }, 2500);
        });
    });
}
