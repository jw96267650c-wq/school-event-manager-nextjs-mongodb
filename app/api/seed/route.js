import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "MongoDB 연결 실패: MONGODB_URI 환경변수를 확인해주세요." },
        { status: 500 }
      );
    }

    // 관리자 계정 생성/갱신 (admin / 1234)
    const passwordHash = crypto.createHash("sha256").update("1234").digest("hex");
    await db.collection("users").updateOne(
      { username: "admin" },
      {
        $set: {
          username: "admin",
          passwordHash,
          role: "admin",
          name: "최고 관리자",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "🎉 관리자 계정(admin / 1234)이 성공적으로 준비되었습니다!",
      adminInfo: {
        id: "admin",
        password: "1234",
      },
      database: db.databaseName,
    });
  } catch (error) {
    console.error("SEED API ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

