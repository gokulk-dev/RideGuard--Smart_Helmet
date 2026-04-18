
var currentRole = "rider";   
var previousScreen = "";
var tripActive = false;
var speedInterval = null;
var sosTimer = null;
var sosCount = 10;

var contacts = [
  { id: 1, name: "Rajesh RN",  phone: "9876543210", relation: "Father", primary: true  },
  { id: 2, name: "Meena RN",   phone: "8765432109", relation: "Mother", primary: false }
];

var incidents = [
  { id: 1, type: "crash",       title: "Crash Detected — SOS Sent",    date: "12 Apr 2026", time: "10:42 PM", location: "Saravanampatti, CBE", gforce: "3.8g", response: "6 min",     period: "week"  },
  { id: 2, type: "false-alarm", title: "False Alarm — Cancelled",       date: "10 Apr 2026", time: "08:15 AM", location: "KKND Road, CBE",      gforce: "2.1g", response: "Cancelled", period: "week"  },
  { id: 3, type: "safe",        title: "Hard Brake — No Alert Needed",  date: "05 Apr 2026", time: "06:30 PM", location: "Peelamedu, CBE",       gforce: "1.9g", response: "N/A",      period: "month" },
  { id: 4, type: "crash",       title: "Crash Detected — SOS Sent",    date: "22 Mar 2026", time: "11:05 PM", location: "RS Puram, CBE",         gforce: "4.2g", response: "4 min",    period: "all"   }
];

// ── HELPERS ───────────────────────────────
function getById(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  var el = getById(id);
  if (el) el.textContent = text;
}

function showScreen(screenId) {
  previousScreen = getCurrentScreen();

  // hide all screens
  var allScreens = document.querySelectorAll(".screen");
  allScreens.forEach(function(s) {
    s.classList.remove("active");
  });

  // show target screen
  var target = getById(screenId);
  if (target) target.classList.add("active");

  // show/hide nav
  var nav = getById("bottom-nav");
  if (screenId === "screen-login") {
    nav.classList.add("hidden");
  } else {
    nav.classList.remove("hidden");
    // guardian uses 4-button nav, rider uses 5
    if (currentRole === "guardian") {
      nav.classList.add("guardian-nav");
    } else {
      nav.classList.remove("guardian-nav");
    }
  }

  // highlight correct nav button
  updateNavHighlight(screenId);
}

function getCurrentScreen() {
  var active = document.querySelector(".screen.active");
  if (active) return active.id;
  return "";
}

function goBack() {
  if (previousScreen) {
    showScreen(previousScreen);
  } else {
    // default back
    if (currentRole === "rider") {
      showScreen("screen-dashboard");
    } else {
      showScreen("screen-guardian");
    }
  }
}

function updateNavHighlight(screenId) {
  document.querySelectorAll(".nav-btn").forEach(function(btn) {
    btn.classList.remove("active");
  });

  var map = {
    "screen-dashboard": "nav-home",
    "screen-guardian":  "nav-home",
    "screen-tracking":  "nav-track",
    "screen-contacts":  "nav-contacts",
    "screen-history":   "nav-history",
    "screen-settings":  "nav-settings"
  };

  var navId = map[screenId];
  if (navId) {
    var navEl = getById(navId);
    if (navEl) navEl.classList.add("active");
  }
}

// ── LOGIN ─────────────────────────────────
var loginStep = 1;  // 1 = phone, 2 = otp, 3 = connecting

function handleLogin() {
  if (loginStep === 1) {
    sendOTP();
  } else if (loginStep === 2) {
    verifyOTP();
  }
}

function sendOTP() {
  var phoneInput = getById("phone-input");
  var phone = phoneInput.value.trim();

  // validate: exactly 10 digits, no letters
  var isValid = /^\d{10}$/.test(phone);

  if (!isValid) {
    phoneInput.classList.add("error");
    setText("phone-error", "Enter a valid 10-digit phone number");
    return;
  }

  // clear error
  phoneInput.classList.remove("error");
  setText("phone-error", "");
  phoneInput.disabled = true;

  // show OTP and role fields
  getById("otp-group").classList.remove("hidden");
  getById("role-group").classList.remove("hidden");

  // change button text
  getById("login-btn").textContent = "Verify Code";
  loginStep = 2;
}

function verifyOTP() {
  var otpInput = getById("otp-input");
  var otp = otpInput.value.trim();

  if (otp.length < 4) {
    otpInput.classList.add("error");
    setText("otp-error", "Enter the helmet code");
    return;
  }

  otpInput.classList.remove("error");
  setText("otp-error", "");

  // show BLE pairing
  getById("ble-section").classList.remove("hidden");
  getById("login-btn").disabled = true;
  getById("login-btn").textContent = "Connecting…";
  loginStep = 3;

  // simulate BLE connection
  var dots = 0;
  var searchTimer = setInterval(function() {
    dots = (dots + 1) % 4;
    setText("ble-status", "Searching" + ".".repeat(dots));
  }, 400);

  setTimeout(function() {
    clearInterval(searchTimer);
    setText("ble-status", "Connected ✓");
    getById("login-btn").disabled = false;
    getById("login-btn").textContent = "Enter App";
    getById("login-btn").onclick = enterApp;
  }, 2500);
}

