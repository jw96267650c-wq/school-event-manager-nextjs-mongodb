import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getEvents } from "@/lib/data";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || searchParams.get("q") || "";

    const events = await getEvents({ category, status, search });
    return NextResponse.json(events);
  } catch (error) {
    console.error("EVENTS GET ERROR:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.date || !body.place) {
      return NextResponse.json(
        { error: "행사명, 일시, 장소는 필수 입력 사항입니다." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const newEvent = {
      icon: body.icon || "📌",
      name: body.name.trim(),
      date: body.date.trim(),
      place: body.place.trim(),
      category: body.category || "기타",
      status: body.status || "모집중",
      target: body.target || "전교생",
      capacity: Number(body.capacity) || 0,
      registeredCount: Number(body.registeredCount) || 0,
      description: body.description || "",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!db) {
      return NextResponse.json(
        { _id: `local-${Date.now()}`, ...newEvent },
        { status: 201 }
      );
    }

    const result = await db.collection("events").insertOne(newEvent);
    return NextResponse.json(
      { _id: result.insertedId.toString(), ...newEvent },
      { status: 201 }
    );
  } catch (error) {
    console.error("EVENTS POST ERROR:", error);
    return NextResponse.json(
      { error: "행사 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
