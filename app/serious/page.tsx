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
              I&apos;ve been doing full-stack development for over {webYears} years now, and I care deeply about building products that are not only polished but highly functional and performant. My core stack is React, Next.js, TypeScript, and Tailwind CSS, though I&apos;ve also worked with vanilla HTML and other frameworks such as Vue. I handle state with Zustand, manage databases with Supabase and IndexedDB, and cache with Redis. I also have extensive experience with more specialised libraries such as Three.js, Monaco Editor, Recharts, and KaTeX. I test all of my products with Jest to maintain code quality and ensure everything is production-ready, BrowserStack to verify cross-platform compatibility, and Polypane to fine-tune responsive design across varying screen sizes and resolutions.
            </p>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium text-[var(--text-main)]">Python & Machine Learning</h2>
            <p>
              I&apos;ve been writing Python for {pythonYears} years, which has allowed me to not only work fluently in the language itself but develop a strong focus in specific areas: scraping, browser automation, and machine learning. For web-related tasks, I use DevTools and Burp Suite to their full capability, performing digital forensics to write fast, undetectable, and stable scraping and automation solutions. For machine learning and reinforcement learning, I have studied and applied DQNs, CNNs, and LSTMs, including work conducted at the Research Institute of Tsinghua University in Shenzhen.
            </p>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium text-[var(--text-main)]">C++</h2>
            <p>
              I use C++ exclusively for competitive programming. Whilst this means I don&apos;t carry the same breadth of software development experience in C++ as I do in my other languages, this is a deliberate choice — I&apos;d rather maintain a sharp, focused knowledge of what actually matters in competition than dilute that with language features that don&apos;t serve that goal.
            </p>
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl font-medium text-[var(--text-main)]">Reverse Engineering</h2>
            <p>
              It&apos;s worth noting that I only ever practise reverse engineering within legally clear or grey territory. I have never performed, and have no intention of performing, anything malicious. That said, I have experience across several platforms. On the web, I use Burp Suite and Wireshark to intercept, analyse, and map out traffic flows from closed systems, effectively reading the undocumented API of anything with a network connection. On Android, I work with virtual machines, Ghidra, JADX, Frida, APKTool, and Burp Suite as a proxy to decompile, instrument, and inspect applications at runtime. I&apos;ve also spent a fair amount of time working through files with entirely undocumented extensions, using ImHex to read raw binary and hex values, identify encryption schemes, and decompress RLE-encoded data to get at whatever is actually inside.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}