function selectRole(role) {
  currentRole = role;

  getById("role-rider").classList.remove("active");
  getById("role-guardian").classList.remove("active");

  if (role === "rider") {
    getById("role-rider").classList.add("active");
  } else {
    getById("role-guardian").classList.add("active");
  }
}

function enterApp() {
  setText("role-display", currentRole === "rider" ? "Rider" : "Guardian");

  if (currentRole === "rider") {
    // set up rider nav
    buildRiderNav();
    showScreen("screen-dashboard");
    startLocationTracking();
    startScoreAnimation();
  } else {
    // set up guardian nav
    buildGuardianNav();
    showScreen("screen-guardian");
  }
}

function buildRiderNav() {
  var nav = getById("bottom-nav");
  nav.innerHTML = `
    <button class="nav-btn active" id="nav-home" onclick="navTo('home')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      <span>Home</span>
    </button>
    <button class="nav-btn" id="nav-track" onclick="navTo('track')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      <span>Track</span>
    </button>
    <button class="nav-btn" id="nav-contacts" onclick="navTo('contacts')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
      <span>Contacts</span>
    </button>
    <button class="nav-btn" id="nav-history" onclick="navTo('history')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
      <span>History</span>
    </button>
    <button class="nav-btn" id="nav-settings" onclick="navTo('settings')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
      <span>Settings</span>
    </button>
  `;
}

function buildGuardianNav() {
  var nav = getById("bottom-nav");
  nav.classList.add("guardian-nav");
  nav.innerHTML = `
    <button class="nav-btn active" id="nav-home" onclick="navTo('home')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      <span>Home</span>
    </button>
    <button class="nav-btn" id="nav-track" onclick="navTo('track')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      <span>Track Rider</span>
    </button>
    <button class="nav-btn" id="nav-history" onclick="navTo('history')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
      <span>Alerts</span>
    </button>
    <button class="nav-btn" id="nav-settings" onclick="navTo('settings')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
      <span>Settings</span>
    </button>
  `;
}

// ── NAVIGATION ────────────────────────────
function navTo(tab) {
  if (tab === "home") {
    if (currentRole === "rider") {
      showScreen("screen-dashboard");
    } else {
      showScreen("screen-guardian");
    }
  } else if (tab === "track") {
    showScreen("screen-tracking");
    refreshLocation();
  } else if (tab === "contacts") {
    renderContacts();
    showScreen("screen-contacts");
  } else if (tab === "history") {
    renderHistory("week");
    showScreen("screen-history");
  } else if (tab === "settings") {
    showScreen("screen-settings");
  }
}

// ── GPS / LOCATION ─────────────────────────
function refreshLocation() {
  setText("location-text", "Fetching GPS…");
  setText("lat-val", "--");
  setText("lon-val", "--");
  setText("map-overlay-loc", "📍 Fetching location…");

  if (!navigator.geolocation) {
    setText("location-text", "GPS not supported on this device");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function(position) {
      // success
      var lat = position.coords.latitude.toFixed(5);
      var lon = position.coords.longitude.toFixed(5);

      setText("location-text", "Lat " + lat + ", Lon " + lon);
      setText("lat-val", lat);
      setText("lon-val", lon);
      setText("map-overlay-loc", "📍 " + lat + "°N, " + lon + "°E");
      setText("dash-location-text", lat + "°N, " + lon + "°E");

      // update map iframe with real coordinates
      updateMap(lat, lon);
    },
    function(error) {
      // error or permission denied
      setText("location-text", "Location unavailable — check permissions");
      setText("lat-val", "N/A");
      setText("lon-val", "N/A");
      setText("map-overlay-loc", "📍 Location unavailable");

      // fallback to default Coimbatore location
      updateMap(11.0780, 76.9889);
    }
  );
}

function updateMap(lat, lon) {
  // calculate bounding box (about 3km around the point)
  var delta = 0.03;
  var bbox = (lon - delta) + "," + (lat - delta) + "," + (lon + delta) + "," + (lat + delta);
  var mapUrl = "https://www.openstreetmap.org/export/embed.html?bbox=" + bbox + "&layer=mapnik&marker=" + lat + "," + lon;

  var trackingMap = getById("tracking-map");
  if (trackingMap) trackingMap.src = mapUrl;

  var guardianMap = getById("guardian-map");
  if (guardianMap) guardianMap.src = mapUrl;
}

