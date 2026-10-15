// State management
let currentCategory = "All";
let currentSearch = "";
let currentEvents = [];
let searchDebounceTimer = null;

// DOM Elements
const eventsGrid = document.getElementById("events-grid");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const retryBtn = document.getElementById("retry-btn");
const emptyState = document.getElementById("empty-state");
const resetFiltersBtn = document.getElementById("reset-filters-btn");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");
const eventsCount = document.getElementById("events-count");
const categoryFilters = document.getElementById("category-filters");

// Modal Elements
const eventModal = document.getElementById("event-modal");
const modalCard = document.getElementById("modal-card");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalIcon = document.getElementById("modal-icon");
const modalTitle = document.getElementById("modal-title");
const modalCategory = document.getElementById("modal-category");
const modalFee = document.getElementById("modal-fee");
const modalDate = document.getElementById("modal-date");
const modalTime = document.getElementById("modal-time");
const modalVenue = document.getElementById("modal-venue");
const modalDescription = document.getElementById("modal-description");
const modalSeatsBadge = document.getElementById("modal-seats-badge");
const registrationForm = document.getElementById("registration-form");
const formEventId = document.getElementById("form-event-id");
const submitRegisterBtn = document.getElementById("submit-register-btn");
const formAlert = document.getElementById("form-alert");

// Client Form Error Elements
const errStudentName = document.getElementById("err-student-name");
const errRollNumber = document.getElementById("err-roll-number");
const errEmail = document.getElementById("err-email");

// -------------------------------------------------------------
// Category Badge Helper
// -------------------------------------------------------------
function getCategoryBadgeClass(category) {
  switch (category?.toLowerCase()) {
    case "technical":
      return "bg-cyan-950 text-cyan-300 border-cyan-800/60";
    case "cultural":
      return "bg-purple-950 text-purple-300 border-purple-800/60";
    case "sports":
      return "bg-emerald-950 text-emerald-300 border-emerald-800/60";
    case "gaming":
      return "bg-rose-950 text-rose-300 border-rose-800/60";
    case "workshop":
      return "bg-amber-950 text-amber-300 border-amber-800/60";
    default:
      return "bg-slate-800 text-slate-300 border-slate-700";
  }
}

function getCategoryGlowClass(category) {
  switch (category?.toLowerCase()) {
    case "technical":
      return "breathe-cyan hover:border-cyan-400 hover:shadow-cyan-950/60";
    case "cultural":
      return "breathe-pink hover:border-pink-400 hover:shadow-pink-950/60";
    case "sports":
      return "breathe-emerald hover:border-emerald-400 hover:shadow-emerald-950/60";
    case "gaming":
      return "breathe-rose hover:border-rose-400 hover:shadow-rose-950/60";
    case "workshop":
      return "breathe-amber hover:border-amber-400 hover:shadow-amber-950/60";
    default:
      return "breathe-pink hover:border-purple-400 hover:shadow-purple-950/60";
  }
}

function getIconAnimationClass(category, icon, title = "") {
  const t = (title || "").toLowerCase();
  if (icon === "💻" || t.includes("code")) return "animate-icon-code";
  if (icon === "🤖" || t.includes("robo")) return "animate-icon-robot";
  if (icon === "🧠" || t.includes("ai")) return "animate-icon-ai";
  if (icon === "🎨" || t.includes("web design")) return "animate-icon-palette";
  if (icon === "🎸" || t.includes("band")) return "animate-icon-guitar";
  if (icon === "💃" || t.includes("dance")) return "animate-icon-dance";
  if (icon === "🎭" || t.includes("nukkad")) return "animate-icon-drama";
  if (icon === "👗" || t.includes("fashion")) return "animate-icon-fashion";
  if (icon === "🎤" || t.includes("mic")) return "animate-icon-mic";
  if (icon === "⚽" || t.includes("football")) return "animate-icon-football";
  if (icon === "♟️" || t.includes("chess")) return "animate-icon-chess";
  if (icon === "🎮" || t.includes("gaming") || t.includes("valorant")) return "animate-icon-gaming";
  if (icon === "✏️" || t.includes("ui/ux")) return "animate-icon-sketch";
  if (icon === "⚡" || t.includes("vibe")) return "animate-icon-lightning";
  if (icon === "📷" || t.includes("photo")) return "animate-icon-camera";

  return "animate-icon-bob";
}

function getEventFeatureBadge(event) {
  const isFull = event.available_seats <= 0;
  const isFastFilling = !isFull && event.available_seats <= 10;

  if (isFull) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse">Sold Out</span>`;
  }
  if (isFastFilling) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse">🔥 High Demand</span>`;
  }

  const t = (event.title || "").toLowerCase();
  if (t.includes("code sprint")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]">💻 3-Hr Hackathon</span>`;
  }
  if (t.includes("robo race")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]">🤖 Battlebots</span>`;
  }
  if (t.includes("ai pitch")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]">🧠 Startup Arena</span>`;
  }
  if (t.includes("web design")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]">🎨 UI Showdown</span>`;
  }
  if (t.includes("battle of bands")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.3)]">🎸 Rock Arena</span>`;
  }
  if (t.includes("dance fiesta")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-pink-950/90 text-pink-300 border border-pink-500/60 shadow-[0_0_8px_rgba(236,72,153,0.3)]">💃 Dance Clash</span>`;
  }
  if (t.includes("nukkad")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.3)]">🎭 Street Theatre</span>`;
  }
  if (t.includes("fashion")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-pink-950/90 text-pink-300 border border-pink-500/60 shadow-[0_0_8px_rgba(236,72,153,0.3)]">👗 Ramp Walk</span>`;
  }
  if (t.includes("open mic")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.3)]">🎤 Live Standup</span>`;
  }
  if (t.includes("football")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]">⚽ Turf Cup</span>`;
  }
  if (t.includes("chess")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]">♟️ Grandmaster</span>`;
  }
  if (t.includes("valorant")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.3)]">🎮 Esports Clash</span>`;
  }
  if (t.includes("ui/ux")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]">✏️ Hands-on Lab</span>`;
  }
  if (t.includes("vibe coding")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]">⚡ AI Dev Bootcamp</span>`;
  }
  if (t.includes("photography")) {
    return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.3)]">📷 Photo Trail</span>`;
  }

  return `<span class="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">✨ ${event.category}</span>`;
}

function getCardRunningTicker(event) {
  const cat = (event.category || "").toLowerCase();
  let items = [];

  if (cat === "technical") {
    items = ["⚡ HACKATHON ARENA", "LIVE CODING", "CASH PRIZES", "CERTIFICATE OF MERIT", "CAMPUS AUDITORIUM"];
  } else if (cat === "gaming") {
    items = ["🎮 60 FPS ESPORTS", "VALORANT SHOWDOWN", "SQUAD CUP", "STREAMED LIVE", "CHAMPIONSHIP TROPHY"];
  } else if (cat === "cultural") {
    items = ["🎸 MAIN STAGE", "SOUND & LIGHT ARENA", "LIVE AUDIENCE", "MEDALS & AWARDS", "CERTIFICATES"];
  } else if (cat === "sports") {
    items = ["⚽ TURF CUP", "ROLLING TROPHY", "LIVE COMMENTARY", "SPORTS KITS", "REFRESHMENTS"];
  } else {
    items = ["💡 HANDS-ON LAB", "INDUSTRY MENTORS", "PORTFOLIO PROJECT", "VERIFIED CERTIFICATE", "FREE KIT"];
  }

  const tickerText = items.join(" • ") + " • ";
  return `
    <div class="card-mini-ticker-wrap py-1 px-2 my-2.5 rounded-lg bg-slate-900/90 border border-slate-700/60 select-none">
      <div class="card-mini-ticker inline-flex text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-cyan-300">
        <span class="pr-6">${tickerText}</span>
        <span class="pr-6">${tickerText}</span>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// Fetch and Render Events
// -------------------------------------------------------------
async function fetchEvents() {
  // Show Loading state
  loadingState.classList.remove("hidden");
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
  eventsGrid.classList.add("hidden");

  try {
    const params = new URLSearchParams();
    if (currentCategory && currentCategory !== "All") {
      params.append("category", currentCategory);
    }
    if (currentSearch && currentSearch.trim() !== "") {
      params.append("search", currentSearch.trim());
    }

    const url = `/api/events${params.toString() ? "?" + params.toString() : ""}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const events = await res.json();
    currentEvents = events;
    loadingState.classList.add("hidden");

    eventsCount.textContent = events.length;

    if (events.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    }

    renderEventsGrid(events);
    eventsGrid.classList.remove("hidden");
  } catch (err) {
    console.error("Failed to fetch events:", err);
    loadingState.classList.add("hidden");
    errorMessage.textContent = err.message || "Failed to connect to backend server. Make sure the API is running.";
    errorState.classList.remove("hidden");
  }
}

