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
// Live Fest Countdown Timer with 3D Flip Digits & Tick Pulse
// -------------------------------------------------------------
function startFestCountdown() {
  const festDate = new Date("2026-11-14T10:00:00").getTime();

  let lastDays = "";
  let lastHours = "";
  let lastMinutes = "";
  let lastSeconds = "";

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
    const now = new Date().getTime();
    const distance = festDate - now;

    const elDays = document.getElementById("timer-days");
    const elHours = document.getElementById("timer-hours");
    const elMinutes = document.getElementById("timer-minutes");
    const elSeconds = document.getElementById("timer-seconds");

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
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);

  // Initialize subtle 3D tilt on the timer wrapper
  const timerWrap = document.querySelector(".timer-laser-wrap");
  if (timerWrap && typeof VanillaTilt !== "undefined") {
    VanillaTilt.init(timerWrap, {
      max: 8,
      speed: 400,
      glare: true,
      "max-glare": 0.22,
      perspective: 1000
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
// Roll-Up Slot Machine Stats Counter
// -------------------------------------------------------------
function initStatCounters() {
  const counters = document.querySelectorAll(".stat-counter");
  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute("data-target") || "0", 10);
    const prefix = counter.getAttribute("data-prefix") || "";
    const suffix = counter.getAttribute("data-suffix") || "";
    const duration = 2000;
    const startTime = performance.now();

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
      }
    }

    requestAnimationFrame(updateCounter);
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

  const audioBtn = document.getElementById("fest-audio-btn");
  if (audioBtn) {
    audioBtn.addEventListener("click", toggleFestAudio);
  }
});
