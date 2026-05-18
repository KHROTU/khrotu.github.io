import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React from 'react';
interface Props {
  content: string;
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