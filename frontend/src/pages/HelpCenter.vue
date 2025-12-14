<template>
  <div class="relative min-h-screen">
    <!-- Animated Cricket Background -->
    <AnimatedCricketBackground />
    
    <!-- Content Container -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 py-12">
      <!-- Hero Section -->
      <div class="text-center mb-12 glass-panel-hero rounded-3xl p-12">
        <div class="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          Support Center
        </div>
        <h1 class="text-5xl font-black text-white mb-4 neon-gradient">Help Center</h1>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto">Find answers to your questions about using CrickArena</p>
        
        <!-- Search Box -->
        <div class="mt-8 max-w-2xl mx-auto">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search help articles..."
              class="w-full px-6 py-4 pl-14 bg-white/10 backdrop-blur-sm border-2 border-green-400/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-all duration-300"
            />
            <svg class="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid md:grid-cols-3 gap-6 mb-12">
        <RouterLink to="/contact" class="group premium-card rounded-3xl p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Contact Support</h3>
          <p class="text-sm text-gray-300">Get help from our team</p>
        </RouterLink>

        <a href="mailto:crickarena201@gmail.com" class="group premium-card rounded-3xl p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
          <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Email Us</h3>
          <p class="text-sm text-gray-300">crickarena201@gmail.com</p>
        </a>

        <RouterLink to="/" class="group premium-card rounded-3xl p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Back to Home</h3>
          <p class="text-sm text-gray-300">Return to main page</p>
        </RouterLink>
      </div>

      <!-- FAQ Sections -->
      <div v-if="filteredCategories.length > 0" class="space-y-8">
        <div v-for="category in filteredCategories" :key="category.title" class="glass-panel rounded-3xl p-8">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <component :is="category.icon" class="w-8 h-8 text-green-400"/>
            {{ category.title }}
          </h2>
          
          <div class="space-y-4">
            <div
              v-for="(faq, index) in category.faqs"
              :key="index"
              class="border border-white/20 rounded-xl overflow-hidden transition-all duration-300 hover:border-green-400/50"
            >
              <button
                @click="toggleFaq(category.title, index)"
                class="w-full px-6 py-4 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span class="font-semibold text-white">{{ faq.question }}</span>
                <svg
                  class="w-5 h-5 text-green-400 transition-transform duration-300"
                  :class="{ 'rotate-180': isFaqOpen(category.title, index) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <transition name="slide-fade">
                <div v-if="isFaqOpen(category.title, index)" class="px-6 py-4 bg-white/5">
                  <p class="text-gray-300 leading-relaxed" v-html="faq.answer"></p>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="text-center py-16 glass-panel rounded-3xl">
        <svg class="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-xl font-semibold text-gray-300 mb-2">No results found</h3>
        <p class="text-gray-400 mb-6">Try adjusting your search terms</p>
        <button @click="searchQuery = ''" class="btn-primary px-6 py-3 rounded-xl font-semibold">
          Clear Search
        </button>
      </div>

      <!-- Contact CTA -->
      <div class="mt-12 glass-panel-strong rounded-3xl p-10 text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Still need help?</h2>
        <p class="text-gray-300 text-lg mb-6">Our support team is here to assist you</p>
        <div class="flex flex-wrap justify-center gap-4">
          <RouterLink to="/contact" class="btn-primary px-8 py-4 rounded-2xl font-bold text-lg">
            Contact Support
          </RouterLink>
          <a href="mailto:crickarena201@gmail.com" class="btn-secondary px-8 py-4 rounded-2xl font-bold text-lg">
            Send Email
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import AnimatedCricketBackground from '../components/AnimatedCricketBackground.vue';

// Icon components (inline SVG wrapped)
const RocketIcon = { template: '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>' };
const ShieldIcon = { template: '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>' };
const TrophyIcon = { template: '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>' };
const ClubIcon = { template: '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>' };
const UsersIcon = { template: '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>' };
const ToolIcon = { template: '<svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>' };

