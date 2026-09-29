import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { name, studentId, contact, note } = body;

    if (!name || !studentId || !contact) {
      return NextResponse.json(
        { error: "이름, 학년/반/번호, 연락처를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const db = await getDb();

    if (!db) {
      // DB가 없을 때 로컬 fallback 처리
      return NextResponse.json(
        {
          ok: true,
          message: "참가 신청이 완료되었습니다 (임시 모드).",
          registration: { id: `reg-${Date.now()}`, name, studentId, contact, note }
        },
        { status: 201 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 행사 ID입니다." },
        { status: 400 }
      );
    }

    const event = await db.collection("events").findOne({ _id: new ObjectId(id) });
    if (!event) {
      return NextResponse.json(
        { error: "해당 행사를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (event.status === "마감" || event.status === "종료") {
      return NextResponse.json(
        { error: "현재 신청이 마감되었거나 종료된 행사입니다." },
        { status: 400 }
      );
    }

    // 정원 확인
    const capacity = Number(event.capacity) || 0;
    const currentCount = Number(event.registeredCount) || 0;
    if (capacity > 0 && currentCount >= capacity) {
      return NextResponse.json(
        { error: "모집 정원이 마감되었습니다." },
        { status: 400 }
      );
    }

    // 중복 신청 확인 (동일 행사, 동일 학번/이름)
    const existing = await db.collection("event_registrations").findOne({
      eventId: id,
      $or: [{ studentId: studentId.trim() }, { contact: contact.trim() }]
    });

    if (existing) {
      return NextResponse.json(
        { error: "이미 동일한 학번 또는 연락처로 신청된 내역이 있습니다." },
        { status: 400 }
      );
    }

    // 참가 신청 기록 생성
    const newRegistration = {
      eventId: id,
      eventName: event.name,
      name: name.trim(),
      studentId: studentId.trim(),
      contact: contact.trim(),
      note: (note || "").trim(),
      createdAt: new Date()
    };

    const regResult = await db.collection("event_registrations").insertOne(newRegistration);

    // 행사 registeredCount 1 증가
    await db.collection("events").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { registeredCount: 1 }, $set: { updatedAt: new Date() } }
    );

    return NextResponse.json(
      {
        ok: true,
        message: "참가 신청이 성공적으로 완료되었습니다!",
        registrationId: regResult.insertedId.toString(),
        newRegisteredCount: currentCount + 1
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("EVENT REGISTER ERROR:", error);
    return NextResponse.json(
      { error: "참가 신청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
