import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';
interface Props {
  content: string;
}
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogv', '.mov', '.m4v'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];

function cleanPathFromHref(href: string): string {
  try {
    const base = typeof window === 'undefined' ? 'https://example.com' : window.location.origin;
    return new URL(href, base).pathname.toLowerCase();
  } catch {
    return href.toLowerCase().split('?')[0].split('#')[0];
  }
}
function getMediaTypeFromHref(href: string): 'video' | 'audio' | null {
  const path = cleanPathFromHref(href);
  if (VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext))) return 'video';
  if (AUDIO_EXTENSIONS.some((ext) => path.endsWith(ext))) return 'audio';
  return null;
}
export default function BlogContent({ content }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => {
          const childArray = React.Children.toArray(children).filter(
            (child) => typeof child !== 'string' || child.trim().length > 0
          );
          if (childArray.length === 1) {
            const child = childArray[0];
            if (
              typeof child === 'object' &&
              child !== null &&
              'props' in child &&
              child.props !== null &&
              typeof child.props === 'object' &&
              'href' in child.props &&
              typeof child.props.href === 'string'
            ) {
              const href = child.props.href as string;
              const mediaType = getMediaTypeFromHref(href);
              if (mediaType === 'video') {
                return (
                  <figure className="flex flex-col gap-2 my-6">
                    <video
                      src={href}
                      controls
                      preload="metadata"
                      playsInline
                      className="rounded-sm w-full h-auto"
                    />
                  </figure>
                );
              }
              if (mediaType === 'audio') {
                return (
                  <figure className="flex flex-col gap-2 my-6">
                    <audio src={href} controls preload="metadata" className="w-full" />
                  </figure>
                );
              }
            }
          }
          const hasOnlyImages =
            childArray.length > 0 &&
            childArray.every(
              (child) =>
                typeof child === 'object' &&
                child !== null &&
                'props' in child &&
                child.props !== null &&
                typeof child.props === 'object' &&
                'src' in child.props
            );
          if (hasOnlyImages) {
            return <>{children}</>;
          }
          return <p>{children}</p>;
        },
        img: ({ src, alt }) => (
          <figure className="flex flex-col gap-2">
            <img
              src={src}
              alt={alt || ''}
              className="rounded-sm h-auto max-w-full"
            />
            {alt && (
              <figcaption className="text-sm text-[var(--text-muted)]">
                {alt}
              </figcaption>
            )}
          </figure>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-[var(--text-main)] underline underline-offset-4 hover:text-white transition-colors"
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        ),
        code: ({ children, className }) => {
          const isInline = !className;
          return isInline ? (
            <code className="bg-[#111] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--text-main)]">
              {children}
            </code>
          ) : (
            <pre className="bg-[#111] p-4 rounded overflow-x-auto my-6">
              <code className={`${className} text-sm font-mono`}>
                {children}
              </code>
            </pre>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}