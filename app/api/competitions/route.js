import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCompetitions } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const competitions = await getCompetitions();
    return NextResponse.json(competitions);
  } catch (error) {
    console.error("COMPETITIONS GET ERROR:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { message: "대회 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { message: "데이터베이스 연결을 확인할 수 없습니다." },
        { status: 500 }
      );
    }

    const newCompetition = {
      name: body.name,
      sport: body.sport || "기타",
      description: body.description || "",
      status: body.status || "진행예정",
      startDate: body.startDate || "",
      endDate: body.endDate || "",
      games: Number(body.games) || 0,
      playedGames: Number(body.playedGames) || 0,
      teams: Number(body.teams) || 0,
      progress: Number(body.progress) || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("competitions").insertOne(newCompetition);

    return NextResponse.json(
      { _id: result.insertedId.toString(), ...newCompetition },
      { status: 201 }
    );
  } catch (error) {
    console.error("COMPETITION POST ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "관리자 권한이 필요합니다." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "대회 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}