import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getEventRegistrations } from "@/lib/data";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const registrations = await getEventRegistrations(id);
    return NextResponse.json(registrations);
  } catch (error) {
    console.error("EVENT REGISTRATIONS GET ERROR:", error);
    return NextResponse.json(
      { error: "신청자 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const regId = searchParams.get("regId");

    if (!regId) {
      return NextResponse.json(
        { error: "삭제할 신청 ID(regId)가 필요합니다." },
        { status: 400 }
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ ok: true });
    }

    if (ObjectId.isValid(regId)) {
      await db.collection("event_registrations").deleteOne({ _id: new ObjectId(regId) });
    } else {
      await db.collection("event_registrations").deleteOne({ _id: regId });
    }

    // 행사 인원 수 감소
    if (ObjectId.isValid(id)) {
      await db.collection("events").updateOne(
        { _id: new ObjectId(id), registeredCount: { $gt: 0 } },
        { $inc: { registeredCount: -1 } }
      );
    }

    return NextResponse.json({ ok: true, message: "참가 신청이 취소되었습니다." });
  } catch (error) {
    console.error("EVENT REGISTRATION DELETE ERROR:", error);
    return NextResponse.json(
      { error: "참가 신청 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { regId, name, studentId, contact, note } = body;

    if (!regId) {
      return NextResponse.json(
        { error: "수정할 신청 ID(regId)가 필요합니다." },
        { status: 400 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "학생 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ ok: true, message: "DB 미연결 (테스트 모드)" });
    }

    const filter = ObjectId.isValid(regId) ? { _id: new ObjectId(regId) } : { _id: regId };
    const update = {
      $set: {
        name: name.trim(),
        studentId: studentId ? studentId.trim() : "",
        contact: contact ? contact.trim() : "",
        note: note ? note.trim() : "",
        updatedAt: new Date(),
      },
    };

    const res = await db.collection("event_registrations").updateOne(filter, update);

    if (res.matchedCount === 0) {
      return NextResponse.json({ error: "신청 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "신청 정보가 수정되었습니다." });
  } catch (error) {
    console.error("EVENT REGISTRATION PUT ERROR:", error);
    return NextResponse.json(
      { error: "참가 신청 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
