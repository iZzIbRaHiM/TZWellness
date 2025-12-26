"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAIN_NAVIGATION, CONTACT_INFO } from "@/lib/navigation-config";

const navigation = MAIN_NAVIGATION;

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 ease-smooth",
        isScrolled
          ? "glass-navbar"
          : "bg-sand-100/50"
      )}
    >
      {/* Top bar with contact info */}
      <div className="hidden lg:block bg-emerald-900 text-white text-sm py-2">
        <div className="container-fluid flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a
              href={CONTACT_INFO.phoneHref}
              className="flex items-center gap-2 hover:text-emerald-200 transition-colors"
              aria-label="Call us"
            >
              <Phone className="h-4 w-4" />
              <span>{CONTACT_INFO.phone}</span>
            </a>
            <span className="text-emerald-300">|</span>
            <span>{CONTACT_INFO.hours}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/appointments/lookup"
              className="hover:text-emerald-200 transition-colors"
            >
              Check Appointment Status
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container-fluid" aria-label="Main navigation">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="TF Wellfare - Home"
          >
            <div className="w-10 h-10 bg-emerald-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-serif font-bold text-xl">TF</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-serif text-xl font-semibold text-emerald-900">
                TF Wellfare
              </span>
              <span className="block text-xs text-emerald-700 -mt-1">
                Medical Clinic
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive(item.href)
                      ? "text-emerald-900 bg-emerald-50"
                      : "text-gray-700 hover:text-emerald-900 hover:bg-emerald-50"
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.name}
                  {item.children && (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </Link>

                {/* Dropdown menu */}
                {item.children && (
                  <AnimatePresence>
                    {activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute left-0 top-full pt-2 w-64"
                      >
                        <div className="glass-card p-2 shadow-elevated-md">
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={cn(
                                "block px-4 py-2.5 text-sm rounded-lg transition-all duration-200",
                                isActive(child.href)
                                  ? "text-emerald-900 bg-emerald-100"
                                  : "text-emerald-800 hover:text-emerald-900 hover:bg-sand-200"
                              )}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Button asChild variant="cta" size="lg">
              <Link href="/book">
                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                Book Appointment
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2 border-t">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-4 py-3 text-base font-medium rounded-md transition-colors",
                        isActive(item.href)
                          ? "text-emerald-900 bg-emerald-50"
                          : "text-gray-700 hover:text-emerald-900 hover:bg-emerald-50"
                      )}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      {item.name}
                    </Link>
                    {item.children && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              "block px-4 py-2 text-sm rounded-md transition-colors",
                              isActive(child.href)
                                ? "text-emerald-900 bg-emerald-50"
                                : "text-gray-600 hover:text-emerald-900 hover:bg-emerald-50"
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="pt-4 px-4">
                  <Button asChild variant="cta" size="lg" className="w-full">
                    <Link href="/book">
                      <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                      Book Appointment
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
