import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "DB 연결 실패" }, { status: 500 });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const notice = await db.collection("notices").findOne(filter);

    if (!notice) {
      return NextResponse.json({ error: "공지사항을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ ...notice, _id: notice._id.toString() });
  } catch (error) {
    console.error("NOTICE GET ERROR:", error);
    return NextResponse.json({ error: "공지사항 조회 중 오류 발생" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, category, important, date } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "공지사항 제목을 입력해주세요." }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "DB 연결 실패" }, { status: 500 });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const update = {
      $set: {
        title: title.trim(),
        content: content !== undefined ? content.trim() : "",
        category: category || "일반",
        important: Boolean(important),
        ...(date ? { date } : {}),
        updatedAt: new Date(),
      },
    };

    const result = await db.collection("notices").updateOne(filter, update);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "공지사항을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "공지사항이 수정되었습니다." });
  } catch (error) {
    console.error("NOTICE PUT ERROR:", error);
    return NextResponse.json({ error: "공지사항 수정 중 오류 발생" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "DB 연결 실패" }, { status: 500 });
    }

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id };
    const result = await db.collection("notices").deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "공지사항을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: "공지사항이 삭제되었습니다." });
  } catch (error) {
    console.error("NOTICE DELETE ERROR:", error);
    return NextResponse.json({ error: "공지사항 삭제 중 오류 발생" }, { status: 500 });
  }
}
