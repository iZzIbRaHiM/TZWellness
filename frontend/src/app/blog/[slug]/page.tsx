import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BlogPostContent } from "@/components/blog/blog-post-content";
import { ArticleSchema } from "@/components/seo/schemas";
import { blogApi } from "@/lib/api";

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const response = await blogApi.getBySlug(params.slug);

  if (!response.success || !response.data) {
    return {
      title: "Post Not Found",
    };
  }

  const post = response.data;

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name || "TZ Wellness Team"],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const response = await blogApi.getBySlug(params.slug);

  if (!response.success || !response.data) {
    notFound();
  }

  const post = response.data;

  // Format post data to match component expectations
  const formattedPost = {
    ...post,
    author: {
      name: post.author_name || "TZ Wellness Team",
      bio: post.author_bio || "Healthcare professionals dedicated to your wellbeing",
      image: post.author_avatar || "/images/default-avatar.jpg",
    },
    read_time: post.read_time_minutes || Math.ceil(post.content.split(' ').length / 200),
    tags: post.tags?.map(t => t.name) || [],
    category: post.category?.name || "Health",
  };

  return (
    <div className="min-h-screen bg-sand-50">
      <ArticleSchema
        title={post.title}
        description={post.excerpt || post.title}
        author={post.author_name || "TZ Wellness Team"}
        datePublished={post.published_at}
        dateModified={post.updated_at}
        image={post.featured_image || "https://tzwellness.com/images/default-blog.jpg"}
        url={`https://tzwellness.com/blog/${params.slug}`}
      />
      <div className="container-fluid py-8">
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            { label: post.title, href: `/blog/${params.slug}` },
          ]}
        />
        <BlogPostContent post={formattedPost} />
      </div>
    </div>
  );
}
