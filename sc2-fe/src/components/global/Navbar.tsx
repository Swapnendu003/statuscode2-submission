import Link from "next/link"
import {
  CircleUser,
  Menu,
  Package2,
  Search,
  Heart
} from "lucide-react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"


export default function Navbar() {
    return (
      <div >
      <header className="relative z-10 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 md:px-6 shadow-sm">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
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
            <span className="font-bold bg-clip-text text-transparent bg-black">
              VaniSetu
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
          >
            Recommendations
          </Link>
          <Link
            href="/products"
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            Suitability
          </Link>
          <Link
            href="/analysis"
            className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
          >
            Analytics
          </Link>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search customers, products..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-white/50 backdrop-blur border-gray-200"
              />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/50 backdrop-blur hover:bg-white/80"
              >
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white/95 backdrop-blur"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
        </div>
    )
}