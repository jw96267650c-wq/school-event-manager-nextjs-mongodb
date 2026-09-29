import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getMatches } from "@/lib/data";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const matches = await getMatches();
    return NextResponse.json(matches);
  } catch (error) {
    console.error("MATCHES GET ERROR:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    if (!body.competitionId) {
      return NextResponse.json(
        { message: "대회를 선택해주세요." },
        { status: 400 }
      );
    }

    if (!body.homeTeam || !body.awayTeam) {
      return NextResponse.json(
        { message: "두 팀을 입력해주세요." },
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

    const newMatch = {
      competitionId: body.competitionId,
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      home: body.homeTeam,
      away: body.awayTeam,
      date: body.date || "",
      time: body.time || "",
      venue: body.venue || body.place || "",
      place: body.venue || body.place || "",
      status: body.status || "경기 예정",
      homeScore:
        body.homeScore === "" || body.homeScore === undefined
          ? null
          : Number(body.homeScore),
      awayScore:
        body.awayScore === "" || body.awayScore === undefined
          ? null
          : Number(body.awayScore),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("matches").insertOne(newMatch);

    return NextResponse.json(
      { _id: result.insertedId.toString(), ...newMatch },
      { status: 201 }
    );
  } catch (error) {
    console.error("MATCHES POST ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "관리자 권한이 필요합니다." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "경기 일정 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
