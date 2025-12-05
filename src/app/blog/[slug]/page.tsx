"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  thumbnail_url: string;
  published_at: string;
  reading_time: number;
  tags: string[];
  author_id: string;
}

interface Author {
  id: string;
  name: string;
  avatar_url: string;
  bio: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data: postData, error: postError } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (postError) throw postError;

      if (postData) {
        const blogPost = postData as unknown as BlogPost;
        setPost(blogPost);

        if (blogPost.author_id) {
          const { data: authorData } = await supabase
            .from('authors' as any)
            .select('*')
            .eq('id', blogPost.author_id)
            .single();

          if (authorData) {
            setAuthor(authorData as unknown as Author);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Post not found</h2>
          <Button onClick={() => router.push('/blog')}>
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/blog">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {post.thumbnail_url && (
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8">
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <article>
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

            <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
              {author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.published_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.reading_time} min read</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {author && (
          <div className="mt-12 p-6 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              {author.avatar_url && (
                <img
                  src={author.avatar_url}
                  alt={author.name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{author.name}</h3>
                <p className="text-muted-foreground">{author.bio}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
