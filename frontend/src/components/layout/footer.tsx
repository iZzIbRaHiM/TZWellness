import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FOOTER_LINKS, SOCIAL_LINKS, CONTACT_INFO } from "@/lib/navigation-config";

const socialLinks = [
  { name: "Facebook", href: SOCIAL_LINKS[0].href, icon: Facebook },
  { name: "Twitter", href: SOCIAL_LINKS[1].href, icon: Twitter },
  { name: "Instagram", href: SOCIAL_LINKS[2].href, icon: Instagram },
  { name: "LinkedIn", href: SOCIAL_LINKS[3].href, icon: Linkedin },
];

export function Footer() {
  return (
    <footer className="bg-emerald-950 text-white" role="contentinfo">
      {/* Main footer content */}
      <div className="container-fluid py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand & Contact */}
          <div>
            <Link href="/" className="inline-block mb-6 group">
              <Image
                src="/main_logo.png"
                alt="TZ Wellness Logo"
                width={400}
                height={133}
                className="h-32 w-auto group-hover:scale-105 transition-transform duration-300 brightness-0 invert"
              />
            </Link>

            <p className="text-emerald-200/80 mb-6 max-w-sm leading-relaxed">
              Nurturing our health through comprehensive metabolic and chronic disease management. Expert care for diabetes, thyroid, PCOS, and obesity.
            </p>

            <div className="space-y-3 text-sm">
              <a
                href={CONTACT_INFO.emailHref}
                className="flex items-center gap-3 text-emerald-200/80 hover:text-white transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-800/50 flex items-center justify-center">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </div>
                <span>{CONTACT_INFO.email}</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.main.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-emerald-200 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 text-white">Account</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.account.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-emerald-200 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-emerald-800" />

      {/* Bottom bar */}
      <div className="container-fluid py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-emerald-300">
            © {new Date().getFullYear()} TZ Wellness. All rights reserved.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-300 hover:text-white transition-colors"
                aria-label={social.name}
              >
                <social.icon className="h-5 w-5" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
