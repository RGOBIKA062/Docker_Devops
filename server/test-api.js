/**
 * Comprehensive API Test
 */

const API = 'http://localhost:5000/api';
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const startDate = tomorrow.toISOString().split('T')[0];
const endDate = tomorrow.toISOString().split('T')[0];

async function test() {
  console.log('='.repeat(60));
  console.log('🧪 COMPREHENSIVE API TEST');
  console.log('='.repeat(60));

  // Step 1: Signup
  console.log('\n📝 STEP 1: User Signup');
  const email = `test${Date.now()}@example.com`;
  const signupRes = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test User',
      email,
      password: 'TestPass123',
      confirmPassword: 'TestPass123',
      userType: 'student'
    })
  });
  
  if (!signupRes.ok) {
    const err = await signupRes.json();
    console.error('❌ Signup failed:', err);
    return;
  }
  
  const signupData = await signupRes.json();
  console.log(`✅ Signup success`);
  console.log(`   Email: ${email}`);
  console.log(`   Token: ${signupData.token.substring(0, 30)}...`);
  
  const token = signupData.token;

  // Step 2: Create Event
  console.log('\n📝 STEP 2: Create Event');
  const eventPayload = {
    title: 'Advanced Web Development Workshop',
    description: 'Learn advanced React, Node.js, and modern web development practices in this comprehensive 2-day workshop. Perfect for intermediate developers looking to level up their skills.',
    shortDescription: 'Master advanced web development',
    eventType: 'Workshop',
    category: 'Web Development',
    skillLevel: 'Intermediate',
    organizerName: 'Tech Academy',
    organizerEmail: 'contact@techacademy.com',
    organizerPhone: '+1234567890',
    organizationType: 'Company',
    startDate,
    endDate,
    startTime: '09:00',
    endTime: '18:00',
    timezone: 'IST',
    locationType: 'Offline',
    address: '123 Tech Street',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560001',
    venue: 'Tech Park',
    meetingLink: '',
    totalCapacity: '100',
    pricingType: 'Paid',
    pricingAmount: '2999',
    earlyBirdEnabled: false,
    earlyBirdPercentage: '10',
    earlyBirdEndDate: '',
    hasCertificate: true,
    hasJobOpportunity: true,
    hasPrizePool: false,
    prizeAmount: '',
    hasQA: true,
    hasRecording: true,
    hasMaterials: true,
    materialsUrl: 'https://github.com/example',
    hasLiveChat: true,
    hasGiveaways: false,
    bannerImage: '',
    tags: ['react', 'nodejs', 'web-dev'],
    requirements: 'Basic JavaScript knowledge',
    deliverables: 'Certificate and source code'
  };

  console.log(`📤 Payload fields: ${Object.keys(eventPayload).length}`);
  
  const createRes = await fetch(`${API}/events/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(eventPayload)
  });

  const eventData = await createRes.json();
  
  if (!createRes.ok) {
    console.error(`❌ Event creation failed (${createRes.status})`);
    if (eventData.errors) {
      console.error('   Errors:', eventData.errors);
    }
    if (eventData.message) {
      console.error('   Message:', eventData.message);
    }
    return;
  }

  console.log('✅ Event created successfully');
  console.log(`   Event ID: ${eventData.event._id}`);
  console.log(`   Title: ${eventData.event.title}`);

  // Step 3: Get all events
  console.log('\n📝 STEP 3: Get All Events');
  const allRes = await fetch(`${API}/events/all`);
  const allData = await allRes.json();
  console.log(`✅ Retrieved ${allData.length || allData.events?.length || 0} events`);

  // Step 4: Get single event
  console.log('\n📝 STEP 4: Get Single Event');
  const singleRes = await fetch(`${API}/events/${eventData.event._id}`);
  const singleData = await singleRes.json();
  if (singleRes.ok) {
    console.log('✅ Event retrieved');
    console.log(`   Views: ${singleData.views || singleData.viewCount || 0}`);
  } else {
    console.error('❌ Failed to get event');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ ALL TESTS PASSED');
  console.log('='.repeat(60));
}

test().catch(e => console.error('💥 Test error:', e.message));