function renderEventsGrid(events) {
  eventsGrid.innerHTML = "";

  events.forEach((event, index) => {
    const card = document.createElement("div");
    const categoryGlow = getCategoryGlowClass(event.category);
    const iconAnim = getIconAnimationClass(event.category, event.icon, event.title);

    card.className =
      `card-fade event-card-tilt relative overflow-hidden bg-slate-800/80 backdrop-blur-md border rounded-2xl p-5 flex flex-col justify-between ${categoryGlow} hover:shadow-2xl transition-shadow duration-300 group`;
    card.style.animationDelay = `${index * 35}ms`;

    const isFull = event.available_seats <= 0;
    const isFastFilling = !isFull && event.available_seats <= 10;
    const feeText = event.fee > 0 ? `₹${event.fee}` : "Free";
    const categoryBadgeClass = getCategoryBadgeClass(event.category);

    const filledSeats = Math.max(0, event.capacity - event.available_seats);
    const fillPct = event.capacity > 0 ? Math.min(100, Math.round((filledSeats / event.capacity) * 100)) : 0;
    const isHighDemand = fillPct >= 80 || isFastFilling;
    const barGradient = isFull
      ? "bg-rose-500"
      : isHighDemand
      ? "bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse"
      : "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400";

    const featureBadge = getEventFeatureBadge(event);
    const miniTicker = getCardRunningTicker(event);

    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-3xl p-2.5 rounded-xl bg-slate-750/90 border border-slate-700/60 ${iconAnim} group-hover:scale-110 transition-transform select-none inline-block shadow-inner flex-shrink-0">
              ${event.icon || "✨"}
            </span>
            <div class="overflow-hidden w-36 sm:w-44 md:w-48 lg:w-52">
              <span class="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border ${categoryBadgeClass}">
                ${event.category}
              </span>
              <!-- Running Marquee Card Header Title -->
              <div class="card-title-track mt-0.5">
                <div class="card-title-ticker inline-flex">
                  <h3 class="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors pr-6 whitespace-nowrap">
                    ${event.title}
                  </h3>
                  <h3 class="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors pr-6 whitespace-nowrap">
                    ${event.title}
                  </h3>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1 flex-shrink-0">
            ${
              isFull
                ? `<span class="px-2 py-0.5 text-xs font-black uppercase rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">FULL</span>`
                : `<span class="px-2 py-0.5 text-xs font-semibold rounded bg-slate-900 text-slate-300 border border-slate-700">${feeText}</span>`
            }
            ${featureBadge}
          </div>
        </div>

        <p class="text-xs text-slate-300 line-clamp-2 mb-2 leading-relaxed">
          ${event.description || "No description provided."}
        </p>

        <!-- Running Mini Ticker Tape On Card -->
        ${miniTicker}

        <div class="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-700/60 mb-5">
          <div class="flex items-center gap-2">
            <span class="text-slate-400">📅</span>
            <span>${event.event_date} • ${event.event_time}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-slate-400">📍</span>
            <span class="truncate">${event.venue}</span>
          </div>

          <!-- Capacity Info with Visual Animated Barber-Pole Progress Bar -->
          <div class="pt-1">
            <div class="flex items-center justify-between text-slate-300 font-medium text-xs mb-1.5">
              <span class="text-slate-400">Capacity:</span>
              <div class="flex items-center gap-1.5">
                ${
                  isFastFilling
                    ? `<span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">🔥 Filling Fast</span>`
                    : ""
                }
                <span class="${isFull ? 'text-rose-400 font-bold' : isHighDemand ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}">
                  ${event.available_seats} / ${event.capacity} left
                </span>
              </div>
            </div>
            <div class="w-full bg-slate-900/90 rounded-full h-2 overflow-hidden border border-slate-700/60 shadow-inner">
              <div class="h-full rounded-full transition-all duration-700 ${barGradient} animate-stripes" style="width: ${Math.max(4, fillPct)}%"></div>
            </div>
          </div>
        </div>
      </div>

      <button
        onclick="openEventDetails(${event.id})"
        class="w-full py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl bg-slate-750 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 active:scale-[0.98] text-white border border-slate-700 hover:border-pink-500 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-md group/btn btn-shine-sweep"
      >
        <span>View Details & Register</span>
        <span class="text-xs transition-transform duration-200 group-hover/btn:translate-x-1">→</span>
      </button>
    `;

    // Spotlight cursor illumination tracking on each card
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });

    // Cyber UI Audio Blip on Card Hover
    card.addEventListener("mouseenter", () => {
      playHoverBlip();
    });

    eventsGrid.appendChild(card);
  });

  // Initialize VanillaTilt 3D holographic tilt on event cards
  if (typeof VanillaTilt !== "undefined") {
    VanillaTilt.init(document.querySelectorAll(".event-card-tilt"), {
      max: 12,
      speed: 400,
      glare: true,
      "max-glare": 0.28,
      scale: 1.03,
      perspective: 1000
    });
  }
}

// -------------------------------------------------------------
// Event Details & Registration Modal
// -------------------------------------------------------------
async function openEventDetails(eventId) {
  try {
    const res = await fetch(`/api/events/${eventId}`);
    if (!res.ok) throw new Error("Could not load event details");
    const event = await res.json();

    formEventId.value = event.id;
    modalIcon.textContent = event.icon || "✨";
    modalTitle.textContent = event.title;
    modalCategory.textContent = event.category;
    modalCategory.className = `text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(event.category)}`;
    modalFee.textContent = event.fee > 0 ? `₹${event.fee}` : "Free";
    modalDate.textContent = event.event_date;
    modalTime.textContent = event.event_time;
    modalVenue.textContent = event.venue;
    modalDescription.textContent = event.description || "Join us for this exciting event at HSB FEST 2026!";

    // Seat availability info
    const isFull = event.available_seats <= 0;
    if (isFull) {
      modalSeatsBadge.textContent = "0 seats available • FULL";
      modalSeatsBadge.className = "font-bold text-xs px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800";
      submitRegisterBtn.disabled = true;
      submitRegisterBtn.textContent = "Registration Closed (Full)";
    } else {
      modalSeatsBadge.textContent = `${event.available_seats} / ${event.capacity} seats remaining`;
      modalSeatsBadge.className = "font-bold text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800";
      submitRegisterBtn.disabled = false;
      submitRegisterBtn.textContent = "Register for Event";
    }

    // Reset Form & Pass Views
    registrationForm.reset();
    clearFormErrors();
    hideFormAlert();

    const formSec = document.getElementById("registration-form-section");
    const passSec = document.getElementById("holographic-pass-section");
    if (formSec) formSec.classList.remove("hidden");
    if (passSec) passSec.classList.add("hidden");

    // Show modal with animation
    eventModal.classList.remove("hidden");
    requestAnimationFrame(() => {
      eventModal.classList.remove("opacity-0");
      modalCard.classList.remove("scale-95");
      modalCard.classList.add("scale-100");
    });
  } catch (err) {
    alert("Error fetching event details: " + err.message);
  }
}

function closeModal() {
  eventModal.classList.add("opacity-0");
  modalCard.classList.remove("scale-100");
  modalCard.classList.add("scale-95");
  setTimeout(() => {
    eventModal.classList.add("hidden");
    clearFormErrors();
    hideFormAlert();
    const formSec = document.getElementById("registration-form-section");
    const passSec = document.getElementById("holographic-pass-section");
    if (formSec) formSec.classList.remove("hidden");
    if (passSec) passSec.classList.add("hidden");
  }, 200);
}

// -------------------------------------------------------------
// Form Validation & Registration Handling
// -------------------------------------------------------------
function clearFormErrors() {
  errStudentName.classList.add("hidden");
  errRollNumber.classList.add("hidden");
  errEmail.classList.add("hidden");
}

function showFormAlert(type, message) {
  formAlert.className = `mb-4 p-3 rounded-xl text-sm font-medium ${
    type === "success"
      ? "bg-emerald-950/80 text-emerald-200 border border-emerald-800"
      : "bg-rose-950/80 text-rose-200 border border-rose-800"
  }`;
  formAlert.textContent = message;
  formAlert.classList.remove("hidden");
}

function hideFormAlert() {
  formAlert.classList.add("hidden");
  formAlert.textContent = "";
}

registrationForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearFormErrors();
  hideFormAlert();

  const eventId = formEventId.value;
  const studentName = document.getElementById("student-name").value.trim();
  const rollNumber = document.getElementById("roll-number").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  // Client-side validation checks
  let hasError = false;

  if (!studentName) {
    errStudentName.textContent = "Please enter your full name.";
    errStudentName.classList.remove("hidden");
    hasError = true;
  }

  if (!rollNumber) {
    errRollNumber.textContent = "Please enter your college roll number.";
    errRollNumber.classList.remove("hidden");
    hasError = true;
  }

  if (!email) {
    errEmail.textContent = "Please enter your email address.";
    errEmail.classList.remove("hidden");
    hasError = true;
  } else if (!email.includes("@")) {
    errEmail.textContent = "Email must contain '@'.";
    errEmail.classList.remove("hidden");
    hasError = true;
  }

  if (hasError) return;

  // Submit to server
  submitRegisterBtn.disabled = true;
  const originalBtnText = submitRegisterBtn.textContent;
  submitRegisterBtn.textContent = "Submitting registration...";

  try {
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        student_name: studentName,
        roll_number: rollNumber,
        email: email,
        phone: phone || null,
      }),
    });

    const data = await res.json();

    if (res.status === 201) {
      // Populate Holographic Pass Details
      const passTitle = document.getElementById("pass-event-title");
      const passName = document.getElementById("pass-student-name");
      const passRoll = document.getElementById("pass-roll-number");
      const passVenue = document.getElementById("pass-venue");
      const passDatetime = document.getElementById("pass-datetime");
      const passTicketId = document.getElementById("pass-ticket-id");

      if (passTitle) passTitle.textContent = modalTitle.textContent;
      if (passName) passName.textContent = data.student_name || studentName;
      if (passRoll) passRoll.textContent = data.roll_number || rollNumber;
      if (passVenue) passVenue.textContent = modalVenue.textContent;
      if (passDatetime) passDatetime.textContent = `${modalDate.textContent} • ${modalTime.textContent}`;
      if (passTicketId) {
        const randId = Math.floor(10000 + Math.random() * 90000);
        passTicketId.textContent = `#HSB26-TKT-${randId}`;
      }

      // Transition from form to Holographic Pass
      const formSection = document.getElementById("registration-form-section");
      const passSection = document.getElementById("holographic-pass-section");

      if (formSection) formSection.classList.add("hidden");
      if (passSection) {
        passSection.classList.remove("hidden");
        // Initialize 3D tilt with high-intensity holographic glare
        const passCard = document.getElementById("holographic-pass-container");
        if (passCard && typeof VanillaTilt !== "undefined") {
          VanillaTilt.init(passCard, {
            max: 18,
            speed: 400,
            glare: true,
            "max-glare": 0.45,
            perspective: 800
          });
        }
      }

      // Trigger Celebration effects
      fireFestConfetti();
      playCelebrationFanfare();

      // Refresh events to sync available seats
      fetchEvents();

      submitRegisterBtn.disabled = false;
      submitRegisterBtn.textContent = originalBtnText;
    } else {
      // Show exact server error message (e.g. "Event is full", "Already registered")
      const errMsg = data.detail || "Registration failed. Please check your details.";
      showFormAlert("error", errMsg);
      submitRegisterBtn.disabled = false;
      submitRegisterBtn.textContent = originalBtnText;
    }
  } catch (err) {
    console.error("Network error during registration:", err);
    showFormAlert("error", "Network error: Unable to contact server. Please retry.");
    submitRegisterBtn.disabled = false;
    submitRegisterBtn.textContent = originalBtnText;
  }
});

