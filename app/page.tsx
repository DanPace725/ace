import Image from 'next/image'
import Link from 'next/link'

const highlights = [
  {
    title: 'Log meaningful effort',
    body: 'Turn chores, habits, study sessions, and personal goals into simple XP moments.',
  },
  {
    title: 'Review before rewarding',
    body: 'Optional approval queues let parents, teachers, or admins confirm tasks first.',
  },
  {
    title: 'Make progress visible',
    body: 'Profiles, levels, rewards, and XP charts keep the day-to-day work easy to see.',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#15252b]">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-[#d9d1c3] bg-[#f7f4ed]/95 px-4 py-3 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-bold tracking-wide text-[#15252b]">
            <Image
              src="/logo2.png"
              alt=""
              width={36}
              height={36}
              className="rounded-full"
              priority
            />
            ACE
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-[#15252b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#264653] focus:outline-none focus:ring-2 focus:ring-[#2f80ed]"
          >
            Login
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative isolate flex min-h-[84svh] items-center overflow-hidden px-4 pb-16 pt-24">
          <Image
            src="/logo2.png"
            alt=""
            width={640}
            height={640}
            className="pointer-events-none absolute -right-28 top-20 -z-10 w-[420px] rounded-full opacity-20 sm:right-4 sm:w-[560px] lg:w-[640px]"
            priority
          />

          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1fr_360px] lg:items-center">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#2a6f73]">Gamified progress tracking</p>
              <h1 className="text-5xl font-black leading-[0.98] text-[#15252b] sm:text-6xl lg:text-7xl">
                ACE
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#395057]">
                A lightweight app for turning everyday tasks into XP, levels, and rewards across family, classroom, or personal profiles.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="rounded-md bg-[#2f80ed] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#2569c7] focus:outline-none focus:ring-2 focus:ring-[#2f80ed]"
                >
                  Login to ACE
                </Link>
                <Link
                  href="#overview"
                  className="rounded-md border border-[#b8ad9d] px-5 py-3 text-center font-semibold text-[#15252b] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#2f80ed]"
                >
                  See How It Works
                </Link>
              </div>
            </div>

            <div className="rounded-md border border-[#d9d1c3] bg-white/80 p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <span className="font-semibold text-[#15252b]">Today</span>
                <span className="rounded-full bg-[#f4d35e] px-3 py-1 text-xs font-bold text-[#15252b]">Level 4</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Morning routine</span>
                    <span>80 XP</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#e6dfd2]">
                    <div className="h-full w-4/5 rounded-full bg-[#2f80ed]" />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Reading</span>
                    <span>45 XP</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#e6dfd2]">
                    <div className="h-full w-[45%] rounded-full bg-[#2a9d8f]" />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Review queue</span>
                    <span>2 pending</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#e6dfd2]">
                    <div className="h-full w-1/3 rounded-full bg-[#e76f51]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="overview" className="border-t border-[#d9d1c3] bg-white px-4 py-12">
          <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <article key={highlight.title} className="rounded-md border border-[#e2dbcf] p-5">
                <h2 className="text-lg font-bold text-[#15252b]">{highlight.title}</h2>
                <p className="mt-3 leading-7 text-[#50636a]">{highlight.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
