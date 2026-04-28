import { NextRequest, NextResponse } from "next/server";
import { deleteSession, updateSession } from "@/lib/data";
import { AUTH_COOKIE_NAME, getUsernameFromSessionToken } from "@/lib/auth";
import { workoutSessionSchema } from "@/lib/validation";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const json = await request.json();
    const payload = workoutSessionSchema.parse(json);
    const loggedBy = getUsernameFromSessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);
    await updateSession(params.id, payload, loggedBy);
    return NextResponse.json({ id: params.id });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to update session"
      },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteSession(params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to delete session"
      },
      { status: 400 }
    );
  }
}