function startLocationTracking() {
  // auto-fetch GPS when rider opens app
  refreshLocation();
}

// ── TRIP TRACKING ─────────────────────────
function toggleTrip() {
  var btn = getById("trip-toggle");
  tripActive = !tripActive;

  if (tripActive) {
    btn.textContent = "End Trip";
    btn.classList.add("active-trip");

    // simulate speed changes
    speedInterval = setInterval(function() {
      var speed = Math.floor(Math.random() * 50) + 15;
      setText("speed-val", speed + " km/h");
      setText("guardian-speed", speed + " km/h");
    }, 1500);
  } else {
    btn.textContent = "Start Trip";
    btn.classList.remove("active-trip");
    clearInterval(speedInterval);
    setText("speed-val", "0 km/h");
    setText("guardian-speed", "0 km/h");
  }
}

// ── SAFETY SCORE ANIMATION ─────────────────
function startScoreAnimation() {
  var score = 94;
  setInterval(function() {
    // gently change score by ±1
    var change = Math.random() > 0.5 ? 1 : -1;
    score = Math.min(100, Math.max(70, score + change));

    setText("score-num", score);

    // update ring arc
    var arc = getById("score-arc");
    if (arc) {
      var dashoffset = 201 - (201 * score / 100);
      arc.setAttribute("stroke-dashoffset", dashoffset.toFixed(1));
    }
  }, 3000);
}