// -------------------------------------------------------------
// Search & Filter Listeners
// -------------------------------------------------------------
searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value;
  if (currentSearch.length > 0) {
    clearSearchBtn.classList.remove("hidden");
  } else {
    clearSearchBtn.classList.add("hidden");
  }

  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    fetchEvents();
  }, 250);
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  currentSearch = "";
  clearSearchBtn.classList.add("hidden");
  fetchEvents();
});

categoryFilters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;

  const category = btn.getAttribute("data-category");
  currentCategory = category;

  // Update button active state
  document.querySelectorAll(".filter-btn").forEach((b) => {
    b.classList.remove("bg-purple-600", "text-white", "shadow-md", "shadow-purple-600/30");
    b.classList.add("bg-slate-800", "text-slate-300", "border", "border-slate-700");
  });

  btn.classList.add("bg-purple-600", "text-white", "shadow-md", "shadow-purple-600/30");
  btn.classList.remove("bg-slate-800", "text-slate-300", "border", "border-slate-700");

  playFilterWhoosh();
  fetchEvents();
});

resetFiltersBtn.addEventListener("click", () => {
  currentSearch = "";
  searchInput.value = "";
  clearSearchBtn.classList.add("hidden");
  currentCategory = "All";

  document.querySelectorAll(".filter-btn").forEach((b) => {
    if (b.getAttribute("data-category") === "All") {
      b.classList.add("bg-purple-600", "text-white", "shadow-md", "shadow-purple-600/30");
      b.classList.remove("bg-slate-800", "text-slate-300");
    } else {
      b.classList.remove("bg-purple-600", "text-white", "shadow-md", "shadow-purple-600/30");
      b.classList.add("bg-slate-800", "text-slate-300");
    }
  });

  playFilterWhoosh();
  fetchEvents();
});

// Handle "Register Another" in Holographic Pass
const registerAnotherBtn = document.getElementById("register-another-btn");
if (registerAnotherBtn) {
  registerAnotherBtn.addEventListener("click", () => {
    const formSection = document.getElementById("registration-form-section");
    const passSection = document.getElementById("holographic-pass-section");
    if (formSection) formSection.classList.remove("hidden");
    if (passSection) passSection.classList.add("hidden");
    registrationForm.reset();
    clearFormErrors();
    hideFormAlert();
  });
}

retryBtn.addEventListener("click", fetchEvents);
closeModalBtn.addEventListener("click", closeModal);

// Close modal when clicking outside
eventModal.addEventListener("click", (e) => {
  if (e.target === eventModal) {
    closeModal();
  }
});

// ESC key to close modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !eventModal.classList.contains("hidden")) {
    closeModal();
  }
});

