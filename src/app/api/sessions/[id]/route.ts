import { NextResponse } from "next/server";
import { deleteSession, updateSession } from "@/lib/data";
import { workoutSessionSchema } from "@/lib/validation";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const json = await request.json();
    const payload = workoutSessionSchema.parse(json);
    await updateSession(params.id, payload);
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

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
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
