"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (formData.password !== formData.confirmPassword) {
      addToast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "error",
      });
      return;
    }

    if (formData.password.length < 6) {
      addToast({
        title: "비밀번호 오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "error",
      });
      return;
    }

    if (!formData.name.trim()) {
      addToast({
        title: "이름 입력 필요",
        description: "이름을 입력해주세요.",
        variant: "error",
      });
      return;
    }
    
    try {
      setIsLoading(true);

      // 1. Supabase Auth로 사용자 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (authError) {
        addToast({
          title: "회원가입 실패",
          description: authError.message,
          variant: "error",
        });
        return;
      }

      if (!authData.user) {
        addToast({
          title: "회원가입 실패",
          description: "사용자 생성에 실패했습니다.",
          variant: "error",
        });
        return;
      }

      // 2. public.users 테이블에 프로필 생성
      const { error: profileError } = await supabase
        .from("users")
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email!,
            full_name: formData.name,
          },
        ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // 프로필 생성 실패해도 계속 진행 (이미 auth.users에는 생성됨)
      }

      addToast({
        title: "회원가입 성공! 🎉",
        description: "환영합니다! 로그인 중...",
        variant: "success",
      });
      
      // 로그인 성공 시 Dashboard로 이동
      // Supabase signUp은 자동으로 세션을 생성함
      router.push("/dashboard");
      router.refresh();
      
    } catch (error) {
      console.error("Signup error:", error);
      addToast({
        title: "오류 발생",
        description: "회원가입 중 문제가 발생했습니다.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <Link
            href="/login"
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          
          <div className="text-6xl mb-4">🍅</div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            회원가입
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            AI 소비 코치와 함께 시작하세요
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                이름
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="홍길동"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                이메일
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                비밀번호
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="최소 6자 이상"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                비밀번호 확인
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="비밀번호 재입력"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-13 text-base font-semibold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="font-semibold text-violet-600 hover:text-violet-700"
              >
                로그인
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

