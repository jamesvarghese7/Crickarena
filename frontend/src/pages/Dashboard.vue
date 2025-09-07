<template>
  <div class="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50 to-white">
    <div class="max-w-6xl mx-auto p-4 space-y-10">
      <!-- Welcome / Session -->
      <section class="relative overflow-hidden rounded-3xl">
        <div class="rounded-3xl p-8 md:p-10 bg-gradient-to-r from-emerald-700 to-green-600 text-white shadow-xl">
          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p class="text-sm font-semibold text-emerald-100">Welcome back</p>
              <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow">Kerala Cricket Dashboard</h1>
              <p class="mt-3 text-white/90 max-w-prose">
                Your gateway to Kerala's grassroots cricket community. Discover local clubs, follow district tournaments, and stay connected with cricket across God's Own Country.
              </p>
              <div class="mt-6 flex items-center gap-3 text-sm">
                <span class="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>
                  <span>{{ auth.userProfile?.name || auth.user?.displayName || auth.user?.email }}</span>
                </span>
              </div>
            </div>
            <div class="relative hidden md:block">
              <div class="aspect-video rounded-2xl bg-white/10 border border-white/30 shadow-inner overflow-hidden">
                <div class="absolute inset-0 p-6 flex flex-col justify-center">
                  <h3 class="text-2xl font-bold drop-shadow">Cricket: The Gentleman’s Game</h3>
                  <p class="mt-2 text-white/85 text-sm leading-relaxed">
                    From the coastal grounds of Kollam to the hill stations of Wayanad, Kerala's cricket community thrives across all 14 districts. 
                    Join local tournaments, connect with neighborhood clubs, and be part of God's Own Country's cricket legacy.
                  </p>
                  <ul class="mt-4 grid grid-cols-2 gap-2 text-sm text-white/90">
                    <li class="inline-flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>14 Districts</li>
                    <li class="inline-flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>Local Tournaments</li>
                    <li class="inline-flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>Grassroots Cricket</li>
                    <li class="inline-flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>Community Spirit</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Grid overlay -->
        <div class="pointer-events-none absolute inset-0 rounded-3xl [mask-image:linear-gradient(to_bottom,black,transparent)]">
          <svg aria-hidden="true" class="absolute inset-0 h-full w-full stroke-white/10" fill="none"><defs><pattern id="grid2" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M0 32V.5H32"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid2)"/></svg>
        </div>
      </section>



      <!-- Latest match news (static placeholders; wire up to API later) -->
      <section>
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-2xl font-bold text-green-700 flex items-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 4h18v13H3z"/><path d="M8 21l4-4 4 4"/></svg>
            Kerala Cricket Updates
          </h2>
          <div class="flex gap-4">
            <RouterLink v-if="isClubManager" to="/club-registration" class="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">Register Club</RouterLink>
            <RouterLink to="/" class="text-sm text-green-700 hover:underline">View all tournaments</RouterLink>
          </div>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article v-for="n in news" :key="n.id" class="rounded-2xl bg-white/70 border border-gray-100 shadow overflow-hidden">
            <div class="h-32 bg-gradient-to-br from-emerald-200 to-emerald-100" />
            <div class="p-4">
              <h3 class="font-semibold text-lg">{{ n.title }}</h3>
              <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ n.summary }}</p>
              <div class="mt-3 text-xs text-gray-500">{{ n.date }}</div>
            </div>
          </article>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '../store/auth';

const auth = useAuthStore();

// Derived role flag
const isClubManager = computed(() => (auth.userProfile?.role || 'public') === 'clubManager');

// Static placeholder news; wire to API later if available
const news = ref([
  { id: 1, title: 'Kochi Tuskers defeat Thrissur Warriors in thriller', date: 'Today', summary: 'A nail-biting final over at the Kochi Cricket Ground saw the Tuskers clinch victory with a last-ball boundary.' },
  { id: 2, title: 'Young Kozhikode batsman scores maiden century', date: 'Yesterday', summary: 'The 19-year-old opener from Kozhikode showcased maturity beyond his years, crafting a classy ton in the district championship.' },
  { id: 3, title: 'Kannur Spinners dominate Palakkad in night match', date: '2 days ago', summary: 'Local spinners ruled the roost under lights as Kannur secured a convincing victory in the inter-district tournament.' },
]);

</script>