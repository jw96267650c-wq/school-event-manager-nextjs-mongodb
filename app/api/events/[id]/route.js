import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getEvent } from "@/lib/data";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
      return NextResponse.json(
        { error: "해당 행사를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("EVENT GET ERROR:", error);
    return NextResponse.json(
      { error: "행사 정보를 불러오는 중 오류가 발생했습니다." },
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
      return NextResponse.json({ ok: true, ...body });
    }

    const filter = ObjectId.isValid(id)
      ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
      : { _id: id };

    const updateFields = {
      ...(body.name && { name: body.name.trim() }),
      ...(body.date && { date: body.date.trim() }),
      ...(body.place && { place: body.place.trim() }),
      ...(body.category && { category: body.category }),
      ...(body.status && { status: body.status }),
      ...(body.target && { target: body.target.trim() }),
      ...(body.capacity !== undefined && { capacity: Number(body.capacity) || 0 }),
      ...(body.icon && { icon: body.icon }),
      ...(body.description !== undefined && { description: body.description }),
      updatedAt: new Date()
    };

    const result = await db.collection("events").updateOne(
      filter,
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "수정할 행사를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "행사가 성공적으로 수정되었습니다." });
  } catch (error) {
    console.error("EVENT PUT ERROR:", error);
    return NextResponse.json(
      { error: "행사 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();

    if (!db) {
      return NextResponse.json({ error: "데이터베이스 연결을 확인할 수 없습니다." }, { status: 500 });
    }

    const filter = ObjectId.isValid(id)
      ? { $or: [{ _id: new ObjectId(id) }, { _id: id }] }
      : { _id: id };

    // 행사 삭제
    const result = await db.collection("events").deleteOne(filter);

    // 연관된 행사 참가 신청 데이터 정리
    await db.collection("event_registrations").deleteMany({
      $or: [{ eventId: id }, { eventId: String(id) }]
    });

    return NextResponse.json({
      ok: true,
      deletedCount: result.deletedCount,
      message: result.deletedCount > 0 ? "행사가 삭제되었습니다." : "행사가 이미 삭제되었거나 존재하지 않습니다."
    });
  } catch (error) {
    console.error("EVENT DELETE ERROR:", error);
    return NextResponse.json(
      { error: "행사 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

