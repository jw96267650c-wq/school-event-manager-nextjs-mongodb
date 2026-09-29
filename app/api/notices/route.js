import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";


export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json([]);
    }
    const docs = await db.collection("notices").find({}).sort({ createdAt: -1, date: -1 }).toArray();
    return NextResponse.json(docs.map((x) => ({ ...x, _id: x._id.toString() })));
  } catch (error) {
    console.error("NOTICES GET ERROR:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, category, important, date } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "공지사항 제목을 입력해주세요." },
        { status: 400 }
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: "데이터베이스 연결에 실패했습니다." },
        { status: 500 }
      );
    }

    const todayStr = new Date().toISOString().slice(2, 10).replace(/-/g, ".");
    const newNotice = {
      title: title.trim(),
      content: content ? content.trim() : "",
      category: category || "일반",
      important: Boolean(important),
      date: date || todayStr,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("notices").insertOne(newNotice);

    return NextResponse.json(
      { _id: result.insertedId.toString(), ...newNotice },
      { status: 201 }
    );
  } catch (error) {
    console.error("NOTICES POST ERROR:", error);
    return NextResponse.json(
      { error: "공지사항 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
