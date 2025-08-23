"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleUser,
  Menu,
  Package2,
  Search,
  ChevronDown,
  ChevronRight,
  Star,
  PhoneCall,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRODUCT_CATEGORIES } from "@/constants/product";
import Navbar from "@/components/global/Navbar";
import api from "@/services/api";

interface User {
  _id: string;
  customerId: number;
  creditScore: number;
  country: string;
  gender: string;
  age: number;
  tenure: number;
  balance: number;
  productNumbers: number;
  creditCard: number;
  activeMember: number;
  estimatedSalary: number;
  churn: number;
  name: string;
  location: string;
  email: string;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  riskLevel: string;
  minBalance: number;
  minTenure: number;
  specialInformation: string | null;
  benefits: string[];
  requirementsCriteria: string;
  targetCustomer: {
    ageRange: { min: number; max: number };
    incomeRange: { min: number; max: number };
    creditScoreRange: { min: number; max: number };
    preferredGender: string;
    requiredDocuments: string[];
    idealFor: string[];
  };
}

export default function Dashboard2() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading] = useState(false);
  const [productsError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user/data/all");
        setUsers(response.data.reverse());
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    const transformedProducts = PRODUCT_CATEGORIES.flatMap((category) =>
      category.products.map((productName) => ({
        _id: productName.replace(/\s+/g, "-").toLowerCase(),
        name: productName,
        category: category.name,
        description: `This is a ${category.name.toLowerCase()} product designed to meet financial needs.`,
        riskLevel:
          category.name === "Insurance"
            ? "Low"
            : category.name === "Deposit"
            ? "Low"
            : category.name === "Loans"
            ? "Medium"
            : "Moderate",
        minBalance: 0,
        minTenure: 0,
        specialInformation: null,
        benefits: [],
        requirementsCriteria: "",
        targetCustomer: {
          ageRange: { min: 18, max: 65 },
          incomeRange: { min: 0, max: 1000000 },
          creditScoreRange: { min: 0, max: 900 },
          preferredGender: "All",
          requiredDocuments: [],
          idealFor: [],
        },
      }))
    );
    setProducts(transformedProducts);
    fetchUsers();
  }, []);

  const handleUserClick = async (userId: string) => {
    try {
      const response = await api.post("/user/data", {
        customerId: userId,
      });
      setSelectedUser(response.data);
      setDialogOpen(true);
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  const handleProductClick = async (productId: string) => {
    try {
      const response = await api.get(`/products/${productId}`);
      setSelectedProduct(response.data.data);
      setProductDialogOpen(true);
    } catch (err) {
      console.error("Error fetching product details:", err);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const handleProductRadioChange = (product: Product) => {
    setSelectedProduct(product);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleGetRecommendations = async () => {
    if (!selectedProduct || selectedUsers.length === 0) return;
    setIsSubmitting(true);
    try {
      const selectedUsersData = users.filter((user) =>
        selectedUsers.includes(user._id)
      );
      const customerIds = selectedUsersData.map((user) => user.customerId);

      const payload = {
        productName: selectedProduct.name,
        customerIds,
      };

      const response = await api.post("/suitability/suitable-customers", payload);
      sessionStorage.setItem("suitability", JSON.stringify(response.data));
      router.push("/suitability");
    } catch (err) {
      console.error("Error fetching suitability:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      <Navbar />
      {/* Main */}
      <main className="flex flex-col flex-1 gap-3 p-4 overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Product-Centric Recommendation
          </h1>
          <p className="text-base text-muted-foreground">
            Select a product and customers to analyze and recommend suitability
          </p>
        </div>
        {/* Swap card order: Product selection first, then user selection */}
        <div className="grid gap-3 flex-1 overflow-hidden md:gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {/* Product Selection (Single-select) */}
          <Card className="flex flex-col overflow-y-scroll scrollbar-hide bg-yellow-50">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Choose a Product</CardTitle>
                  <CardDescription className="text-sm">
                    Select a product to analyze customer suitability
                  </CardDescription>
                </div>
                {selectedProduct && (
                  <Badge variant="outline" className="ml-auto">
                    {selectedProduct.name}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-3 pb-3 pt-0 overflow-hidden">
              {productsLoading ? (
                <div className="overflow-auto flex-1 scrollbar-hide">
                  {/* ...loading skeleton... */}
                </div>
              ) : productsError ? (
                <div className="text-red-500 p-4 text-base">
                  Error: {productsError}
                </div>
              ) : (
                <div className="overflow-auto flex-1 scrollbar-hide">
                  <Table>
                    <TableBody>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <React.Fragment key={category.name}>
                          <TableRow
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => toggleCategory(category.name)}
                          >
                            <TableCell colSpan={4} className="p-2">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-sm">
                                  {category.name}
                                </div>
                                {expandedCategories.includes(category.name) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedCategories.includes(category.name) &&
                            category.products.map((productName) => {
                              const productId = productName
                                .replace(/\s+/g, "-")
                                .toLowerCase();
                              const productObj = products.find(
                                (p) => p._id === productId
                              );
                              return (
                                <TableRow
                                  key={productId}
                                  className={`cursor-pointer bg-muted/50 ${
                                    selectedProduct &&
                                    selectedProduct._id === productId
                                      ? "border-2 border-primary"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    productObj &&
                                    handleProductRadioChange(productObj)
                                  }
                                  onDoubleClick={() =>
                                    handleProductClick(productId)
                                  }
                                >
                                  <TableCell className="p-2 pl-8">
                                    <input
                                      type="radio"
                                      name="selectedProduct"
                                      checked={
                                        !!(
                                          selectedProduct &&
                                          selectedProduct._id === productId
                                        )
                                      }
                                      onChange={() =>
                                        productObj &&
                                        handleProductRadioChange(productObj)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </TableCell>
                                  <TableCell className="p-2">
                                    <div className="font-medium text-sm">
                                      {productName}
                                    </div>
                                  </TableCell>
                                  <TableCell className="p-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {category.name}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {!productsLoading && !productsError && (
                <div className="mt-1 flex items-center">
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct
                      ? `Selected: ${selectedProduct.name}`
                      : "No product selected"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Selection (Multi-select) */}
          <Card className="flex flex-col xl:col-span-2 overflow-y-scroll scrollbar-hide">
            <CardHeader className="py-3">
              <div className="grid gap-1">
                <CardTitle className="text-lg">Select Customers</CardTitle>
                <CardDescription className="text-sm">
                  Pick customers to analyze for the chosen product
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-3 pb-3 pt-0 overflow-hidden">
              {loading ? (
                <div className="overflow-auto flex-1 scrollbar-hide">
                  {/* ...loading skeleton... */}
                </div>
              ) : error ? (
                <div className="text-red-500 p-4 text-base">Error: {error}</div>
              ) : (
                <div className="overflow-auto flex-1 scrollbar-hide">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[40px] p-2 text-xs font-medium"></TableHead>
                        <TableHead className="p-2 text-xs font-medium">
                          Name
                        </TableHead>
                        <TableHead className="p-2 text-xs font-medium">
                          Customer ID
                        </TableHead>
                        <TableHead className="hidden p-2 text-xs font-medium md:table-cell">
                          Location
                        </TableHead>
                        <TableHead className="hidden p-2 text-xs font-medium xl:table-cell">
                          Credit Score
                        </TableHead>
                        <TableHead className="p-2 text-xs font-medium text-right">
                          Balance
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow
                          key={user._id}
                          className="cursor-pointer"
                          onClick={() => handleUserClick(user._id)}
                        >
                          <TableCell
                            className="p-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={selectedUsers.includes(user._id)}
                              onCheckedChange={() =>
                                handleCheckboxChange(user._id)
                              }
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="font-medium text-sm">
                              {user.name}
                            </div>
                            <div className="hidden text-xs text-muted-foreground md:inline">
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell className="p-2 text-sm">
                            {user.customerId}
                          </TableCell>
                          <TableCell className="hidden p-2 text-sm md:table-cell">
                            {user.location}
                          </TableCell>
                          <TableCell className="hidden p-2 text-sm xl:table-cell">
                            {user.creditScore}
                          </TableCell>
                          <TableCell className="p-2 text-sm text-right">
                            ₹{user.balance.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="mt-1 flex items-center">
                <p className="text-sm text-muted-foreground">
                  {selectedUsers.length} customers selected
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analyze Suitability Button */}
        <div className="flex justify-center py-2">
          <Button
            size="lg"
            onClick={handleGetRecommendations}
            disabled={
              !selectedProduct || selectedUsers.length === 0 || isSubmitting
            }
            className="px-8 text-base bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Analyzing...
              </>
            ) : (
              <>
                Analyze Suitability for {selectedUsers.length}{" "}
                {selectedUsers.length === 1 ? "Customer" : "Customers"}
                {selectedProduct && ` (${selectedProduct.name})`}
              </>
            )}
          </Button>
        </div>
      </main>

      {/* User Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
            <DialogDescription>
              Detailed information to help identify suitable product
              recommendations
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Personal Information</h4>
                <div className="grid gap-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">
                      {selectedUser.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Email:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Age:</span>
                    <span className="text-sm font-medium">
                      {selectedUser.age}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Gender:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.gender}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Country:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.country}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Location:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.location}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Financial Information</h4>
                <div className="grid gap-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Customer ID:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.customerId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Credit Score:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.creditScore}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Balance:
                    </span>
                    <span className="text-sm font-medium">
                      ₹{selectedUser.balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Est. Salary:
                    </span>
                    <span className="text-sm font-medium">
                      ₹{selectedUser.estimatedSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Products:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.productNumbers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Credit Card:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.creditCard ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <h4 className="font-medium text-sm">Account Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tenure:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.tenure}{" "}
                      {selectedUser.tenure === 1 ? "year" : "years"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Active Member:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.activeMember ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Churn Risk:
                    </span>
                    <Badge
                      variant={selectedUser.churn ? "destructive" : "outline"}
                    >
                      {selectedUser.churn ? "High" : "Low"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[80vw] flex flex-col">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Product specifications and eligibility criteria for customer
              recommendations
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4 py-2 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[600px]">
                <h3 className="text-lg font-semibold">
                  {selectedProduct.name}
                </h3>
                <Badge>{selectedProduct.category}</Badge>
              </div>

              <div className="space-y-1 min-w-[600px]">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{selectedProduct.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 min-w-[600px]">
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Product Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Risk Level:
                      </span>
                      <Badge
                        variant={
                          selectedProduct.riskLevel === "High"
                            ? "destructive"
                            : selectedProduct.riskLevel === "Medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedProduct.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Min Balance:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedProduct.minBalance > 0
                          ? `₹${selectedProduct.minBalance.toLocaleString()}`
                          : "None"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Min Tenure:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedProduct.minTenure > 0
                          ? `${selectedProduct.minTenure} ${
                              selectedProduct.minTenure === 1 ? "year" : "years"
                            }`
                          : "None"}
                      </span>
                    </div>
                    {selectedProduct.specialInformation && (
                      <div className="pt-1">
                        <span className="text-sm text-muted-foreground">
                          Special Information:
                        </span>
                        <p className="text-sm mt-1">
                          {selectedProduct.specialInformation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Target Customer</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Age Range:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedProduct.targetCustomer.ageRange.min} -{" "}
                        {selectedProduct.targetCustomer.ageRange.max} years
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Income Range:
                      </span>
                      <span className="text-sm font-medium">
                        ₹
                        {selectedProduct.targetCustomer.incomeRange.min.toLocaleString()}{" "}
                        - ₹
                        {selectedProduct.targetCustomer.incomeRange.max.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Credit Score:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedProduct.targetCustomer.creditScoreRange.min} -
                        {selectedProduct.targetCustomer.creditScoreRange.max}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Gender Preference:
                      </span>
                      <span className="text-sm font-medium">
                        {selectedProduct.targetCustomer.preferredGender}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 min-w-[600px]">
                <div>
                  <h4 className="font-medium text-sm mb-2">Benefits</h4>
                  <ul className="space-y-1">
                    {selectedProduct.benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="text-sm flex items-center gap-2"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Ideal For</h4>
                  <ul className="space-y-1">
                    {selectedProduct.targetCustomer.idealFor.map(
                      (ideal, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-center gap-2"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                          {ideal}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-2 min-w-[600px]">
                <h4 className="font-medium text-sm mb-2">Required Documents</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.targetCustomer.requiredDocuments.map(
                    (doc, index) => (
                      <Badge key={index} variant="outline">
                        {doc}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <div className="pt-2 min-w-[600px]">
                <h4 className="font-medium text-sm mb-2">
                  Requirements Criteria
                </h4>
                <p className="text-sm">
                  {selectedProduct.requirementsCriteria}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
