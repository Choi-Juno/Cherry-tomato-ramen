import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 입력 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 이름은 필수입니다." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Supabase Auth에 사용자 생성
    // 주의: Database Trigger(on_auth_user_created)가 실행되어
    // public.users 테이블에 자동으로 프로필이 생성됩니다.
    // 따라서 API에서 별도로 public.users에 insert하면 중복 키 에러가 발생합니다.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "사용자 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: name,
      },
    });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "회원가입 중 문제가 발생했습니다." },
      { status: 500 }
    );
  }
}
