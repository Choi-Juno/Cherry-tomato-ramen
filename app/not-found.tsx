import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <span className="text-6xl">🔍</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-slate-600 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link href="/dashboard">
          <Button className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600">
            대시보드로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}

