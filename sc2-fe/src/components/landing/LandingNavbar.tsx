"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  name: string;
  sectionId: string;
}

const navItems: NavItem[] = [
  { name: "Home", sectionId: "hero" },
  { name: "Challenges", sectionId: "challenges" },
  { name: "Solutions", sectionId: "solutions" },
  { name: "Team", sectionId: "team" },
];

const LandingNavbar = () => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                <Image
                  src="https://i.postimg.cc/pL2FN02B/Abstract-Connection-Logo-Design.png"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="h-8 w-8 rounded-lg border border-black"
                  unoptimized={true}
                />
              </div>
              <span
                className={`font-bold text-xl ${
                  isScrolled ? "text-blue-700" : "text-blue-600"
                }`}
              >
                VaniSetu
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.sectionId)}
                className={`text-sm font-medium hover:text-blue-600 transition-colors ${
                  isScrolled ? "text-gray-700" : "text-gray-700"
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => window.open("https://calendly.com/your-link", "_blank")}
              className={`border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors ${
                isScrolled ? "" : "border-2"
              }`}
            >
              Book a Demo
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 right-0 shadow-md py-4 px-6 z-50">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.sectionId)}
                className="text-gray-700 font-medium hover:text-blue-600"
              >
                {item.name}
              </button>
            ))}
            <div className="flex flex-col space-y-3 pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => window.open("https://calendly.com/your-link", "_blank")}
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                Book a Demo
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;