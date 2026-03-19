import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="max-w-6xl md:ml-[10%] lg:ml-[12%] px-6 py-12 md:py-20 flex flex-col gap-24">
      <div className="flex items-center justify-start gap-8 text-[var(--text-muted)]">
        <a href="https://github.com/KHROTU" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors group">
          <Image src="/github.svg" alt="GitHub" width={20} height={20} className="opacity-80 group-hover:opacity-100 transition-opacity" />
          <span className="font-mono text-sm">/ khrotu</span>
        </a>
        <a href="https://www.linkedin.com/in/mohan-yan-43905437b/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-white transition-colors group">
          <Image src="/linkedin.svg" alt="LinkedIn" width={20} height={20} className="opacity-80 group-hover:opacity-100 transition-opacity" />
          <span className="font-mono text-sm">/ me</span>
        </a>
      </div>
      <section className="flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <Image 
            src="/pfp.jpg" 
            alt="KHROTU Profile Picture" 
            width={96} 
            height={96} 
            className="rounded-sm object-cover bg-neutral-800" 
            priority
          />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-4xl font-medium text-[var(--text-main)]">
              KHROTU / khrotu / khrotubutms
            </h1>
            <Link href="/name" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors w-fit">
              what does that mean?
            </Link>
          </div>
        </div>
        <p className="text-lg md:text-xl text-[var(--text-muted)] leading-relaxed whitespace-nowrap">
          i&apos;d like to think i&apos;m a relatively competent dev; dabbles in ai/ml now and then
        </p>
      </section>
      <section className="flex flex-col gap-12">
        <h2 className="text-3xl font-medium text-[var(--text-main)]">what I&apos;ve been up to</h2>
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-medium text-[var(--text-muted)]">stuff i&apos;m proud of</h3>
          <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar snap-x snap-mandatory">
            <Card 
              name="USACO Platinum"
              desc="pretty cool, right?"
              time="2024 - present"
            />
            <Card 
              name="BloxdForge"
              href="https://www.bloxdforge.com"
              desc={<>comprehensive studio for a block game i used to play. <a href="https://www.bloxdforge.com/studio/wiki/guides/bloxdforge-versions" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">full story</a>.</>}
              time="2023 - present"
            />
            <Card 
              name="schematic-diffusion"
              href="https://github.com/KHROTU/schematic-diffusion"
              desc="a text-conditional 3D diffusion model for generating minecraft schematics."
              time="2025"
            />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-medium text-[var(--text-muted)]">i mean it&apos;s fine ig</h3>
          <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar snap-x snap-mandatory">
            <Card 
              name="Sat DB" 
              href="https://www.satdbfor.me"
              desc="overpriced tutoring centre kept pushing me to buy their account so i made it free for everyone :>" 
              time="2025 - present" 
            />
            <Card 
              name="victordle" 
              href="https://github.com/KHROTU/victordle"
              desc="idiot loses at victordle repeatedly so immediately turns to cheating." 
              time="2025" 
            />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-medium text-[var(--text-muted)]">must be the wind</h3>
          <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar snap-x snap-mandatory">
            <Card 
              name="GraphIt!" 
              href="https://www.graphit.dev"
              desc="turns out there&apos;s a reason desmos exists." 
              time="2025" 
            />
            <Card 
              name="notLLM"
              href="https://not-llm.vercel.app"
              desc="first try at real time stuff using ably. shut down due to my incapability in not messing stuff up with connections."
              time="2025"
            />
            <Card 
              name="kortex"
              href="https://github.com/KHROTU/kortex"
              desc="clippy better fr fr."
              time="2025"
            />
          </div>
        </div>
      </section>
      <section className="pt-16 border-t border-[var(--border-bezel)] border-opacity-20 flex flex-col gap-6">
        <h2 className="text-2xl font-medium text-[var(--text-main)]">reach out</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-lg text-[var(--text-muted)]">
          <a href="mailto:3o65iduqd@mozmail.com" className="hover:text-white transition-colors">email</a>
          <a href="https://github.com/KHROTU" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">github</a>
          <a href="https://x.com/khrotubutms/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">twitter</a>
          <a href="https://bsky.app/profile/khrotubutbsky.bsky.social" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">bluesky</a>
          <a href="https://www.linkedin.com/in/mohan-yan-43905437b/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">linkedin</a>
        </div>
      </section>
    </main>
  )
}

function Card({ name, href, desc, time }: { name: string, href?: string, desc: React.ReactNode, time: string }) {
  const Title = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/60">
      {name}
    </a>
  ) : (
    <span>{name}</span>
  );
  return (
    <article className="shrink-0 w-[85vw] md:w-[400px] bg-transparent border border-[var(--border-bezel)] p-8 flex flex-col gap-5 rounded-sm snap-start">
      <div className="flex justify-between items-start gap-4">
        <h4 className="font-medium text-[var(--text-main)] text-xl">{Title}</h4>
        <span className="text-sm text-[var(--text-muted)] whitespace-nowrap pt-1">{time}</span>
      </div>
      <div className="text-lg text-[var(--text-muted)] leading-relaxed">{desc}</div>
    </article>
  )
}