const searchQuery = ref('');
const openFaqs = ref({});

const categories = [
  {
    title: 'Getting Started',
    icon: RocketIcon,
    faqs: [
      {
        question: 'How do I create an account on CrickArena?',
        answer: 'Click the "<strong>Get Started Free</strong>" button on the homepage, then choose your role (Player, Club Manager, Coach, or Admin). You can sign up with email/password or use Google Sign-In for quick access.'
      },
      {
        question: 'What are the different user roles available?',
        answer: 'CrickArena has 4 roles: <strong>Players</strong> (join clubs, participate in tournaments), <strong>Club Managers</strong> (manage clubs, players, tournaments), <strong>Coaches</strong> (train players, track performance), and <strong>Admins</strong> (manage platform, approve clubs).'
      },
      {
        question: 'Is CrickArena free to use?',
        answer: 'Yes! CrickArena is completely free for basic features. Some tournaments may have entry fees set by organizers, but platform usage is free.'
      },
      {
        question: 'Which districts in Kerala are supported?',
        answer: 'CrickArena supports all 14 districts of Kerala: Thiruvananthapuram, Kollam, Pathanamthitta, Alappuzha, Kottayam, Idukki, Ernakulam, Thrissur, Palakkad, Malappuram, Kozhikode, Wayanad, Kannur, and Kasaragod.'
      },
      {
        question: 'Can I use CrickArena on mobile devices?',
        answer: 'Yes! CrickArena is fully responsive and works on all devices including smartphones, tablets, and desktops.'
      },
      {
        question: 'How do I navigate the dashboard?',
        answer: 'After logging in, click on your profile icon or "<strong>Dashboard</strong>" link in the navigation bar. Your dashboard will show features relevant to your role (Player/Club Manager/Coach/Admin).'
      }
    ]
  },
  {
    title: 'Account & Authentication',
    icon: ShieldIcon,
    faqs: [
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'On the login page, click "<strong>Forgot Password</strong>", enter your email, and we\'ll send you a reset link. Check your spam folder if you don\'t see it within a few minutes.'
      },
      {
        question: 'Can I change my email address?',
        answer: 'Yes, go to your "<strong>Profile</strong>" page, click "<strong>Edit Profile</strong>", and update your email. You\'ll need to verify the new email address.'
      },
      {
        question: 'How do I update my profile information?',
        answer: 'Navigate to your dashboard, click on "<strong>Profile</strong>" or your profile picture, then click "<strong>Edit Profile</strong>". Update your details and click "<strong>Save Changes</strong>".'
      },
      {
        question: 'Can I sign in with Google?',
        answer: 'Yes! On the registration or login page, click the "<strong>Continue with Google</strong>" button. This is the quickest way to get started.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'Contact our support team at <a href="mailto:crickarena201@gmail.com" class="text-green-400 underline">crickarena201@gmail.com</a> with your account details. We\'ll process your request within 48 hours.'
      }
    ]
  },
  {
    title: 'Tournaments & Matches',
    icon: TrophyIcon,
    faqs: [
      {
        question: 'How do I register my club for a tournament?',
        answer: 'Browse tournaments from the "<strong>Tournaments</strong>" page, click on a tournament, and click the "<strong>Register Club</strong>" button. Complete the registration form and wait for admin approval.'
      },
      {
        question: 'What tournament formats are supported?',
        answer: 'CrickArena supports multiple formats: <strong>Knockout</strong>, <strong>Round Robin/League</strong>, <strong>Groups + Knockout</strong>, <strong>Super League (IPL-style)</strong>, and <strong>Groups + Super 8 (ICC-style)</strong>.'
      },
      {
        question: 'How do I view upcoming matches?',
        answer: 'Go to the homepage or "<strong>Tournaments</strong>" page to see upcoming fixtures. Click on any match card to view detailed information including venue, time, and teams.'
      },
      {
        question: 'Can I track live scores?',
        answer: 'Yes! Matches with live scoring enabled will show real-time updates on the match details page during the game.'
      },
      {
        question: 'How are tournament fixtures generated?',
        answer: 'Once registration closes, tournament admins generate fixtures using our advanced scheduling system that considers venue availability, rest days, and team preferences.'
      }
    ]
  },
  {
    title: 'Club Management',
    icon: ClubIcon,
    faqs: [
      {
        question: 'How do I register a new club?',
        answer: 'As a Club Manager, go to your dashboard and click "<strong>Register Club</strong>". Fill in club details including name, district, ground information, and upload your club logo. Submit for admin approval.'
      },
      {
        question: 'How long does club approval take?',
        answer: 'Club approvals are typically processed within 24-48 hours. You\'ll receive an email notification once your club is approved or if additional information is needed.'
      },
      {
        question: 'Can I manage multiple clubs?',
        answer: 'Currently, each Club Manager account can manage one primary club. If you need to manage multiple clubs, please contact support for assistance.'
      },
      {
        question: 'How do I add players to my club?',
        answer: 'Go to your Club Manager dashboard, navigate to the "<strong>Players</strong>" section, and click "<strong>Add Player</strong>". Players can also request to join your club, which you can approve from the dashboard.'
      }
    ]
  },
  {
    title: 'Player Features',
    icon: UsersIcon,
    faqs: [
      {
        question: 'How do I join a cricket club?',
        answer: 'Browse clubs from the "<strong>Clubs</strong>" page, filter by your district, and click "<strong>Join Club</strong>" on the club you\'re interested in. The club manager will review and approve your request.'
      },
      {
        question: 'Can I be part of multiple clubs?',
        answer: 'Yes, players can be associated with multiple clubs, but you can only represent one club per tournament.'
      },
      {
        question: 'How do I view my cricket statistics?',
        answer: 'Go to your Player Dashboard to see your performance statistics including matches played, runs scored, wickets taken, and more.'
      },
      {
        question: 'Can I create a player profile without joining a club?',
        answer: 'Yes! You can create your player profile first and browse clubs at your own pace. Joining a club is optional but recommended for tournament participation.'
      }
    ]
  },
  {
    title: 'Troubleshooting',
    icon: ToolIcon,
    faqs: [
      {
        question: 'The website is loading slowly. What should I do?',
        answer: 'Try clearing your browser cache and cookies, ensure you have a stable internet connection, or try accessing the site from a different browser or device.'
      },
      {
        question: 'I\'m not receiving email notifications.',
        answer: 'Check your spam/junk folder first. If emails are still missing, verify your email address in your profile settings and ensure notifications are enabled.'
      },
      {
        question: 'I can\'t upload images (club logo, profile picture).',
        answer: 'Ensure your image is in JPG, PNG, or WebP format and under 5MB in size. Try compressing the image or using a different file if issues persist.'
      },
      {
        question: 'My club registration is stuck in "Pending" status.',
        answer: 'Club approvals can take 24-48 hours. If it\'s been longer, contact support at <a href="mailto:crickarena201@gmail.com" class="text-green-400 underline">crickarena201@gmail.com</a> with your club details.'
      },
      {
        question: 'I found a bug. How do I report it?',
        answer: 'We appreciate bug reports! Please email us at <a href="mailto:crickarena201@gmail.com" class="text-green-400 underline">crickarena201@gmail.com</a> with a detailed description, screenshots if possible, and steps to reproduce the issue.'
      }
    ]
  }
];

function toggleFaq(category, index) {
  const key = `${category}-${index}`;
  openFaqs.value[key] = !openFaqs.value[key];
}

function isFaqOpen(category, index) {
  return openFaqs.value[`${category}-${index}`] || false;
}

const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return categories;
  }
  
  const query = searchQuery.value.toLowerCase();
  return categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    )
  })).filter(category => category.faqs.length > 0);
});
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>