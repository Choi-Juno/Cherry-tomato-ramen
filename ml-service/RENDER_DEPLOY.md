# 🚀 Render로 ML 서비스 배포하기

## 📋 **사전 준비**

- ✅ GitHub 계정
- ✅ Render 계정 (https://render.com - 무료)
- ✅ GitHub에 코드 푸시 완료

---

## 🔧 **1단계: Render 계정 생성**

1. **Render 접속**: https://render.com
2. **Sign Up** 클릭
3. **GitHub으로 가입** (권장)
4. GitHub 연동 승인

---

## 🎯 **2단계: Web Service 생성**

### **옵션 A: Blueprint 사용 (추천, 더 쉬움)**

1. Render Dashboard → **Blueprints**
2. **New Blueprint Instance** 클릭
3. GitHub 저장소 선택: `Cherry-tomato-ramen`
4. `render.yaml` 자동 감지됨
5. **Apply** 클릭
6. 끝! 자동으로 배포 시작 🎉

### **옵션 B: 수동 설정**

1. Render Dashboard → **New +** → **Web Service**
2. **GitHub 저장소 연결**
   - `Cherry-tomato-ramen` 선택
3. **Service 설정**
   ```
   Name:             cherry-tomato-ml
   Region:           Oregon (Free)
   Branch:           main
   Root Directory:   ml-service
   Runtime:          Python 3
   Build Command:    pip install -r requirements.txt
   Start Command:    uvicorn main:app --host 0.0.0.0 --port $PORT
   Instance Type:    Free
   ```
4. **Advanced 설정**
   - Health Check Path: `/health`
   - Auto-Deploy: `Yes` (GitHub 푸시 시 자동 배포)

5. **환경 변수 추가**
   ```
   ML_API_SECRET_KEY = dev-secret-key
   ```

6. **Create Web Service** 클릭

---

## ⏱️ **3단계: 배포 대기**

- 첫 배포는 **5-10분** 소요됩니다
- 빌드 로그를 실시간으로 확인할 수 있습니다

**빌드 과정:**
```
1. ⬇️  GitHub에서 코드 가져오기
2. 📦 Python 의존성 설치 (requirements.txt)
3. 🤖 ML 모델 로드
4. 🚀 FastAPI 서버 시작
5. ✅ Health check 성공
```

---

## 🌐 **4단계: 배포 URL 확인**

배포가 완료되면 Render가 제공하는 URL을 확인하세요:

```
https://cherry-tomato-ml.onrender.com
```

### **테스트하기:**

```bash
# Health Check
curl https://cherry-tomato-ml.onrender.com/health

# 예상 응답
{
  "status": "healthy",
  "models_loaded": true
}
```

---

## 🔗 **5단계: Next.js 프론트엔드 연동**

### **로컬 개발 환경**

`.env.local` 파일에 Render URL을 추가:

```env
# Local ML Service (개발용)
# NEXT_PUBLIC_ML_API_URL=http://localhost:8000

# Render ML Service (프로덕션용)
NEXT_PUBLIC_ML_API_URL=https://cherry-tomato-ml.onrender.com
ML_API_SECRET_KEY=dev-secret-key
```

### **Vercel 환경 변수**

Vercel Dashboard → Settings → Environment Variables에 추가:

```
NEXT_PUBLIC_ML_API_URL = https://cherry-tomato-ml.onrender.com
ML_API_SECRET_KEY = dev-secret-key
```

---

## ⚙️ **6단계: CORS 설정 확인**

`ml-service/main.py`에서 CORS 설정 확인:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3006",
        "https://your-vercel-app.vercel.app",  # Vercel URL 추가
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**또는 모든 오리진 허용 (개발 중):**

```python
allow_origins=["*"]
```

---

## 🎉 **완료!**

이제 다음을 사용할 수 있습니다:

- 🌐 **프로덕션 ML API**: `https://cherry-tomato-ml.onrender.com`
- 📊 **Health Check**: `https://cherry-tomato-ml.onrender.com/health`
- 🤖 **Insights API**: `https://cherry-tomato-ml.onrender.com/predict/insights`

---

## 🚨 **무료 티어 제한사항**

Render 무료 티어:
- ✅ **무료** (신용카드 불필요)
- ⚠️ **15분 비활성화 시 슬립 모드** (첫 요청 시 30초 소요)
- ✅ **자동 배포** (GitHub 푸시 시)
- ✅ **HTTPS** 자동 제공
- ⚠️ **월 750시간 제한** (1개 서비스 24/7 운영 가능)

### **슬립 모드 해결책:**

1. **Keep-alive 서비스 사용** (무료)
   - https://uptimerobot.com
   - 5분마다 health check 요청

2. **유료 플랜 ($7/월)**
   - 슬립 모드 없음
   - 더 빠른 성능

---

## 🔄 **자동 배포 설정**

GitHub에 푸시하면 자동으로 Render에 배포됩니다:

```bash
# ml-service 코드 수정 후
git add .
git commit -m "Update ML service"
git push origin main

# Render가 자동으로 감지하고 재배포 시작!
```

---

## 📊 **배포 상태 모니터링**

Render Dashboard에서 확인 가능:
- 📈 **Metrics**: CPU, Memory, Response Time
- 📜 **Logs**: 실시간 서버 로그
- 🔄 **Deploy History**: 배포 기록
- ⚙️ **Settings**: 환경 변수, 서비스 설정

---

## 🐛 **트러블슈팅**

### 문제 1: 빌드 실패
```
Error: No module named 'sklearn'
```
**해결**: `requirements.txt`에 `scikit-learn` 추가 확인

### 문제 2: 서버 시작 실패
```
Error: Address already in use
```
**해결**: `--port $PORT` 사용 확인 (Render가 동적으로 포트 할당)

### 문제 3: Health Check 실패
```
Health check failed
```
**해결**: `main.py`에 `/health` 엔드포인트 확인

### 문제 4: CORS 에러
```
Access to fetch blocked by CORS policy
```
**해결**: `main.py`에서 Vercel URL을 `allow_origins`에 추가

---

## 📚 **참고 링크**

- Render 공식 문서: https://render.com/docs
- FastAPI 배포 가이드: https://fastapi.tiangolo.com/deployment/
- Python on Render: https://render.com/docs/deploy-python

---

**배포 성공을 기원합니다! 🚀**

