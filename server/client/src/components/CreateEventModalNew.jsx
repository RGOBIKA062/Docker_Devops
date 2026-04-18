import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { X, Plus, Loader } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

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

const CreateEventModal = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);

  const form = useForm({
    defaultValues: {
      // Basic Info
      title: '',
      description: '',
      shortDescription: '',
      eventType: '',
      category: '',
      skillLevel: 'All Levels',
      
      // Organizer
      organizerName: '',
      organizerEmail: '',
      organizerPhone: '',
      organizationType: 'College',
      
      // Date & Time
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      timezone: 'IST',
      
      // Location
      locationType: 'Offline',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      venue: '',
      meetingLink: '',
      
      // Capacity & Pricing
      totalCapacity: '100',
      pricingType: 'Free',
      pricingAmount: '0',
      earlyBirdEnabled: false,
      earlyBirdPercentage: '10',
      earlyBirdEndDate: '',
      
      // Features
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
      
      // Banner
      bannerImage: '',
      
      // Requirements & Deliverables
      requirements: '',
      deliverables: ''
    }
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const onSubmit = async (values) => {
    if (tags.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one tag' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const payload = {
        ...values,
        tags,
        totalCapacity: parseInt(values.totalCapacity),
        pricingAmount: values.pricingType === 'Free' ? 0 : parseFloat(values.pricingAmount),
        prizeAmount: values.hasPrizePool ? parseFloat(values.prizeAmount) : 0
      };

      const response = await fetch(`${API_BASE_URL}/events/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const data = await response.json();
      toast({ title: 'Success', description: 'Event created successfully!' });
      
      setOpen(false);
      form.reset();
      setTags([]);
      setStep(1);

      // Refresh events
      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to create event' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Extraordinary Event</DialogTitle>
          <DialogDescription>
            Step {step} of 3 - Fill all details to create your event
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* STEP 1: BASIC INFORMATION */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg">Basic Information</h3>
                
                {/* Title */}
                <FormItem>
                  <FormLabel>Event Title *</FormLabel>
                  <FormControl>
                    <Input 
                      {...form.register('title', { required: true })}
                      placeholder="e.g., AI Workshop 2025"
                      className="text-base"
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.title?.message}</FormMessage>
                </FormItem>

                {/* Description */}
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...form.register('description', { required: true })}
                      placeholder="Detailed description of your event..."
                      rows={4}
                      className="text-base"
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                </FormItem>

                {/* Short Description */}
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input 
                      {...form.register('shortDescription')}
                      placeholder="Brief one-liner about the event"
                    />
                  </FormControl>
                </FormItem>

                {/* Event Type & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Event Type *</FormLabel>
                    <FormControl>
                      <Controller
                        name="eventType"
                        control={form.control}
                        rules={{ required: true }}
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
                  </FormItem>

                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Controller
                        name="category"
                        control={form.control}
                        rules={{ required: true }}
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
                  </FormItem>
                </div>

                {/* Skill Level */}
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

                {/* Tags */}
                <FormItem>
                  <FormLabel>Tags (Add at least one)</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag and press Add"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <X 
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FormItem>
              </div>
            )}

            {/* STEP 2: ORGANIZER & LOGISTICS */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg">Organizer & Logistics</h3>

                {/* Organizer Details */}
                <FormItem>
                  <FormLabel>Organizer Name *</FormLabel>
                  <FormControl>
                    <Input {...form.register('organizerName', { required: true })} />
                  </FormControl>
                </FormItem>

                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input 
                        {...form.register('organizerEmail', { required: true })}
                        type="email"
                      />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input {...form.register('organizerPhone', { required: true })} />
                    </FormControl>
                  </FormItem>
                </div>

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
                            {['College', 'Company', 'Individual', 'NGO', 'Government'].map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormControl>
                </FormItem>

                {/* Date & Time */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Date & Time</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input 
                          {...form.register('startDate', { required: true })}
                          type="date"
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input 
                          {...form.register('endDate', { required: true })}
                          type="date"
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Start Time *</FormLabel>
                      <FormControl>
                        <Input 
                          {...form.register('startTime', { required: true })}
                          type="time"
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>End Time *</FormLabel>
                      <FormControl>
                        <Input 
                          {...form.register('endTime', { required: true })}
                          type="time"
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>

                {/* Location */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Location</h4>
                  <FormItem>
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
                              {['Online', 'Offline', 'Hybrid'].map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FormControl>
                  </FormItem>

                  {form.watch('locationType') !== 'Online' && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...form.register('address')} />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...form.register('city')} />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input {...form.register('state')} />
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input {...form.register('zipCode')} />
                        </FormControl>
                      </FormItem>
                    </div>
                  )}

                  {(form.watch('locationType') === 'Online' || form.watch('locationType') === 'Hybrid') && (
                    <FormItem className="mt-4">
                      <FormLabel>Meeting Link</FormLabel>
                      <FormControl>
                        <Input 
                          {...form.register('meetingLink')}
                          placeholder="e.g., https://zoom.us/..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: PRICING & FEATURES */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg">Pricing & Features</h3>

                {/* Pricing */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-4">Pricing</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormItem>
                      <FormLabel>Total Capacity *</FormLabel>
                      <FormControl>
                        <Input 
                          {...form.register('totalCapacity', { required: true })}
                          type="number"
                          min="1"
                        />
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormLabel>Pricing Type</FormLabel>
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
                                {['Free', 'Paid'].map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FormControl>
                    </FormItem>
                  </div>

                  {form.watch('pricingType') === 'Paid' && (
                    <FormItem className="mt-4">
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          {...form.register('pricingAmount')}
                          type="number"
                          min="0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                </div>

                {/* Features */}
                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-4">Event Features</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'hasCertificate', label: '🎓 Certificate' },
                      { name: 'hasJobOpportunity', label: '💼 Job Opportunity' },
                      { name: 'hasPrizePool', label: '🏆 Prize Pool' },
                      { name: 'hasQA', label: '❓ Q&A Session' },
                      { name: 'hasRecording', label: '📹 Recording Available' },
                      { name: 'hasMaterials', label: '📚 Study Materials' },
                      { name: 'hasLiveChat', label: '💬 Live Chat' },
                      { name: 'hasGiveaways', label: '🎁 Giveaways' }
                    ].map(feature => (
                      <div key={feature.name} className="flex items-center space-x-2">
                        <Checkbox 
                          {...form.register(feature.name)}
                          id={feature.name}
                        />
                        <label htmlFor={feature.name} className="text-sm cursor-pointer">
                          {feature.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  {form.watch('hasPrizePool') && (
                    <FormItem className="mt-4">
                      <FormLabel>Prize Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          {...form.register('prizeAmount')}
                          type="number"
                          min="0"
                        />
                      </FormControl>
                    </FormItem>
                  )}

                  {form.watch('hasMaterials') && (
                    <FormItem className="mt-4">
                      <FormLabel>Materials URL</FormLabel>
                      <FormControl>
                        <Input 
                          {...form.register('materialsUrl')}
                          placeholder="https://..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                </div>

                {/* Banner & Requirements */}
                <div>
                  <h4 className="font-semibold mb-4">Additional</h4>
                  <FormItem>
                    <FormLabel>Banner Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...form.register('bannerImage')}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem className="mt-4">
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...form.register('requirements')}
                        placeholder="What participants need to bring/know..."
                        rows={2}
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem className="mt-4">
                    <FormLabel>Deliverables</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...form.register('deliverables')}
                        placeholder="What participants will receive..."
                        rows={2}
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </div>
            )}

            {/* Navigation & Submit */}
            <DialogFooter className="gap-2 mt-8 border-t pt-4">
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
                >
                  Next
                </Button>
              )}
              {step === 3 && (
                <Button 
                  type="submit"
                  disabled={loading}
                  className="gap-2"
                >
                  {loading && <Loader className="w-4 h-4 animate-spin" />}
                  Create Event
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
