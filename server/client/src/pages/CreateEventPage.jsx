import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useForm, Controller } from "react-hook-form";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Loader, X, Upload, Image as ImageIcon } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const EVENT_TYPES = [
  "Workshop", "Hackathon", "Conference", "Webinar", "Networking",
  "Career Fair", "Internship Drive", "Placement Drive", "Competition", "Seminar", "Training"
];

const CATEGORIES = [
  "AI/ML", "Web Development", "Mobile Development", "Cloud Computing", "DevOps",
  "Cybersecurity", "Data Science", "Blockchain", "IoT", "Robotics", "Business",
  "Marketing", "Finance", "Leadership", "Entrepreneurship"
];

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const CreateEventPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState([]);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      eventType: "",
      category: "",
      skillLevel: "All Levels",
      organizerName: "",
      organizerEmail: "",
      organizerPhone: "",
      organizationType: "College",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      timezone: "IST",
      locationType: "Offline",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      venue: "",
      meetingLink: "",
      totalCapacity: "100",
      pricingType: "Free",
      pricingAmount: "0",
      earlyBirdEnabled: false,
      earlyBirdPercentage: "10",
      earlyBirdEndDate: "",
      hasCertificate: false,
      hasJobOpportunity: false,
      hasPrizePool: false,
      prizeAmount: "0",
      hasQA: false,
      hasRecording: false,
      hasMaterials: false,
      materialsUrl: "",
      hasLiveChat: false,
      hasGiveaways: false,
      bannerImage: "",
      requirements: "",
      deliverables: ""
    }
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleBannerUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image size must be less than 5MB" });
      return;
    }

    setBannerFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const onSubmit = async (values) => {
    if (tags.length === 0) {
      toast({ title: "Error", description: "Please add at least one tag" });
      return;
    }

    if (!bannerFile) {
      toast({ title: "Error", description: "Please upload a banner image" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      // Convert image to base64
      let bannerImageUrl = "";
      const reader = new FileReader();
      
      bannerImageUrl = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(bannerFile);
      });

      const payload = {
        ...values,
        tags,
        bannerImage: bannerImageUrl,
        totalCapacity: parseInt(values.totalCapacity),
        pricingAmount: values.pricingType === "Free" ? 0 : parseFloat(values.pricingAmount),
        prizeAmount: values.hasPrizePool ? parseFloat(values.prizeAmount) : 0
      };

      const response = await fetch(`${API_BASE_URL}/events/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const data = await response.json();
      toast({ title: "Success", description: "Event created successfully!" });

      form.reset();
      setTags([]);
      setBannerFile(null);
      setBannerPreview(null);
      setStep(1);
      
      // Redirect to student feed with "My Events" tab selected
      setTimeout(() => navigate("/student?tab=mine"), 1500);
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: error.message || "Failed to create event" });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background py-8">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/organizer")}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Event</h1>
              <p className="text-muted-foreground">Fill in the details to create and publish your event</p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-lg border bg-card p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step Indicator */}
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3].map(s => (
                    <div
                      key={s}
                      className={`h-2 w-12 rounded-full transition-colors ${
                        s === step ? "bg-primary" : s < step ? "bg-primary/50" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Step 1: Basic Info & Organizer */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Event Details</h2>
                    
                    <FormItem>
                      <FormLabel>Event Title *</FormLabel>
                      <FormControl>
                        <Input {...form.register("title", { required: true })} placeholder="Enter event title" />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Short Description *</FormLabel>
                      <FormControl>
                        <Input {...form.register("shortDescription", { required: true })} placeholder="Brief description" />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea {...form.register("description", { required: true })} placeholder="Detailed description" rows={3} />
                      </FormControl>
                    </FormItem>

                    <div className="grid grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel>Event Type *</FormLabel>
                        <FormControl>
                          <Select onValueChange={v => form.setValue("eventType", v)} value={form.watch("eventType")}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVENT_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <FormControl>
                          <Select onValueChange={v => form.setValue("category", v)} value={form.watch("category")}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    </div>

                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <FormControl>
                        <Select onValueChange={v => form.setValue("skillLevel", v)} value={form.watch("skillLevel")}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SKILL_LEVELS.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    {/* Tags */}
                    <FormItem>
                      <FormLabel>Tags *</FormLabel>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newTag}
                          onChange={e => setNewTag(e.target.value)}
                          onKeyPress={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                          placeholder="Add a tag and press Enter"
                        />
                        <Button type="button" onClick={addTag} variant="outline" size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-2">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </FormItem>

                    {/* Organizer Info */}
                    <h3 className="text-lg font-semibold mt-8">Organizer Information</h3>
                    
                    <FormItem>
                      <FormLabel>Organizer Name *</FormLabel>
                      <FormControl>
                        <Input {...form.register("organizerName", { required: true })} placeholder="Your name" />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input {...form.register("organizerEmail", { required: true })} type="email" placeholder="your@email.com" />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input {...form.register("organizerPhone", { required: true })} placeholder="+91 XXXXX XXXXX" />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Organization Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={v => form.setValue("organizationType", v)} value={form.watch("organizationType")}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["College", "Company", "NGO", "Community", "Individual"].map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  </div>
                )}

                {/* Step 2: Date, Time & Location */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Date, Time & Location</h2>

                    <div className="grid grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input {...form.register("startDate", { required: true })} type="date" />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input {...form.register("endDate", { required: true })} type="date" />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel>Start Time *</FormLabel>
                        <FormControl>
                          <Input {...form.register("startTime", { required: true })} type="time" />
                        </FormControl>
                      </FormItem>

                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input {...form.register("endTime")} type="time" />
                        </FormControl>
                      </FormItem>
                    </div>

                    <FormItem>
                      <FormLabel>Location Type *</FormLabel>
                      <FormControl>
                        <Select onValueChange={v => form.setValue("locationType", v)} value={form.watch("locationType")}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Offline", "Online", "Hybrid"].map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    {(form.watch("locationType") === "Offline" || form.watch("locationType") === "Hybrid") && (
                      <>
                        <FormItem>
                          <FormLabel>Venue *</FormLabel>
                          <FormControl>
                            <Input {...form.register("venue")} placeholder="Venue name" />
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...form.register("address")} placeholder="Street address" />
                          </FormControl>
                        </FormItem>

                        <div className="grid grid-cols-3 gap-2">
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...form.register("city")} placeholder="City" />
                            </FormControl>
                          </FormItem>

                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...form.register("state")} placeholder="State" />
                            </FormControl>
                          </FormItem>

                          <FormItem>
                            <FormLabel>ZIP Code</FormLabel>
                            <FormControl>
                              <Input {...form.register("zipCode")} placeholder="ZIP" />
                            </FormControl>
                          </FormItem>
                        </div>
                      </>
                    )}

                    {(form.watch("locationType") === "Online" || form.watch("locationType") === "Hybrid") && (
                      <FormItem>
                        <FormLabel>Meeting Link</FormLabel>
                        <FormControl>
                          <Input {...form.register("meetingLink")} placeholder="https://meet.google.com/..." />
                        </FormControl>
                      </FormItem>
                    )}

                    {/* Capacity & Pricing */}
                    <h3 className="text-lg font-semibold mt-8">Capacity & Pricing</h3>

                    <FormItem>
                      <FormLabel>Total Capacity *</FormLabel>
                      <FormControl>
                        <Input {...form.register("totalCapacity")} type="number" placeholder="100" />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Pricing Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={v => form.setValue("pricingType", v)} value={form.watch("pricingType")}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["Free", "Paid"].map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>

                    {form.watch("pricingType") === "Paid" && (
                      <FormItem>
                        <FormLabel>Price (₹) *</FormLabel>
                        <FormControl>
                          <Input {...form.register("pricingAmount")} type="number" placeholder="500" />
                        </FormControl>
                      </FormItem>
                    )}
                  </div>
                )}

                {/* Step 3: Features & Additional */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Features & Additional Details</h2>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={form.watch("hasCertificate")}
                          onCheckedChange={v => form.setValue("hasCertificate", v)}
                        />
                        <label className="cursor-pointer">Provide Certificate</label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={form.watch("hasJobOpportunity")}
                          onCheckedChange={v => form.setValue("hasJobOpportunity", v)}
                        />
                        <label className="cursor-pointer">Job Opportunities</label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={form.watch("hasPrizePool")}
                          onCheckedChange={v => form.setValue("hasPrizePool", v)}
                        />
                        <label className="cursor-pointer">Prize Pool</label>
                      </div>

                      {form.watch("hasPrizePool") && (
                        <FormItem className="ml-6">
                          <FormLabel>Prize Amount (₹)</FormLabel>
                          <FormControl>
                            <Input {...form.register("prizeAmount")} type="number" />
                          </FormControl>
                        </FormItem>
                      )}

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={form.watch("hasQA")}
                          onCheckedChange={v => form.setValue("hasQA", v)}
                        />
                        <label className="cursor-pointer">Q&A Session</label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={form.watch("hasRecording")}
                          onCheckedChange={v => form.setValue("hasRecording", v)}
                        />
                        <label className="cursor-pointer">Recording Available</label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={form.watch("hasMaterials")}
                          onCheckedChange={v => form.setValue("hasMaterials", v)}
                        />
                        <label className="cursor-pointer">Course Materials</label>
                      </div>

                      {form.watch("hasMaterials") && (
                        <FormItem className="ml-6">
                          <FormLabel>Materials URL</FormLabel>
                          <FormControl>
                            <Input {...form.register("materialsUrl")} placeholder="https://..." />
                          </FormControl>
                        </FormItem>
                      )}

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={form.watch("hasLiveChat")}
                          onCheckedChange={v => form.setValue("hasLiveChat", v)}
                        />
                        <label className="cursor-pointer">Live Chat</label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={form.watch("hasGiveaways")}
                          onCheckedChange={v => form.setValue("hasGiveaways", v)}
                        />
                        <label className="cursor-pointer">Giveaways</label>
                      </div>
                    </div>

                    <FormItem className="mt-6">
                      <FormLabel>Banner Image *</FormLabel>
                      <div className="space-y-3">
                        {bannerPreview ? (
                          <div className="relative">
                            <img
                              src={bannerPreview}
                              alt="Banner preview"
                              className="w-full h-48 object-cover rounded-lg border border-border"
                            />
                            <Button
                              type="button"
                              onClick={removeBanner}
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                              <p className="text-sm font-semibold text-foreground">Click to upload image</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG, GIF (Max 5MB)</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBannerUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                        {bannerFile && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {bannerFile.name}
                          </p>
                        )}
                      </div>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Requirements</FormLabel>
                      <FormControl>
                        <Textarea {...form.register("requirements")} placeholder="What participants need to bring/know..." rows={2} />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Deliverables</FormLabel>
                      <FormControl>
                        <Textarea {...form.register("deliverables")} placeholder="What participants will receive..." rows={2} />
                      </FormControl>
                    </FormItem>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-2 pt-6 border-t">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                    >
                      Previous
                    </Button>
                  )}
                  {step < 3 && (
                    <Button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="ml-auto"
                    >
                      Next
                    </Button>
                  )}
                  {step === 3 && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="ml-auto gap-2"
                      >
                        {loading && <Loader className="w-4 h-4 animate-spin" />}
                        Create Event
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateEventPage;
