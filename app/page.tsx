import Image from 'next/image'
import Link from 'next/link'
import { FaChartLine, FaClipboardCheck, FaCoins, FaDoorOpen, FaGift, FaPlusCircle, FaUserFriends } from 'react-icons/fa'

const featureGroups = [
  {
    title: 'Profiles',
    body: 'Give each learner, kid, or personal track its own XP, level, rewards, and credit balance.',
    icon: FaUserFriends,
  },
  {
    title: 'Task Logging',
    body: 'Log chores, habits, studying, reading, or custom goals with clear XP and optional bonus points.',
    icon: FaPlusCircle,
  },
  {
    title: 'Review Queue',
    body: 'Route selected profiles through approval before XP and credits are awarded.',
    icon: FaClipboardCheck,
  },
  {
    title: 'Rewards',
    body: 'Connect progress to earned rewards so effort has a visible payoff.',
    icon: FaGift,
  },
  {
    title: 'Rooms',
    body: 'Track shared spaces, assignments, room state, and balance changes over time.',
    icon: FaDoorOpen,
  },
  {
    title: 'Credits',
    body: 'Use a simple credit economy to show gains, costs, dividends, and profile ledgers.',
    icon: FaCoins,
  },
]

const principles = [
  'Mobile-first task logging for quick one-hand updates.',
  'Admin tools for managing profiles, tasks, rewards, rooms, and assignments.',
  'Progress views that separate the selected profile from whole-house stats.',
  'A conservative credit system that can grow with more household rules over time.',
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-800 bg-gray-900/95 px-4 py-3 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-bold text-white">
            <Image
              src="/logo2.png"
              alt=""
              width={40}
              height={40}
              className="rounded-full"
              priority
            />
            <span className="text-lg">ACE</span>
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Login
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative isolate flex min-h-[88svh] items-center overflow-hidden border-b border-gray-800 px-4 pb-16 pt-24">
          <Image
            src="/logo2.png"
            alt=""
            width={760}
            height={760}
            className="pointer-events-none absolute left-1/2 top-20 -z-10 w-[560px] -translate-x-1/2 rounded-full opacity-10 sm:top-16 sm:w-[700px]"
            priority
          />

          <div className="mx-auto w-full max-w-6xl">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Gamified household progress</p>
              <h1 className="text-5xl font-black leading-[1.02] text-white sm:text-6xl lg:text-7xl">
                ACE
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300 sm:text-xl">
                A mobile-friendly app for turning everyday responsibilities into XP, rewards, room care, and a simple credit economy.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-md bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Login to ACE
                </Link>
                <Link
                  href="#overview"
                  className="rounded-md border border-gray-600 px-5 py-3 text-center font-semibold text-gray-100 transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Overview
                </Link>
              </div>
            </div>

            <div className="mt-12 grid max-w-4xl gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-gray-700 bg-gray-800/80 p-4">
                <p className="text-sm text-gray-400">Profiles</p>
                <p className="mt-2 text-2xl font-bold">XP + Levels</p>
              </div>
              <div className="rounded-md border border-gray-700 bg-gray-800/80 p-4">
                <p className="text-sm text-gray-400">Rooms</p>
                <p className="mt-2 text-2xl font-bold">Credits + State</p>
              </div>
              <div className="rounded-md border border-gray-700 bg-gray-800/80 p-4">
                <p className="text-sm text-gray-400">Admin</p>
                <p className="mt-2 text-2xl font-bold">Review + Assign</p>
              </div>
            </div>
          </div>
        </section>

        <section id="overview" className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Broad system</p>
                <h2 className="mt-2 text-3xl font-bold text-white">What ACE Connects</h2>
              </div>
              <p className="max-w-xl text-gray-300">
                The goal is to make effort, responsibility, and follow-through visible without adding a lot of friction.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureGroups.map((feature) => {
                const Icon = feature.icon

                return (
                  <article key={feature.title} className="rounded-md border border-gray-700 bg-gray-800 p-5 shadow-lg">
                    <Icon className="mb-4 h-6 w-6 text-blue-300" aria-hidden="true" />
                    <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                    <p className="mt-3 leading-7 text-gray-300">{feature.body}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-gray-800 bg-gray-950 px-4 py-12">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Designed around use</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Small logs, bigger patterns</h2>
              <p className="mt-4 leading-8 text-gray-300">
                ACE is meant to be quick enough for daily use while still leaving a useful trail: what got done, what needs review, how profiles are progressing, and how room credits are moving.
              </p>
            </div>

            <div className="grid gap-3">
              {principles.map((principle) => (
                <div key={principle} className="flex gap-3 rounded-md border border-gray-800 bg-gray-900 p-4">
                  <FaChartLine className="mt-1 h-5 w-5 shrink-0 text-green-300" aria-hidden="true" />
                  <p className="leading-7 text-gray-200">{principle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 rounded-md border border-gray-700 bg-gray-800 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm text-gray-400">Already set up?</p>
              <h2 className="mt-1 text-2xl font-bold text-white">Go straight to your profiles, rooms, rewards, and admin tools.</h2>
            </div>
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Login
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
