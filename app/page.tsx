import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="max-w-6xl md:ml-[10%] lg:ml-[12%] px-6 py-20 md:py-32 flex flex-col gap-24">
      <section className="flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <Image 
            src="/pfp.jpg" 
            alt="KHROTU Profile Picture" 
            width={96} 
            height={96} 
            className="rounded-sm object-cover bg-neutral-800" 
          />
          <Link href="/name" className="flex items-center gap-3 text-2xl md:text-4xl font-medium text-[var(--text-main)] hover:text-white transition-colors group">
            KHROTU / khrotu / khrotubutms
            <ArrowRight className="w-6 h-6 text-[var(--text-muted)] group-hover:text-white transition-all group-hover:translate-x-2" />
          </Link>
        </div>
        <p className="text-lg md:text-xl text-[var(--text-muted)] leading-relaxed whitespace-nowrap">
          i&apos;d like to think i&apos;m a relatively competent dev; dabbles in ai/ml now and then
        </p>
      </section>
      <section className="flex flex-col gap-12">
        <h2 className="text-3xl font-medium text-[var(--text-main)]">what I&apos;ve been up to</h2>
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-medium text-[var(--text-muted)]">stuff i&apos;m proud of</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-16 border-t border-white/10">
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl font-medium text-[var(--text-main)]">Reach out to me:</h2>
          <div className="flex flex-col gap-5 text-lg text-[var(--text-muted)]">
            <a href="mailto:3o65iduqd@mozmail.com" className="hover:text-white transition-colors w-fit">3o65iduqd@mozmail.com</a>
            <a href="https://github.com/KHROTU" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors w-fit">GitHub</a>
            <a href="https://x.com/khrotubutms/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors w-fit">Twitter / X</a>
            <a href="https://bsky.app/profile/khrotubutbsky.bsky.social" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors w-fit">Bluesky</a>
            <a href="https://www.linkedin.com/in/mohan-yan-43905437b/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors w-fit">LinkedIn</a>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl font-medium text-[var(--text-main)]">Work with me:</h2>
          <div className="flex flex-col gap-5 text-lg text-[var(--text-muted)]">
            <p className="leading-relaxed">
              I am currently available for select freelance opportunities, project commissions, and consulting.
            </p>
            <Link href="/commissions" className="text-[var(--text-main)] hover:text-white underline underline-offset-4 transition-colors w-fit">
              View my services & capabilities
            </Link>
          </div>
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
    <div className="bg-[var(--bg-card)] border border-white/5 p-8 flex flex-col gap-5 rounded-md">
      <div className="flex justify-between items-start gap-4">
        <h4 className="font-medium text-[var(--text-main)] text-xl">{Title}</h4>
        <span className="text-sm text-[var(--text-muted)] whitespace-nowrap pt-1">{time}</span>
      </div>
      <div className="text-lg text-[var(--text-muted)] leading-relaxed">{desc}</div>
    </div>
  )
}
