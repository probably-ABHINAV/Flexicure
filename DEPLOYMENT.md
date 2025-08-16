# Flexicure Deployment Guide

This guide covers deploying Flexicure to production with security best practices.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (Supabase recommended)
- Domain name with SSL certificate
- Email service (Resend)
- Video service (Daily.co)
- Payment processor (Razorpay/Stripe)

## Environment Variables

Create a `.env.production` file with the following variables:

\`\`\`bash
# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database (Neon/Supabase)
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service
RESEND_API_KEY=your-resend-key

# SMS/WhatsApp
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890

# Payments
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
STRIPE_SECRET_KEY=your-stripe-secret

# Video Calls
DAILY_API_KEY=your-daily-api-key

# Security
NEXTAUTH_SECRET=your-nextauth-secret
ENCRYPTION_KEY=your-32-char-encryption-key

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
GOOGLE_ANALYTICS_ID=your-ga-id
\`\`\`

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   \`\`\`bash
   npm install -g vercel
   vercel login
   vercel --prod
   \`\`\`

2. **Configure Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Enable automatic deployments from main branch

3. **Custom Domain**
   - Add your domain in Vercel dashboard
   - Configure DNS records as instructed

### Option 2: Docker + VPS

1. **Build Docker Image**
   \`\`\`bash
   docker build -t flexicure .
   \`\`\`

2. **Run with Docker Compose**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

3. **Configure Nginx**
   - Copy `nginx.conf` to your server
   - Update SSL certificate paths
   - Restart Nginx

### Option 3: Traditional VPS

1. **Install Dependencies**
   \`\`\`bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx certbot
   \`\`\`

2. **Build Application**
   \`\`\`bash
   npm ci --production
   npm run build
   \`\`\`

3. **Configure Process Manager**
   \`\`\`bash
   npm install -g pm2
   pm2 start npm --name "flexicure" -- start
   pm2 startup
   pm2 save
   \`\`\`

## Database Setup

### Neon Database

1. **Create Database**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy connection string

2. **Run Migrations**
   \`\`\`bash
   # Connect to your database and run the SQL files in order:
   psql $DATABASE_URL -f scripts/sql/0001_init.sql
   psql $DATABASE_URL -f scripts/sql/0002_payments.sql
   psql $DATABASE_URL -f scripts/sql/0003_video.sql
   psql $DATABASE_URL -f scripts/sql/0004_reviews.sql
   \`\`\`

### Supabase Setup

1. **Create Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create new project
   - Copy API keys

2. **Configure Authentication**
   - Enable email/password auth
   - Configure OAuth providers (Google, GitHub)
   - Set up email templates

## Security Checklist

### SSL/TLS
- [ ] SSL certificate installed and configured
- [ ] HTTP to HTTPS redirects enabled
- [ ] HSTS headers configured
- [ ] SSL Labs A+ rating achieved

### Security Headers
- [ ] Content Security Policy configured
- [ ] X-Frame-Options set to DENY
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer-Policy configured

### Application Security
- [ ] Environment variables secured
- [ ] Database connections encrypted
- [ ] API rate limiting enabled
- [ ] Input validation implemented
- [ ] XSS protection enabled

### Monitoring
- [ ] Health check endpoint configured
- [ ] Error logging implemented
- [ ] Performance monitoring enabled
- [ ] Security event logging active

## Performance Optimization

### Caching
```nginx
# Static assets
location /_next/static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API responses
location /api/ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
