import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-primary-foreground text-lg">
              ACE
            </div>
            <span className="font-display font-bold text-xl text-foreground hidden sm:block">
              AllCollegeEvent
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden md:block text-base lg:text-lg font-semibold text-foreground/80 hover:text-primary transition-colors"
            >
              Get Started
            </Link>

            {/* Profile Link - visible when logged in (Dashboard removed) */}
            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  className="text-base lg:text-lg font-semibold text-foreground/80 hover:text-primary transition-colors px-3 py-2"
                >
                  Profile
                </Link>
              </>
            )}

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                  >
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.email || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Signed in
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/student")}>
                    Student Feed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/create-event")}>
                    Create Event
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/faculty")}>
                    Faculty Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/mentor-discovery")}>
                    Find Mentors
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="hidden sm:inline-flex text-base lg:text-lg font-semibold"
                >
                  <Link to="/auth">Login</Link>
                </Button>
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg px-6 text-base lg:text-lg"
                >
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
