import {
  Cloud,
  CreditCard,
  Github,
  Settings,
  User,
  UserPlus,
  Users,
  BarChartBig,
  IndianRupee,
  CircleUser,
  BookUser,
  Instagram
} from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link";

export function NavMenu() {
  return (
    <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Feedback Tracker</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
        <DropdownMenuItem>
            <Link href="/dashboard" className="flex flexr-row">
              <BarChartBig className="mr-2 h-4 w-4"/>
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
          <CircleUser className="mr-2 h-4 w-4"/>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IndianRupee className="mr-2 h-4 w-4"/>
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4"/>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />
        <a href="https://github.com/Aditya948351" target="_blank" rel="noopener noreferrer">
          <DropdownMenuItem>
            <Github className="mr-2 h-4 w-4"/>
            GitHub
          </DropdownMenuItem>
        </a>
        <DropdownMenuItem>
          <Instagram className="mr-2 h-4 w-4"/>
          Contact Support Team
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Made by PBL group No.(Dont Know)</DropdownMenuItem>
    </DropdownMenuContent>
  )
}
