"use client";

// Force dynamic rendering - don't prerender at build time
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const { addToast } = useToast();

    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("test123456");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                addToast({
                    title: "로그인 실패",
                    description: error.message,
                    variant: "error",
                });
                return;
            }

            if (data.session) {
                addToast({
                    title: "로그인 성공!",
                    description: "환영합니다 🎉",
                    variant: "success",
                });

                // Redirect to dashboard
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            console.error("Login error:", error);
            addToast({
                title: "오류 발생",
                description: "로그인 중 문제가 발생했습니다.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center pb-4">
                    <div className="text-6xl mb-4">🍅</div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        AI 소비 코치
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        대학생을 위한 스마트 가계부
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2 border-b border-slate-200 dark:border-slate-800">
                            <label
                                htmlFor="email"
                                className="text-sm font-semibold border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                            >
                                이메일
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="test@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2 border-b border-slate-200 dark:border-slate-800">
                            <label
                                htmlFor="password"
                                className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                            >
                                비밀번호
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            {isLoading ? "로그인 중..." : "로그인"}
                        </Button>
                    </form>

                    <div className="mt-6 p-4 bg-violet-50 dark:bg-slate-800 rounded-xl border border-violet-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-violet-900 dark:text-violet-300 mb-2">
                            💡 테스트 계정
                        </p>
                        <div className="space-y-1 text-xs text-violet-800 dark:text-violet-400">
                            <p>
                                📧 이메일:{" "}
                                <code className="bg-white dark:bg-slate-700 dark:text-slate-200 px-2 py-0.5 rounded">
                                    test@example.com
                                </code>
                            </p>
                            <p>
                                🔑 비밀번호:{" "}
                                <code className="bg-white dark:bg-slate-700 dark:text-slate-200 px-2 py-0.5 rounded">
                                    test123456
                                </code>
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            계정이 없으신가요?{" "}
                            <Link
                                href="/signup"
                                className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                            >
                                회원가입
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