// -------------------------------------------------------------
// Live Fest Countdown Timer with Full Sci-Fi HUD Suite
// -------------------------------------------------------------
function showLiveActivityToastCustom(message) {
  const container = document.getElementById("live-activity-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className =
    "toast-enter flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-cyan-500/60 shadow-2xl text-xs text-white group mb-2.5 max-w-sm";
  toast.innerHTML = `
    <span class="text-xl">✨</span>
    <span class="flex-1 font-semibold text-slate-100">${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("toast-enter");
    toast.classList.add("toast-exit");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 320);
  }, 4000);
}

function startFestCountdown() {
  const festDate = new Date("2026-11-14T10:00:00").getTime();

  let lastDays = "";
  let lastHours = "";
  let lastMinutes = "";
  let lastSeconds = "";
  let timerInterval = null;
  let isSimulating = false;

  const elDays = document.getElementById("timer-days");
  const elHours = document.getElementById("timer-hours");
  const elMinutes = document.getElementById("timer-minutes");
  const elSeconds = document.getElementById("timer-seconds");
  const secondsRing = document.getElementById("seconds-ring");
  const energySegs = document.querySelectorAll("#energy-meter-container .energy-seg");
  const statusTitle = document.getElementById("timer-status-title");
  const btnLaunchSim = document.getElementById("btn-launch-sim");
  const btnResetSim = document.getElementById("btn-reset-sim");
  const latencyEl = document.getElementById("clock-latency");

  function flipDigit(el, newText) {
    if (!el) return;
    el.textContent = newText;
    el.classList.remove("animate-digit-flip");
    void el.offsetWidth;
    el.classList.add("animate-digit-flip");
  }

  function pulseUnitBox(boxId) {
    const box = document.getElementById(boxId);
    if (!box) return;
    box.classList.remove("animate-tick-pulse");
    void box.offsetWidth;
    box.classList.add("animate-tick-pulse");
  }

  function updateTimer() {
    if (isSimulating) return;

    const now = new Date().getTime();
    const distance = festDate - now;

    if (distance <= 0) {
      if (elDays) elDays.textContent = "00";
      if (elHours) elHours.textContent = "00";
      if (elMinutes) elMinutes.textContent = "00";
      if (elSeconds) elSeconds.textContent = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const strDays = String(days).padStart(2, "0");
    const strHours = String(hours).padStart(2, "0");
    const strMinutes = String(minutes).padStart(2, "0");
    const strSeconds = String(seconds).padStart(2, "0");

    if (strDays !== lastDays) {
      flipDigit(elDays, strDays);
      lastDays = strDays;
    }
    if (strHours !== lastHours) {
      flipDigit(elHours, strHours);
      lastHours = strHours;
    }
    if (strMinutes !== lastMinutes) {
      flipDigit(elMinutes, strMinutes);
      lastMinutes = strMinutes;
    }
    if (strSeconds !== lastSeconds) {
      flipDigit(elSeconds, strSeconds);
      pulseUnitBox("timer-box-seconds");
      lastSeconds = strSeconds;

      // Circular SVG Progress Ring on Seconds (Circumference ~201)
      if (secondsRing) {
        const offset = 201 - (201 * (seconds / 60));
        secondsRing.style.strokeDashoffset = offset;
      }

      // 10-Segment Cyber Core Energy Meter
      const litCount = Math.max(1, Math.ceil(((seconds % 60) + 1) / 6));
      energySegs.forEach((seg, idx) => {
        if (idx < litCount) {
          seg.classList.add("lit");
          seg.classList.remove("unlit");
        } else {
          seg.classList.remove("lit");
          seg.classList.add("unlit");
        }
      });
    }
  }

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);

  // Latency clock randomizer (11ms - 15ms)
  setInterval(() => {
    if (latencyEl) {
      const ms = Math.floor(11 + Math.random() * 5);
      latencyEl.textContent = `${ms}ms`;
    }
  }, 3500);

  // ---------------------------------------------------------
  // Feature 1: Fast-Forward Launch Demo Simulation
  // ---------------------------------------------------------
  if (btnLaunchSim && btnResetSim) {
    btnLaunchSim.addEventListener("click", () => {
      if (isSimulating) return;
      isSimulating = true;
      clearInterval(timerInterval);

      if (statusTitle) {
        statusTitle.textContent = "⚡ SIMULATING COUNTDOWN ACCELERATION...";
        statusTitle.className = "text-[10px] sm:text-xs font-black tracking-widest uppercase text-amber-300 font-mono animate-pulse";
      }

      playFilterWhoosh();

      // Rapidly count down units over 2.4 seconds
      let simSecs = 10;
      let simMins = 3;
      let simHours = 2;
      let simDays = 1;

      const simStep = setInterval(() => {
        simSecs -= 1;
        if (simSecs < 0) {
          simSecs = 9;
          simMins = Math.max(0, simMins - 1);
          simHours = Math.max(0, simHours - 1);
          simDays = Math.max(0, simDays - 1);
        }

        flipDigit(elDays, String(simDays).padStart(2, "0"));
        flipDigit(elHours, String(simHours).padStart(2, "0"));
        flipDigit(elMinutes, String(simMins).padStart(2, "0"));
        flipDigit(elSeconds, String(simSecs).padStart(2, "0"));
        pulseUnitBox("timer-box-seconds");

        if (secondsRing) {
          secondsRing.style.strokeDashoffset = 201 - (201 * (simSecs / 10));
        }

        if (simDays === 0 && simHours === 0 && simMins === 0 && simSecs === 0) {
          clearInterval(simStep);

          // Climax: Festival officially live!
          flipDigit(elDays, "00");
          flipDigit(elHours, "00");
          flipDigit(elMinutes, "00");
          flipDigit(elSeconds, "00");

          if (statusTitle) {
            statusTitle.textContent = "🔥 FESTIVAL IS LIVE! ARENAS ARE OPEN!";
            statusTitle.className = "text-[10px] sm:text-xs font-black tracking-widest uppercase bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300 bg-clip-text text-transparent font-mono animate-bounce";
          }

          // Double Confetti Cannon & Fanfare
          fireFestConfetti();
          setTimeout(fireFestConfetti, 450);
          playCelebrationFanfare();

          btnLaunchSim.classList.add("hidden");
          btnResetSim.classList.remove("hidden");
        }
      }, 150);
    });

    btnResetSim.addEventListener("click", () => {
      isSimulating = false;
      btnResetSim.classList.add("hidden");
      btnLaunchSim.classList.remove("hidden");

      if (statusTitle) {
        statusTitle.textContent = "T-MINUS TO FESTIVAL LAUNCH";
        statusTitle.className = "text-[10px] sm:text-xs font-black tracking-widest uppercase bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent font-mono";
      }

      playFilterWhoosh();
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
    });
  }

  // ---------------------------------------------------------
  // Feature 3: One-Click Calendar Integration & Notification
  // ---------------------------------------------------------
  const btnCalendar = document.getElementById("btn-add-calendar");
  if (btnCalendar) {
    btnCalendar.addEventListener("click", () => {
      playHoverBlip();
      const gCalUrl =
        "https://calendar.google.com/calendar/render?action=TEMPLATE&text=HSB+FEST+2026&dates=20261114T043000Z/20261115T163000Z&details=The+ultimate+college+arena+of+technology,+culture,+design,+gaming,+and+sports+at+HSB+FEST+2026.&location=Campus+Grounds";
      window.open(gCalUrl, "_blank");
      showLiveActivityToastCustom("📅 Event added to your calendar! See you on Nov 14!");
    });
  }

  const btnNotify = document.getElementById("btn-notify-fest");
  if (btnNotify) {
    btnNotify.addEventListener("click", () => {
      playHoverBlip();
      btnNotify.innerHTML = `<span>✅</span><span>Reminder Set!</span>`;
      btnNotify.classList.add("bg-emerald-950", "text-emerald-300", "border-emerald-600");
      showLiveActivityToastCustom("🔔 Fest reminder active! You'll be alerted when arenas open.");
    });
  }

  // Initialize subtle 3D tilt on the timer wrapper
  const timerWrap = document.querySelector(".timer-laser-wrap");
  if (timerWrap && typeof VanillaTilt !== "undefined") {
    VanillaTilt.init(timerWrap, {
      max: 8,
      speed: 400,
      glare: true,
      "max-glare": 0.2,
      perspective: 1000,
    });
  }
}

// -------------------------------------------------------------
// Confetti Burst Helper
// -------------------------------------------------------------
function fireFestConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 75,
      angle: 60,
      spread: 60,
      origin: { x: 0.1, y: 0.65 },
      colors: ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#38bdf8"],
    });
    confetti({
      particleCount: 75,
      angle: 120,
      spread: 60,
      origin: { x: 0.9, y: 0.65 },
      colors: ["#a855f7", "#ec4899", "#f59e0b", "#10b981", "#38bdf8"],
    });
  }
}

// -------------------------------------------------------------
// Web Audio API Synthesizer (Native browser sound, zero files)
// -------------------------------------------------------------
let audioCtx = null;
let festBeatsOscillators = [];
let isFestAudioPlaying = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// UI Sound Effects (Zero external audio files, pure Web Audio synthesis)
let isSfxEnabled = true;

function playHoverBlip() {
  if (!isSfxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(650, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(920, ctx.currentTime + 0.045);
    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.048);
  } catch (e) {}
}

function playFilterWhoosh() {
  if (!isSfxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.07);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.075);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.078);
  } catch (e) {}
}

function playZapSound() {
  if (!isSfxEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(920, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.23);
  } catch (e) {}
}

// Celebration Fanfare chime on registration (C5 - E5 - G5 - C6)
function playCelebrationFanfare() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.65);
    });
  } catch (e) {
    console.warn("Audio not allowed yet by browser", e);
  }
}

// Upbeat 6-Second Electronic Fest Synth Groove
function toggleFestAudio() {
  if (isFestAudioPlaying) {
    stopFestAudio();
    return;
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    isFestAudioPlaying = true;
    const btn = document.getElementById("fest-audio-btn");
    const icon = document.getElementById("audio-icon");
    const label = document.getElementById("audio-label");

    if (icon) icon.textContent = "🔊";
    if (label) label.textContent = "Playing Vibe...";
    if (btn) btn.classList.add("bg-purple-600", "text-white", "animate-pulse");

    const eq = document.getElementById("audio-eq");
    if (eq) {
      eq.classList.remove("hidden");
      eq.classList.add("flex");
    }

    const melody = [
      { freq: 440.0, time: 0.0, dur: 0.2 },
      { freq: 523.25, time: 0.25, dur: 0.2 },
      { freq: 659.25, time: 0.5, dur: 0.35 },
      { freq: 587.33, time: 0.9, dur: 0.2 },
      { freq: 523.25, time: 1.15, dur: 0.2 },
      { freq: 440.0, time: 1.4, dur: 0.4 },
      { freq: 392.0, time: 1.9, dur: 0.25 },
      { freq: 440.0, time: 2.2, dur: 0.2 },
      { freq: 523.25, time: 2.45, dur: 0.2 },
      { freq: 659.25, time: 2.7, dur: 0.35 },
      { freq: 783.99, time: 3.15, dur: 0.45 },
      { freq: 659.25, time: 3.65, dur: 0.3 },
      { freq: 523.25, time: 4.0, dur: 0.4 },
      { freq: 587.33, time: 4.5, dur: 0.5 },
      { freq: 523.25, time: 5.1, dur: 0.8 },
    ];

    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

      gain.gain.setValueAtTime(0, ctx.currentTime + note.time);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + note.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + note.time);
      osc.stop(ctx.currentTime + note.time + note.dur);

      festBeatsOscillators.push(osc);
    });

    setTimeout(() => {
      stopFestAudio();
    }, 6200);
  } catch (e) {
    console.error("Audio error:", e);
    stopFestAudio();
  }
}

function stopFestAudio() {
  isFestAudioPlaying = false;
  festBeatsOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch (e) {}
  });
  festBeatsOscillators = [];

  const btn = document.getElementById("fest-audio-btn");
  const icon = document.getElementById("audio-icon");
  const label = document.getElementById("audio-label");
  const eq = document.getElementById("audio-eq");
  if (icon) icon.textContent = "🎵";
  if (label) label.textContent = "Play Vibe";
  if (btn) btn.classList.remove("bg-purple-600", "text-white", "animate-pulse");
  if (eq) {
    eq.classList.add("hidden");
    eq.classList.remove("flex");
  }
}

// -------------------------------------------------------------
// Dynamic Hero Typewriter Effect
// -------------------------------------------------------------
function startTypewriter() {
  const targetEl = document.getElementById("typewriter-text");
  if (!targetEl) return;

  const phrases = [
    "HSB FEST 2026 🚀",
    "The Ultimate Tech Arena 💻",
    "Battle of the Bands 🎸",
    "Valorant & Gaming Arena 🎮",
    "14 Epic Competitions 🏆",
    "Where Legends Compete ⚡",
  ];

  let phraseIndex = 0;
  let charIndex = phrases[0].length;
  let isDeleting = true;

  function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
      targetEl.textContent = currentPhrase.substring(0, charIndex);
    } else {
      charIndex++;
      targetEl.textContent = currentPhrase.substring(0, charIndex);
    }

    let typeSpeed = isDeleting ? 40 : 80;

    // Finished typing full word
    if (!isDeleting && charIndex === currentPhrase.length) {
      typeSpeed = 2000; // Pause at complete word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 400; // Brief pause before typing next
    }

    setTimeout(type, typeSpeed);
  }

  // Let initial title display for 2.2 seconds before starting typewriter loop
  setTimeout(type, 2200);
}

// -------------------------------------------------------------
// Interactive Cyber Constellation Particles Canvas
// -------------------------------------------------------------
// Interactive Cyber Constellation Particles Canvas (High-Luminance Cyber Neon)
// -------------------------------------------------------------
// -------------------------------------------------------------
// Interactive Cyber Constellation Particles Canvas (Multi-Theme Support)
// -------------------------------------------------------------
const festThemes = [
  {
    name: "Cyber Neon",
    icon: "🎨",
    colors: [
      "rgba(0, 245, 255, ",   // Electric Neon Cyan
      "rgba(255, 30, 150, ",  // Hot Magenta Pink
      "rgba(185, 75, 255, ",  // Electric Cyber Violet
      "rgba(255, 220, 0, ",   // Bright Cyber Gold
      "rgba(0, 255, 170, ",   // Neon Spring Lime
    ],
  },
  {
    name: "Golden Glory",
    icon: "⚡",
    colors: [
      "rgba(255, 215, 0, ",   // Cyber Gold
      "rgba(245, 158, 11, ",  // Warm Amber
      "rgba(239, 68, 68, ",   // Vivid Crimson
      "rgba(251, 191, 36, ",  // Sunflower
      "rgba(255, 255, 255, ", // Brilliant Starlight
    ],
  },
  {
    name: "Toxic Matrix",
    icon: "🧪",
    colors: [
      "rgba(16, 185, 129, ",  // Matrix Emerald
      "rgba(0, 255, 170, ",   // Neon Lime
      "rgba(34, 211, 238, ",  // Cyan
      "rgba(52, 211, 153, ",  // Mint
      "rgba(167, 243, 208, ", // Light Mint
    ],
  },
];
let currentThemeIndex = 0;
let activeParticleColors = festThemes[0].colors;
let festParticleSystem = [];

function initFestParticles() {
  const canvas = document.getElementById("fest-particles-canvas");
  const heroSection = document.getElementById("hero-section");
  if (!canvas || !heroSection) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const particleCount = 80;

  const mouse = {
    x: null,
    y: null,
    radius: 170
  };

  function resizeCanvas() {
    canvas.width = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  window.addEventListener("mousemove", (e) => {
    const rect = heroSection.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    } else {
      mouse.x = null;
      mouse.y = null;
    }
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * (canvas.width || window.innerWidth);
      this.y = Math.random() * (canvas.height || 420);
      this.isSuper = Math.random() < 0.28; // 28% are prominent glowing super stars!
      this.radius = this.isSuper ? Math.random() * 2.5 + 4.5 : Math.random() * 2.0 + 2.5;
      this.vx = (Math.random() - 0.5) * 0.85;
      this.vy = (Math.random() - 0.5) * 0.85;
      this.colorIndex = Math.floor(Math.random() * activeParticleColors.length);
      this.baseColor = activeParticleColors[this.colorIndex];
      this.alpha = Math.random() * 0.3 + 0.7; // 0.70 to 1.0 (Highly visible!)
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.04 + 0.02;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += this.pulseSpeed;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      // Mouse interactive push & tether
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.8;
          this.y -= (dy / dist) * force * 1.8;
        }
      }
    }

    draw() {
      const currentRadius = this.radius + Math.sin(this.pulse) * (this.isSuper ? 1.6 : 0.6);
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(1.2, currentRadius), 0, Math.PI * 2);
      ctx.fillStyle = this.baseColor + this.alpha + ")";
      ctx.shadowBlur = this.isSuper ? 22 : 12;
      ctx.shadowColor = this.baseColor + "1)";
      ctx.fill();

      // Outer sparkling halo on Super Stars
      if (this.isSuper) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius * 1.9, 0, Math.PI * 2);
        ctx.strokeStyle = this.baseColor + "0.45)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
  }

  festParticleSystem = [];
  for (let i = 0; i < particleCount; i++) {
    festParticleSystem.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < festParticleSystem.length; i++) {
      festParticleSystem[i].update();
      festParticleSystem[i].draw();

      // Connect near particles with vivid neon threads
      for (let j = i + 1; j < festParticleSystem.length; j++) {
        const dx = festParticleSystem[i].x - festParticleSystem[j].x;
        const dy = festParticleSystem[i].y - festParticleSystem[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 135) {
          const lineAlpha = (1 - dist / 135) * 0.7; // Bright 0.70 max opacity
          ctx.beginPath();
          ctx.moveTo(festParticleSystem[i].x, festParticleSystem[i].y);
          ctx.lineTo(festParticleSystem[j].x, festParticleSystem[j].y);
          ctx.strokeStyle = festParticleSystem[i].baseColor + lineAlpha + ")";
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }

      // Connect nearby particles to mouse cursor with intense glowing laser
      if (mouse.x !== null && mouse.y !== null) {
        const dx = festParticleSystem[i].x - mouse.x;
        const dy = festParticleSystem[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const mouseLineAlpha = (1 - dist / mouse.radius) * 0.95;
          ctx.beginPath();
          ctx.moveTo(festParticleSystem[i].x, festParticleSystem[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 245, 255, ${mouseLineAlpha})`;
          ctx.lineWidth = 2.2;
          ctx.shadowBlur = 12;
          ctx.shadowColor = "rgba(0, 245, 255, 0.9)";
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Draw interactive neon cursor reticle
    if (mouse.x !== null && mouse.y !== null) {
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 22, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 245, 255, 0.75)";
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(0, 245, 255, 0.9)";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 30, 150, 0.95)";
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// -------------------------------------------------------------
// Roll-Up Slot Machine Stats Counter & Interactive Sci-Fi Hub
// -------------------------------------------------------------
function initStatCounters() {
  const statWraps = document.querySelectorAll(".stat-laser-wrap");
  const counters = document.querySelectorAll(".stat-counter");

  // Reusable slot machine count animation
  function rollStatNumber(counter, duration = 1800) {
    if (!counter) return;
    const target = parseInt(counter.getAttribute("data-target") || "0", 10);
    const prefix = counter.getAttribute("data-prefix") || "";
    const suffix = counter.getAttribute("data-suffix") || "";
    const startTime = performance.now();

    counter.classList.remove("stat-sparkle-pop");

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeProgress * target);

      counter.textContent = `${prefix}${currentVal.toLocaleString()}${progress >= 1 ? suffix : ""}`;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
        counter.classList.add("stat-sparkle-pop");
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // Initial count roll on page load
  counters.forEach((c) => rollStatNumber(c, 2000));

  // Re-roll on hover with snappy duration
  statWraps.forEach((wrap) => {
    let lastHoverTime = 0;
    wrap.addEventListener("mouseenter", () => {
      const now = Date.now();
      if (now - lastHoverTime > 900) {
        lastHoverTime = now;
        playHoverBlip();
        const counter = wrap.querySelector(".stat-counter");
        if (counter) rollStatNumber(counter, 750);
      }
    });
  });

  // VanillaTilt on Stat Cards
  if (typeof VanillaTilt !== "undefined") {
    VanillaTilt.init(statWraps, {
      max: 10,
      speed: 350,
      glare: true,
      "max-glare": 0.22,
      scale: 1.05,
      perspective: 800,
    });
  }

  // Card 1: Prize Pool -> Open Breakdown Modal
  const cardPrize = document.getElementById("stat-card-prize");
  const prizeModal = document.getElementById("prize-modal");
  const prizeCard = document.getElementById("prize-modal-card");
  const closePrizeBtn = document.getElementById("close-prize-modal-btn");
  const browseFromPrizeBtn = document.getElementById("btn-prize-browse-events");

  function openPrizeModal() {
    if (!prizeModal || !prizeCard) return;
    playHoverBlip();
    prizeModal.classList.remove("hidden");
    requestAnimationFrame(() => {
      prizeModal.classList.remove("opacity-0");
      prizeCard.classList.remove("scale-95");
      prizeCard.classList.add("scale-100");
    });
    if (typeof confetti !== "undefined") {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#fbbf24", "#d97706"],
      });
    }
  }

  function closePrizeModal() {
    if (!prizeModal || !prizeCard) return;
    prizeModal.classList.add("opacity-0");
    prizeCard.classList.remove("scale-100");
    prizeCard.classList.add("scale-95");
    setTimeout(() => {
      prizeModal.classList.add("hidden");
    }, 200);
  }

  if (cardPrize) {
    cardPrize.addEventListener("click", openPrizeModal);
  }
  if (closePrizeBtn) {
    closePrizeBtn.addEventListener("click", closePrizeModal);
  }
  if (prizeModal) {
    prizeModal.addEventListener("click", (e) => {
      if (e.target === prizeModal) closePrizeModal();
    });
  }
  if (browseFromPrizeBtn) {
    browseFromPrizeBtn.addEventListener("click", () => {
      closePrizeModal();
      const eventsSection = document.getElementById("events");
      if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // Card 2: Students Joining -> Celebratory Toast & Mini Confetti
  const cardStudents = document.getElementById("stat-card-students");
  if (cardStudents) {
    cardStudents.addEventListener("click", () => {
      playHoverBlip();
      showLiveActivityToastCustom("🎓 1,500+ verified registrations across 28 institutes! Secure your pass now.");
      if (typeof confetti !== "undefined") {
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.55 },
          colors: ["#ec4899", "#a855f7", "#c084fc"],
        });
      }
    });
  }

  // Card 3: Battle Events -> Scroll to Events & Activate "All" Filter
  const cardEvents = document.getElementById("stat-card-events");
  if (cardEvents) {
    cardEvents.addEventListener("click", () => {
      playHoverBlip();
      const eventsSection = document.getElementById("events");
      if (eventsSection) {
        eventsSection.scrollIntoView({ behavior: "smooth" });
      }
      const allFilterBtn = document.querySelector('#category-filters [data-category="All"]');
      if (allFilterBtn) {
        allFilterBtn.click();
      }
      showLiveActivityToastCustom("⚔️ Showing all 15 Battle Arenas live!");
    });
  }

  // Card 4: Fest Categories -> Scroll to Category Filters & Glow Pulse
  const cardCategories = document.getElementById("stat-card-categories");
  if (cardCategories) {
    cardCategories.addEventListener("click", () => {
      playHoverBlip();
      const catFilters = document.getElementById("category-filters");
      if (catFilters) {
        catFilters.scrollIntoView({ behavior: "smooth", block: "center" });
        const filterBtns = catFilters.querySelectorAll(".filter-btn");
        filterBtns.forEach((btn, idx) => {
          setTimeout(() => {
            btn.classList.add("ring-2", "ring-cyan-400", "scale-105");
            setTimeout(() => {
              btn.classList.remove("ring-2", "ring-cyan-400", "scale-105");
            }, 600);
          }, idx * 120);
        });
      }
      showLiveActivityToastCustom("🌐 5 Mega Categories: Technical, Cultural, Sports, Gaming & Workshop.");
    });
  }

  // Global ESC key listener to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && prizeModal && !prizeModal.classList.contains("hidden")) {
      closePrizeModal();
    }
  });
}

