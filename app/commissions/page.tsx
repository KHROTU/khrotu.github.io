import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

export default function CommissionsPage() {
  return (
    <main className="max-w-6xl md:ml-[10%] lg:ml-[12%] px-6 py-20 md:py-32 flex flex-col gap-20">
      <Link href="/" className="flex items-center gap-2 text-lg text-[var(--text-muted)] hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-6 h-6" /> Back to home
      </Link>
      <section className="flex flex-col gap-8">
        <h1 className="text-4xl font-medium text-[var(--text-main)] tracking-tight">
          Commissions & Consulting
        </h1>
        <p className="text-xl md:text-2xl text-[var(--text-muted)] leading-relaxed">
          I design and build software, ranging from high-performance web applications to specialized AI/ML workflows. I prioritize clean architecture, robust systems, and delivering tangible value over gimmicks.
        </p>
      </section>
      <section className="flex flex-col gap-12">
        <h2 className="text-lg font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Capabilities
        </h2>
        <div className="grid gap-10">
          <ServiceCard 
            title="Full-Stack Web Development"
            desc="Production-ready web applications using modern stacks (Next.js, React, TypeScript). From responsive, accessible frontends to scalable backends and database architecture."
          />
          <ServiceCard 
            title="AI & Machine Learning"
            desc="Custom integrations of LLMs, local AI models (Ollama, PyTorch), and automated agent workflows. Expertise in fine-tuning, RAG pipelines, and intelligent data extraction."
          />
          <ServiceCard 
            title="Scripting & Automation"
            desc="Robust Python scripting for data processing, web scraping, and workflow automation. Custom desktop GUI applications tailored to specific internal tooling needs."
          />
        </div>
      </section>
      <section className="flex flex-col gap-8 pt-16 border-t border-white/10">
        <h2 className="text-2xl font-medium text-[var(--text-main)]">
          Let&apos;s build something
        </h2>
        <p className="text-xl text-[var(--text-muted)] leading-relaxed">
          If you have a project in mind, the best way to get started is to send an email with a brief overview of your requirements, expected timeline, and budget constraints.
        </p>
        <a 
          href="mailto:3o65iduqd@mozmail.com" 
          className="inline-flex items-center justify-center gap-2 bg-[var(--text-main)] text-black text-lg font-medium px-8 py-4 rounded hover:bg-white transition-colors w-fit mt-2"
        >
          Get in touch <ArrowUpRight className="w-6 h-6" />
        </a>
      </section>
    </main>
  )
}

function ServiceCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-2xl font-medium text-[var(--text-main)]">{title}</h3>
      <p className="text-xl text-[var(--text-muted)] leading-relaxed">{desc}</p>
    </div>
  )
}
