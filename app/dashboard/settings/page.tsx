"use client";

// Force dynamic rendering - don't prerender at build time
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Bell, Download, Trash2, LogOut } from "lucide-react";

export default function SettingsPage() {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationTone, setNotificationTone] = useState<"coach" | "friend">("coach");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">설정</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">계정 및 앱 설정을 관리하세요</p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-violet-600 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>프로필</CardTitle>
              <CardDescription>계정 정보를 관리합니다</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">이름</label>
            <Input defaultValue="김지민" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-100">이메일</label>
            <Input type="email" defaultValue="jimin@example.com" disabled />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              이메일은 변경할 수 없습니다
            </p>
          </div>
          <Button>프로필 저장</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-violet-600" />
            <div>
              <CardTitle>알림 설정</CardTitle>
              <CardDescription>
                AI 인사이트 및 예산 알림 설정
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">알림 활성화</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                AI 인사이트 및 예산 알림을 받습니다
              </p>
            </div>
            <Button
              variant={notificationEnabled ? "default" : "outline"}
              onClick={() => setNotificationEnabled(!notificationEnabled)}
            >
              {notificationEnabled ? "켜짐" : "꺼짐"}
            </Button>
          </div>

          {notificationEnabled && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">알림 톤</label>
              <Select value={notificationTone} onValueChange={(value: "coach" | "friend") => setNotificationTone(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coach">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">코치형</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        전문적이고 조언적인 톤
                      </p>
                    </div>
                  </SelectItem>
                  <SelectItem value="friend">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">친구형</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        친근하고 편안한 톤
                      </p>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button>알림 설정 저장</Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Download className="h-6 w-6 text-violet-600" />
            <div>
              <CardTitle>데이터 관리</CardTitle>
              <CardDescription>데이터 백업 및 내보내기</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">데이터 내보내기</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              모든 거래 내역을 CSV 또는 Excel 파일로 다운로드할 수 있습니다
            </p>
            <div className="flex gap-2">
              <Button variant="outline">CSV 다운로드</Button>
              <Button variant="outline">Excel 다운로드</Button>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">데이터 가져오기</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              은행 앱이나 다른 가계부 앱에서 내보낸 CSV 파일을 업로드하세요
            </p>
            <Button variant="outline">파일 업로드</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            <div>
              <CardTitle className="text-red-600 dark:text-red-400">위험 영역</CardTitle>
              <CardDescription>
                되돌릴 수 없는 작업입니다
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">모든 데이터 삭제</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              모든 거래 내역, 예산 설정, AI 인사이트가 영구적으로 삭제됩니다
            </p>
            <Button variant="destructive">데이터 삭제</Button>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">계정 삭제</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              계정과 모든 데이터가 영구적으로 삭제됩니다
            </p>
            <Button variant="destructive">계정 삭제</Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="p-6">
          <Button variant="outline" className="w-full gap-2">
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </CardContent>
      </Card>

      {/* App Version */}
      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        <p>AI 소비 코치 v1.0.0</p>
        <p className="mt-1">© 2024 Cherry Tomato Ramen</p>
      </div>
    </div>
  );
}

