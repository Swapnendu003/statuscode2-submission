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
import LandingNavbar from "@/components/landing/LandingNavbar";
import Threads from "@/components/landing/Threads";
import TeamsSection from "@/components/landing/TeamsSection";
import { Badge } from "@/components/ui/badge";
import RotatingText from "@/components/landing/RotatingText";
import { GradientBars } from "@/components/landing/GradientBg";
import CTAButton from "@/components/landing/CTAButton";
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
      <LandingNavbar />

      <div id="hero" className="relative overflow-hidden pt-20">
        <GradientBars />
        <div className="relative z-10 container mx-auto px-6">
          <div className="flex flex-col items-center justify-center mt-20 mb-60">
            <div className="text-center max-w-3xl">
              <Badge
                variant="outline"
                className="mb-5 px-4 py-2 text-sm border-blue-200 text-blue-700 bg-white/80 inline-flex items-center"
              >
                <Flag className="h-4 w-4 mr-2" />
                Supporting SDG-8: Decent Work & Economic Growth
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight mt-8">
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  Banking for Every Indian
                </span>{" "}
                <span className="flex items-center justify-center gap-2 mt-4">
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
                    mainClassName="inline-block px-4 py-2 rounded-lg text-blue-900"
                    staggerFrom={"last"}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-1"
                    elementLevelClassName="leading-relaxed"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                  />
                </span>
              </h1>
              <p className="text-sm md:text-base text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto mt-[-2rem]">
                <strong>70% of India&apos;s population</strong> still lacks
                access to basic financial services. VaniSetu empowers banks to
                bridge this gap by reaching marginalized communities through
                intelligent recommendations and native language communication,
                <strong>
                  {" "}
                  making financial inclusion a reality for every Indian.
                </strong>
              </p>
              <div className="flex flex-wrap gap-3 justify-center mb-10">
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
              <div className="flex gap-6 justify-center mt-4">
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
      <div id="challenges">
        <ContainerScroll
          titleComponent={
            <div className="max-w-3xl mx-auto mb-8 ">
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
                Witness how VaniSetu is transforming lives by making banking
                accessible to millions of underserved Indians through innovative
                technology and cultural understanding.
              </p>
            </div>
          }
        >
          <ImageCarousel />
        </ContainerScroll>
      </div>

      <div id="solutions" className="relative z-10 container mx-auto px-6 py-16 mt-[-10rem]">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-2 text-sm border-blue-200 text-blue-700 bg-white/80 mx-auto inline-flex items-center"
          >
            <Zap className="h-4 w-4 mr-2" />
            Our Solutions
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Smart Solutions for Financial Services
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Our innovative platform helps financial institutions bridge
            communication gaps and expand their reach through data-driven
            insights and multilingual capabilities.
          </p>
        </div>

        <div className="relative mx-auto mb-16">
          <div className="absolute inset-0 z-0 pointer-events-none w-[120%] ml-[-10%] h-full">
            <Threads color={[0.8, 0.4, 0.1]} amplitude={1} distance={0.5} />
          </div>
          <div className="relative z-10 grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <article
              className="bg-background flex w-full flex-col items-start justify-start border-4 border-black p-6 shadow-[8px_8px_0_0_#000] transition-shadow duration-300 hover:shadow-[12px_12px_0_0_#000] dark:border-white dark:shadow-[8px_8px_0_0_#fff] dark:hover:shadow-[12px_12px_0_0_#fff] min-h-[450px]"
              onClick={() => handleFeatureClick("/dashboard")}
            >
              <div className="flex flex-col h-full w-full">
                <div className="mb-4 flex items-center gap-x-2 text-xs">
                  <div className="text-foreground border-2 border-black bg-orange-500 px-3 py-1 font-bold">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div className="border-border text-foreground border-2 bg-orange-500 px-3 py-1 font-bold">
                    FinSutra
                  </div>
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="text-foreground text-2xl leading-7 font-black uppercase mb-4">
                    Intelligent Product Recommendations
                  </h3>
                  <p className="text-md border-l-4 border-orange-500 pl-4 leading-6 text-gray-800 mb-6">
                    AI-powered insights that match suitable banking products to
                    underserved communities based on their unique needs and
                    circumstances.
                  </p>
                  <div className="space-y-4">
                    {/* Feature points */}
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-orange-600" />
                      <p className="text-sm text-gray-700">
                        Deep understanding of rural and urban marginalized
                        communities
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-orange-600" />
                      <p className="text-sm text-gray-700">
                        Data-driven recommendations that break traditional
                        banking barriers
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                      <p className="text-sm text-gray-700">
                        Track real impact on financial inclusion and SDG-8
                        progress
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="bg-background flex w-full flex-col items-start justify-start border-4 border-black p-6 shadow-[8px_8px_0_0_#000] transition-shadow duration-300 hover:shadow-[12px_12px_0_0_#000] dark:border-white dark:shadow-[8px_8px_0_0_#fff] dark:hover:shadow-[12px_12px_0_0_#fff] min-h-[450px]"
              onClick={() => handleFeatureClick("/products")}
            >
              <div className="flex flex-col h-full w-full">
                <div className="mb-4 flex items-center gap-x-2 text-xs">
                  <div className="text-foreground border-2 border-black bg-green-500 px-3 py-1 font-bold">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div className="border-border text-foreground border-2 bg-green-500 px-3 py-1 font-bold">
                    VaniConnect
                  </div>
                </div>
                <div className="flex flex-col flex-grow">
                  <h3 className="text-foreground text-2xl leading-7 font-black uppercase mb-4">
                    Native Language Communication
                  </h3>
                  <p className="text-md border-l-4 border-green-500 pl-4 leading-6 text-gray-800 mb-6">
                    Break down language barriers that prevent millions from
                    accessing financial services. Communication in their comfort
                    language builds trust and understanding.
                  </p>
                  <div className="space-y-4">
                    {/* Feature points */}
                    <div className="flex items-start gap-3">
                      <Languages className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-gray-700">
                        Support for 11+ Indian languages from Hindi to Tamil
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Heart className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-gray-700">
                        Reach daily wage workers, farmers, and small business
                        owners
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-gray-700">
                        Build trust through cultural sensitivity and local
                        understanding
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
        <div id="team">
          <TeamsSection />
        </div>
      </div>
      
      <footer className="w-full py-8 mt-16 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-4">
              <span className="font-semibold text-gray-800">VaniSetu</span>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              Breaking barriers in financial inclusion
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>by</span>
              <span className="font-medium">Char-মগজ</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}