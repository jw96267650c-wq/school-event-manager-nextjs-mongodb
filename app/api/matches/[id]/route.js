import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "잘못된 경기 ID입니다." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const match = await db.collection("matches").findOne({
      _id: new ObjectId(id),
    });

    if (!match) {
      return NextResponse.json(
        { message: "경기를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error("MATCH GET ERROR:", error);

    return NextResponse.json(
      { message: "경기 정보를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "잘못된 경기 ID입니다." },
        { status: 400 }
      );
    }

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

    if (body.homeTeam === body.awayTeam) {
      return NextResponse.json(
        { message: "같은 팀끼리는 경기를 진행할 수 없습니다." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const updateData = {
      competitionId: body.competitionId,
      homeTeam: body.homeTeam,
      awayTeam: body.awayTeam,
      date: body.date || "",
      time: body.time || "",
      venue: body.venue || "",
      status: body.status || "예정",
      homeScore:
        body.homeScore === "" || body.homeScore === undefined
          ? null
          : Number(body.homeScore),
      awayScore:
        body.awayScore === "" || body.awayScore === undefined
          ? null
          : Number(body.awayScore),
      updatedAt: new Date(),
    };

    const result = await db.collection("matches").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: updateData,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "경기를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "경기 일정이 수정되었습니다.",
    });
  } catch (error) {
    console.error("MATCH UPDATE ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "관리자 권한이 필요합니다." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "경기 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "잘못된 경기 ID입니다." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const result = await db.collection("matches").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "경기를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "경기 일정이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("MATCH DELETE ERROR:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "관리자 권한이 필요합니다." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "경기 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}