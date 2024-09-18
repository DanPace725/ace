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

## Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Supabase Account**: Create an account at [supabase.com](https://supabase.com) and set up a project.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/my-ace-app.git
   cd my-ace-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Supabase project and get your Supabase URL and API key.

4. Create a `.env.local` file in the root of the project and add the following:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Database Setup
Use Supabase's SQL editor to create the necessary tables:
- Users
- Actions
- ActionLogs
- Achievements
- Skills
- Levels
- Rewards

Check the Data Model section in the documentation for detailed schema setup.

### Deploying on Vercel
1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Deploy to Vercel:
   - Go to Vercel, create an account, and link your GitHub repository.
   - Add the environment variables for Supabase in your Vercel project settings.
   - Your app will be live on Vercel's platform!

## Next Steps
- Add real-time updates using Supabase.
- Implement more customizable progress-tracking features.
- Enhance the admin interface for easier task management.
- Improve UI design and accessibility.

## Contributing
Feel free to fork this repository and submit pull requests. Any feedback or suggestions are welcome!

## License
This project is licensed under the MIT License.