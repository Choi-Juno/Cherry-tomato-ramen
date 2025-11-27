"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Users,
  Target,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Brain,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🍅</span>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            AI 소비 코치
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">
              로그인
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white border-0">
              시작하기
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-24 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            AI 기반 맞춤형 소비 코칭
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-violet-200 to-pink-200 bg-clip-text text-transparent">
              소비 습관을
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              AI가 바꿔드립니다
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            단순한 가계부가 아닙니다. <br className="hidden md:block" />
            AI가 당신의 소비 패턴을 분석하고, <strong className="text-white">행동 변화를 이끄는 맞춤형 코칭</strong>을 제공합니다.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow-lg shadow-violet-500/25">
                무료로 시작하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                이미 계정이 있어요
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-20">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-violet-400">15%</div>
            <div className="text-sm text-slate-500 mt-1">평균 지출 절감</div>
          </div>
          <div className="text-center border-x border-slate-800">
            <div className="text-3xl md:text-4xl font-bold text-pink-400">AI</div>
            <div className="text-sm text-slate-500 mt-1">맞춤형 코칭</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-400">20대</div>
            <div className="text-sm text-slate-500 mt-1">또래 비교 분석</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-24 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              왜 <span className="text-violet-400">AI 소비 코치</span>인가요?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              기존 가계부 앱은 기록만 할 뿐, 행동을 바꿔주지 않습니다.
              우리는 다릅니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-violet-500/50 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI 패턴 분석</h3>
                <p className="text-slate-400 leading-relaxed">
                  &ldquo;저녁에 배달 주문이 많아요&rdquo; 처럼 당신도 몰랐던 소비 패턴을 AI가 찾아냅니다.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-pink-500/50 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">맞춤형 챌린지</h3>
                <p className="text-slate-400 leading-relaxed">
                  &ldquo;이번 주 배달 2회 이하&rdquo; 같은 구체적인 목표를 제안하고 달성을 도와드려요.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-slate-900/50 border-slate-800 hover:border-orange-500/50 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">또래 비교</h3>
                <p className="text-slate-400 leading-relaxed">
                  같은 연령대 평균과 비교해서 내 소비 수준이 어느 정도인지 알려드려요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              이렇게 <span className="text-pink-400">작동해요</span>
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                icon: Zap,
                title: "간편하게 지출 입력",
                desc: "FAB 버튼 하나로 2초 만에 지출을 기록하세요.",
                color: "violet",
              },
              {
                step: "02",
                icon: BarChart3,
                title: "AI가 패턴 분석",
                desc: "2개월 치 데이터만 쌓이면 AI가 당신의 소비 습관을 분석합니다.",
                color: "pink",
              },
              {
                step: "03",
                icon: Sparkles,
                title: "맞춤 코칭 제공",
                desc: "비난 없이, 구체적이고 실천 가능한 조언을 받아보세요.",
                color: "orange",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-6 p-6 rounded-2xl bg-slate-900/30 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-${item.color}-500/20 to-transparent flex items-center justify-center`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-400`} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Step {item.step}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 px-6 py-24 bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            대학생들이 <span className="text-violet-400">선택한 이유</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote: "배달비가 이렇게 많은 줄 몰랐어요. AI가 알려줘서 한 달에 5만원 아꼈습니다.",
                author: "김OO",
                role: "대학교 3학년",
              },
              {
                quote: "다른 앱은 기록만 하고 끝인데, 여기는 진짜 행동을 바꿔줘요.",
                author: "이OO",
                role: "대학교 2학년",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-800 text-left">
                <CardContent className="p-6">
                  <p className="text-slate-300 mb-4 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.author}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-violet-900/50 to-pink-900/30 border border-violet-500/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              무료로 가입하고, AI 소비 코치의 맞춤형 조언을 받아보세요.
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 shadow-lg shadow-violet-500/25">
                무료 회원가입
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                무료 사용
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                카드 등록 없음
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                언제든 탈퇴 가능
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍅</span>
            <span className="font-bold text-slate-400">AI 소비 코치</span>
          </div>
          <p className="text-sm text-slate-600">
            © 2025 Cherry Tomato Ramen. Made with ❤️ for university students.
          </p>
        </div>
      </footer>
    </div>
  );
}
