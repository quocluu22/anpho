import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const SCRIPT_URL    = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
const ADMIN_SECRET  = process.env.ADMIN_SECRET;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  // Public actions — no auth needed
  const publicActions = ["getMenu","getSettings","getGallery","getReviews","getAbout","getStaffPublic"];
  if (!publicActions.includes(action)) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URLSearchParams(searchParams);
  if (!publicActions.includes(action)) {
    params.set("secret", ADMIN_SECRET);
  }

  const res  = await fetch(`${SCRIPT_URL}?${params.toString()}`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(request) {
  const session = await getServerSession();
  const body    = await request.json();

  // Public POST actions
  const publicPost = ["submitReservation","submitBooking","submitContact"];
  if (!publicPost.includes(body.action) && !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = { ...body, secret: ADMIN_SECRET };
  const res  = await fetch(SCRIPT_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
