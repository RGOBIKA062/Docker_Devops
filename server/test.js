/**
 * Quick test script to verify API functionality
 * Run with: node test.js
 */

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  fullName: 'Test Student',
  email: `teststudent${Date.now()}@test.com`,
  password: 'TestPass123',
  confirmPassword: 'TestPass123',
  userType: 'student'
};

const testEvent = {
  title: 'Advanced Web Development Workshop',
  description: 'Learn advanced React, Node.js, and modern web development practices in this comprehensive 2-day workshop. Perfect for intermediate developers looking to level up their skills.',
  shortDescription: 'Master advanced web development in 2 days',
  eventType: 'Workshop',
  category: 'Web Development',
  skillLevel: 'Intermediate',
  organizerName: 'Tech Academy',
  organizerEmail: 'contact@techacademy.com',
  organizerPhone: '+1234567890',
  organizationType: 'Company',
  startDate: '2025-12-15',
  endDate: '2025-12-16',
  startTime: '09:00',
  endTime: '18:00',
  timezone: 'IST',
  locationType: 'Offline',
  address: '123 Tech Street',
  city: 'Bangalore',
  state: 'Karnataka',
  zipCode: '560001',
  venue: 'Tech Park Conference Hall',
  meetingLink: '',
  totalCapacity: 100,
  pricingType: 'Paid',
  pricingAmount: 2999,
  earlyBirdEnabled: true,
  earlyBirdPercentage: 20,
  earlyBirdEndDate: '2025-12-01',
  hasCertificate: true,
  hasJobOpportunity: true,
  hasPrizePool: false,
  prizeAmount: 0,
  hasQA: true,
  hasRecording: true,
  hasMaterials: true,
  materialsUrl: 'https://github.com/example/materials',
  hasLiveChat: true,
  hasGiveaways: false,
  bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
  tags: ['react', 'nodejs', 'web-development', 'javascript'],
  requirements: 'Basic understanding of HTML, CSS, and JavaScript. A laptop with Node.js installed.',
  deliverables: 'Certificate of completion, project files, lifetime access to materials'
};

async function test() {
  try {
    console.log('\n🚀 Starting API tests...\n');

    // 1. Sign up
    console.log('📝 1. Testing Signup...');
    const signupRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const signupData = await signupRes.json();
    if (!signupRes.ok) {
      console.error('❌ Signup failed:', signupData);
      return;
    }
    console.log('✅ Signup successful');
    const token = signupData.token;
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // 2. Create event
    console.log('\n📝 2. Testing Event Creation...');
    const eventRes = await fetch(`${API_BASE}/events/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testEvent)
    });
    const eventData = await eventRes.json();
    if (!eventRes.ok) {
      console.error('❌ Event creation failed:', eventData);
      if (eventData.errors) {
        console.error('   Validation errors:', eventData.errors);
      }
      return;
    }
    console.log('✅ Event created successfully');
    console.log(`   Event ID: ${eventData.event._id}`);
    console.log(`   Event Title: ${eventData.event.title}`);

    // 3. Get all events
    console.log('\n📝 3. Testing Get All Events...');
    const allEventsRes = await fetch(`${API_BASE}/events/all`);
    const allEventsData = await allEventsRes.json();
    console.log(`✅ Retrieved ${allEventsData.length || 0} events`);

    // 4. Get event by ID
    console.log('\n📝 4. Testing Get Event by ID...');
    const eventByIdRes = await fetch(`${API_BASE}/events/${eventData.event._id}`);
    const eventByIdData = await eventByIdRes.json();
    if (eventByIdRes.ok) {
      console.log('✅ Event retrieved successfully');
      console.log(`   Attendees: ${eventByIdData.registeredCount || 0}`);
    } else {
      console.error('❌ Failed to retrieve event:', eventByIdData);
    }

    console.log('\n✅ All tests passed!\n');
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
  }
}

test();
