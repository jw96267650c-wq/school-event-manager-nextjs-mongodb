import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { message: "데이터베이스 연결에 실패했습니다." },
        { status: 500 }
      );
    }

    const filter = ObjectId.isValid(id)
      ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
      : { _id: id };

    const competition = await db.collection("competitions").findOne(filter);

    if (!competition) {
      return NextResponse.json(
        { message: "대회를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...competition, _id: competition._id.toString() });
  } catch (error) {
    console.error("COMPETITION GET ERROR:", error);

    return NextResponse.json(
      { message: "대회를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ message: "DB 연결 실패" }, { status: 500 });
    }

    const filter = ObjectId.isValid(id)
      ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
      : { _id: id };

    const updateData = {
      ...(body.name && { name: body.name.trim() }),
      ...(body.sport && { sport: body.sport.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status && { status: body.status }),
      ...(body.startDate !== undefined && { startDate: body.startDate }),
      ...(body.endDate !== undefined && { endDate: body.endDate }),
      ...(body.teams !== undefined && { teams: Number(body.teams) || 0 }),
      ...(body.games !== undefined && { games: Number(body.games) || 0 }),
      ...(body.playedGames !== undefined && { playedGames: Number(body.playedGames) || 0 }),
      ...(body.progress !== undefined && { progress: Number(body.progress) || 0 }),
      updatedAt: new Date(),
    };

    const result = await db.collection("competitions").updateOne(
      filter,
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "대회를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "대회가 수정되었습니다.",
      updated: updateData,
    });
  } catch (error) {
    console.error("COMPETITION UPDATE ERROR:", error);
    return NextResponse.json(
      { message: "대회 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ message: "DB 연결 실패" }, { status: 500 });
    }

    const filter = ObjectId.isValid(id)
      ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
      : { _id: id };

    const result = await db.collection("competitions").deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "대회를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 해당 대회의 경기 데이터도 함께 정리
    await db.collection("matches").deleteMany({
      $or: [{ competitionId: id }, { competitionId: String(id) }]
    });

    return NextResponse.json({
      success: true,
      message: "대회가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("COMPETITION DELETE ERROR:", error);
    return NextResponse.json(
      { message: "대회 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
