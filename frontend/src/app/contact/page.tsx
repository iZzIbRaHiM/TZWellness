"use client";

import { useState } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar,
  Send,
  CheckCircle2
} from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["Main: (123) 456-7890", "Fax: (123) 456-7891"],
    action: "tel:+1234567890"
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@tfwellfare.com", "appointments@tfwellfare.com"],
    action: "mailto:info@tfwellfare.com"
  },
  {
    icon: MapPin,
    title: "Address",
    details: ["123 Medical Center Drive", "Suite 100, Healthcare City, HC 12345"],
    action: null
  },
  {
    icon: Clock,
    title: "Hours",
    details: ["Mon - Fri: 8:00 AM - 6:00 PM", "Sat: 9:00 AM - 2:00 PM", "Sun: Closed"],
    action: null
  }
];

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-sand-50 to-white py-20 lg:py-32">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-emerald-950 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Have questions about our services? Ready to schedule an appointment? 
              We're here to help you on your wellness journey.
            </p>
            <Button asChild size="lg">
              <Link href="/book">
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment Online
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20">
        <div className="container-fluid">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-8 w-8 text-emerald-700" />
                  </div>
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 text-sm mb-1">
                      {detail}
                    </p>
                  ))}
                  {info.action && (
                    <a
                      href={info.action}
                      className="text-emerald-700 hover:text-emerald-900 text-sm font-medium mt-3 inline-block"
                    >
                      Contact Now →
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-sand-50">
        <div className="container-fluid">
          <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* Contact Form */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-emerald-950 mb-6">
                Send Us a Message
              </h2>
              <p className="text-gray-700 mb-8">
                Fill out the form below and we'll respond within 24 hours. For urgent matters, 
                please call us directly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    What to Expect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-emerald-950 mb-2">Response Time</h4>
                    <p className="text-gray-600 text-sm">
                      We typically respond to all inquiries within 24 hours during business days.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-950 mb-2">New Patients</h4>
                    <p className="text-gray-600 text-sm">
                      If you're a new patient, we recommend booking a consultation directly through 
                      our online booking system for faster scheduling.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-950 mb-2">Existing Patients</h4>
                    <p className="text-gray-600 text-sm">
                      For prescription refills or medical records requests, please call our office 
                      directly for faster service.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-emerald-900 text-white border-0">
                <CardHeader>
                  <CardTitle>Need Immediate Assistance?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-emerald-100">
                    For urgent medical concerns, please call our office directly. We offer 
                    same-day appointments for urgent matters.
                  </p>
                  <Button asChild size="lg" className="w-full bg-white text-emerald-900 hover:bg-emerald-50">
                    <a href="tel:+1234567890">
                      <Phone className="mr-2 h-5 w-5" />
                      Call (123) 456-7890
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Map integration</p>
                  <p className="text-xs">123 Medical Center Drive</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-20">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold text-emerald-950 mb-6">
              Looking for Quick Answers?
            </h2>
            <p className="text-gray-700 mb-8">
              Check out our frequently asked questions or resource library.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" size="lg">
                <Link href="/resources/faqs">
                  View FAQs
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/resources">
                  Browse Resources
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
