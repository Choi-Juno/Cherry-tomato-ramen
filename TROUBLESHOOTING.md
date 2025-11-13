# 🔧 ML 연동 문제 해결 가이드

## ❌ 문제: "AI 인사이트를 불러올 수 없습니다" 에러

### 1단계: 브라우저 콘솔 확인

1. **브라우저에서 F12 키** 누르기 (또는 우클릭 → 검사)
2. **Console 탭** 선택
3. 빨간색 에러 메시지 확인
4. 정확한 에러 내용 복사

---

### 2단계: ML 서비스 상태 확인

#### 터미널에서 실행:

```bash
curl http://localhost:8000/health
```

#### ✅ 정상 응답:
```json
{"status":"healthy","models_loaded":true}
```

#### ❌ 에러 응답:
- `curl: (7) Failed to connect`: ML 서비스가 실행되지 않음
- `{"status":"unhealthy"}`: 모델 로딩 실패

---

### 3단계: ML 서비스 재시작

#### 기존 ML 서비스 중단 (백그라운드 프로세스 찾기):

**방법 1: 터미널에서 Ctrl+C로 중단**
- ML 서비스를 실행한 터미널 찾기
- `Ctrl + C` 눌러서 중단

**방법 2: 포트 확인 후 프로세스 종료**
```bash
# 8000 포트를 사용하는 프로세스 찾기
lsof -ti:8000

# 프로세스 종료 (PID가 나오면)
kill -9 $(lsof -ti:8000)
```

#### 새로 시작:

```bash
cd /Users/junochoi/Documents/University/1학년_2학기/cherry_tomato_ramen/ml-service

# 가상환경 활성화
source venv/bin/activate

# ML 서비스 시작 (로그 확인 가능)
python main.py
```

또는 (백그라운드로 실행)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 &
```

---

### 4단계: Next.js 재시작

ML 서비스를 재시작한 후, Next.js도 재시작:

```bash
# Next.js 중단 (Ctrl+C)
# 그리고 다시 시작
npm run dev
```

---

### 5단계: 테스트

1. http://localhost:3000 접속
2. 로그인
3. Dashboard 확인
4. 거래 추가 (+ 버튼)
5. AI 인사이트 확인

---

## 🐛 일반적인 에러와 해결 방법

### 에러 1: `TypeError: Failed to fetch`

**원인**: ML 서비스가 실행되지 않음

**해결**:
```bash
cd ml-service
source venv/bin/activate
python main.py
```

---

### 에러 2: `CORS policy` 관련 에러

**원인**: CORS 설정 문제

**해결**: `ml-service/main.py` 확인 - CORS가 이미 설정되어 있어야 함:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 에러 3: `Internal Server Error (500)`

**원인**: ML 서비스 내부 에러

**해결**:
1. ML 서비스 터미널 로그 확인
2. 파이썬 에러 메시지 확인
3. 데이터 파일 존재 확인:
   ```bash
   ls -lh ml-service/data/student_spending.csv
   ```

---

### 에러 4: `ModuleNotFoundError` (Python)

**원인**: Python 패키지 누락

**해결**:
```bash
cd ml-service
source venv/bin/activate
pip install -r requirements.txt
```

---

### 에러 5: 모델이 로드되지 않음

**원인**: 저장된 모델 파일이 없거나 손상됨

**해결**:
```bash
# 모델 디렉토리 삭제
rm -rf ml-service/saved_models/*

# ML 서비스 재시작 (자동으로 모델 재학습)
cd ml-service
source venv/bin/activate
python main.py
```

---

## 🔍 디버깅 체크리스트

- [ ] ML 서비스 실행 중? (`curl http://localhost:8000/health`)
- [ ] Next.js 실행 중? (`http://localhost:3000`)
- [ ] 브라우저 콘솔에 에러 없음?
- [ ] `.env.local` 파일에 환경 변수 설정?
  ```env
  NEXT_PUBLIC_ML_API_URL=http://localhost:8000
  ML_API_SECRET_KEY=dev-secret-key
  ```
- [ ] 로그인 되어 있음?
- [ ] 거래 내역이 있음?

---

## 💡 추가 팁

### 1. 로그 레벨 높이기

`ml-service/main.py`에 추가:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### 2. 간단한 테스트

터미널에서 직접 API 호출:
```bash
curl -X POST "http://localhost:8000/predict/insights" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-key" \
  -d '{
    "user_id": "test",
    "transactions": [
      {"date": "2025-01-10", "amount": 10000, "category": "food", "description": "테스트"}
    ],
    "current_month_budget": {"food": 300000}
  }'
```

**예상 응답**: JSON 형식의 인사이트 데이터

---

## 📞 여전히 문제가 해결되지 않나요?

다음 정보를 확인해주세요:

1. **브라우저 콘솔의 정확한 에러 메시지**
2. **ML 서비스 터미널의 로그**
3. **Next.js 터미널의 로그**
4. **`curl http://localhost:8000/health` 결과**

이 정보를 가지고 다시 질문해주세요! 🚀

