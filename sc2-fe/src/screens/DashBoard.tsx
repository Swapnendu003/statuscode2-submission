"use client";
import React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  description: string;
  category: string;
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

export default function Dashboard1() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/user/data/all");
        setUsers(response.data.reverse());
        setLoading(false);
      } catch (err: unknown) {
          if (err instanceof Error) {
              setError(err.message);
          } else {
              setError("An error occurred");
          }
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

  const handleCheckboxChange = (id: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((userId) => userId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleProductCheckboxChange = (name: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(name)) {
        return prev.filter((productName) => productName !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const handleGetRecommendations = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one customer to get recommendations");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedUsersData = users.filter((user) =>
        selectedUsers.includes(user._id)
      );

      const payload = {
        customers: selectedUsersData.map((user) => ({
          customer_id: user.customerId.toString(),
          credit_score: user.creditScore,
          country: user.country,
          gender: user.gender,
          age: user.age,
          tenure: user.tenure,
          balance: user.balance,
          products_number: user.productNumbers,
          credit_card: user.creditCard,
          active_member: user.activeMember,
          estimated_salary: user.estimatedSalary,
          churn: user.churn,
          name: user.name,
          email: user.email,
        })),
        productNames:
          selectedProducts.length > 0 ? selectedProducts : undefined,
        topK: 3, 
      };

      const response = await api.post("/advisor/schemes", payload);

      sessionStorage.setItem("recommendations", JSON.stringify(response.data));

      router.push("/recommendations");
    } catch (err: unknown) {
      console.error("Error getting recommendations:", err);
      alert(
        `Error getting recommendations: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">

<Navbar />
      <main className="flex flex-col flex-1 gap-3 p-4 overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Customer Product Recommendation
          </h1>
          <p className="text-base text-muted-foreground">
            Select customers to analyze and recommend suitable financial
            products
          </p>
        </div>

        <div className="grid gap-3 flex-1 overflow-hidden md:gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="flex flex-col xl:col-span-2 overflow-y-scroll scrollbar-hide">
            <CardHeader className="py-3">
              <div className="grid gap-1">
                <CardTitle className="text-lg">Customer Selection</CardTitle>
                <CardDescription className="text-sm">
                  Select customers to generate tailored financial product
                  recommendations
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-3 pb-3 pt-0 overflow-hidden">
              {loading ? (
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
                      {Array(7)
                        .fill(0)
                        .map((_, index) => (
                          <TableRow key={index}>
                            <TableCell className="p-2">
                              <div className="h-4 w-4 rounded bg-gray-200 animate-pulse"></div>
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-1"></div>
                              <div className="h-3 w-40 bg-gray-100 rounded animate-pulse hidden md:block"></div>
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell className="hidden p-2 md:table-cell">
                              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell className="hidden p-2 xl:table-cell">
                              <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell className="p-2 text-right">
                              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse ml-auto"></div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
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

          <Card className="flex flex-col overflow-y-scroll scrollbar-hide">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Available Products & Schemes
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Browse and select products to recommend to customers
                  </CardDescription>
                </div>
                {selectedProducts.length > 0 && (
                  <Badge variant="outline" className="ml-auto">
                    {selectedProducts.length} selected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 px-3 pb-3 pt-0 overflow-hidden">
              {productsLoading ? (
                <div className="overflow-auto flex-1 scrollbar-hide">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[40px] p-2 text-xs font-medium"></TableHead>
                        <TableHead className="p-2 text-xs font-medium">
                          Name
                        </TableHead>
                        <TableHead className="p-2 text-xs font-medium">
                          Category
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array(10)
                        .fill(0)
                        .map((_, index) => (
                          <TableRow key={index}>
                            <TableCell className="p-2">
                              <div className="h-5 w-36 bg-gray-200 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell className="hidden p-2 md:table-cell">
                              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
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
                              return (
                                <TableRow
                                  key={productId}
                                  className="cursor-pointer bg-muted/50"
                                >
                                  <TableCell className="p-2 pl-8">
                                    <div
                                      className="product-checkbox"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Checkbox
                                        checked={selectedProducts.includes(
                                          productName
                                        )}
                                        onCheckedChange={() =>
                                          handleProductCheckboxChange(
                                            productName
                                          )
                                        }
                                      />
                                    </div>
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
                    {selectedProducts.length} products selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center py-2">
          <Button
            size="lg"
            onClick={handleGetRecommendations}
            disabled={selectedUsers.length === 0 || isSubmitting}
            className="px-8 text-base"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Processing...
              </>
            ) : (
              <>
                Get Recommendations for {selectedUsers.length}{" "}
                {selectedUsers.length === 1 ? "Customer" : "Customers"}
                {selectedProducts.length > 0 &&
                  ` (${selectedProducts.length} products)`}
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
