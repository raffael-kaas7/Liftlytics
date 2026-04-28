import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/data";
import { AUTH_COOKIE_NAME, getUsernameFromSessionToken } from "@/lib/auth";
import { workoutSessionSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const payload = workoutSessionSchema.parse(json);
    const loggedBy = getUsernameFromSessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
    const session = await createSession({ ...payload, loggedBy });
    return NextResponse.json({ id: session.id });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create session"
      },
      { status: 400 }
    );
  }
}
