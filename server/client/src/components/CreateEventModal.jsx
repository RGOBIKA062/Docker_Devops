import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { X, Plus, Loader, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

// Constants
const EVENT_TYPES = [
  'Workshop', 'Hackathon', 'Conference', 'Webinar', 'Networking',
  'Career Fair', 'Internship Drive', 'Placement Drive', 'Competition', 'Seminar', 'Training'
];

const CATEGORIES = [
  'AI/ML', 'Web Development', 'Mobile Development', 'Cloud Computing', 'DevOps',
  'Cybersecurity', 'Data Science', 'Blockchain', 'IoT', 'Robotics', 'Business',
  'Marketing', 'Finance', 'Leadership', 'Entrepreneurship'
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const ORGANIZER_TYPES = ['College', 'Company', 'Individual', 'NGO', 'Government'];

// ============================================================================
// VALIDATION UTILITIES - Production Grade
// ============================================================================

const ValidationRules = {
  title: {
    required: 'Event title is required',
    minLength: { value: 5, message: 'Title must be at least 5 characters' },
    maxLength: { value: 100, message: 'Title cannot exceed 100 characters' },
    pattern: { 
      value: /^[a-zA-Z0-9\s&\-()]+$/i, 
      message: 'Title contains invalid characters' 
    }
  },
  description: {
    required: 'Event description is required',
    minLength: { value: 20, message: 'Description must be at least 20 characters' },
    maxLength: { value: 5000, message: 'Description cannot exceed 5000 characters' }
  },
  shortDescription: {
    maxLength: { value: 200, message: 'Short description cannot exceed 200 characters' }
  },
  organizerName: {
    required: 'Organizer name is required',
    minLength: { value: 2, message: 'Organizer name must be at least 2 characters' },
    maxLength: { value: 100, message: 'Organizer name cannot exceed 100 characters' }
  },
  organizerEmail: {
    required: 'Organizer email is required',
    pattern: { 
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
      message: 'Please enter a valid email address' 
    }
  },
  organizerPhone: {
    pattern: { 
      value: /^[\d+\-\s()]{7,15}$/, 
      message: 'Please enter a valid phone number' 
    }
  },
  startDate: {
    required: 'Start date is required'
  },
  endDate: {
    required: 'End date is required'
  },
  startTime: {
    required: 'Start time is required',
    pattern: {
      value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      message: 'Please enter valid time (HH:MM format)'
    }
  },
  endTime: {
    required: 'End time is required',
    pattern: {
      value: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
      message: 'Please enter valid time (HH:MM format)'
    }
  },
  totalCapacity: {
    required: 'Total capacity is required',
    min: { value: 1, message: 'Capacity must be at least 1' },
    max: { value: 10000, message: 'Capacity cannot exceed 10,000' }
  },
  pricingAmount: {
    min: { value: 0, message: 'Price cannot be negative' },
    max: { value: 1000000, message: 'Price seems too high' }
  },
  prizeAmount: {
    min: { value: 0, message: 'Prize amount cannot be negative' },
    max: { value: 10000000, message: 'Prize amount seems too high' }
  },
  materialsUrl: {
    pattern: {
      value: /^https?:\/\/.+\..+/i,
      message: 'Please enter a valid URL (must start with http:// or https://)'
    }
  },
  bannerImage: {
    pattern: {
      value: /^https?:\/\/.+\..+\.(jpg|jpeg|png|gif|webp)$/i,
      message: 'Please enter a valid image URL (jpg, png, gif, webp)'
    }
  },
  registrationUrl: {
    pattern: {
      value: /^https?:\/\/.+\..+/i,
      message: 'Please enter a valid URL (must start with http:// or https://)'
    }
  }
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

const validateDates = (startDate, endDate, startTime, endTime) => {
  const errors = [];
  
  if (!startDate || !endDate) return errors;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check if start date is in the future
  if (start <= new Date()) {
    errors.push('Start date must be in the future');
  }
  
  // Check if end date is after start date
  if (end < start) {
    errors.push('End date must be after start date');
  }
  
  // Check time logic
  if (startTime && endTime && startDate === endDate) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    if (endHour < startHour || (endHour === startHour && endMin <= startMin)) {
      errors.push('End time must be after start time on the same day');
    }
  }
  
  return errors;
};

const validateLocationFields = (locationType, address, city, state, meetingLink) => {
  const errors = [];
  
  if (locationType === 'Offline' || locationType === 'Hybrid') {
    if (!address || address.trim().length < 5) {
      errors.push('Address is required for offline events (minimum 5 characters)');
    }
    if (!city || city.trim().length < 2) {
      errors.push('City is required for offline events');
    }
    if (!state || state.trim().length < 2) {
      errors.push('State is required for offline events');
    }
  }
  
  if (locationType === 'Online' || locationType === 'Hybrid') {
    if (!meetingLink || !meetingLink.trim()) {
      errors.push('Meeting link is required for online events');
    } else if (!isValidUrl(meetingLink)) {
      errors.push('Please enter a valid meeting link URL');
    }
  }
  
  return errors;
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

const CreateEventModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [imageLoadingError, setImageLoadingError] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const isAuthenticated = !!localStorage.getItem('authToken');

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      shortDescription: '',
      eventType: '',
      category: '',
      skillLevel: 'All Levels',
      organizerName: '',
      organizerEmail: '',
      organizerPhone: '',
      organizationType: 'College',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      timezone: 'IST',
      locationType: 'Offline',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      venue: '',
      meetingLink: '',
      totalCapacity: '100',
      pricingType: 'Free',
      pricingAmount: '0',
      earlyBirdEnabled: false,
      earlyBirdPercentage: '10',
      earlyBirdEndDate: '',
      hasCertificate: false,
      hasJobOpportunity: false,
      hasPrizePool: false,
      prizeAmount: '0',
      hasQA: false,
      hasRecording: false,
      hasMaterials: false,
      materialsUrl: '',
      hasLiveChat: false,
      hasGiveaways: false,
      bannerImage: '',
      registrationUrl: '',
      requirements: '',
      deliverables: ''
    },
    mode: 'onChange'
  });

  // =========================================================================
  // TAG MANAGEMENT
  // =========================================================================

  const addTag = useCallback(() => {
    const trimmed = newTag.trim().toLowerCase();
    
    if (!trimmed) {
      toast({ title: 'Error', description: 'Tag cannot be empty', variant: 'destructive' });
      return;
    }
    
    if (trimmed.length < 2) {
      toast({ title: 'Error', description: 'Tag must be at least 2 characters', variant: 'destructive' });
      return;
    }
    
    if (trimmed.length > 30) {
      toast({ title: 'Error', description: 'Tag cannot exceed 30 characters', variant: 'destructive' });
      return;
    }
    
    if (tags.includes(trimmed)) {
      toast({ title: 'Error', description: 'This tag already exists', variant: 'destructive' });
      return;
    }
    
    if (tags.length >= 10) {
      toast({ title: 'Error', description: 'Maximum 10 tags allowed', variant: 'destructive' });
      return;
    }
    
    setTags([...tags, trimmed]);
    setNewTag('');
  }, [newTag, tags]);

  const removeTag = useCallback((tag) => {
    setTags(tags.filter(t => t !== tag));
  }, [tags]);

  // =========================================================================
  // BANNER IMAGE PREVIEW
  // =========================================================================

  const handleBannerImageChange = (file) => {
    if (!file) {
      setBannerImagePreview('');
      setImageLoadingError(false);
      form.setValue('bannerImage', '');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageLoadingError(true);
      setBannerImagePreview('');
      form.setValue('bannerImage', '');
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a JPG, PNG, GIF, or WebP image',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageLoadingError(true);
      setBannerImagePreview('');
      form.setValue('bannerImage', '');
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    // Read file and create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result;
      setBannerImagePreview(base64String);
      form.setValue('bannerImage', base64String);
      setImageLoadingError(false);
    };
    reader.onerror = () => {
      setImageLoadingError(true);
      setBannerImagePreview('');
      form.setValue('bannerImage', '');
      toast({
        title: 'Error',
        description: 'Failed to read the image file',
        variant: 'destructive'
      });
    };
    reader.readAsDataURL(file);
  };

  // =========================================================================
  // STEP VALIDATION & NAVIGATION
  // =========================================================================

  const handleNextStep = async () => {
    const newErrors = [];
    const values = form.getValues();

    switch (step) {
      case 1: {
        // Basic Information
        if (!values.title?.trim()) newErrors.push('Event title is required');
        if (!values.description?.trim()) newErrors.push('Event description is required');
        if (!values.eventType) newErrors.push('Event type is required');
        if (!values.category) newErrors.push('Category is required');
        if (tags.length === 0) newErrors.push('At least one tag is required');
        break;
      }

      case 2: {
        // Organizer & Logistics
        if (!values.organizerName?.trim()) newErrors.push('Organizer name is required');
        if (!values.organizerEmail?.trim()) newErrors.push('Organizer email is required');
        if (!values.startDate) newErrors.push('Start date is required');
        if (!values.endDate) newErrors.push('End date is required');
        if (!values.startTime) newErrors.push('Start time is required');
        if (!values.endTime) newErrors.push('End time is required');
        if (!values.locationType) newErrors.push('Location type is required');

        const dateErrors = validateDates(
          values.startDate,
          values.endDate,
          values.startTime,
          values.endTime
        );
        newErrors.push(...dateErrors);

        const locationErrors = validateLocationFields(
          values.locationType,
          values.address,
          values.city,
          values.state,
          values.meetingLink
        );
        newErrors.push(...locationErrors);
        break;
      }

      case 3: {
        // Pricing & Features
        if (!values.totalCapacity || parseInt(values.totalCapacity) < 1) {
          newErrors.push('Capacity must be at least 1');
        }
        if (!values.pricingType) newErrors.push('Pricing type is required');
        if (values.pricingType === 'Paid') {
          const price = parseFloat(values.pricingAmount);
          if (isNaN(price) || price <= 0) {
            newErrors.push('Price must be greater than 0 for paid events');
          }
        }
        if (values.hasPrizePool) {
          const prize = parseFloat(values.prizeAmount);
          if (isNaN(prize) || prize <= 0) {
            newErrors.push('Prize amount must be greater than 0');
          }
        }
        if (!values.bannerImage?.trim()) {
          newErrors.push('Banner image is required');
        }
        break;
      }
    }

    if (newErrors.length > 0) {
      setValidationErrors(newErrors);
      toast({
        title: `⚠️ ${newErrors.length} Issue${newErrors.length > 1 ? 's' : ''} Found`,
        description: 'Please fix the errors below to continue',
        variant: 'destructive'
      });
      return;
    }

    setValidationErrors([]);
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    setValidationErrors([]);
  };

  // =========================================================================
  // FORM SUBMISSION
  // =========================================================================

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      setValidationErrors([]);

      // Only validate on final submission (all 3 steps already validated during navigation)
      // Final check for banner image on submission
      if (!values.bannerImage?.trim()) {
        setValidationErrors(['Banner image is required']);
        toast({
          title: 'Missing Banner Image',
          description: 'Please upload a banner image to create the event',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Validate auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to create an event',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Construct payload
      const payload = {
        ...values,
        tags,
        totalCapacity: parseInt(values.totalCapacity),
        pricingAmount: values.pricingType === 'Free' ? 0 : parseFloat(values.pricingAmount || 0),
        prizeAmount: values.hasPrizePool ? parseFloat(values.prizeAmount || 0) : 0,
        bannerImage: values.bannerImage.trim()
      };

      console.log('📤 Submitting event:', { title: payload.title, tags: payload.tags.length, banner: !!payload.bannerImage });

      // Submit to API
      const response = await fetch(`${API_BASE_URL}/events/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.errors
          ? responseData.errors.map(e => typeof e === 'object' ? e.msg : e).join(', ')
          : responseData.message || 'Failed to create event';

        setValidationErrors([errorMessage]);

        toast({
          title: 'Event Creation Failed',
          description: errorMessage,
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Success
      toast({
        title: '✅ Success',
        description: `Event "${payload.title}" created successfully!`,
        className: 'bg-green-50 border-green-200'
      });

      // Reset form
      setOpen(false);
      form.reset();
      setTags([]);
      setStep(1);
      setBannerImagePreview('');
      setValidationErrors([]);

      // Refresh events
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      const errorMsg = error.message || 'An unexpected error occurred';
      setValidationErrors([errorMsg]);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => {
            if (!isAuthenticated) {
              toast({
                title: 'Authentication Required',
                description: 'Please log in first to create an event',
                variant: 'destructive'
              });
              return;
            }
            setOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create Extraordinary Event</DialogTitle>
          <DialogDescription className="text-base">
            Step {step} of 3 • Fill all details to create your event
          </DialogDescription>
        </DialogHeader>

        {/* Validation Errors Alert */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Please fix the following error(s):</div>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* ================================================================ */}
            {/* STEP 1: BASIC INFORMATION */}
            {/* ================================================================ */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg">📋 Basic Information</h3>

                <FormItem>
                  <FormLabel>Event Title *</FormLabel>
                  <FormControl>
                    <Input
                      {...form.register('title', ValidationRules.title)}
                      placeholder="e.g., Advanced Web Development Workshop"
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.title?.message}</FormMessage>
                </FormItem>

                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...form.register('description', ValidationRules.description)}
                      placeholder="Detailed description of your event..."
                      rows={4}
                      maxLength={5000}
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                </FormItem>

                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input
                      {...form.register('shortDescription', ValidationRules.shortDescription)}
                      placeholder="Brief one-liner about the event"
                      maxLength={200}
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.shortDescription?.message}</FormMessage>
                </FormItem>

                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Event Type *</FormLabel>
                    <FormControl>
                      <Controller
                        name="eventType"
                        control={form.control}
                        rules={{ required: 'Event type is required' }}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {EVENT_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.eventType?.message}</FormMessage>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Controller
                        name="category"
                        control={form.control}
                        rules={{ required: 'Category is required' }}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.category?.message}</FormMessage>
                  </FormItem>
                </div>

                <FormItem>
                  <FormLabel>Skill Level</FormLabel>
                  <FormControl>
                    <Controller
                      name="skillLevel"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SKILL_LEVELS.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Tags * (Add relevant skills/topics)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Add a tag and press Enter or click Add"
                          maxLength={30}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTag}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="gap-2">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:bg-white/30 rounded p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      {tags.length === 0 && (
                        <p className="text-xs text-red-500">At least one tag is required</p>
                      )}
                      <p className="text-xs text-gray-500">{tags.length}/10 tags</p>
                    </div>
                  </FormControl>
                </FormItem>
              </div>
            )}

            {/* ================================================================ */}
            {/* STEP 2: ORGANIZER & LOGISTICS */}
            {/* ================================================================ */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg">👤 Organizer & Logistics</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Organizer Name *</FormLabel>
                    <FormControl>
                      <Input
                        {...form.register('organizerName', ValidationRules.organizerName)}
                        placeholder="Your name or organization"
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.organizerName?.message}</FormMessage>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Organizer Type</FormLabel>
                    <FormControl>
                      <Controller
                        name="organizationType"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORGANIZER_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </FormItem>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        {...form.register('organizerEmail', ValidationRules.organizerEmail)}
                        placeholder="contact@example.com"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.organizerEmail?.message}</FormMessage>
                  </FormItem>

                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...form.register('organizerPhone', ValidationRules.organizerPhone)}
                        placeholder="+1 234 567 8900"
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.organizerPhone?.message}</FormMessage>
                  </FormItem>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">📅 Date & Time</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input
                          {...form.register('startDate', ValidationRules.startDate)}
                          type="date"
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.startDate?.message}</FormMessage>
                    </FormItem>

                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input
                          {...form.register('endDate', ValidationRules.endDate)}
                          type="date"
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.endDate?.message}</FormMessage>
                    </FormItem>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormItem>
                      <FormLabel>Start Time *</FormLabel>
                      <FormControl>
                        <Input
                          {...form.register('startTime', ValidationRules.startTime)}
                          type="time"
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.startTime?.message}</FormMessage>
                    </FormItem>

                    <FormItem>
                      <FormLabel>End Time *</FormLabel>
                      <FormControl>
                        <Input
                          {...form.register('endTime', ValidationRules.endTime)}
                          type="time"
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.endTime?.message}</FormMessage>
                    </FormItem>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">📍 Location</h4>

                  <FormItem className="mb-4">
                    <FormLabel>Location Type *</FormLabel>
                    <FormControl>
                      <Controller
                        name="locationType"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Online">Online</SelectItem>
                              <SelectItem value="Offline">Offline</SelectItem>
                              <SelectItem value="Hybrid">Hybrid (Online + Offline)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </FormItem>

                  {(form.watch('locationType') === 'Offline' || form.watch('locationType') === 'Hybrid') && (
                    <div className="space-y-4 mb-4">
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Input
                            {...form.register('address')}
                            placeholder="Street address"
                          />
                        </FormControl>
                      </FormItem>

                      <div className="grid grid-cols-3 gap-4">
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input
                              {...form.register('city')}
                              placeholder="City"
                            />
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input
                              {...form.register('state')}
                              placeholder="State"
                            />
                          </FormControl>
                        </FormItem>

                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input
                              {...form.register('zipCode')}
                              placeholder="Zip code"
                            />
                          </FormControl>
                        </FormItem>
                      </div>

                      <FormItem>
                        <FormLabel>Venue Name</FormLabel>
                        <FormControl>
                          <Input
                            {...form.register('venue')}
                            placeholder="e.g., Tech Park Conference Hall"
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                  )}

                  {(form.watch('locationType') === 'Online' || form.watch('locationType') === 'Hybrid') && (
                    <FormItem>
                      <FormLabel>Meeting Link *</FormLabel>
                      <FormControl>
                        <Input
                          {...form.register('meetingLink')}
                          placeholder="https://zoom.us/... or https://meet.google.com/..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* STEP 3: PRICING & FEATURES */}
            {/* ================================================================ */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg">💰 Pricing & Features</h3>

                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-4">Pricing & Capacity</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Total Capacity *</FormLabel>
                      <FormControl>
                        <Input
                          {...form.register('totalCapacity', { 
                            required: 'Capacity is required',
                            min: { value: 1, message: 'Minimum 1 participant' },
                            max: { value: 10000, message: 'Maximum 10,000' },
                            valueAsNumber: true
                          })}
                          type="number"
                          min="1"
                          max="10000"
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.totalCapacity?.message}</FormMessage>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Pricing Type *</FormLabel>
                      <FormControl>
                        <Controller
                          name="pricingType"
                          control={form.control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Free">Free</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FormControl>
                    </FormItem>
                  </div>

                  {form.watch('pricingType') === 'Paid' && (
                    <FormItem className="mt-4">
                      <FormLabel>Price (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          {...form.register('pricingAmount', {
                            required: 'Price is required for paid events',
                            min: { value: 1, message: 'Price must be at least ₹1' },
                            max: { value: 1000000, message: 'Price cannot exceed ₹1,000,000' },
                            valueAsNumber: true
                          })}
                          type="number"
                          min="1"
                          placeholder="e.g., 999"
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.pricingAmount?.message}</FormMessage>
                    </FormItem>
                  )}
                </div>

                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-4">🎁 Event Features</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'hasCertificate', label: '🎓 Certificate of Completion' },
                      { name: 'hasJobOpportunity', label: '💼 Job Opportunities' },
                      { name: 'hasPrizePool', label: '🏆 Prize Pool' },
                      { name: 'hasQA', label: '❓ Q&A Session' },
                      { name: 'hasRecording', label: '📹 Recording Available' },
                      { name: 'hasMaterials', label: '📚 Study Materials' },
                      { name: 'hasLiveChat', label: '💬 Live Chat Support' },
                      { name: 'hasGiveaways', label: '🎁 Giveaways' }
                    ].map(feature => (
                      <div key={feature.name} className="flex items-center space-x-2">
                        <Controller
                          name={feature.name}
                          control={form.control}
                          render={({ field }) => (
                            <>
                              <Checkbox
                                id={feature.name}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <label htmlFor={feature.name} className="text-sm cursor-pointer">
                                {feature.label}
                              </label>
                            </>
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  {form.watch('hasPrizePool') && (
                    <FormItem className="mt-4">
                      <FormLabel>Prize Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          {...form.register('prizeAmount', {
                            min: { value: 0, message: 'Cannot be negative' },
                            valueAsNumber: true
                          })}
                          type="number"
                          min="0"
                          placeholder="Total prize pool amount"
                        />
                      </FormControl>
                      <FormMessage>{form.formState.errors.prizeAmount?.message}</FormMessage>
                    </FormItem>
                  )}

                  {form.watch('hasMaterials') && (
                    <FormItem className="mt-4">
                      <FormLabel>Materials URL</FormLabel>
                      <FormControl>
                        <Input
                          {...form.register('materialsUrl')}
                          placeholder="https://github.com/... or https://drive.google.com/..."
                        />
                      </FormControl>
                    </FormItem>
                  )}

                  <FormItem className="mt-4">
                    <FormLabel>📝 Registration URL</FormLabel>
                    <FormControl>
                      <Input
                        {...form.register('registrationUrl', ValidationRules.registrationUrl)}
                        placeholder="https://forms.google.com/d/... or custom registration link"
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.registrationUrl?.message}</FormMessage>
                    <p className="text-xs text-gray-600 mt-2">
                      Provide a Google Form link or any custom registration URL. Users will be directed here when they click "Register".
                    </p>
                  </FormItem>
                </div>

                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    🖼️ Event Banner
                    <span className="text-red-500 text-sm">*</span>
                  </h4>
                  
                  <FormItem>
                    <FormLabel className="font-semibold">Upload Banner Image * (jpg, png, gif, webp - max 5MB)</FormLabel>
                    <FormControl>
                      <div className="mt-2">
                        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleBannerImageChange(file);
                              }
                            }}
                            className="hidden"
                            disabled={loading}
                          />
                          <div className="flex flex-col items-center justify-center py-2">
                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm font-semibold text-gray-700">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF or WebP (max 5MB)</p>
                          </div>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage>{form.formState.errors.bannerImage?.message}</FormMessage>
                  </FormItem>

                  {/* Banner Preview */}
                  {bannerImagePreview && !imageLoadingError && (
                    <div className="mt-4 rounded-lg overflow-hidden border-2 border-green-200 bg-green-50">
                      <img
                        src={bannerImagePreview}
                        alt="Event banner preview"
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-3 bg-green-100 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-green-700 font-semibold">✅ Banner uploaded successfully</p>
                          <p className="text-xs text-green-600">Preview of how it will appear on event cards</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {imageLoadingError && (
                    <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700">Failed to load image</p>
                        <p className="text-xs text-red-600 mt-1">Please try uploading again. Make sure the file is a valid image.</p>
                      </div>
                    </div>
                  )}

                  {!bannerImagePreview && !imageLoadingError && (
                    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-start gap-3">
                      <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-700">Upload an event banner</p>
                        <p className="text-xs text-blue-600 mt-1">A professional banner image helps attract more participants to your event.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-4">📝 Additional Info</h4>

                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        {...form.register('requirements')}
                        placeholder="What participants need (e.g., Laptop with Node.js installed, Basic JavaScript knowledge)"
                        rows={2}
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem className="mt-4">
                    <FormLabel>Deliverables</FormLabel>
                    <FormControl>
                      <Textarea
                        {...form.register('deliverables')}
                        placeholder="What participants will receive (e.g., Certificate, Source code, Lifetime access to materials)"
                        rows={2}
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </div>
            )}

            {/* ================================================================ */}
            {/* NAVIGATION BUTTONS */}
            {/* ================================================================ */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                disabled={step === 1 || loading}
              >
                ← Previous
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={loading}
                    className="gap-2"
                  >
                    Next Step →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading || tags.length === 0 || !form.watch('bannerImage')?.trim()}
                    className="gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Creating Event...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Create Event
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
