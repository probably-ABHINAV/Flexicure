# Flexicure Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables
Copy all variables from `.env.example` and set production values:

**Required Variables:**
- `NEXT_PUBLIC_APP_URL` - Your production domain
- `DATABASE_URL` - Production database connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Your production domain

**Optional Integrations:**
- `RESEND_API_KEY` - For email notifications
- `RAZORPAY_KEY_ID` - For payments
- `RAZORPAY_KEY_SECRET` - For payments
- `LIVEKIT_API_KEY` - For video calls
- `LIVEKIT_API_SECRET` - For video calls
- `LIVEKIT_WS_URL` - LiveKit WebSocket URL

### 2. Database Setup
Run these SQL scripts in order:
1. `scripts/sql/0001_init.sql`
2. `scripts/sql/0002_payments.sql`
3. `scripts/sql/0003_video.sql`
4. `scripts/sql/0004_reviews.sql`
5. `scripts/sql/0005_web_vitals.sql`
6. `scripts/sql/0006_comprehensive_features.sql`
7. `scripts/sql/0007_review_automation.sql`

### 3. Vercel Configuration
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## Deployment Steps

### 1. GitHub Setup
\`\`\`bash
git add .
git commit -m "Production deployment ready"
git push origin main
\`\`\`

### 2. Vercel Deployment
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables
5. Deploy

### 3. Post-Deployment Verification
- [ ] Visit deployed URL
- [ ] Check `/api/health` endpoint
- [ ] Test user registration/login
- [ ] Verify database connections
- [ ] Test booking flow
- [ ] Check payment integration
- [ ] Verify email notifications
- [ ] Test video call functionality

## Production Optimizations

### Performance
- [ ] Enable Vercel Analytics
- [ ] Configure CDN for static assets
- [ ] Set up monitoring alerts
- [ ] Enable compression

### Security
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure CSP headers

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Enable logging

## Domain Setup
1. Add custom domain in Vercel
2. Configure DNS records
3. Enable SSL certificate
4. Update environment variables

## Backup Strategy
- [ ] Database backups configured
- [ ] File storage backups
- [ ] Environment variables backed up
- [ ] Deployment rollback plan

## Go-Live Checklist
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Team notified
- [ ] Monitoring alerts configured
