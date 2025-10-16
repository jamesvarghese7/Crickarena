<template>
  <PlayerProgressSection :player-data="playerData" />
</template>

<script setup>
import PlayerProgressSection from '../../components/player/sections/Progress.vue';

// Define props
const props = defineProps({
  playerData: {
    type: Object,
    default: null
  }
});
</script>