// -------------------------------------------------------------
// Live Activity Notification Toasts (Real-time Fest Energy)
// -------------------------------------------------------------
function initLiveActivityToasts() {
  const container = document.getElementById("live-activity-container");
  if (!container) return;

  const activities = [
    { name: "Rahul S.", dept: "CSE", event: "Code Sprint 2.0", icon: "💻", color: "text-cyan-400" },
    { name: "Priya K.", dept: "IT", event: "Dance Fiesta", icon: "💃", color: "text-pink-400" },
    { name: "Arjun M.", dept: "ECE", event: "Robo Race 2.0", icon: "🤖", color: "text-cyan-400" },
    { name: "Team Phoenix", dept: "Gaming Club", event: "Valorant Showdown", icon: "🎮", color: "text-rose-400" },
    { name: "Acoustic Souls", dept: "Music Soc", event: "Battle of the Bands", icon: "🎸", color: "text-purple-400" },
    { name: "Sneha P.", dept: "Design Cell", event: "UI/UX Workshop", icon: "✏️", color: "text-amber-400" },
    { name: "Vikram R.", dept: "Sports Comm", event: "5-a-Side Football", icon: "⚽", color: "text-emerald-400" },
    { name: "Aditya V.", dept: "AI Cell", event: "AI Pitch Fest", icon: "🧠", color: "text-cyan-400" },
    { name: "Rohan D.", dept: "CSE", event: "Intro to Vibe Coding", icon: "⚡", color: "text-amber-400" },
    { name: "Ananya B.", dept: "Media Club", event: "Photography Walk", icon: "📷", color: "text-purple-400" },
  ];

  let currentIdx = 0;

  function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove("toast-enter");
    toast.classList.add("toast-exit");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 320);
  }

  function showNextToast() {
    const act = activities[currentIdx];
    currentIdx = (currentIdx + 1) % activities.length;

    const toast = document.createElement("div");
    toast.className =
      "toast-enter flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-purple-800/50 shadow-2xl shadow-purple-950/70 text-xs text-slate-200 cursor-pointer hover:border-purple-500 transition group mb-2.5 max-w-sm";
    toast.innerHTML = `
      <span class="text-2xl p-2 rounded-xl bg-slate-800 border border-slate-700/60 shadow-inner flex-shrink-0 animate-bounce">
        ${act.icon}
      </span>
      <div class="flex-1 min-w-0 pr-1">
        <div class="flex items-center gap-1.5 mb-0.5">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span class="font-extrabold text-white truncate">${act.name}</span>
          <span class="text-[10px] text-slate-400 font-mono">(${act.dept})</span>
        </div>
        <p class="text-[11px] text-slate-300 truncate">
          Registered for <span class="font-bold ${act.color}">${act.event}</span>
        </p>
      </div>
      <button class="text-slate-500 hover:text-white text-xs px-1.5 py-0.5 rounded transition" title="Dismiss">✕</button>
    `;

    toast.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();
      dismissToast(toast);
    });

    toast.addEventListener("mouseenter", () => {
      playHoverBlip();
    });

    container.appendChild(toast);

    setTimeout(() => {
      dismissToast(toast);
    }, 5500);
  }

  // Launch initial toast after 2.5s, then trigger every 8.5s
  setTimeout(() => {
    showNextToast();
    setInterval(showNextToast, 8500);
  }, 2500);
}

