# Supabase Authentication Setup Guide

## 🔐 Authentication Configuration

After running the SQL queries, you also need to configure authentication in your Supabase dashboard:

## 1. Enable Email Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Make sure **Email** is enabled under **Auth Providers**

## 2. Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the signup confirmation and password reset emails if desired

## 3. Authentication Settings

In **Authentication** → **Settings**, ensure these settings:

- **Enable email confirmations**: Choose based on your preference
  - `true`: Users must confirm email before logging in
  - `false`: Users can log in immediately (easier for development)

- **Enable signup**: `true` (to allow new user registration)

## 4. Site URL Configuration

1. Go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - For development: `http://localhost:8081` or your Expo dev server URL
   - For production: Your actual app URL

## 5. Row Level Security (RLS)

The SQL file already sets up RLS policies, but verify in your dashboard:

1. Go to **Database** → **Tables**
2. For each table (`posts`, `comments`, `profiles`):
   - Click on the table
   - Go to the **RLS** tab
   - Ensure RLS is **ENABLED**
   - Verify the policies are listed

## 6. Test Authentication

After setup, test these functions:

### User Registration
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123'
});
```

### User Login
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password123'
});
```

### Get Current User
```javascript
const { data: { user } } = await supabase.auth.getUser();
```

## 7. Common Issues & Solutions

### Issue: "New row violates row-level security policy"
**Solution**: Make sure the user is authenticated and the RLS policies are correct.

### Issue: "Permission denied for table posts"
**Solution**: Check that the GRANT permissions were applied correctly.

### Issue: Email confirmations not working
**Solution**: 
1. Check your Site URL settings
2. Verify email template configuration
3. Check spam folder for confirmation emails

### Issue: Users can't access their own data
**Solution**: Verify that `auth.uid()` matches the `user_id` in your tables.

## 8. Database Schema Overview

Your database now has:

```
auth.users (Built-in Supabase table)
├── id (UUID, Primary Key)
├── email
├── created_at
└── raw_user_meta_data

public.profiles (Extended user info)
├── id (UUID, References auth.users.id)
├── email
├── full_name
├── avatar_url
├── bio
├── created_at
└── updated_at

public.posts (Study sessions)
├── id (UUID, Primary Key)
├── user_id (UUID, References auth.users.id)
├── user_name
├── created_at
├── topic
├── subject
├── duration
├── notes
├── mode
└── efficiency

public.comments (Post comments)
├── id (UUID, Primary Key)
├── post_id (UUID, References posts.id)
├── user_id (UUID, References auth.users.id)
├── user_name
├── content
└── created_at
```

## ✅ Verification Checklist

- [ ] SQL queries executed successfully
- [ ] Email authentication enabled
- [ ] Site URLs configured
- [ ] RLS policies active on all tables
- [ ] Test user can sign up
- [ ] Test user can log in
- [ ] Test user can create posts
- [ ] App connects without errors

Your Stensyl app should now be fully functional! 🚀 