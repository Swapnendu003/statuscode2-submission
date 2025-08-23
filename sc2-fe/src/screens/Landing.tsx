"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle,
  Search,
  Brain,
  PhoneCall,
  Globe,
  Languages,
  Shield,
  Heart,
  Zap,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Banknote,
  HandHeart,
  Building,
  Star,
  Flag,
} from "lucide-react";
import Navbar from "@/components/global/Navbar";
import Threads from "@/components/landing/Threads";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RotatingText from "@/components/landing/RotatingText";
import { GradientBars } from "@/components/landing/GradientBg";
import CTAButton from '@/components/landing/CTAButton';
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export default function ReachWiseLanding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const ImageCarousel = () => {
    const images = [
      {
        src: "https://i.postimg.cc/2S0yZ1sm/Whats-App-Image-2025-07-13-at-00-14-02.jpg",
        alt: "Breaking barriers to financial inclusion",
        caption: "Bridging the gap between banking and underserved communities",
      },
      {
        src: "https://i.postimg.cc/nhFMr4w0/Whats-App-Image-2025-07-13-at-00-49-00.jpg",
        alt: "Overcoming language barriers",
        caption: "Speaking your language, understanding your needs",
      },
      {
        src: "https://i.postimg.cc/VN56BYwt/Whats-App-Image-2025-07-13-at-00-53-51.jpg",
        alt: "Promoting economic growth",
        caption: "Empowering lives through accessible financial services",
      },
    ];

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 4000);

      return () => clearInterval(timer);
    }, []);

    const goToPrevious = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    };

    const goToNext = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    return (
      <div className="relative w-full h-full">
        <div className="relative overflow-hidden rounded-xl shadow-2xl h-full">
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={index} className="w-full flex-shrink-0 relative h-full">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white text-sm font-medium">
                    {image.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleFeatureClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen relative">
      <Navbar />

      {/* Hero Section with Gradient Bars */}
      <div className="relative overflow-hidden">
        <GradientBars />
        <div className="relative z-10 container mx-auto px-6">
          <div className="flex flex-col items-center justify-center mt-16 mb-60">
            {/* Centered Content */}
            <div className="text-center max-w-3xl">
              <Badge
                variant="outline"
                className="mb-5 px-4 py-2 text-sm border-blue-200 text-blue-700 bg-white/80 inline-flex items-center"
              >
                <Flag className="h-4 w-4 mr-2" />
                Supporting SDG-8: Decent Work & Economic Growth
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  Banking for Every Indian
                </span>{" "}
                <span className="flex items-center justify-center gap-2 mt-2">
                  <span>in</span>
                  <RotatingText
                    texts={[
                      "हिन्दी",
                      "বাংলা",
                      "தமிழ்",
                      "తెలుగు",
                      "मराठी",
                      "ગુજરાતી",
                      "ಕನ್ನಡ",
                      "മലയാളം",
                    ]}
                    mainClassName="inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-violet-100 to-blue-100 text-blue-900"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                  />
                </span>
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
                <strong>70% of India&apos;s population</strong> still lacks
                access to basic financial services. VaniSetu empowers banks to
                bridge this gap by reaching marginalized communities through
                intelligent recommendations and native language communication,
                <strong>
                  {" "}
                  making financial inclusion a reality for every Indian.
                </strong>
              </p>
              <div className="flex flex-wrap gap-3 justify-center mb-7">
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-xs border-violet-200 text-violet-700 bg-white/80"
                >
                  <TrendingDown className="h-4 w-4 mr-1" />
                  85% Fewer Rejected Calls
                </Badge>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-xs border-blue-200 text-blue-700 bg-white/80"
                >
                  <Languages className="h-4 w-4 mr-1" />
                  11+ Indian Languages
                </Badge>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-xs border-violet-200 text-violet-700 bg-white/80"
                >
                  <Target className="h-4 w-4 mr-1" />
                  Smart Targeting
                </Badge>
              </div>
              <div className="flex gap-6 justify-center">
                <CTAButton
                  text="Start with FinSutra"
                  variant="primary"
                  icon={<ArrowRight className="h-5 w-5" />}
                  onClick={() => handleFeatureClick("/dashboard")}
                />
                <CTAButton
                  text="Explore VaniConnect"
                  variant="secondary"
                  icon={<PhoneCall className="h-5 w-5" />}
                  onClick={() => handleFeatureClick("/products")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add this section before the Feature Cards section */}
      <ContainerScroll
        titleComponent={
          <div className="max-w-3xl mx-auto mb-8 mt-[-15%]">
            <Badge
              variant="outline"
              className="mb-4 px-4 py-2 text-sm border-blue-200 text-blue-700 bg-white/80 mx-auto"
            >
              <HandHeart className="h-4 w-4 mr-2" />
              The Challenge We&apos;re Solving
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Breaking Barriers in Indian Banking
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Witness how VaniSetu is transforming lives by making banking accessible 
              to millions of underserved Indians through innovative technology and 
              cultural understanding.
            </p>
          </div>
        }
      >
        <ImageCarousel />
      </ContainerScroll>

      {/* Rest of the content */}
     
      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Feature Cards */}
        <div className="relative mx-auto mb-16">
          {/* Threads animated background */}
          <div className="absolute inset-0 z-0 pointer-events-none w-[120%] ml-[-10%] h-full">
            <Threads color={[0.8, 0.4, 0.1]} amplitude={1} distance={0.5} />
          </div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 bg-white/90 hover:bg-orange-50"
              onClick={() => handleFeatureClick("/dashboard")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs px-2 py-1">
                    FinSutra
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                  Intelligent Product Recommendations
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  AI-powered insights that match suitable banking products to
                  underserved communities based on their unique needs and
                  circumstances.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-base">
                        Community Analysis
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Deep understanding of rural and urban marginalized
                        communities&apos; financial needs and preferences.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-base">
                        Precision Targeting
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Data-driven recommendations that break traditional
                        banking barriers and reach the unreached.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-base">
                        Social Impact Metrics
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Track real impact on financial inclusion and SDG-8
                        progress in your outreach areas.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded border border-orange-100">
                  <p className="text-gray-700 text-sm font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-orange-600" />
                    Designed for banks committed to inclusive growth
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* VaniConnect Card */}
            <Card
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 bg-white/90 hover:bg-green-50"
              onClick={() => handleFeatureClick("/products")}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow">
                    <PhoneCall className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-2 py-1">
                    VaniConnect
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                  Native Language Communication
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Break down language barriers that prevent millions from
                  accessing financial services. Communication in their comfort
                  language builds trust and understanding.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                      <Languages className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-base">
                        11+ Indian Languages
                      </h4>
                      <p className="text-gray-600 text-sm">
                        From Hindi to Tamil, Bengali to Gujarati - speak to
                        customers in their mother tongue.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
                      <Heart className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-base">
                        Inclusive Banking
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Reach daily wage workers, farmers, small shop owners,
                        and women entrepreneurs who&apos;ve been left behind.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-base">
                        Trust Building
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Cultural sensitivity and local understanding create
                        lasting banking relationships.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded border border-green-100">
                  <p className="text-gray-700 text-sm font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Transforming lives through accessible communication
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>


      </div>
    </div>
  );
}


/*Commit */