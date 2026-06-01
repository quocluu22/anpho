const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// ── Public GET ────────────────────────────────────────────────
export async function fetchPublic(action) {
  const res = await fetch(`${SCRIPT_URL}?action=${action}`, { cache: "no-store" });
  return res.json();
}

// ── Admin GET ─────────────────────────────────────────────────
async function adminGet(action) {
  const res = await fetch(`/api/sheets?action=${action}`);
  const data = await res.json();
  return data;
}

// ── Admin POST ────────────────────────────────────────────────
async function adminPost(body) {
  const res = await fetch("/api/sheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, secret: ADMIN_SECRET }),
  });
  return res.json();
}

// ── Admin API ─────────────────────────────────────────────────
export const adminApi = {
  // Reservations
  getReservations:    ()  => adminGet("getReservations"),
  getBookings:        ()  => adminGet("getReservations"),
  updateReservation:  (d) => adminPost({ action: "updateReservationStatus", ...d }),
  updateBooking:      (d) => adminPost({ action: "updateReservationStatus", ...d }),

  // Menu
  getMenu:            ()  => adminGet("getMenu"),
  getServices:        ()  => adminGet("getMenu"),
  addMenuItem:        (d) => adminPost({ action: "addMenuItem", ...d }),
  updateMenuItem:     (d) => adminPost({ action: "updateMenuItem", ...d }),
  deleteMenuItem:     (d) => adminPost({ action: "deleteMenuItem", ...d }),

  // Gallery
  getGallery:         ()  => adminGet("getGallery"),
  addGallery:         (d) => adminPost({ action: "addGallery", ...d }),
  updateGallery:      (d) => adminPost({ action: "updateGallery", ...d }),
  deleteGallery:      (d) => adminPost({ action: "deleteGallery", ...d }),

  // Reviews
  getReviews:         ()  => adminGet("getReviews"),
  getTestimonials:    ()  => adminGet("getReviews"),
  addReview:          (d) => adminPost({ action: "addReview", ...d }),
  updateReview:       (d) => adminPost({ action: "updateReview", ...d }),
  deleteReview:       (d) => adminPost({ action: "deleteReview", ...d }),

  // About & Settings
  getAbout:           ()  => adminGet("getAbout"),
  updateAbout:        (d) => adminPost({ action: "updateAbout", ...d }),
  getSettings:        ()  => adminGet("getSettings"),
  updateSettings:     (d) => adminPost({ action: "updateSettings", ...d }),

  // Stats & Poll
  getStats:           ()  => adminGet("getStats"),
  pollReservations:   (since) => adminGet(`pollReservations&since=${encodeURIComponent(since)}`),
  pollBookings:       (since) => adminGet(`pollReservations&since=${encodeURIComponent(since)}`),
};
