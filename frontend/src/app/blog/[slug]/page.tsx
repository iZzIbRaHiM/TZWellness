import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BlogPostContent } from "@/components/blog/blog-post-content";
import { ArticleSchema } from "@/components/seo/schemas";

// Static blog posts data
const blogPosts: Record<string, any> = {
  "understanding-blood-sugar-complete-guide": {
    title: "Understanding Blood Sugar: A Complete Guide",
    slug: "understanding-blood-sugar-complete-guide",
    excerpt:
      "Learn how blood sugar works, what affects it, and how to keep it in a healthy range for optimal energy and wellbeing.",
    content: `
## What is Blood Sugar?

Blood sugar, or blood glucose, is the main sugar found in your blood. It comes from the food you eat and is your body's main source of energy. Your blood carries glucose to all of your body's cells to use for energy.

## Why Blood Sugar Matters

Maintaining healthy blood sugar levels is crucial for:

- **Energy levels**: Stable blood sugar means consistent energy throughout the day
- **Mood regulation**: Blood sugar fluctuations can affect your mood and cognitive function
- **Weight management**: Insulin resistance can make weight loss more difficult
- **Long-term health**: Chronic high blood sugar can lead to diabetes and other complications

## What Affects Blood Sugar?

### Diet
The types and amounts of carbohydrates you eat have the biggest impact on blood sugar. Foods high in refined carbs and sugar cause rapid spikes, while fiber-rich foods lead to slower, steadier rises.

### Physical Activity
Exercise helps your cells use glucose more efficiently and can lower blood sugar levels. Both aerobic exercise and strength training are beneficial.

### Stress
When you're stressed, your body releases hormones like cortisol that can raise blood sugar levels. Managing stress is an important part of blood sugar control.

### Sleep
Poor sleep can affect insulin sensitivity and increase blood sugar levels. Aim for 7-9 hours of quality sleep per night.

## Tips for Healthy Blood Sugar

1. **Choose complex carbohydrates** over simple sugars
2. **Eat regular meals** to prevent large fluctuations
3. **Include protein and healthy fats** with each meal
4. **Stay active** with regular exercise
5. **Manage stress** through relaxation techniques
6. **Get enough sleep** each night
7. **Monitor your levels** if recommended by your doctor

## When to See a Doctor

If you experience symptoms like excessive thirst, frequent urination, unexplained weight loss, or persistent fatigue, consult with a healthcare provider. These could be signs of blood sugar issues that need medical attention.

---

*Need personalized guidance on managing your blood sugar? [Book a consultation](/book) with one of our specialists.*
    `,
    category: "Health Tips",
    author: {
      name: "Dr. Sarah Mitchell",
      bio: "Endocrinologist specializing in diabetes management",
      image: "/images/doctors/sarah.jpg",
    },
    published_at: "2024-01-15",
    updated_at: "2024-01-15",
    read_time: 8,
    featured_image: "/images/blog/blood-sugar.jpg",
    tags: ["diabetes", "blood sugar", "health tips"],
    meta_title: "Understanding Blood Sugar: A Complete Guide | TF Wellfare",
    meta_description:
      "Learn how blood sugar works, what affects it, and practical tips to maintain healthy levels for optimal energy and wellbeing.",
  },
};

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = blogPosts[params.slug];

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      type: "article",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author.name],
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <ArticleSchema
        title={post.title}
        description={post.excerpt}
        author={post.author.name}
        datePublished={post.published_at}
        dateModified={post.updated_at}
        image={`https://tfwellfare.com${post.featured_image}`}
        url={`https://tfwellfare.com/blog/${params.slug}`}
      />
      <div className="container-fluid py-8">
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            { label: post.title, href: `/blog/${params.slug}` },
          ]}
        />
        <BlogPostContent post={post} />
      </div>
    </div>
  );
}
