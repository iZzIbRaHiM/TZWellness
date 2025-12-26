import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-sand-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-100 rounded-full opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-terracotta-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="text-center px-4 relative z-10">
        {/* Large 404 with gradient */}
        <h1 className="font-serif text-[10rem] sm:text-[12rem] font-bold leading-none mb-2 bg-gradient-to-br from-emerald-400 to-emerald-700 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="font-serif text-display-xs sm:text-display-sm text-emerald-950 mb-4">
          Page Not Found
        </h2>
        <p className="text-emerald-700/80 mb-10 max-w-md mx-auto text-lg">
          Sorry, we couldn't find the page you're looking for. It might have
          been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/services">
              View Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
