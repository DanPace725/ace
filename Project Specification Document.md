Here's a Project Specification Document based on the provided codebase:

# ACE Framework App - Project Specification Document

## 1. Project Overview

The ACE (Action-Centered Engagement) Framework App is a gamified task-tracking and rewards system built with Next.js and Supabase. It encourages users to take consistent actions toward their goals by providing immediate feedback, XP accumulation, skill progression, and a rewards system.


```1:24:README.md
# ace
A gamified task-tracking and rewards system built with Next.js and Supabase, designed to encourage action-taking through immediate feedback, XP, skill progression, and rewards. Deployed on Vercel, this app provides a flexible and customizable framework for users to log actions, track progress, and stay motivated.

# ACE Framework App

## Overview
The ACE (Action-Centered Engagement) Framework App is a task-tracking and rewards system built with **Next.js** (using the latest app router functionality) and **Supabase**. It encourages users to take consistent actions toward their goals by providing immediate feedback, XP accumulation, skill progression, and a rewards system.

This app is designed to be flexible and scalable, adapting to various contexts like education, work, or personal development.

## Features
- **Dashboard**: View XP progress, recent actions, skill advancements, and rewards.
- **Log Actions**: Log completed actions, earn XP, and track progress toward long-term goals.
- **Rewards System**: Earn small random rewards and cumulative level-based rewards for completing tasks.
- **Admin Management**: Add or edit tasks, define XP requirements, and manage user profiles.
- **Authentication**: Secure user login using Supabase authentication.
- **Responsive Design**: Optimized for desktop and mobile use.

## Tech Stack
- **Next.js**: React-based framework with server-side rendering and the latest app router.
- **Supabase**: Backend as a Service for database management, authentication, and real-time capabilities.
- **Vercel**: Platform for seamless deployment of Next.js applications.
- **Tailwind CSS** (optional): For responsive UI and styling.

```


## 2. Technology Stack

- Frontend: Next.js 14.2.12 (React 18)
- Backend: Supabase
- Styling: Tailwind CSS
- Deployment: Vercel
- Authentication: Supabase Auth
- Database: PostgreSQL (via Supabase)


```11:32:package.json
  "dependencies": {
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/supabase-js": "^2.45.4",
    "autoprefixer": "^10.4.20",
    "bcrypt": "^5.1.1",
    "next": "14.2.12",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7.53.0",
    "react-icons": "^5.3.0",
    "yup": "^1.4.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.12",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.12",
    "typescript": "^5"
  }
```


## 3. Key Features

1. User Authentication
2. Dashboard
3. Action Logging
4. Rewards System
5. Admin Management
6. Responsive Design


```11:17:README.md
## Features
- **Dashboard**: View XP progress, recent actions, skill advancements, and rewards.
- **Log Actions**: Log completed actions, earn XP, and track progress toward long-term goals.
- **Rewards System**: Earn small random rewards and cumulative level-based rewards for completing tasks.
- **Admin Management**: Add or edit tasks, define XP requirements, and manage user profiles.
- **Authentication**: Secure user login using Supabase authentication.
- **Responsive Design**: Optimized for desktop and mobile use.
```


## 4. Database Schema

The database includes the following tables:

- Users
- Actions
- ActionLogs
- Achievements
- Skills
- Levels
- Rewards
- LongTermGoals


```1:126:supabase/migrations/001_initial_schema.sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AdminUserRelationships Table
CREATE TABLE admin_user_relationships (
  admin_id UUID REFERENCES users(id),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (admin_id, user_id)
);

-- Actions Table
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- Auto-incrementing primary key
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,  -- References the 'users' table for admins, nullable
  name TEXT NOT NULL,  -- Name of the action (task)
  description TEXT,  -- Optional description of the action
  type TEXT,  -- Optional type of action (e.g., "task", "goal")
  base_xp INTEGER NOT NULL,  -- XP value for completing the action
  repeating BOOLEAN DEFAULT FALSE,  -- Whether the action is repeating
  frequency TEXT,  -- Frequency for repeating actions (e.g., "daily", "weekly")
  domain TEXT,  -- Domain or category (e.g., work, home)
  created_at TIMESTAMP DEFAULT now(),  -- Timestamp for when the action was created
  updated_at TIMESTAMP DEFAULT now()  -- Timestamp for the last update
) TABLESPACE pg_default;

-- ActionLogs Table
CREATE TABLE action_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action_id UUID REFERENCES actions(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  base_xp INTEGER DEFAULT 0,
  bonus_xp INTEGER DEFAULT 0,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Achievements Table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB,
  reward TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- UserAchievements Table
CREATE TABLE user_achievements (
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id)
);

-- Skills Table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- UserSkills Table
CREATE TABLE user_skills (
  user_id UUID REFERENCES users(id),
  skill_id UUID REFERENCES skills(id),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, skill_id)
);

-- Levels Table
CREATE TABLE levels (
  level_number INTEGER PRIMARY KEY,
  xp_required INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rewards Table
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('immediate', 'cumulative')),
  description TEXT,
  criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- UserRewards Table
CREATE TABLE user_rewards (
  user_id UUID REFERENCES users(id),
  reward_id UUID REFERENCES rewards(id),
  is_claimed BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, reward_id)
);

-- Create LevelRewards Table for many-to-many relationship
CREATE TABLE level_rewards (
  level_number INTEGER REFERENCES levels(level_number),
  reward_id UUID REFERENCES rewards(id),
  PRIMARY KEY (level_number, reward_id)
);

-- LongTermGoals Table
CREATE TABLE long_term_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```


