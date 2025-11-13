# 🚀 Deployment Guide

Complete deployment guide for AI Spending Coach application.

## 📦 Tech Stack

- **Frontend**: Next.js 16 (Vercel)
- **Database**: Supabase (PostgreSQL)
- **ML Service**: FastAPI (Google Cloud Run)

---

## 1️⃣ Database Setup (Supabase)

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down:
   - Project URL
   - Anon/Public key
   - Service Role key

### Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

Or manually run SQL in Supabase SQL Editor:

1. Copy contents of `supabase/migrations/001_initial_schema.sql`
2. Paste and run in Supabase SQL Editor
3. (Optional) Run `supabase/seed.sql` for test data

### Configure Auth

1. Go to Authentication > Settings
2. Enable Email provider
3. (Optional) Configure OAuth providers (Google, etc.)
4. Set site URL to your Vercel domain

---

## 2️⃣ ML Service Deployment (Google Cloud Run)

### Prerequisites

- Google Cloud account
- `gcloud` CLI installed
- Docker installed (for local testing)

### Setup

```bash
# Login to Google Cloud
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Deploy

#### Option A: Using Cloud Build (Recommended)

```bash
cd ml-service

# Submit build
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions _ML_API_SECRET_KEY="your-secret-key"
```

#### Option B: Manual Deployment

```bash
cd ml-service

# Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/spending-coach-ml .

# Push to GCR
docker push gcr.io/YOUR_PROJECT_ID/spending-coach-ml

# Deploy to Cloud Run
gcloud run deploy spending-coach-ml \
  --image gcr.io/YOUR_PROJECT_ID/spending-coach-ml \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars ML_API_SECRET_KEY=your-secret-key
```

### Get Service URL

```bash
gcloud run services describe spending-coach-ml \
  --platform managed \
  --region asia-northeast3 \
  --format 'value(status.url)'
```

Note this URL - you'll need it for the Next.js env variables.

---

## 3️⃣ Frontend Deployment (Vercel)

### Prerequisites

- Vercel account
- GitHub repository

### Setup

1. **Push code to GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Import to Vercel**

- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Select "Next.js" framework

3. **Configure Environment Variables**

Add these in Vercel Project Settings > Environment Variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ML Service
NEXT_PUBLIC_ML_API_URL=https://your-ml-service.run.app
ML_API_SECRET_KEY=your-ml-api-secret-key

# Environment
NODE_ENV=production
```

4. **Deploy**

```bash
# Vercel CLI (optional)
npm install -g vercel
vercel --prod
```

Or simply push to GitHub - Vercel will auto-deploy.

---

## 4️⃣ Post-Deployment Configuration

### Update Supabase Site URL

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Set **Site URL** to your Vercel domain: `https://your-app.vercel.app`
3. Add **Redirect URLs**: 
   - `https://your-app.vercel.app/**`

### Test the Integration

1. Visit your Vercel URL
2. Sign up with a test account
3. Add some transactions
4. Check if AI insights are generated

### Monitor Services

**Vercel:**
- Dashboard > Analytics
- Real-time logs
- Performance metrics

**Cloud Run:**
```bash
# View logs
gcloud run services logs read spending-coach-ml \
  --region asia-northeast3 \
  --limit 100

# Monitor metrics
gcloud run services describe spending-coach-ml \
  --region asia-northeast3
```

**Supabase:**
- Dashboard > Database > Logs
- API usage statistics

---

## 🔧 Development Workflow

### Local Development

```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: ML Service
cd ml-service
uvicorn main:app --reload

# Terminal 3: Supabase (optional, if using local)
supabase start
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
ML_API_SECRET_KEY=dev-secret-key
```

---

## 🚨 Troubleshooting

### Next.js Build Fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### ML Service Not Responding

```bash
# Check Cloud Run logs
gcloud run services logs read spending-coach-ml --limit 50

# Test locally
docker run -p 8000:8000 gcr.io/YOUR_PROJECT_ID/spending-coach-ml
curl http://localhost:8000/health
```

### Database Connection Issues

- Check Supabase project status
- Verify environment variables
- Check RLS policies
- Review Supabase logs

### CORS Errors

Update ML Service `main.py` CORS settings:

```python
allow_origins=[
    "https://your-app.vercel.app",
    "https://*.vercel.app",
]
```

---

## 📊 Scaling Considerations

### Frontend (Vercel)

- Automatic scaling
- CDN-cached static assets
- Serverless functions scale automatically

### ML Service (Cloud Run)

**Current Config:**
- Memory: 512Mi
- CPU: 1
- Max instances: 10

**To scale up:**

```bash
gcloud run services update spending-coach-ml \
  --memory 1Gi \
  --cpu 2 \
  --max-instances 50
```

### Database (Supabase)

- Free tier: Good for testing
- Pro tier: Recommended for production
- Dedicated compute for larger loads

---

## 💰 Cost Estimates

### Free Tier (Testing)

- **Vercel**: Hobby plan (free)
- **Supabase**: Free tier
- **Cloud Run**: 2 million requests/month free
- **Estimated monthly**: $0

### Production (1000 users)

- **Vercel**: Pro plan (~$20/month)
- **Supabase**: Pro plan (~$25/month)
- **Cloud Run**: ~$30/month (with moderate usage)
- **Estimated monthly**: ~$75

---

## 🔐 Security Checklist

- [ ] Environment variables configured correctly
- [ ] Supabase RLS policies enabled
- [ ] ML API requires authentication
- [ ] CORS configured properly
- [ ] HTTPS enforced
- [ ] Rate limiting configured (optional)
- [ ] Secrets not committed to Git

---

## 📈 Monitoring & Alerts

### Set up alerts for:

1. **Error Rate** > 5%
2. **Response Time** > 1s (p95)
3. **ML Service Down**
4. **Database Connection Failures**

### Tools:

- Vercel Analytics
- Google Cloud Monitoring
- Supabase Dashboard
- Sentry (optional)

---

## 🎯 Next Steps

1. Set up CI/CD pipeline
2. Configure custom domain
3. Enable analytics
4. Set up error tracking (Sentry)
5. Configure backups
6. Add monitoring/alerts
7. Performance optimization
8. SEO optimization

---

## 📝 Useful Commands

```bash
# Vercel
vercel --prod                    # Deploy to production
vercel logs                      # View logs
vercel env pull                  # Pull environment variables

# Cloud Run
gcloud run services list
gcloud run services describe SERVICE_NAME
gcloud run services delete SERVICE_NAME

# Supabase
supabase db push                 # Apply migrations
supabase db reset                # Reset database
supabase functions deploy        # Deploy edge functions
```

---

## 🆘 Support

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Cloud Run Docs](https://cloud.google.com/run/docs)

