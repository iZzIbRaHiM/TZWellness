import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FOOTER_LINKS, SOCIAL_LINKS, CONTACT_INFO } from "@/lib/navigation-config";

const footerLinks = FOOTER_LINKS;

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
      <div className="container-fluid py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6 group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-900 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-serif font-bold text-2xl">
                    TF
                  </span>
                </div>
                <div>
                  <span className="font-serif text-xl font-semibold text-white">
                    TF Wellfare
                  </span>
                  <span className="block text-xs text-emerald-300 -mt-0.5">
                    Medical Clinic
                  </span>
                </div>
              </div>
            </Link>

            <p className="text-emerald-200/80 mb-8 max-w-sm leading-relaxed">
              Expert holistic healthcare focused on metabolic health, diabetes
              management, thyroid care, and sustainable wellness solutions.
            </p>

            <div className="space-y-4 text-sm">
              <a
                href={CONTACT_INFO.phoneHref}
                className="flex items-center gap-3 text-emerald-200/80 hover:text-white transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-800/50 flex items-center justify-center">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </div>
                <span>{CONTACT_INFO.phone}</span>
              </a>
              <a
                href={CONTACT_INFO.emailHref}
                className="flex items-center gap-3 text-emerald-200/80 hover:text-white transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-800/50 flex items-center justify-center">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </div>
                <span>{CONTACT_INFO.email}</span>
              </a>
              <div className="flex items-start gap-3 text-emerald-200/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-800/50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </div>
                <span>
                  {CONTACT_INFO.address.street}
                  <br />
                  {CONTACT_INFO.address.suite}, {CONTACT_INFO.address.city}
                </span>
              </div>
              <div className="flex items-center gap-3 text-emerald-200/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-800/50 flex items-center justify-center">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                </div>
                <span>{CONTACT_INFO.hours}</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 text-white">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
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

          {/* Resources */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 text-white">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
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

          {/* Company */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 text-white">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
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

          {/* Legal */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 text-white">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
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
            © {new Date().getFullYear()} TF Wellfare Medical Clinic. All rights
            reserved.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
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
