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

    // 2. public.users 테이블에 프로필 생성
    // service role을 사용하여 RLS 우회
    const { error: profileError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email: authData.user.email!,
          full_name: name,
          created_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      
      // 프로필 생성 실패 시 auth 사용자 삭제 (선택적)
      // 주의: admin API 필요
      
      return NextResponse.json(
        { 
          error: "프로필 생성 중 오류가 발생했습니다.",
          details: profileError.message 
        },
        { status: 500 }
      );
    }

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

