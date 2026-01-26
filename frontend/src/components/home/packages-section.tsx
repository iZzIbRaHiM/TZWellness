"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

const packages = [
  {
    name: "MY REVERSAL PLAN",
    duration: "3 Months",
    badge: "Popular",
    bestFor: [
      "Pre-diabetes or new diabetes",
      "Initial fatty liver",
    ],
    includes: [
      "3 months nutrition plan",
      "2 follow up sessions at 1.5 month and 3 month",
      "Bone broth recipie",
      "4 eating rules",
      "Yoga 3 times a week",
      "Meditation 2 times a week",
      "Reversal tracker notebook",
    ],
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "MY RESET JOURNEY",
    duration: "6-9 Months",
    badge: "Comprehensive",
    bestFor: [
      "Long diabetes",
      "Advanced fatty liver",
      "Weight reduction",
      "Autoimmune conditions",
    ],
    includes: [
      "6-9 months nutrition plan",
      "4 follow up sessions throughout journey",
      "Bone broth recipie",
      "4 eating rules",
      "Yoga 3 times a week",
      "Meditation 2 times a week",
      "Reversal tracker notebook",
    ],
    gradient: "from-teal-500 to-cyan-600",
  },
];

export function PackagesSection() {
  const { settings } = useSiteSettings();
  
  // Convert tel: link to WhatsApp link - extract only digits after tel:
  const whatsappNumber = settings.clinic_phone_href?.replace(/^tel:\+?/, "").replace(/\D/g, "");
  
  // Helper function to create WhatsApp link with pre-filled message
  const getWhatsAppLink = (packageName: string) => {
    const message = `Hi! I'm interested in "${packageName}". It'd be great if you'd guide me more.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Healing Journey
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Personalized programs designed to support your wellness goals
          </p>
        </motion.div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Card */}
              <div className="relative h-full bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-emerald-200 transition-all duration-300 hover:shadow-xl">
                {/* Badge */}
                {pkg.badge && (
                  <div className="absolute top-6 right-6 z-10">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${pkg.gradient} text-white shadow-lg`}>
                      {pkg.badge}
                    </span>
                  </div>
                )}

                {/* Gradient Header */}
                <div className={`bg-gradient-to-br ${pkg.gradient} p-8 text-white`}>
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-medium">{pkg.duration}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Best For */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Best For:
                    </h4>
                    <ul className="space-y-2">
                      {pkg.bestFor.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Includes */}
                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Includes:
                    </h4>
                    <ul className="space-y-2">
                      {pkg.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-emerald-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <a
                    href={getWhatsAppLink(pkg.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r ${pkg.gradient} text-white hover:shadow-lg hover:scale-105`}
                  >
                    Start Now
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
