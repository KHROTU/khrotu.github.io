import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { blogPosts, groupPostsByMonthYear } from '@/lib/blogs';
export default function BlogsPage() {
  const groups = groupPostsByMonthYear(blogPosts);
  return (
    <main className="max-w-6xl md:ml-[10%] lg:ml-[12%] px-6 py-20 md:py-32 flex flex-col gap-20">
      <Link href="/" className="flex items-center gap-2 text-lg text-[var(--text-muted)] hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-6 h-6" /> back to me
      </Link>
      <article className="flex flex-col gap-16 max-w-4xl">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-medium text-[var(--text-main)]">
            blogs
          </h1>
          <p className="text-xl text-[var(--text-muted)] leading-relaxed">
            thoughts, stories, and things i found interesting
          </p>
        </div>
        <div className="flex flex-col gap-14">
          {groups.map((group) => (
            <section key={group.label} className="flex flex-col gap-5">
              <h2 className="text-sm font-mono text-[var(--text-muted)] tracking-wide">
                {group.label}
              </h2>
              <div className="flex flex-col">
                {group.posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blogs/${post.slug}`}
                    className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-6 py-4 transition-colors"
                  >
                    <span className="text-lg text-[var(--text-main)] group-hover:text-white transition-colors">
                      {post.title}
                    </span>
                    <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">
                      {post.date}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
