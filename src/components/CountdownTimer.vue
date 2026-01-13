<template>
  <div v-if="!isExpired" class="countdown-timer">
    <i class="icon-clock"></i>
    <div class="timer-digits">
        <span>{{ days }}d</span>
        <span class="separator">:</span>
        <span>{{ hours }}h</span>
        <span class="separator">:</span>
        <span>{{ minutes }}m</span>
        <span class="separator">:</span>
        <span>{{ seconds }}s</span>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted,
  computed
} from 'vue';
import { t } from '@/i18n';

const props = defineProps({
  targetTimestamp: {
    type: Number,
    required: true,
  },
});

const now = ref(Date.now());
let interval = null;

const timeRemaining = computed(() => {
  const remaining = props.targetTimestamp - now.value;
  return remaining > 0 ? remaining : 0;
});

const isExpired = computed(() => timeRemaining.value <= 0);

const days = computed(() => Math.floor(timeRemaining.value / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'));
const hours = computed(() => Math.floor((timeRemaining.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'));
const minutes = computed(() => Math.floor((timeRemaining.value % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'));
const seconds = computed(() => Math.floor((timeRemaining.value % (1000 * 60)) / 1000).toString().padStart(2, '0'));

const updateNow = () => {
  now.value = Date.now();
};

onMounted(() => {
  interval = setInterval(updateNow, 1000);
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<style scoped lang="scss">
.countdown-timer {
    display: flex;
    align-items: center;
    gap: 8px; /* Slightly increased gap */
    font-family: var(--font-mono);
    font-size: 0.9rem; /* Set base font size */
    color: var(--primary-gold);
    /* Removed box styling for cleaner look */
    background: transparent; 
    padding: 0;
    border: none;
    
    .icon-clock {
        font-size: 1rem;
        opacity: 0.8;
    }
}

.timer-digits {
    display: flex;
    align-items: baseline; /* Align by baseline for better look */
    gap: 2px;
    
    span:not(.separator) {
        min-width: 24px; /* Ensure fixed width for numbers to prevent jitter */
        text-align: right;
        font-weight: 600;
        letter-spacing: 0.5px;
    }
    
    .separator {
        opacity: 0.6;
        margin: 0 1px;
        font-weight: 300;
        color: var(--primary-gold);
    }
}
</style>
