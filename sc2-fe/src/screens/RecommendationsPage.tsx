'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, Download, Mail, User, Phone, AlertCircle, Check, ChevronUp, ChevronDown, Star, Shield, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Hourglass from "@/components/global/Loader";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Product {
  name1: string;
  category1: string;
  riskLevel1: string;
  description1: string;
  suitability1: string;
  name2?: string;
  category2?: string;
  riskLevel2?: string;
  description2?: string;
  suitability2?: string;
  name3?: string;
  category3?: string;
  riskLevel3?: string;
  description3?: string;
  suitability3?: string;
}

interface CustomerRecommendation {
  customer_id: string;
  recommended_products: Product[];
}

interface RecommendationsData {
  success: boolean;
  recommendations: CustomerRecommendation[];
}

async function fetchUserDetails(customerId: string) {
  const response = await fetch('https://bob-server-side.onrender.com/user/data/custId', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId }),
  });
  return response.json();
}

export default function RecommendationsPage() {
  const router = useRouter();
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerRecommendation | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCallingCustomer, setIsCallingCustomer] = useState(false);
  const [callSuccess, setCallSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [expandedRecommendations, setExpandedRecommendations] = useState<{ [key: string]: number }>({});
  const [selectedLanguage, setSelectedLanguage] = useState("bn-IN");
  const [customerDetails, setCustomerDetails] = useState<{[key: string]: any}>({});

  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('recommendations');
      
      if (!storedData) {
        setError("No recommendations data found. Please return to the dashboard and select customers.");
        setLoading(false);
        return;
      }
      
      const parsedData = JSON.parse(storedData);
      setData(parsedData);
      
      // Initialize each customer with their first recommendation expanded (1)
      const initialExpandedState: {[key: string]: number} = {};
      parsedData.recommendations.forEach((rec: CustomerRecommendation) => {
        initialExpandedState[rec.customer_id] = 1; // Show the first recommendation by default
      });
      setExpandedRecommendations(initialExpandedState);
      
      // Fetch customer details for all recommendations
      const fetchAllCustomerDetails = async () => {
        const customerDetailsMap: {[key: string]: any} = {};
        
        for (const recommendation of parsedData.recommendations) {
          try {
            const customerData = await fetchUserDetails(recommendation.customer_id);
            customerDetailsMap[recommendation.customer_id] = customerData;
          } catch (err) {
            console.error(`Failed to fetch details for customer ${recommendation.customer_id}:`, err);
          }
        }
        
        setCustomerDetails(customerDetailsMap);
        setLoading(false);
      };
      
      fetchAllCustomerDetails();
    } catch (err) {
      setError("Failed to load recommendations data.");
      setLoading(false);
    }
  }, []);

  const handleExportToCsv = () => {
    if (!data) return;
    
    const headers = [
      "Customer ID", 
      "Customer Email", 
      "Customer Name", 
      "Product Name", 
      "Category", 
      "Risk Level", 
      "Product Description",
      "Suitability"
    ];
    
    const rows: string[][] = [];
    
    data.recommendations.forEach(rec => {
      const customer = customerDetails[rec.customer_id];
      const customerEmail = customer?.email || 'N/A';
      const customerName = customer?.name || 'N/A';
      
      rec.recommended_products.forEach(product => {
        rows.push([
          rec.customer_id,
          customerEmail,
          customerName,
          `"${product.name1?.replace(/"/g, '""') || 'N/A'}"`,
          product.category1 || 'N/A',
          product.riskLevel1 || 'N/A',
          `"${product.description1?.replace(/"/g, '""') || 'N/A'}"`,
          `"${product.suitability1?.replace(/"/g, '""') || 'N/A'}"`
        ]);
        
        // Add second product if exists
        if (product.name2) {
          rows.push([
            rec.customer_id,
            customerEmail,
            customerName,
            `"${product.name2.replace(/"/g, '""')}"`,
            product.category2 || 'N/A',
            product.riskLevel2 || 'N/A',
            `"${product.description2?.replace(/"/g, '""') || 'N/A'}"`,
            `"${product.suitability2?.replace(/"/g, '""') || 'N/A'}"`
          ]);
        }
        
        // Add third product if exists
        if (product.name3) {
          rows.push([
            rec.customer_id,
            customerEmail,
            customerName,
            `"${product.name3.replace(/"/g, '""')}"`,
            product.category3 || 'N/A',
            product.riskLevel3 || 'N/A',
            `"${product.description3?.replace(/"/g, '""') || 'N/A'}"`,
            `"${product.suitability3?.replace(/"/g, '""') || 'N/A'}"`
          ]);
        }
      });
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'product_recommendations.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'deposits': return 'bg-green-100 text-green-800';
      case 'deposit': return 'bg-green-100 text-green-800';
      case 'loans': return 'bg-blue-100 text-blue-800';
      case 'loan': return 'bg-blue-100 text-blue-800';
      case 'investment': return 'bg-purple-100 text-purple-800';
      case 'insurance': return 'bg-red-100 text-red-800';
      case 'digital banking': return 'bg-cyan-100 text-cyan-800';
      case 'mutual fund': return 'bg-amber-100 text-amber-800';
      case 'mutual funds': return 'bg-amber-100 text-amber-800';
      case 'debt fund': return 'bg-indigo-100 text-indigo-800';
      case 'fund of fund': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContactClick = (recommendation: CustomerRecommendation) => {
    setCurrentCustomer(recommendation);
    setContactDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!currentCustomer) return;
    
    setSendingEmail(true);
    setEmailSent(false);
    
    try {
      const customer = customerDetails[currentCustomer.customer_id];
      const product = currentCustomer.recommended_products[0];
      
      const payload = [{
        customer_id: currentCustomer.customer_id,
        email: customer?.email || '',
        productName: product.name1,
        productDescription: product.description1
      }];
      
      const response = await fetch('https://bob-server-side.onrender.com/email/send-image-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      const result = await response.json();
      
      toast?.({
        title: "Email Sent Successfully",
        description: `Email sent to ${customer?.email}`,
      }) || alert(`Email sent to ${customer?.email}`);
      
      setEmailSent(true);
      
      setTimeout(() => {
        setContactDialogOpen(false);
        setSendingEmail(false);
        setEmailSent(false);
      }, 2000);
    } catch (err) {
      console.error("Error sending email:", err);
      toast?.({
        title: "Failed to Send Email",
        description: "There was an error sending the email. Please try again.",
        variant: "destructive",
      }) || alert("Failed to send email");
      setSendingEmail(false);
    }
  };

  const handleCallClick = () => {
    if (!currentCustomer) return;
    setShowPhoneInput(true);
  };

  const initiateCall = async () => {
    if (!currentCustomer || !phoneNumber) return;
    
    const phoneRegex = /^\+[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setPhoneError("Please enter a valid phone number with country code (e.g. +917003159819)");
      return;
    }
    
    setPhoneError(null);
    setIsCallingCustomer(true);
    
    try {
      const customer = customerDetails[currentCustomer.customer_id];
      const product = currentCustomer.recommended_products[0];
      
      const payload = {
        phone_number: phoneNumber,
        language: selectedLanguage, 
        cust_name: customer?.name || 'Customer',
        cust_details: {
          customerId: currentCustomer.customer_id,
          age: customer?.age || 'N/A',
          gender: customer?.gender || 'N/A',
          location: customer?.location || 'N/A',
          creditScore: customer?.creditScore || 'N/A',
          estimatedSalary: customer?.estimatedSalary?.toString() || 'N/A',
          balance: customer?.balance?.toString() || 'N/A',
          tenure: customer?.tenure || 'N/A',
          activeMember: customer?.activeMember || 'N/A',
          productNumbers: customer?.productNumbers || 'N/A',
          creditCard: customer?.creditCard || 'N/A',
        },
        product_details: {
          product_id1: product.name1,
          name1: product.name1,
          category1: product.category1,
          riskLevel1: product.riskLevel1,
          description1: product.description1,
          product_id2: product.name2,
          name2: product.name2,
          category2: product.category2,
          riskLevel2: product.riskLevel2,
          description2: product.description2,
          product_id3: product.name3,
          name3: product.name3,
          category3: product.category3,
          riskLevel3: product.riskLevel3,
          description3: product.description3,
        },
      };
      
      const response = await fetch('http://0.0.0.0:8000/create-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }
      
      setCallSuccess(true);
      
      setTimeout(() => {
        setShowPhoneInput(false);
        setIsCallingCustomer(false);
        setCallSuccess(false);
        setPhoneNumber("");
        setContactDialogOpen(false);
      }, 2000);
      
    } catch (err) {
      console.error("Error initiating call:", err);
      toast?.({
        title: "Failed to Initiate Call",
        description: "There was an error initiating the call. Please try again.",
        variant: "destructive",
      }) || alert("Failed to initiate call");
      setIsCallingCustomer(false);
    }
  };

  const handleProductSelect = (customerId: string, productNumber: number) => {
    setExpandedRecommendations(prev => ({
      ...prev,
      [customerId]: productNumber
    }));
  };

  // Animation variants for product cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xl">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-lg text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold">Error Loading Recommendations</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personalized Product Recommendations</h1>
          <p className="text-muted-foreground mt-1">
            Tailored financial solutions for {data?.recommendations.length || 0} customers
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportToCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {data?.recommendations.map((rec) => {
          const customer = customerDetails[rec.customer_id];
          const product = rec.recommended_products[0]; // Each customer has one entry with multiple products
          const activeProduct = expandedRecommendations[rec.customer_id];
          
          return (
            <Card key={rec.customer_id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">
                        {getInitials(customer?.name || customer?.email?.split('@')[0] || rec.customer_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {customer?.name || `Customer ID: ${rec.customer_id}`}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Mail className="mr-1 h-3 w-3" />
                        {customer?.email || 'Email not available'} | 
                        <span className="ml-1">ID: {rec.customer_id}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleContactClick(rec)}>Contact Customer</Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 pb-4">
                <div className="flex mb-6 border-b">
                  <button 
                    className={cn(
                      "pb-2 px-4 text-sm font-medium relative",
                      activeProduct === 1 
                        ? "text-primary border-b-2 border-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => handleProductSelect(rec.customer_id, 1)}
                  >
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      <span>Primary Recommendation</span>
                    </div>
                    {activeProduct === 1 && (
                      <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary" />
                    )}
                  </button>
                  
                  {product.name2 && (
                    <button 
                      className={cn(
                        "pb-2 px-4 text-sm font-medium relative",
                        activeProduct === 2 
                          ? "text-primary border-b-2 border-primary" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => handleProductSelect(rec.customer_id, 2)}
                    >
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        <span>Alternative 1</span>
                      </div>
                      {activeProduct === 2 && (
                        <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary" />
                      )}
                    </button>
                  )}
                  
                  {product.name3 && (
                    <button 
                      className={cn(
                        "pb-2 px-4 text-sm font-medium relative",
                        activeProduct === 3 
                          ? "text-primary border-b-2 border-primary" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      onClick={() => handleProductSelect(rec.customer_id, 3)}
                    >
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Alternative 2</span>
                      </div>
                      {activeProduct === 3 && (
                        <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-primary" />
                      )}
                    </button>
                  )}
                </div>
                
                <div className="relative min-h-[300px]">
                  {activeProduct === 1 && (
                    <motion.div
                      key={`${rec.customer_id}-1`}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{product.name1}</h3>
                          <div className="flex mt-2 space-x-2">
                            <Badge className={getCategoryColor(product.category1)}>
                              {product.category1}
                            </Badge>
                            <Badge className={getRiskLevelColor(product.riskLevel1)}>
                              {product.riskLevel1} Risk
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Star className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-lg mt-4">
                        <h4 className="font-medium mb-2">Product Description</h4>
                        <p className="text-muted-foreground">
                          {product.description1}
                        </p>
                      </div>
                      
                      <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 text-primary">Why This Product Is Recommended</h4>
                        <p>
                          {product.suitability1}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeProduct === 2 && product.name2 && (
                    <motion.div
                      key={`${rec.customer_id}-2`}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{product.name2}</h3>
                          <div className="flex mt-2 space-x-2">
                            <Badge className={getCategoryColor(product.category2 || '')}>
                              {product.category2}
                            </Badge>
                            <Badge className={getRiskLevelColor(product.riskLevel2 || '')}>
                              {product.riskLevel2} Risk
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-secondary/10 p-2 rounded-full">
                          <Shield className="h-8 w-8 text-secondary" />
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-lg mt-4">
                        <h4 className="font-medium mb-2">Product Description</h4>
                        <p className="text-muted-foreground">
                          {product.description2}
                        </p>
                      </div>
                      
                      <div className="bg-secondary/5 border border-secondary/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 text-primary">Why This Product Is Recommended</h4>
                        <p>
                          {product.suitability2}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeProduct === 3 && product.name3 && (
                    <motion.div
                      key={`${rec.customer_id}-3`}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{product.name3}</h3>
                          <div className="flex mt-2 space-x-2">
                            <Badge className={getCategoryColor(product.category3 || '')}>
                              {product.category3}
                            </Badge>
                            <Badge className={getRiskLevelColor(product.riskLevel3 || '')}>
                              {product.riskLevel3} Risk
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-accent/20 p-2 rounded-full">
                          <Clock className="h-8 w-8 text-accent" />
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-lg mt-4">
                        <h4 className="font-medium mb-2">Product Description</h4>
                        <p className="text-muted-foreground">
                          {product.description3}
                        </p>
                      </div>
                      
                      <div className="bg-accent/5 border border-accent/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 text-primary">Why This Product Is Recommended</h4>
                        <p>
                          {product.suitability3}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="bg-muted/20 py-3 flex justify-between">
                <div className="text-sm text-muted-foreground flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                  <span>Personalized recommendation based on customer profile</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleContactClick(rec)}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => {
                      setCurrentCustomer(rec);
                      setContactDialogOpen(true);
                      setShowPhoneInput(true);
                    }}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      <Dialog open={contactDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setSendingEmail(false);
          setEmailSent(false);
          setShowPhoneInput(false);
          setPhoneNumber("");
          setIsCallingCustomer(false);
          setCallSuccess(false);
          setPhoneError(null);
        }
        setContactDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          {showPhoneInput ? (
            <>
              <DialogHeader>
                <DialogTitle>Enter Phone Number to Call</DialogTitle>
                <DialogDescription>
                  Please provide the phone number to contact the customer
                </DialogDescription>
              </DialogHeader>
              
              {isCallingCustomer && !callSuccess ? (
                <div className="py-8 flex flex-col items-center">
                  <Hourglass />
                  <p className="text-center mt-4 font-medium">Initiating call...</p>
                  <p className="text-sm text-muted-foreground mt-1">Please wait while we connect</p>
                </div>
              ) : callSuccess ? (
                <div className="py-8 flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-12 w-12 text-green-600" />
                  </div>
                  <p className="text-center mt-4 font-medium text-green-700">Call initiated successfully!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You will be connected shortly
                  </p>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (with country code)</Label>
                    <Input 
                      id="phone" 
                      placeholder="+917003159819" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    {phoneError && (
                      <p className="text-sm text-red-500">{phoneError}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <select
                      id="language"
                      className="w-full p-2 border rounded-md"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option value="en-IN">English (India)</option>
                      <option value="bn-IN">Bengali (India)</option>
                      <option value="gu-IN">Gujarati (India)</option>
                      <option value="kn-IN">Kannada (India)</option>
                      <option value="ml-IN">Malayalam (India)</option>
                      <option value="mr-IN">Marathi (India)</option>
                      <option value="ta-IN">Tamil (India)</option>
                      <option value="te-IN">Telugu (India)</option>
                      <option value="hi-IN">Hindi (India)</option>
                      <option value="pa-IN">Punjabi (India)</option>
                      <option value="or-IN">Odia (India)</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowPhoneInput(false)}>
                      Cancel
                    </Button>
                    <Button onClick={initiateCall}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Contact Customer</DialogTitle>
                <DialogDescription>
                  Choose how you would like to contact the customer
                </DialogDescription>
              </DialogHeader>
              
              {sendingEmail && !emailSent ? (
                <div className="py-8 flex flex-col items-center">
                  <Hourglass />
                  <p className="text-center mt-4 font-medium">Sending email to customer...</p>
                  <p className="text-sm text-muted-foreground mt-1">This may take a few moments</p>
                </div>
              ) : emailSent ? (
                <div className="py-8 flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-12 w-12 text-green-600" />
                  </div>
                  <p className="text-center mt-4 font-medium text-green-700">Email sent successfully!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Recommendation has been delivered to the customer
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button 
                      className="flex flex-col h-24 items-center justify-center gap-2" 
                      onClick={handleSendEmail}
                    >
                      <Mail className="h-8 w-8" />
                      <span>Send Email</span>
                    </Button>
                    <Button 
                      className="flex flex-col h-24 items-center justify-center gap-2" 
                      variant="outline" 
                      onClick={handleCallClick}
                    >
                      <Phone className="h-8 w-8" />
                      <span>Call Customer</span>
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>Both options will share product recommendation details</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
