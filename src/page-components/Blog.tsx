"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
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
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<Record<string, Author>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts' as any)
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (postsError) throw postsError;

      if (postsData) {
        setPosts(postsData as unknown as BlogPost[]);

        const allTags = new Set<string>();
        (postsData as unknown as BlogPost[]).forEach(post => {
          post.tags?.forEach(tag => allTags.add(tag));
        });
        setCategories(['All', ...Array.from(allTags)]);

        const authorIdsSet = new Set((postsData as unknown as BlogPost[]).map(p => p.author_id).filter(Boolean));
        const authorIds = Array.from(authorIdsSet);
        if (authorIds.length > 0) {
          const { data: authorsData } = await supabase
            .from('authors' as any)
            .select('*')
            .in('id', authorIds);

          if (authorsData) {
            const authorsMap: Record<string, Author> = {};
            (authorsData as unknown as Author[]).forEach(author => {
              authorsMap[author.id] = author;
            });
            setAuthors(authorsMap);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedCategory === "All"
    ? posts
    : posts.filter(post => post.tags?.includes(selectedCategory));

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-muted-foreground">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="pt-16 sm:pt-24 pb-16 sm:pb-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground">Partnership Marketing Insights</Badge>
            <h1 className="mb-6">Partnership Marketing Blog</h1>
            <p className="text-lg text-muted-foreground">
              Expert insights, strategies, and case studies to help you scale your SaaS through influencer partnerships
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blog posts published yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {post.thumbnail_url && (
                    <div className="overflow-hidden h-48">
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      {post.tags && post.tags.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {post.tags[0]}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.published_at).toLocaleDateString()}</span>
                        </div>
                        {post.reading_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.reading_time} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {post.author_id && authors[post.author_id] && (
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        {authors[post.author_id].avatar_url && (
                          <img
                            src={authors[post.author_id].avatar_url}
                            alt={authors[post.author_id].name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {authors[post.author_id].name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