// -------------------------------------------------------------
// Interactive Fullscreen Stardust Cursor Sparkle Trail
// -------------------------------------------------------------
function initCursorSparkles() {
  const canvas = document.getElementById("cursor-sparkle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  let sparkles = [];
  const sparkleColors = ["#00f5ff", "#ff1e96", "#b94bff", "#ffdc00", "#00ffaa", "#ffffff"];

  window.addEventListener("mousemove", (e) => {
    for (let i = 0; i < 2; i++) {
      if (sparkles.length < 80) {
        sparkles.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.1,
          vy: Math.random() * 0.9 + 0.3,
          size: Math.random() * 2.8 + 1.8,
          color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 22 + 18,
        });
      }
    }
  });

  function drawStar(cx, cy, spikes, outerRadius, innerRadius, color, alpha) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 6;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.life++;
      s.x += s.vx;
      s.y += s.vy;
      s.alpha = Math.max(0, 1 - s.life / s.maxLife);

      if (s.life >= s.maxLife || s.alpha <= 0) {
        sparkles.splice(i, 1);
      } else {
        drawStar(s.x, s.y, 4, s.size, s.size * 0.38, s.color, s.alpha);
      }
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// -------------------------------------------------------------
// Fest Theme Switcher Pill
// -------------------------------------------------------------
function initFestThemeSwitcher() {
  const themeBtn = document.getElementById("fest-theme-btn");
  const themeIcon = document.getElementById("theme-icon");
  const themeLabel = document.getElementById("theme-label");
  if (!themeBtn) return;

  themeBtn.addEventListener("click", () => {
    currentThemeIndex = (currentThemeIndex + 1) % festThemes.length;
    const theme = festThemes[currentThemeIndex];
    activeParticleColors = theme.colors;

    if (themeIcon) themeIcon.textContent = theme.icon;
    if (themeLabel) themeLabel.textContent = theme.name;

    // Refresh active particles to pick up new theme colors
    festParticleSystem.forEach((p) => {
      p.colorIndex = Math.floor(Math.random() * activeParticleColors.length);
      p.baseColor = activeParticleColors[p.colorIndex];
    });

    playFilterWhoosh();
  });
}

// -------------------------------------------------------------
// SFX Audio Toggle Button
// -------------------------------------------------------------
function initSfxToggle() {
  const sfxBtn = document.getElementById("fest-sfx-btn");
  const sfxIcon = document.getElementById("sfx-icon");
  const sfxLabel = document.getElementById("sfx-label");
  if (!sfxBtn) return;

  sfxBtn.addEventListener("click", () => {
    isSfxEnabled = !isSfxEnabled;
    if (sfxIcon) sfxIcon.textContent = isSfxEnabled ? "🔊" : "🔇";
    if (sfxLabel) sfxLabel.textContent = isSfxEnabled ? "SFX On" : "SFX Muted";

    if (isSfxEnabled) {
      playHoverBlip();
    }
  });
}

// -------------------------------------------------------------
// Fest Logo Cyber Power Zap & Glitch on Click
// -------------------------------------------------------------
function initFestLogoZap() {
  const logo = document.getElementById("fest-logo-link");
  if (!logo) return;

  logo.addEventListener("click", (e) => {
    e.preventDefault();
    logo.classList.add("cyber-glitch-active");
    playZapSound();
    fireFestConfetti();

    setTimeout(() => {
      logo.classList.remove("cyber-glitch-active");
    }, 800);
  });
}

// -------------------------------------------------------------
// OpenAI-Powered Real-Time Atmosphere & UI Morphing Engine
// -------------------------------------------------------------
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function hexToRgbaPrefix(hex) {
  if (!hex || typeof hex !== "string") return "rgba(6, 182, 212, ";
  let c = hex.replace("#", "");
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  const r = parseInt(c.substring(0, 2), 16) || 6;
  const g = parseInt(c.substring(2, 4), 16) || 182;
  const b = parseInt(c.substring(4, 6), 16) || 212;
  return `rgba(${r}, ${g}, ${b}, `;
}

