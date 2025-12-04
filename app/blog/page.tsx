"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail_url: string;
  published_at: string;
  reading_time: number;
  tags: string[];
  author: string;
}

const Blog = () => {
  // Sample blog posts data
  const [posts] = useState<BlogPost[]>([
    {
      id: "1",
      title: "How to Build Strategic Partnerships for SaaS Growth",
      slug: "build-strategic-partnerships",
      excerpt: "Learn the proven framework for identifying and nurturing partnerships that drive exponential growth.",
      thumbnail_url: "",
      published_at: new Date().toISOString(),
      reading_time: 8,
      tags: ["Strategy", "Partnerships"],
      author: "PartnerScale Team"
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const allCategories = ["All", ...new Set(posts.flatMap(post => post.tags))];

  const filteredPosts = selectedCategory === "All"
    ? posts
    : posts.filter(post => post.tags.includes(selectedCategory));

  return (
    <div className="min-h-screen pt-16">
      <section className="py-16 md:py-20 bg-gradient-subtle">
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
            {allCategories.map((category) => (
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
              <p className="text-muted-foreground">No blog posts available at this time.</p>
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
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        {post.author}
                      </span>
                    </div>
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
