"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Phone,
  ChevronLeft,
  Check,
  AlertCircle,
  X,
  User,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  Building,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";

export default function SuitabilityPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCallingCustomer, setIsCallingCustomer] = useState(false);
  const [callSuccess, setCallSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("bn-IN"); 

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("suitability");
      if (!stored) {
        setError("No suitability data found. Please return to dashboard.");
        setLoading(false);
        return;
      }
      setData(JSON.parse(stored));
      setLoading(false);
    } catch (err) {
      setError("Failed to load suitability data.");
      setLoading(false);
    }
  }, []);

  const handleContactClick = (customer: any) => {
    setCurrentCustomer(customer);
    setContactDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!currentCustomer) return;
    setSendingEmail(true);
    setEmailSent(false);
    try {
      const payload = [{
        customer_id: currentCustomer.customer_id,
        email: currentCustomer.email,
        productName: data.product,
        productDescription: currentCustomer.reason,
      }];
      await api.post("/email/send-image-email", payload);
      setEmailSent(true);
      setTimeout(() => {
        setContactDialogOpen(false);
        setSendingEmail(false);
        setEmailSent(false);
      }, 2000);
    } catch (err) {
      setSendingEmail(false);
      alert("Failed to send email");
    }
  };

  const handleCallClick = () => {
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
      const payload = {
        phone_number: phoneNumber,
        language: selectedLanguage, 
        cust_name: currentCustomer.name,
        cust_details: currentCustomer,
        product_details: {
          name: data.product,
          description: currentCustomer.reason,
        },
      };
      await fetch("https://statuscode2-submission-1.onrender.com/create-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setCallSuccess(true);
      setTimeout(() => {
        setShowPhoneInput(false);
        setIsCallingCustomer(false);
        setCallSuccess(false);
        setPhoneNumber("");
        setContactDialogOpen(false);
      }, 2000);
    } catch (err) {
      setIsCallingCustomer(false);
      alert("Failed to initiate call");
    }
  };

  const CustomerCard = ({ customer, isSuitable }: { customer: any, isSuitable: boolean }) => (
    <Card className={`overflow-hidden ${isSuitable ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
      <CardHeader className={`${isSuitable ? 'bg-green-100/50' : 'bg-red-100/50'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {customer.name}
              <span className="ml-2 text-xs text-muted-foreground">({customer.customer_id})</span>
            </CardTitle>
            <CardDescription className="flex items-center mt-1 gap-4">
              <div className="flex items-center">
                <Mail className="mr-1 h-3 w-3" />
                {customer.email}
              </div>
              <div className="flex items-center">
                <MapPin className="mr-1 h-3 w-3" />
                {customer.location}
              </div>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isSuitable ? "default" : "destructive"} className="flex items-center gap-1">
              {isSuitable ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {isSuitable ? "Suitable" : "Not Suitable"}
            </Badge>
            {isSuitable && (
              <Button size="sm" onClick={() => handleContactClick(customer)}>
                Contact
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{customer.gender}, {customer.age} years</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Credit Score: {customer.credit_score}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Balance: ₹{customer.balance?.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Salary: ₹{customer.estimated_salary?.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Tenure: {customer.tenure} years</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Products: {customer.product_numbers} | Card: {customer.credit_card ? "Yes" : "No"}</span>
          </div>
        </div>
        <div className={`border p-4 rounded-lg mt-4 ${isSuitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h4 className={`font-medium mb-2 flex items-center gap-2 ${isSuitable ? 'text-green-700' : 'text-red-700'}`}>
            {isSuitable ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {isSuitable ? "Why This Product Is Suitable" : "Why This Product Is Not Suitable"}
          </h4>
          <p className="text-sm leading-relaxed">{customer.reason}</p>
        </div>
      </CardContent>
      {isSuitable && (
        <CardFooter className="bg-green-100/30 py-3 flex justify-between">
          <div className="text-sm text-muted-foreground flex items-center">
            <Check className="h-4 w-4 mr-1 text-green-500" />
            <span>Ready for outreach</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleContactClick(customer)}
            >
              <Mail className="h-3 w-3 mr-1" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                setCurrentCustomer(customer);
                setContactDialogOpen(true);
                setShowPhoneInput(true);
              }}
            >
              <Phone className="h-3 w-3 mr-1" />
              Call
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-xl">Loading suitability...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-lg text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold">Error Loading Suitability</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild className="mt-4">
            <Link href="/products">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Suitability Analysis</h1>
          <p className="text-muted-foreground mt-1">
            {data?.qualified_customers} out of {data?.total_customers} customers are suitable for <b>{data?.product}</b>
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Product Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Product:</span>
                <span className="font-medium">{data?.product}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Customers:</span>
                <span className="font-medium">{data?.total_customers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-700">Suitable Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Count:</span>
                <span className="font-medium text-green-700">{data?.qualified_customers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Percentage:</span>
                <span className="font-medium text-green-700">
                  {((data?.qualified_customers / data?.total_customers) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-700">Not Suitable Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Count:</span>
                <span className="font-medium text-red-700">{data?.unqualified_customers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Percentage:</span>
                <span className="font-medium text-red-700">
                  {((data?.unqualified_customers / data?.total_customers) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <h2 className="text-xl font-semibold text-green-700">Suitable Customers ({data?.qualified_customers})</h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {data?.suitable_customers?.map((customer: any) => (
            <CustomerCard key={customer.customer_id} customer={customer} isSuitable={true} />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4 mt-12">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <h2 className="text-xl font-semibold text-red-700">Not Suitable Customers ({data?.unqualified_customers})</h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {data?.not_suitable_customers?.map((customer: any) => (
            <CustomerCard key={customer.customer_id} customer={customer} isSuitable={false} />
          ))}
        </div>
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
          setSelectedLanguage("bn-IN"); // Reset language on close
        }
        setContactDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          {showPhoneInput ? (
            <>
              <DialogHeader>
                <DialogTitle>Enter Phone Number to Call</DialogTitle>
                <DialogDescription>
                  Please provide the phone number to contact {currentCustomer?.name}
                </DialogDescription>
              </DialogHeader>
              {isCallingCustomer && !callSuccess ? (
                <div className="py-8 flex flex-col items-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
                <DialogTitle>Contact {currentCustomer?.name}</DialogTitle>
                <DialogDescription>
                  Choose how you would like to contact the customer
                </DialogDescription>
              </DialogHeader>
              {sendingEmail && !emailSent ? (
                <div className="py-8 flex flex-col items-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
                      <span>Both options will share product suitability details</span>
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
