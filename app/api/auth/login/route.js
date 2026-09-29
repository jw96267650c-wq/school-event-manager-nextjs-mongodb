import { NextResponse } from "next/server";
import { loginAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();

    const username = body.username?.trim();
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json(
        {
          message: "아이디와 비밀번호를 입력해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    const success = await loginAdmin(username, password);

    if (!success) {
      return NextResponse.json(
        {
          message: "아이디 또는 비밀번호가 올바르지 않습니다.",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "로그인되었습니다.",
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message: "로그인 처리 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}