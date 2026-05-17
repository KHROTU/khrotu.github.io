export type ContentBlock = string | { image: string; caption?: string; width?: number; height?: number };
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  content: ContentBlock[];
}
export const blogPosts: BlogPost[] = [
  {
    slug: 'first-post',
    title: 'First Post',
    date: '2026-05-18',
    content: [
      "woo yeah blogs test lets go gang",
      { image: 'https://i.ibb.co/WqzNYXm/Ravenfield-Screenshot-2026-01-17-16-07-44-46.png', caption: 'look at this dope ass landing' },
      "hell yeah a SECOND line of content? in this economy???",
      { image: 'https://i.ibb.co/F4RYmRzc/Ravenfield-Screenshot-2025-12-07-00-40-11-55.png', caption: 'look at this rizz ass pose' }
    ]
  }
];
export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}
export function getAllSlugs(): string[] {
  return blogPosts.map(post => post.slug);
}
export interface BlogGroup {
  label: string;
  posts: BlogPost[];
}
export function groupPostsByMonthYear(posts: BlogPost[]): BlogGroup[] {
  const map = new Map<string, BlogPost[]>();
  for (const post of posts) {
    const d = new Date(post.date + 'T00:00:00');
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const existing = map.get(key);
    if (existing) {
      existing.push(post);
    } else {
      map.set(key, [post]);
    }
  }
  const sortedKeys = Array.from(map.keys()).sort().reverse();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return sortedKeys.map((key) => {
    const [year, month] = key.split('-');
    const label = `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    const groupPosts = map.get(key)!;
    groupPosts.sort((a, b) => b.date.localeCompare(a.date));
    return { label, posts: groupPosts };
  });
}