// ── CONTACTS ──────────────────────────────
function renderContacts() {
  var list = getById("contacts-list");
  if (!list) return;

  if (contacts.length === 0) {
    list.innerHTML = "<p style='font-size:13px;color:#9ca3af;text-align:center;padding:24px 0'>No contacts added yet.</p>";
    return;
  }

  list.innerHTML = "";

  contacts.forEach(function(contact) {
    var initials = contact.name.split(" ").map(function(w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
    var colors = ["#2563eb", "#16a34a", "#7c3aed", "#d97706", "#0891b2"];
    var colorIndex = contact.name.charCodeAt(0) % colors.length;
    var color = colors[colorIndex];

    var card = document.createElement("div");
    card.className = "contact-card";
    card.innerHTML =
      '<div class="contact-avatar" style="background:' + color + '22;color:' + color + '">' + initials + '</div>' +
      '<div>' +
        '<p class="contact-name">' + contact.name + '</p>' +
        '<p class="contact-detail">' + contact.phone + ' · ' + contact.relation + '</p>' +
        (contact.primary ? '<span class="primary-badge">Primary SOS</span>' : '') +
      '</div>' +
      '<button class="delete-btn" onclick="deleteContact(' + contact.id + ')">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' +
      '</button>';

    list.appendChild(card);
  });
}

function deleteContact(id) {
  contacts = contacts.filter(function(c) { return c.id !== id; });
  renderContacts();
}

function openAddModal() {
  if (contacts.length >= 3) {
    alert("Maximum 3 emergency contacts allowed.");
    return;
  }
  getById("add-modal").classList.remove("hidden");
}

function closeAddModal() {
  getById("add-modal").classList.add("hidden");
  getById("new-name").value = "";
  getById("new-phone").value = "";
  getById("new-relation").value = "";
}

function saveContact() {
  var name     = getById("new-name").value.trim();
  var phone    = getById("new-phone").value.trim();
  var relation = getById("new-relation").value;

  if (!name || !phone) {
    alert("Please fill in name and phone number.");
    return;
  }

  if (!/^\d{10}$/.test(phone)) {
    alert("Enter a valid 10-digit phone number.");
    return;
  }

  contacts.push({
    id:       Date.now(),
    name:     name,
    phone:    phone,
    relation: relation || "Other",
    primary:  contacts.length === 0
  });

  closeAddModal();
  renderContacts();
}

function testSOS() {
  var btn = getById("test-sos-btn");
  btn.textContent = "✓ Test alert sent to all contacts!";
  btn.style.color = "#16a34a";
  btn.style.borderColor = "#16a34a";

  setTimeout(function() {
    btn.textContent = "Send Test Alert to All Contacts";
    btn.style.color = "";
    btn.style.borderColor = "";
  }, 3000);
}

// ── HISTORY ───────────────────────────────
function filterHistory(period, clickedBtn) {
  // update active tab
  document.querySelectorAll(".filter-tab").forEach(function(tab) {
    tab.classList.remove("active");
  });
  clickedBtn.classList.add("active");

  renderHistory(period);
}

function renderHistory(period) {
  var list = getById("history-list");
  if (!list) return;

  // filter incidents by period
  var filtered = incidents.filter(function(inc) {
    if (period === "all")   return true;
    if (period === "week")  return inc.period === "week";
    if (period === "month") return inc.period === "week" || inc.period === "month";
    return true;
  });

  if (filtered.length === 0) {
    list.innerHTML = "<p style='font-size:13px;color:#9ca3af;text-align:center;padding:24px 0'>No incidents in this period.</p>";
    return;
  }

  list.innerHTML = "";

  filtered.forEach(function(inc) {
    var card = document.createElement("div");
    card.className = "incident-card";

    card.innerHTML =
      '<div class="incident-header" onclick="toggleIncident(this)">' +
        '<div class="incident-dot ' + inc.type + '"></div>' +
        '<div>' +
          '<p class="incident-title">' + inc.title + '</p>' +
          '<p class="incident-meta">' + inc.date + ' · ' + inc.time + ' · ' + inc.location + '</p>' +
        '</div>' +
        '<svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>' +
      '</div>' +
      '<div class="incident-detail">' +
        '<div class="detail-grid">' +
          '<div class="detail-box"><p class="detail-lbl">G-Force</p><p class="detail-val">' + inc.gforce + '</p></div>' +
          '<div class="detail-box"><p class="detail-lbl">Response Time</p><p class="detail-val">' + inc.response + '</p></div>' +
          '<div class="detail-box"><p class="detail-lbl">Location</p><p class="detail-val" style="font-size:11px">' + inc.location + '</p></div>' +
          '<div class="detail-box"><p class="detail-lbl">Time</p><p class="detail-val">' + inc.time + '</p></div>' +
        '</div>' +
      '</div>';

    list.appendChild(card);
  });
}

function toggleIncident(headerEl) {
  var card = headerEl.parentElement;
  card.classList.toggle("open");
}

// ── SETTINGS ──────────────────────────────
function selectSeg(btn, groupId) {
  var group = getById(groupId);
  group.querySelectorAll(".seg-btn").forEach(function(b) {
    b.classList.remove("active");
  });
  btn.classList.add("active");
}

function editTemplate() {
  alert('SOS Template:\n"EMERGENCY: I may have been in an accident.\nLocation: [GPS LINK]\nPlease contact me immediately."');
}

function logout() {
  // reset login state
  loginStep = 1;
  currentRole = "rider";
  tripActive = false;
  clearInterval(speedInterval);
  clearInterval(sosTimer);

  // reset login form
  var phoneInput = getById("phone-input");
  phoneInput.value = "";
  phoneInput.disabled = false;
  phoneInput.classList.remove("error");
  setText("phone-error", "");

  getById("otp-input").value = "";
  getById("otp-error") && setText("otp-error", "");
  getById("otp-group").classList.add("hidden");
  getById("role-group").classList.add("hidden");
  getById("ble-section").classList.add("hidden");

  var loginBtn = getById("login-btn");
  loginBtn.textContent = "Send OTP";
  loginBtn.disabled = false;
  loginBtn.onclick = handleLogin;

  showScreen("screen-login");
}

// ── SOS ───────────────────────────────────
function triggerSOS() {
  sosCount = 10;
  setText("sos-countdown", 10);
  setText("sos-count-text", 10);

  // show GPS in SOS overlay
  var locText = getById("location-text");
  if (locText) {
    setText("sos-gps-text", "GPS: " + locText.textContent);
  }

  getById("sos-overlay").classList.remove("hidden");

  sosTimer = setInterval(function() {
    sosCount--;
    setText("sos-countdown", sosCount);
    setText("sos-count-text", sosCount);

    if (sosCount <= 0) {
      clearInterval(sosTimer);
      sendSOS();
    }
  }, 1000);
}

function cancelSOS() {
  clearInterval(sosTimer);
  getById("sos-overlay").classList.add("hidden");
}

function sendSOS() {
  getById("sos-overlay").classList.add("hidden");

  // add to incident history
  var now = new Date();
  var dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  var timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  var newIncident = {
    id:       Date.now(),
    type:     "crash",
    title:    "Crash Detected — SOS Sent",
    date:     dateStr,
    time:     timeStr,
    location: getById("location-text") ? getById("location-text").textContent : "Unknown",
    gforce:   (2 + Math.random() * 3).toFixed(1) + "g",
    response: "Pending",
    period:   "week"
  };

  incidents.unshift(newIncident);

  alert("SOS sent to " + contacts.length + " contact(s) with your GPS location.");
}

// ── PHONE INPUT — digits only ──────────────
document.addEventListener("DOMContentLoaded", function() {
  var phoneInput = getById("phone-input");
  if (phoneInput) {
    phoneInput.addEventListener("input", function() {
      // remove any non-digit characters as user types
      this.value = this.value.replace(/\D/g, "");
      // cap at 10 digits
      if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
      }
    });
  }

  // init history render so it's ready
  renderHistory("week");
  renderContacts();
});
