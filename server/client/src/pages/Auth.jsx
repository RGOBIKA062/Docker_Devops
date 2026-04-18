import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

const API_BASE_URL = "http://localhost:5000/api";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupUserType, setSignupUserType] = useState("student");
  
  // Password strength validation
  const validatePasswordStrength = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const minLength = password.length >= 6;
    
    return {
      hasUppercase,
      hasLowercase,
      hasNumbers,
      minLength,
      isValid: hasUppercase && hasLowercase && hasNumbers && minLength
    };
  };
  
  const passwordStrength = validatePasswordStrength(signupPassword);
  
  const [carouselApi, setCarouselApi] = useState(null);
  const autoplayRef = useRef(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Try to load up to 3 named assets from src/assets matching caurosel1/2/3
  let slideUrls = [];
  try {
    const _slideModules = import.meta.glob('../assets/caurosel*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
    slideUrls = Object.values(_slideModules).slice(0, 3);
  } catch (e) {
    console.warn('Could not load carousel images:', e);
  }

  useEffect(() => {
    if (!carouselApi) return;
    autoplayRef.current = setInterval(() => {
      try {
        carouselApi.scrollNext();
      } catch (e) {
        /* ignore */
      }
    }, 3500);
    return () => clearInterval(autoplayRef.current);
  }, [carouselApi]);

  /**
   * Handle Login
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      if (!loginEmail || !loginPassword) {
        throw new Error("Please fill in all fields");
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update auth context with both user and authenticated state
      login(data.user);

      toast({
        title: "✅ Welcome back!",
        description: "You've successfully logged in.",
      });

      // Redirect based on user type - small delay to ensure state updates
      setTimeout(() => {
        const userType = data.user.userType;
        if (userType === "student") {
          navigate("/student");
        } else if (userType === "faculty") {
          navigate("/faculty");
        } else if (userType === "industry") {
          navigate("/industry");
        } else if (userType === "freelancer") {
          navigate("/freelancer");
        } else if (userType === "organizer") {
          navigate("/organizer");
        } else {
          navigate("/student");
        }
      }, 100);

      // Clear form
      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      const errorMsg = error.message || "Invalid email or password.";
      setLoginError(errorMsg);
      toast({
        variant: "destructive",
        title: "❌ Login Failed",
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Signup
   */
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");
    setLoading(true);

    try {
      // Validation
      if (!signupFullName || !signupEmail || !signupPassword || !signupConfirmPassword) {
        throw new Error("Please fill in all fields");
      }

      if (signupPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (signupPassword !== signupConfirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Check password strength (uppercase, lowercase, numbers)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(signupPassword)) {
        throw new Error("Password must contain uppercase, lowercase, and numbers");
      }

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: signupFullName,
          email: signupEmail,
          password: signupPassword,
          confirmPassword: signupConfirmPassword,
          userType: signupUserType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Store token
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update auth context with both user and authenticated state
      login(data.user);

      toast({
        title: "✅ Account created!",
        description: "Welcome to AllCollegeEvents! You have successfully signed up.",
        className: "bg-green-50 border-green-200",
      });

      // Redirect based on user type - small delay to ensure state updates
      setTimeout(() => {
        navigate(`/${data.user.userType}`);
      }, 100);

      // Clear form
      setSignupFullName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPassword("");
    } catch (error) {
      const errorMsg = error.message || "Failed to create account. Please try again.";
      setSignupError(errorMsg);
      toast({
        variant: "destructive",
        title: "❌ Signup Failed",
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-4rem)] flex items-start justify-center gap-8">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex w-full max-w-sm mr-8">
                <div className="w-full overflow-hidden rounded-3xl relative md:h-[650px] lg:h-[750px]">
            <Carousel opts={{ loop: true }} setApi={setCarouselApi}>
              <CarouselContent>
                {slideUrls.length > 0 ? (
                  slideUrls.map((src, i) => (
                    <CarouselItem key={i}>
                      <div className="h-full w-full flex items-center justify-center bg-white">
                        <img src={src} alt={`carousel ${i + 1}`} className="max-h-full max-w-full object-contain" />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <>
                    <CarouselItem className="pl-0">
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/60 to-primary/30 text-white text-2xl font-semibold">caurosel1</div>
                    </CarouselItem>
                    <CarouselItem className="pl-0">
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-secondary/60 to-secondary/30 text-white text-2xl font-semibold">caurosel2</div>
                    </CarouselItem>
                    <CarouselItem className="pl-0">
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-accent/60 to-accent/30 text-white text-2xl font-semibold">caurosel3</div>
                    </CarouselItem>
                  </>
                )}
              </CarouselContent>
              <CarouselPrevious className="hidden md:block" />
              <CarouselNext className="hidden md:block" />
            </Carousel>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mt-0">
          <Card className="border-2 border-primary/20 shadow-2xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">AllCollegeEvent</CardTitle>
              <CardDescription className="text-center text-base">Join the ultimate event discovery platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="text-base">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="text-base">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {loginError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        ⚠️ {loginError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => {
                        setLoginEmail(e.target.value);
                        setLoginError("");
                      }} required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setLoginError("");
                      }} required className="h-11" />
                    </div>
                    <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    {signupError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        ⚠️ {signupError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input id="signup-name" type="text" placeholder="John Doe" value={signupFullName} onChange={(e) => {
                        setSignupFullName(e.target.value);
                        setSignupError("");
                      }} required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={(e) => {
                        setSignupEmail(e.target.value);
                        setSignupError("");
                      }} required className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => {
                        setSignupPassword(e.target.value);
                        setSignupError("");
                      }} required minLength={6} className="h-11" />
                      {signupPassword && (
                        <div className="text-xs space-y-1 p-3 bg-gray-50 rounded border border-gray-200">
                          <p className={passwordStrength.minLength ? "text-green-600 font-medium" : "text-red-600"}>
                            {passwordStrength.minLength ? "✓" : "✗"} At least 6 characters
                          </p>
                          <p className={passwordStrength.hasUppercase ? "text-green-600 font-medium" : "text-red-600"}>
                            {passwordStrength.hasUppercase ? "✓" : "✗"} Contains uppercase letter (A-Z)
                          </p>
                          <p className={passwordStrength.hasLowercase ? "text-green-600 font-medium" : "text-red-600"}>
                            {passwordStrength.hasLowercase ? "✓" : "✗"} Contains lowercase letter (a-z)
                          </p>
                          <p className={passwordStrength.hasNumbers ? "text-green-600 font-medium" : "text-red-600"}>
                            {passwordStrength.hasNumbers ? "✓" : "✗"} Contains numbers (0-9)
                          </p>
                        </div>
                      )}
                      {!signupPassword && <p className="text-xs text-muted-foreground">Must contain uppercase, lowercase, numbers, and min 6 characters</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <Input id="signup-confirm-password" type="password" placeholder="••••••••" value={signupConfirmPassword} onChange={(e) => {
                        setSignupConfirmPassword(e.target.value);
                        setSignupError("");
                      }} required minLength={6} className="h-11" />
                      {signupPassword && signupConfirmPassword && signupPassword !== signupConfirmPassword && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                      {signupPassword && signupConfirmPassword && signupPassword === signupConfirmPassword && (
                        <p className="text-xs text-green-500">✓ Passwords match</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-type">I am a...</Label>
                      <select id="signup-type" value={signupUserType} onChange={(e) => setSignupUserType(e.target.value)} className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <option value="student">Student</option>                        
                        <option value="faculty">Faculty Member</option>
                        <option value="industry">Industry Professional</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="organizer">Admin</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading || signupPassword !== signupConfirmPassword || !passwordStrength.isValid}>{loading ? "Creating account..." : "Sign Up"}</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
