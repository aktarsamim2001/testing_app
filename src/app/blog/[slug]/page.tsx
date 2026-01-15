"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppDispatch } from "@/store";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  ChevronDown
} from "lucide-react";
import { getBlogDetails } from "@/store/slices/blogDetailsSlice";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function BlogPostPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: post,
    status,
    error,
  } = useSelector((state: any) => state.blogDetails);

  useEffect(() => {
    if (slug) {
      dispatch(getBlogDetails(slug));
    }
  }, [dispatch, slug]);

  const author = useMemo(() => ({
    name: post?.author || "",
    avatar_url: post?.author_image || "",
    bio: post?.author_about || "",
  }), [post?.author, post?.author_image, post?.author_about]);

  const image = useMemo(() => post?.image || "/no image.png", [post?.image]);
  const description = useMemo(() => post?.description || post?.content || "", [post?.description, post?.content]);
  const readingTime = useMemo(() => post?.estimated_reading_time || post?.reading_time || "", [post?.estimated_reading_time, post?.reading_time]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Post not found</h2>
          <Button onClick={() => router.push("/blog")}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-6 hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Title and Meta */}
          <div className="px-6 sm:px-10 pt-8 pb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : ""}
                </span>
              </div>
              {readingTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
              )}
            </div>

            {/* Author Info */}
            {author.name && (
              <div className="flex items-center gap-3 pb-6 border-b border-gray-200">
                {author.avatar_url && (
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="font-semibold text-gray-900">{author.name}</div>
                  {author.bio && (
                    <div className="text-sm text-gray-600">{author.bio}</div>
                  )}
                  <div>
                    <Link href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-1 text-sm hover:underline">
                     <Twitter className="w-4 h-4" />
                    </Link>
                    <Link href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-1 ml-4 text-sm hover:underline">
                      <Linkedin className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Featured Image */}
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gray-900">
            <img
              src={image}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (
                  !target.src.endsWith("/no%20image.png") &&
                  !target.src.endsWith("/no image.png")
                ) {
                  target.onerror = null;
                  target.src = "/no image.png";
                }
              }}
            />
          </div>

          {/* Article Content */}
          <div className="px-6 sm:px-10 py-8">
            {/* Excerpt if available */}
            {post.excerpt && (
              <div className="text-lg text-gray-700 mb-8 leading-relaxed">
                {post.excerpt}
              </div>
            )}

            {/* Main Content with Custom Styling */}
            <div 
              className="blog-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: description }}
              style={{
                color: '#374151',
                lineHeight: '1.75'
              }}
            />
          </div>
        </article>

        {/* FAQ Section */}
        {post.faq && Array.isArray(post.faq) && post.faq.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6 sm:p-10">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full space-y-2">
              {[...post.faq]
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((item: any, idx: number) => (
                  <AccordionItem 
                    key={idx} 
                    value={`item-${idx}`}
                    className="border border-gray-200 rounded-lg px-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <AccordionTrigger className="text-left text-lg md:text-xl font-medium text-gray-900 py-4 hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>
        )}

        {/* Share and Tags Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 sm:p-10">
          {/* Share Article */}
          <div className="mb-5 flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Share this article:
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?url=${window.location.href}&text=${post.title}`,
                    '_blank'
                  );
                }}
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
                    '_blank'
                  );
                }}
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </Button>
            </div>
          </div>

          {/* Tags */}
          {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string, idx: number) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles for Blog Content */}
      <style jsx global>{`
        .blog-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-top: 2rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .blog-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .blog-content p {
          color: #4b5563;
          margin-bottom: 1.25rem;
          line-height: 1.75;
        }

        .blog-content ul,
        .blog-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
          color: #4b5563;
        }

        .blog-content ul li,
        .blog-content ol li {
          margin-bottom: 0.5rem;
          line-height: 1.75;
        }

        .blog-content ul li::marker {
          color: #6b7280;
        }

        .blog-content ol li::marker {
          color: #6b7280;
          font-weight: 600;
        }

        .blog-content strong {
          color: #111827;
          font-weight: 600;
        }

        .blog-content a {
          color: #2563eb;
          text-decoration: underline;
        }

        .blog-content a:hover {
          color: #1d4ed8;
        }

        .blog-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }

        .blog-content code {
          background: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          color: #111827;
        }

        .blog-content pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .blog-content pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }

        .blog-content img {
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
}