async function morphAtmosphere(promptText) {
  if (!promptText || !promptText.trim()) return;
  const cleanPrompt = promptText.trim();

  const morphBtn = document.getElementById("btn-ai-morph");
  const morphText = document.getElementById("btn-ai-morph-text");
  const morphIcon = document.getElementById("btn-ai-morph-icon");
  const activePill = document.getElementById("active-theme-pill");
  const vibeDesc = document.getElementById("theme-vibe-desc");
  const rippleEl = document.getElementById("ai-theme-ripple");

  // Loading state
  if (morphBtn) morphBtn.disabled = true;
  if (morphText) morphText.textContent = "Synthesizing...";
  if (morphIcon) morphIcon.className = "animate-spin";
  playHoverBlip();

  try {
    const res = await fetch("/api/ai/morph-theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: cleanPrompt }),
    });

    if (!res.ok) throw new Error("AI Morph API error: " + res.status);
    const data = await res.json();

    // 1. Trigger Fullscreen Expanding Liquid Wave
    if (rippleEl) {
      rippleEl.classList.remove("liquid-wave-active", "opacity-0");
      void rippleEl.offsetWidth; // Force Reflow
      rippleEl.classList.add("liquid-wave-active");
      setTimeout(() => {
        rippleEl.classList.remove("liquid-wave-active");
      }, 1300);
    }

    // 2. Update CSS Custom Properties
    const root = document.documentElement;
    if (data.primary) root.style.setProperty("--theme-primary", data.primary);
    if (data.secondary) root.style.setProperty("--theme-secondary", data.secondary);
    if (data.accent) root.style.setProperty("--theme-accent", data.accent);
    if (data.background_hue) root.style.setProperty("--theme-bg-glow", data.background_hue);

    if (data.laser_gradient && Array.isArray(data.laser_gradient)) {
      data.laser_gradient.forEach((color, idx) => {
        root.style.setProperty(`--theme-laser-${idx + 1}`, color);
      });
    }

    // 3. Update HUD Display
    if (activePill) {
      activePill.textContent = `● ${(data.theme_name || cleanPrompt).toUpperCase()}`;
    }
    if (vibeDesc && data.vibe_description) {
      vibeDesc.textContent = `"${data.vibe_description}"`;
    }

    // 4. Morph Constellation Background Particles
    if (typeof festParticleSystem !== "undefined" && festParticleSystem.length > 0) {
      const p1 = hexToRgbaPrefix(data.primary);
      const p2 = hexToRgbaPrefix(data.secondary);
      const p3 = hexToRgbaPrefix(data.accent || data.primary);
      const newColorPalette = [p1, p2, p3, p1, p2];

      activeParticleColors = newColorPalette;
      festParticleSystem.forEach((p, idx) => {
        p.baseColor = newColorPalette[idx % newColorPalette.length];
        if (data.particle_speed) {
          p.vx = (Math.random() - 0.5) * 0.85 * data.particle_speed;
          p.vy = (Math.random() - 0.5) * 0.85 * data.particle_speed;
        }
      });
    }

    // 5. Confetti Spark & Toast
    if (typeof confetti !== "undefined") {
      confetti({
        particleCount: 45,
        spread: 75,
        origin: { y: 0.35 },
        colors: [data.primary, data.secondary, data.accent || "#ffffff"],
      });
    }
    showLiveActivityToastCustom(`🎨 Atmosphere Morphed: ${data.theme_name || cleanPrompt}`);

    // Trigger Festive Spiderman Swing if Diwali or Spider theme is activated
    if (
      cleanPrompt.toLowerCase().includes("diwali") ||
      cleanPrompt.toLowerCase().includes("spidey") ||
      cleanPrompt.toLowerCase().includes("spider") ||
      (data.theme_name && (data.theme_name.toLowerCase().includes("diwali") || data.theme_name.toLowerCase().includes("spider")))
    ) {
      if (typeof window.triggerFestiveSpidermanSwing === "function") {
        setTimeout(() => window.triggerFestiveSpidermanSwing(), 400);
      }
    }
    console.error("Atmosphere morph failed:", err);
    showLiveActivityToastCustom("⚡ AI Theme calibrated with standard preset.");
  } finally {
    if (morphBtn) morphBtn.disabled = false;
    if (morphText) morphText.textContent = "Morph Site";
    if (morphIcon) morphIcon.className = "animate-pulse";
  }
}

function initAIAtmosphereMorpher() {
  const form = document.getElementById("ai-theme-form");
  const input = document.getElementById("ai-theme-input");
  const presetBtns = document.querySelectorAll(".preset-vibe-btn");
  const revertBtn = document.getElementById("btn-revert-theme");

  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      morphAtmosphere(input.value);
    });
  }

  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const vibe = btn.getAttribute("data-vibe");
      if (input) input.value = vibe;
      morphAtmosphere(vibe);
    });
  });

  if (revertBtn) {
    revertBtn.addEventListener("click", () => {
      morphAtmosphere("Tokyo Cyberpunk Rain");
    });
  }
}

// -------------------------------------------------------------
// Floating 3D Kinetic Neural Core (ZENITH AI Concierge)
// -------------------------------------------------------------
let zenithChatHistory = [];

function initZenithAICompanion() {
  const toggleBtn = document.getElementById("btn-toggle-zenith");
  const drawer = document.getElementById("zenith-chat-drawer");
  const closeBtn = document.getElementById("close-zenith-chat");
  const chatForm = document.getElementById("zenith-chat-form");
  const chatInput = document.getElementById("zenith-chat-input");
  const messagesBox = document.getElementById("zenith-messages");
  const quickBtns = document.querySelectorAll(".zenith-quick-prompt");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.remove("hidden");
    requestAnimationFrame(() => {
      drawer.classList.remove("opacity-0", "translate-y-4");
      drawer.classList.add("opacity-100", "translate-y-0");
    });
    if (chatInput) chatInput.focus();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.add("opacity-0", "translate-y-4");
    drawer.classList.remove("opacity-100", "translate-y-0");
    setTimeout(() => {
      drawer.classList.add("hidden");
    }, 280);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      playHoverBlip();
      if (drawer.classList.contains("hidden")) {
        openDrawer();
      } else {
        closeDrawer();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      playHoverBlip();
      closeDrawer();
    });
  }

  quickBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.textContent.trim().replace(/^[^\w]+/, "");
      if (chatInput) chatInput.value = text;
      handleSendMessage(text);
    });
  });

  async function handleSendMessage(text) {
    if (!text || !text.trim() || !messagesBox) return;
    const cleanText = text.trim();
    if (chatInput) chatInput.value = "";
    playHoverBlip();

    // 1. Append User Message
    const userMsg = document.createElement("div");
    userMsg.className = "flex gap-2 justify-end";
    userMsg.innerHTML = `
      <div class="bg-cyan-950/80 p-2.5 rounded-2xl rounded-tr-none border border-cyan-500/40 text-cyan-200 leading-relaxed max-w-[85%]">
        ${escapeHtml(cleanText)}
      </div>
      <span class="text-base">🧑‍🎓</span>
    `;
    messagesBox.appendChild(userMsg);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // 2. Append Thinking Indicator
    const thinkingMsg = document.createElement("div");
    thinkingMsg.className = "flex gap-2 zenith-thinking-row";
    thinkingMsg.innerHTML = `
      <span class="text-base animate-spin">🤖</span>
      <div class="bg-slate-850 p-2.5 rounded-2xl rounded-tl-none border border-cyan-500/20 text-slate-400 italic">
        ZENITH AI is processing...
      </div>
    `;
    messagesBox.appendChild(thinkingMsg);
    messagesBox.scrollTop = messagesBox.scrollHeight;

    zenithChatHistory.push({ role: "user", content: cleanText });

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanText, history: zenithChatHistory }),
      });

      if (!res.ok) throw new Error("Chat API error: " + res.status);
      const data = await res.json();

      thinkingMsg.remove();

      // 3. Append AI Response Bubble
      const aiMsg = document.createElement("div");
      aiMsg.className = "flex gap-2";
      aiMsg.innerHTML = `
        <span class="text-base">🤖</span>
        <div class="bg-slate-850 p-2.5 rounded-2xl rounded-tl-none border border-cyan-500/30 text-slate-100 leading-relaxed max-w-[88%] shadow-md">
          ${data.reply || "Systems optimal! Ready for HSB FEST 2026."}
        </div>
      `;
      messagesBox.appendChild(aiMsg);
      messagesBox.scrollTop = messagesBox.scrollHeight;

      zenithChatHistory.push({ role: "assistant", content: data.reply || "" });

      // 4. Handle autonomous UI action from AI!
      if (data.action) {
        executeAIAction(data.action);
      }
    } catch (err) {
      console.error("ZENITH chat error:", err);
      thinkingMsg.remove();
      const errMsg = document.createElement("div");
      errMsg.className = "flex gap-2";
      errMsg.innerHTML = `
        <span class="text-base">⚠️</span>
        <div class="bg-rose-950/80 p-2.5 rounded-2xl border border-rose-500/40 text-rose-200">
          Could not connect to neural node. Try again shortly!
        </div>
      `;
      messagesBox.appendChild(errMsg);
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
  }

  function executeAIAction(action) {
    if (!action || !action.type) return;

    if (action.type === "open_prize_modal") {
      const cardPrize = document.getElementById("stat-card-prize");
      if (cardPrize) cardPrize.click();
    } else if (action.type === "scroll_to") {
      const targetEl = document.getElementById(action.target);
      if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
    } else if (action.type === "filter_category") {
      const btn = document.querySelector(`#category-filters [data-category="${action.category}"]`);
      if (btn) btn.click();
      const eventsSection = document.getElementById("events");
      if (eventsSection) eventsSection.scrollIntoView({ behavior: "smooth" });
    } else if (action.type === "trigger_launch_sim") {
      const btnLaunch = document.getElementById("btn-launch-sim");
      if (btnLaunch) btnLaunch.click();
    } else if (action.type === "trigger_spiderman_swing") {
      if (typeof window.triggerFestiveSpidermanSwing === "function") {
        window.triggerFestiveSpidermanSwing();
      }
    } else if (action.type === "morph_theme" && action.prompt) {
      morphAtmosphere(action.prompt);
    }
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSendMessage(chatInput.value);
    });
  }
}