## 5. Authentication

The app uses Supabase Authentication. Users can sign up and log in using email and password. The authentication flow is implemented in the login page:


```1:100:app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        // You might want to show a message that asks the user to verify their email
        setError('Please check your email to verify your account')
        return
      }
      router.push('/dashboard')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError(isLogin ? 'Invalid login credentials' : 'Error creating account')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="px-8 py-6 mt-4 text-left bg-gray-800 shadow-lg rounded-lg">
        <div className="flex justify-center">
          <Image
            src="/  logo1.png"
            alt="Logo"
            width={64}
            height={64}
            className="mb-4"
          />
        </div>
        <h3 className="text-2xl font-bold text-center text-white">
          {isLogin ? 'Login to your account' : 'Create a new account'}
        </h3>
        <form onSubmit={handleAuth}>
          <div className="mt-4">
            <div>
              <label className="block text-gray-300" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                id="email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-300" htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Password"
                id="password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 bg-gray-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50" type="submit">
                {isLogin ? 'Login' : 'Register'}
              </button>
              {isLogin && (
                <a href="#" className="text-sm text-blue-400 hover:underline">Forgot password?</a>
              )}
            </div>
          </div>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-400 hover:underline"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
```


## 6. Routing and Middleware

The app uses Next.js App Router. A middleware is implemented to protect routes and redirect unauthenticated users to the login page:


```1:22:middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```


## 7. User Interface

The app features a dark-themed UI with a sidebar navigation for authenticated users. The layout is responsive and uses Tailwind CSS for styling.


```1:24:app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import ClientLayout from './components/ClientLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ACE Framework App',
  description: 'A modern app using the ACE Framework',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
```



```1:48:app/components/Sidebar.tsx
"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Log Task', path: '/actions' },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Admin', path: '/admin' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 w-64 min-h-screen p-4 flex flex-col">
      <div className="text-white text-2xl font-bold mb-8">ACE Framework</div>
      <ul className="flex-grow">
        {navItems.map((item) => (
          <li key={item.path} className="mb-4">
            <Link href={item.path}>
              <span className={`block p-2 rounded ${
                pathname === item.path ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}>
                {item.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <button 
        className="bg-red-600 text-white p-2 rounded hover:bg-red-700 mt-auto"
        onClick={handleLogout}
      >
        Logout
      </button>
    </nav>
  

```


## 8. Main Pages

1. Dashboard (`/dashboard`)
2. Log Task (`/actions`)
3. Rewards (`/rewards`)
4. Admin (`/admin`)

Each page is implemented as a separate component in the `app` directory.

## 9. State Management

The app uses React's built-in state management with hooks. Supabase client is used for data fetching and real-time updates.

## 10. Deployment

The app is configured for deployment on Vercel:


```1:9:vercel.json
{
    "version": 2,
    "builds": [
      {
        "src": "package.json",
        "use": "@vercel/next"
      }
    ]
  }
```


## 11. Environment Variables

The app requires the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 12. Future Enhancements

1. Implement real-time updates using Supabase
2. Add more customizable progress-tracking features
3. Enhance the admin interface for easier task management
4. Improve UI design and accessibility


```85:89:README.md
## Next Steps
- Add real-time updates using Supabase.
- Implement more customizable progress-tracking features.
- Enhance the admin interface for easier task management.
- Improve UI design and accessibility.
```


## 13. License

The project is licensed under the MIT License.


```1:22:LICENSE
MIT License

Copyright (c) 2024 DanPace725

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```


This specification provides an overview of the ACE Framework App based on the provided codebase. It outlines the main features, technology stack, and structure of the application. Developers should refer to individual component files for more detailed implementation specifics.