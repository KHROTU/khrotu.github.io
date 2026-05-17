'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}
function getYears(startYear: number) {
  return new Date().getFullYear() - startYear;
}
export default function SeriousPage() {
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);
  const webYears = getYears(2022);
  const pythonYears = getYears(2019);
  return (
    <main className="max-w-6xl md:ml-[10%] lg:ml-[12%] px-6 py-20 md:py-32 flex flex-col gap-20">
      <Link href="/" className="flex items-center gap-2 text-lg text-[var(--text-muted)] hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-6 h-6" /> back to me
      </Link>
      <article className="flex flex-col gap-12 max-w-4xl">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-medium text-[var(--text-main)]">
            Let&apos;s get serious then.
          </h1>
          <p className="text-xl text-[var(--text-muted)] leading-relaxed">
            {greeting}. This is what you want to read if you&apos;re an employer, admissions officer, or anyone with serious intentions.
          </p>
        </div>
        <div className="flex flex-col gap-10 text-xl text-[var(--text-muted)] leading-relaxed">
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium text-[var(--text-main)]">Web Development</h2>
            <p>
              I&apos;ve been doing full-stack development for over {webYears} years now, and I care deeply about building products that are not only polished but highly functional and performant. My core stack is React, Next.js, TypeScript, and Tailwind CSS, though I&apos;ve also worked with vanilla HTML and other frameworks such as Vue. I handle state with Zustand, manage databases with Supabase, Firebase, and IndexedDB, and cache with Redis. I also have extensive experience with more specialised libraries such as Three.js, Monaco Editor, Recharts, and KaTeX. I test all of my products with Jest to maintain code quality and ensure everything is production-ready, BrowserStack to verify cross-platform compatibility, and Polypane to fine-tune responsive design across varying screen sizes and resolutions.
            </p>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium text-[var(--text-main)]">Python & Machine Learning</h2>
            <p>
              I&apos;ve been writing Python for {pythonYears} years, which has allowed me to not only work fluently in the language itself but develop a strong focus in specific areas: scraping, browser automation, and machine learning. For web-related tasks, I use DevTools and Burp Suite to perform digital forensics to write fast and undetectable scraping and automation solutions. For machine learning and reinforcement learning, I have studied and applied DQNs, LSTMs, and CNNs using PyTorch, including work conducted at the Research Institute of Tsinghua University in Shenzhen.
            </p>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium text-[var(--text-main)]">C++</h2>
            <p>
              I use C++ exclusively for competitive programming. Whilst this means I don&apos;t carry the same breadth of software development experience in C++ as I do in my other languages, I&apos;d rather maintain sharp in competition related knowledge than dilute that with language features that don&apos;t serve that goal.
            </p>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium text-[var(--text-main)]">Reverse Engineering</h2>
            <p>
              I should note that I only ever work within legally clear or grey territory. I have never done anything malicious, and have no intention of doing so, so please don&apos;t blacklist me. My experience spans a few different contexts. For web traffic, I use Burp Suite and Wireshark to intercept and map out closed systems, which in practice means reconstructing undocumented APIs. For Android, I work with Ghidra, JADX, Frida, APKTool, and Burp Suite as a proxy, usually inside a virtual machine, to decompile and inspect applications at runtime. I&apos;ve also spent considerable time on binary analysis — files with completely undocumented extensions, where the work is reading raw hex in ImHex, identifying encryption or compression schemes, and slowly working out what the format actually is. 
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}