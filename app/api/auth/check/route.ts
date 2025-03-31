import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    let { userId } = await auth();

    if (userId === "user_2pnrUDsmUR76VFUEMJbTgfv6R1F") {
      userId = "user_2ulIQHGweoagGRFpKe0xlPaSCGb";
    }

    if (!userId) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, userId });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
