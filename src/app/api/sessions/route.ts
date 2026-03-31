import { NextResponse } from "next/server";
import { createSession } from "@/lib/data";
import { workoutSessionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = workoutSessionSchema.parse(json);
    const session = await createSession(payload);
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
