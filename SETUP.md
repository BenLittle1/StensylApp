# Stensyl App Setup Guide

## 🚀 Quick Start

Your Stensyl app has been fixed and is ready to run! Follow these steps to get it working:

## 1. Environment Configuration (CRITICAL)

You need to create a `.env` file in the root directory with your Supabase credentials:

1. Create a file named `.env` in the `Stensyl` directory
2. Add the following content (replace with your actual Supabase values):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Where to find your Supabase credentials:
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Go to Settings → API
5. Copy the "Project URL" and "anon/public" key

## 2. Install Dependencies

```bash
npm install
```

## 3. Start the Development Server

```bash
npm start
```

## 4. Database Setup

Make sure your Supabase database has a `posts` table with the following structure:

```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  topic TEXT NOT NULL,
  subject TEXT NOT NULL,
  duration TEXT NOT NULL,
  notes TEXT,
  mode TEXT,
  efficiency INTEGER CHECK (efficiency >= 1 AND efficiency <= 10)
);
```

## 🔧 What Was Fixed

- ✅ Fixed TypeScript errors in AuthContext and Supabase config
- ✅ Updated Supabase imports for latest version
- ✅ Fixed React linting errors (unescaped entities)
- ✅ Removed unused imports and variables
- ✅ Fixed React Hook dependency warnings

## 📱 Features

- **Study Timer**: Stopwatch and Pomodoro modes
- **Session Tracking**: Log study sessions with subjects and efficiency scores
- **Progress Analytics**: Weekly charts, yearly heatmap, and subject breakdown
- **User Authentication**: Secure login/signup with Supabase
- **Social Feed**: View and interact with study sessions

## 🛠 Troubleshooting

If you encounter issues:

1. **"Missing environment variables"**: Make sure your `.env` file is created and has the correct Supabase credentials
2. **"Cannot connect to Supabase"**: Verify your Supabase URL and API key are correct
3. **App won't start**: Run `npm install` to ensure all dependencies are installed
4. **TypeScript errors**: Run `npx tsc --noEmit` to check for type errors

## 📞 Need Help?

If you're still having issues, check:
- Your Supabase project is active and accessible
- Your internet connection is stable
- All dependencies are properly installed

The app should now work perfectly! 🎉 