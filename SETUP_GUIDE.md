# 🚀 Cherry Tomato Ramen - 설정 가이드

이 가이드는 프로젝트를 처음 설정할 때 따라야 하는 단계별 지침입니다.

---

## 📋 1단계: Supabase 프로젝트 생성

### 1.1 Supabase 계정 생성 및 프로젝트 생성

1. **Supabase 웹사이트 접속**
   - https://supabase.com 방문
   - "Start your project" 클릭

2. **GitHub으로 로그인**
   - "Sign in with GitHub" 선택
   - 권한 승인

3. **새 프로젝트 생성**
   - "New Project" 클릭
   - **Organization**: 개인 organization 선택
   - **Project Name**: `cherry-tomato-ramen` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 및 **반드시 저장!**
   - **Region**: `Northeast Asia (Seoul)` 선택
   - **Pricing Plan**: Free tier 선택
   - "Create new project" 클릭

4. **프로젝트 생성 대기**
   - 약 2-3분 소요
   - "Setting up project..." 메시지가 사라질 때까지 대기

---

## 📋 2단계: 데이터베이스 설정

### 2.1 API Keys 확인

1. **프로젝트 대시보드**에서:
   - 왼쪽 사이드바 → "Settings" (⚙️ 아이콘)
   - "API" 섹션 클릭

2. **필요한 정보 복사**:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (긴 문자열)

### 2.2 환경 변수 설정

1. **프로젝트 루트에서 `.env.local` 파일 생성**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **`.env.local` 파일 편집**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   
   ⚠️ **실제 값으로 교체하세요!**

### 2.3 마이그레이션 실행

1. **Supabase Dashboard 접속**:
   - 왼쪽 사이드바 → "SQL Editor" 클릭

2. **마이그레이션 SQL 실행**:
   - "New query" 클릭
   - `supabase/migrations/001_initial_schema.sql` 파일의 내용을 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭 (또는 `Ctrl/Cmd + Enter`)

3. **성공 확인**:
   - "Success. No rows returned" 메시지 확인
   - 왼쪽 사이드바 → "Table Editor" 클릭
   - 다음 테이블들이 생성되었는지 확인:
     - ✅ users
     - ✅ user_settings
     - ✅ categories
     - ✅ transactions
     - ✅ budgets
     - ✅ ai_insights
     - ✅ challenges

### 2.4 시드 데이터 삽입 (선택사항)

1. **SQL Editor에서 새 쿼리 생성**:
   - `supabase/seed.sql` 파일의 내용을 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭

2. **테스트 데이터 확인**:
   - Table Editor → "transactions" 테이블 선택
   - 샘플 거래 내역 확인

---

## 📋 3단계: 로컬 개발 서버 실행

### 3.1 의존성 설치 확인

```bash
npm install
```

### 3.2 개발 서버 시작

```bash
npm run dev
```

### 3.3 브라우저에서 확인

- http://localhost:3000 접속
- `/dashboard`로 자동 리다이렉트 확인
- UI가 정상적으로 표시되는지 확인

---

## 📋 4단계: 연결 테스트

### 4.1 브라우저 개발자 도구 열기

- Chrome/Edge: `F12` 또는 `Ctrl/Cmd + Shift + I`
- Console 탭 선택

### 4.2 Supabase 연결 확인

개발자 도구 Console에서 다음 코드 실행:

```javascript
// Supabase 클라이언트 테스트
fetch('/api/transactions')
  .then(res => res.json())
  .then(data => console.log('API Response:', data))
  .catch(err => console.error('Error:', err));
```

**예상 결과**:
- 성공: `{ error: "Unauthorized" }` (인증이 필요하므로 정상)
- 실패: Network error 또는 404 (환경 변수 확인 필요)

---

## 🎯 다음 단계

1. **인증 시스템 구현** (선택사항)
   - Supabase Auth 설정
   - 회원가입/로그인 페이지 구현

2. **실제 데이터 CRUD 구현**
   - 지출 추가/수정/삭제 기능
   - 대시보드에 실제 데이터 표시

3. **ML 서비스 구축** (Phase 3-4)
   - FastAPI 서비스 구현
   - AI 인사이트 생성

---

## 🐛 문제 해결 (Troubleshooting)

### 문제: "Invalid API key" 오류

**해결책**:
1. `.env.local` 파일의 API key가 올바른지 확인
2. Supabase Dashboard → Settings → API에서 키 재확인
3. 개발 서버 재시작 (`npm run dev`)

### 문제: 테이블이 생성되지 않음

**해결책**:
1. SQL Editor에서 에러 메시지 확인
2. 마이그레이션 SQL을 순서대로 다시 실행
3. Supabase Dashboard → Database → Tables에서 수동 확인

### 문제: CORS 오류

**해결책**:
1. Supabase Dashboard → Authentication → URL Configuration
2. "Site URL"에 `http://localhost:3000` 추가
3. "Redirect URLs"에 `http://localhost:3000/**` 추가

---

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [프로젝트 아키텍처](./ARCHITECTURE.md)
- [배포 가이드](./DEPLOYMENT.md)

---

## ✅ 체크리스트

완료된 항목에 체크하세요:

- [ ] Supabase 프로젝트 생성
- [ ] API Keys 복사
- [ ] `.env.local` 파일 생성 및 설정
- [ ] 마이그레이션 실행
- [ ] 시드 데이터 삽입 (선택사항)
- [ ] 로컬 개발 서버 실행
- [ ] 브라우저에서 UI 확인
- [ ] API 연결 테스트

모든 항목을 완료하면 **백엔드 API 연결 및 프론트엔드 개발**을 시작할 수 있습니다! 🎉

