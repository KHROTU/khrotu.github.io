import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBlogPost, getAllSlugs } from '@/lib/blogs';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return { title: 'Not Found' };
  }
  const firstText = post.content.find((b): b is string => typeof b === 'string');
  return {
    title: `${post.title} | khrotu`,
    description: firstText || post.title,
  };
}
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    notFound();
  }
  return (
    <main className="max-w-6xl md:ml-[10%] lg:ml-[12%] px-6 py-20 md:py-32 flex flex-col gap-20">
      <Link href="/blogs" className="flex items-center gap-2 text-lg text-[var(--text-muted)] hover:text-white transition-colors w-fit">
        <ArrowLeft className="w-6 h-6" /> back to blogs
      </Link>
      <article className="flex flex-col gap-10 max-w-4xl">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-medium text-[var(--text-main)]">
            {post.title}
          </h1>
          <span className="text-lg text-[var(--text-muted)]">{post.date}</span>
        </div>
        <div className="flex flex-col gap-8 text-xl text-[var(--text-muted)] leading-relaxed">
          {post.content.map((block, i) => (
            typeof block === 'string' ? (
              <p key={i}>{block}</p>
            ) : (
              <figure key={i} className="flex flex-col gap-2">
                <img
                  src={block.image}
                  alt={block.caption || ''}
                  width={block.width}
                  height={block.height}
                  className="rounded-sm h-auto max-w-full"
                />
                {block.caption && (
                  <figcaption className="text-sm text-[var(--text-muted)]">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            )
          ))}
        </div>
      </article>
    </main>
  );
}