import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NamePage() {
  return (
    <main className="max-w-6xl md:ml-[10%] lg:ml-[12%] px-6 py-20 md:py-32 flex flex-col gap-20">
      <Link href="/" className="flex items-center gap-2 text-lg text-[var(--text-muted)] hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-6 h-6" /> Back to home
      </Link>

      <article className="flex flex-col gap-10 max-w-4xl">
        <h1 className="text-4xl font-medium text-[var(--text-main)]">
          What&apos;s in the name?
        </h1>
        
        <div className="flex flex-col gap-8 text-xl text-[var(--text-muted)] leading-relaxed">
          <p>
            Surprisingly, no, it&apos;s not a bunch of random letters. KHROTU stands for King Hades Ruler of the Underworld.
          </p>
          <p>
            If you&apos;re wondering why, it&apos;s because I was a literal child when I came up with it. I was eight and I thought Hades was a chill guy, so I stole it from a book I was reading at the time.
          </p>
          <p>
            As for the pronunciation, it&apos;s pronounced as &quot;crow-too&quot;, although I doubt you need that information to type out my name.
          </p>
          <p>
            The other names obviously stem from my main one. &quot;khrotu&quot; is the name I use when going full caps makes me sound dumb in the context (I would unironically have more respect for some guy called &quot;DoggyLover69&quot; than some kid with a cocky full caps random letter name), and any name with a &quot;butsomething&quot; suffix is when I create accounts on different sites or different emails (e.g. &quot;butms&quot; when I&apos;m using my Outlook email, &quot;butsnap&quot; for Snapchat, &quot;butbsky&quot; for Bluesky, etc.).
          </p>
        </div>
      </article>
    </main>
  )
}