// -------------------------------------------------------------
// Animated Festive Spider-Man (Cyber Diwali Web-Slinger)
// -------------------------------------------------------------
const spideyFestiveQuotes = [
  "With great festive power comes great coding responsibility! 🪔✨",
  "My Spider-Sense is tingling... ₹150,000 in prizes and infinite Kaju Katli! 🕷️✨",
  "Friendly neighborhood Spider-Man here, swapping web fluid for festive sparklers! 🎆",
  "Swapping web fluid for laddoos today! Happy Diwali from HSB FEST 2026! 🪔",
  "Swinging by to make sure everyone registers before the arenas fill up! 🕸️",
  "May your Diwali shine brighter than our 10-segment cyber core! 🪔💥",
];

function initFestiveSpiderman() {
  const stage = document.getElementById("spiderman-hero-stage");
  const heroSection = document.getElementById("hero-section");
  const spidey = document.getElementById("festive-spiderman");
  const webLine = document.getElementById("web-strand");
  const speechBubble = document.getElementById("spidey-speech");
  const speechText = document.getElementById("spidey-speech-text");
  const timerContainer = document.getElementById("fest-timer-container");

  if (!stage || !heroSection || !spidey || !webLine) return;

  let isSwinging = false;
  let quoteIndex = 0;

  function createSparklerEmber(x, y) {
    if (!stage) return;
    const ember = document.createElement("span");
    ember.className = "sparkler-ember";

    const colors = ["#fcd34d", "#fbbf24", "#f59e0b", "#f43f5e", "#38bdf8", "#ffffff"];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 16;

    ember.style.left = `${x + offsetX}px`;
    ember.style.top = `${y + offsetY}px`;
    ember.style.backgroundColor = col;
    ember.style.boxShadow = `0 0 10px ${col}, 0 0 18px ${col}`;

    stage.appendChild(ember);
    setTimeout(() => ember.remove(), 750);
  }

  function getPerchCoords() {
    const heroRect = heroSection.getBoundingClientRect();
    const titleEl = document.getElementById("hero-main-title") || document.getElementById("hero-heading-box") || document.querySelector("h1");
    if (titleEl) {
      const titleRect = titleEl.getBoundingClientRect();
      // Hovering directly above "Ignite Your Spark at"
      // Position him perched right over the upper-right area of the headline ("Spark at")
      const targetX = (titleRect.right - heroRect.left) - 95;
      const targetY = (titleRect.top - heroRect.top) - 86;
      return {
        x: Math.max(16, Math.min(heroRect.width - 120, targetX)),
        y: Math.max(10, targetY),
      };
    }
    return {
      x: heroRect.width * 0.65,
      y: 60,
    };
  }

  function swingSpiderman(startSide = "left") {
    if (isSwinging) return;
    isSwinging = true;

    spidey.classList.remove("spidey-perched", "animate-spidey-flip");
    if (speechBubble) {
      speechBubble.classList.add("hidden", "opacity-0");
    }

    const heroWidth = heroSection.offsetWidth;
    const perch = getPerchCoords();

    // Start coordinates
    const startX = startSide === "left" ? -140 : heroWidth + 140;
    const startY = 50;
    const endX = perch.x;
    const endY = perch.y;

    // Web Anchor on top ceiling
    const anchorX = startSide === "left" ? heroWidth * 0.38 : heroWidth * 0.62;
    const anchorY = 0;

    webLine.setAttribute("x1", anchorX);
    webLine.setAttribute("y1", anchorY);
    webLine.setAttribute("opacity", "0.95");

    const duration = 2200; // 2.2 seconds swing
    const startTime = performance.now();
    let lastEmberTime = 0;

    function animateSwing(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth pendulum swing curve (sinusoidal dip)
      const easeX = 1 - Math.pow(1 - progress, 2.5);
      const currentX = startX + (endX - startX) * easeX;

      // Vertical parabolic arc (dips in the middle then rises into landing perch)
      const arcDip = Math.sin(progress * Math.PI) * 140;
      const currentY = startY + (endY - startY) * progress + arcDip;

      // Dynamic tilt angle
      const swingAngle = Math.cos(progress * Math.PI) * 28 * (startSide === "left" ? 1 : -1);
      spidey.style.left = `${currentX}px`;
      spidey.style.top = `${currentY}px`;
      spidey.style.transform = `rotate(${swingAngle}deg)`;

      // Web Line Endpoint attached to Spidey hand
      const spideyHandX = currentX + (startSide === "left" ? 85 : 30);
      const spideyHandY = currentY + 35;
      webLine.setAttribute("x2", spideyHandX);
      webLine.setAttribute("y2", spideyHandY);

      // Spawn sparkler trail
      if (currentTime - lastEmberTime > 35) {
        lastEmberTime = currentTime;
        createSparklerEmber(currentX + 50, currentY + 70);
        createSparklerEmber(spideyHandX, spideyHandY);
      }

      if (progress < 1) {
        requestAnimationFrame(animateSwing);
      } else {
        // Landing Perch Complete! Hovering directly above "Ignite Your Spark at"
        isSwinging = false;
        spidey.style.transform = "rotate(0deg)";
        spidey.classList.add("spidey-perched");
        playHoverBlip();

        // Connect golden web strand from ceiling to Spidey's hand while suspended
        const spideyHandX = endX + (startSide === "left" ? 85 : 30);
        const spideyHandY = endY + 35;
        const perchAnchorX = endX + 55;
        webLine.setAttribute("x1", perchAnchorX);
        webLine.setAttribute("y1", 0);
        webLine.setAttribute("x2", spideyHandX);
        webLine.setAttribute("y2", spideyHandY);
        webLine.setAttribute("opacity", "0.75");

        // Landing confetti puff
        if (typeof confetti !== "undefined") {
          const rect = spidey.getBoundingClientRect();
          confetti({
            particleCount: 22,
            spread: 45,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight,
            },
            colors: ["#f59e0b", "#fbbf24", "#ef4444", "#ffffff"],
          });
        }

        // Show Festive Quote
        showSpideySpeech(spideyFestiveQuotes[quoteIndex % spideyFestiveQuotes.length]);
        quoteIndex++;
      }
    }

    requestAnimationFrame(animateSwing);
  }

  function showSpideySpeech(text) {
    if (!speechBubble || !speechText) return;
    speechText.textContent = text;
    speechBubble.classList.remove("hidden");
    requestAnimationFrame(() => {
      speechBubble.classList.remove("opacity-0");
      speechBubble.classList.add("opacity-100");
    });

    setTimeout(() => {
      speechBubble.classList.remove("opacity-100");
      speechBubble.classList.add("opacity-0");
      setTimeout(() => speechBubble.classList.add("hidden"), 300);
    }, 4500);
  }

  function triggerSpidermanAcrobatics() {
    if (isSwinging) return;
    playHoverBlip();

    spidey.classList.remove("spidey-perched", "animate-spidey-flip");
    void spidey.offsetWidth; // Reflow
    spidey.classList.add("animate-spidey-flip");
    webLine.setAttribute("opacity", "0.25");

    // Double firework confetti cannon
    if (typeof confetti !== "undefined") {
      const rect = spidey.getBoundingClientRect();
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { x: originX, y: originY },
        colors: ["#f59e0b", "#ef4444", "#fbbf24", "#06b6d4"],
      });
    }

    const randomQuote = spideyFestiveQuotes[Math.floor(Math.random() * spideyFestiveQuotes.length)];
    showSpideySpeech(randomQuote);
    showLiveActivityToastCustom(`🕷️ Spidey: ${randomQuote}`);

    setTimeout(() => {
      spidey.classList.remove("animate-spidey-flip");
      spidey.classList.add("spidey-perched");
      webLine.setAttribute("opacity", "0.75");
    }, 900);
  }

  spidey.addEventListener("click", triggerSpidermanAcrobatics);

  // Keep Spidey anchored properly on window resize
  window.addEventListener("resize", () => {
    if (!isSwinging && spidey.classList.contains("spidey-perched")) {
      const perch = getPerchCoords();
      spidey.style.left = `${perch.x}px`;
      spidey.style.top = `${perch.y}px`;
      const spideyHandX = perch.x + 85;
      const spideyHandY = perch.y + 35;
      const perchAnchorX = perch.x + 55;
      webLine.setAttribute("x1", perchAnchorX);
      webLine.setAttribute("y1", 0);
      webLine.setAttribute("x2", spideyHandX);
      webLine.setAttribute("y2", spideyHandY);
      webLine.setAttribute("opacity", "0.75");
    }
  });

  // Global trigger so AI or Preset button can swing Spider-Man
  window.triggerFestiveSpidermanSwing = () => {
    swingSpiderman(Math.random() < 0.5 ? "left" : "right");
  };

  // Initial cinematic entrance swing after 1.8 seconds
  setTimeout(() => {
    swingSpiderman("left");
  }, 1800);

  // Automatic swing loop every 26 seconds to keep hero lively
  setInterval(() => {
    if (!isSwinging && document.visibilityState === "visible") {
      swingSpiderman(Math.random() < 0.5 ? "left" : "right");
    }
  }, 26000);
}

// -------------------------------------------------------------
// Initial Boot
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  fetchEvents();
  startFestCountdown();
  startTypewriter();
  initFestParticles();
  initStatCounters();
  initLiveActivityToasts();
  initCursorSparkles();
  initFestThemeSwitcher();
  initSfxToggle();
  initFestLogoZap();
  initAIAtmosphereMorpher();
  initZenithAICompanion();
  initFestiveSpiderman();

  const audioBtn = document.getElementById("fest-audio-btn");
  if (audioBtn) {
    audioBtn.addEventListener("click", toggleFestAudio);
  }
});
