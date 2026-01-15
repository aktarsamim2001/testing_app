"use client";

import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/useRedux";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { getFrontBlogList } from "@/store/slices/frontBlogSlice";
import image from "next/image";
import image2 from "../../public/no image.png";


const Blog = ({ data }) => {
  const dispatch = useAppDispatch();
  const blogState = useSelector((state: any) => state.frontBlog);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);


  useEffect(() => {
    dispatch(getFrontBlogList({ page, limit: 10, category_id: selectedCategory || undefined }));
  }, [dispatch, selectedCategory, page]);

  const section1 = data?.content?.[0]?.section1?.[0] || {};

  const blogs = blogState.data?.data?.blogs || [];
  // Get categories from blogState if available
  const categories = blogState.data?.data?.categories || [];
  const total = blogState.data?.data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="min-h-screen">
      <section className="pt-16 sm:pt-24 pb-16 sm:pb-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{section1.title || ""}</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">{section1.subtitle || ""}</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              {section1.description || ""}
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => { setSelectedCategory(""); setPage(1); }}
            >
              All
            </Button>
            {categories.map((cat: any) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
              >
                {cat.name}
              </Button>
            ))}
          </div>

        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4">
          {blogState.loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, idx) => (
                <Card key={idx} className="animate-pulse overflow-hidden">
                  <div className="bg-muted h-48 w-full" />
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-4 w-16 bg-muted rounded" />
                    </div>
                    <CardTitle>
                      <span className="block h-6 w-3/4 bg-muted rounded mb-2" />
                    </CardTitle>
                    <CardDescription>
                      <span className="block h-4 w-full bg-muted rounded mb-1" />
                      <span className="block h-4 w-2/3 bg-muted rounded" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="h-4 w-16 bg-muted rounded" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="h-4 w-10 bg-muted rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                      <span className="w-8 h-8 rounded-full bg-muted" />
                      <span className="h-4 w-20 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No blog posts published yet.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((post: any) => (
                  <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="overflow-hidden h-48">
                      <img
                        src={post.image && post.image !== '' ? post.image : (typeof window !== 'undefined' ? window.location.origin + '/no image.png' : '/no image.png')}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.endsWith('/no%20image.png') && !target.src.endsWith('/no image.png')) {
                            target.src = '/no image.png';
                          }
                        }}
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {post.category && (
                          <Badge variant="secondary" className="text-xs">
                            {post.category}
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
                          {post.estimated_reading_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{post.estimated_reading_time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {post.author && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                          {post.author_image && post.author_image.trim() !== '' ? (
                            <img
                              src={post.author_image}
                              alt={post.author}
                              className="w-8 h-8 rounded-full"
                            />  
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 19.125a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21c-2.676 0-5.216-.584-7.499-1.875z" />
                              </svg>
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {post.author}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Improved Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 gap-2 sm:gap-4">
                  {/* Result summary */}
                  {(() => {
                    const start = (page - 1) * 10 + 1;
                    const end = start + blogs.length - 1;
                    return (
                      <span className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
                        Showing {start} to {end} of {total} results
                      </span>
                    );
                  })()}
                  {/* Pagination nav */}
                  <nav className="flex items-center gap-1 select-none w-full sm:w-auto justify-center sm:justify-end" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {(() => {
                      const pages = [];
                      if (totalPages <= 5) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i);
                        }
                      } else {
                        if (page <= 3) {
                          pages.push(1, 2, 3, 4, "...", totalPages);
                        } else if (page >= totalPages - 2) {
                          pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                        } else {
                          pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
                        }
                      }
                      return pages.map((p, idx) =>
                        p === "..." ? (
                          <span key={"ellipsis-" + idx} className="px-2 text-muted-foreground">...</span>
                        ) : (
                          <Button
                            key={p}
                            variant={p === page ? "default" : "outline"}
                            size="sm"
                            className={p === page ? "bg-orange-500 text-white" : ""}
                            onClick={() => setPage(Number(p))}
                            aria-current={p === page ? "page" : undefined}
                          >
                            {p}
                          </Button>
                        )
                      );
                    })()}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
