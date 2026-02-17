'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface DocPageProps {
  params: {
    path: string[];
  };
}

export default function DocPage({ params }: DocPageProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const path = params.path?.join('/') || 'aurora-book/end-user/index';

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/docs/${path}`);
        
        if (!response.ok) {
          setError('Documentation page not found');
          return;
        }

        const data = await response.json();
        setContent(data.content || '');
        setError(null);
      } catch (err) {
        setError('Failed to load documentation');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [path]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <p className="text-slate-600">Loading documentation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
            404 - Page Not Found
          </h1>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ← Go Back
          </button>
          <Link
            href="/"
            className="ml-2 px-4 py-2 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded hover:bg-slate-400 dark:hover:bg-slate-600"
          >
            Home
          </Link>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Available Documentation:</h2>
          <ul className="list-disc list-inside space-y-2 text-blue-600 dark:text-blue-400">
            <li>
              <Link href="/docs/aurora-book/end-user/index" className="hover:underline">
                Aurora End-User Manual
              </Link>
            </li>
            <li>
              <Link href="/docs/aurora-book/developer/index" className="hover:underline">
                Aurora Developer Manual
              </Link>
            </li>
            <li>
              <Link href="/docs/aurora-book/end-user/start-here" className="hover:underline">
                Start Here
              </Link>
            </li>
            <li>
              <Link href="/docs/aurora-book/end-user/universes" className="hover:underline">
                Universes Guide
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Parse frontmatter and content
  let frontmatter: Record<string, string> = {};
  let markdownContent = content;

  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (frontmatterMatch) {
    const frontmatterStr = frontmatterMatch[1];
    markdownContent = frontmatterMatch[2];

    // Simple YAML parser for common fields
    const lines = frontmatterStr.split('\n');
    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {frontmatter.title || 'Documentation'}
        </h1>
        {frontmatter.description && (
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {frontmatter.description}
          </p>
        )}
        {frontmatter.version && (
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            Version {frontmatter.version} • Released {frontmatter.release_date}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => router.back()}
          className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded hover:bg-slate-300 dark:hover:bg-slate-600 text-sm"
        >
          ← Back
        </button>
        <Link
          href="/docs/aurora-book/end-user/index"
          className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded hover:bg-slate-300 dark:hover:bg-slate-600 text-sm"
        >
          Documentation Index
        </Link>
      </div>

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none space-y-4">
        <ReactMarkdown
          components={{
            a: ({ node, ...props }) => {
              const href = props.href as string;
              // Convert internal doc links
              if (href?.startsWith('docs/')) {
                const docPath = href.replace(/\.md$/, '');
                return (
                  <Link href={`/docs/${docPath}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {props.children}
                  </Link>
                );
              }
              return <a {...props} />;
            },
            h1: ({ node, ...props }) => (
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-6 mb-3" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-2" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-slate-700 dark:text-slate-300" {...props} />
            ),
            code: ({ node, className, ...props }: any) => {
              const isInline = !className?.includes('language-');
              return isInline ? (
                <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono text-sm" {...props} />
              ) : (
                <code className="block bg-slate-800 dark:bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto font-mono text-sm my-4" {...props} />
              );
            },
            pre: ({ node, ...props }) => (
              <pre className="bg-slate-800 dark:bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 italic text-slate-600 dark:text-slate-400 my-4" {...props} />
            ),
            table: ({ node, ...props }) => (
              <table className="w-full border-collapse border border-slate-300 dark:border-slate-600 my-4" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 p-2 text-left" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="border border-slate-300 dark:border-slate-600 p-2" {...props} />
            ),
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
        <p>📖 Last updated: {frontmatter.release_date || 'Unknown'}</p>
        <p className="mt-2">
          💬{' '}
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            Need help? Visit the documentation portal
          </Link>
        </p>
      </div>
    </div>
  );
}
