<template>
    <button id="goTop">
        <span class="border-progress"></span>
        <!-- Hand-drawn Up Arrow SVG -->
        <svg class="hand-drawn-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21C11.8 16 12.2 8 12 4M12 4L5 11M12 4L19 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </button>
</template>
<script>
export default {
    name: 'GoTop'
}
</script>
<style>
/* Using global style to override the ID selector from external CSS */
#goTop {
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px !important;
    background: rgba(20, 20, 20, 0.4) !important; /* Reduced opacity */
    border: 1px solid rgba(238, 207, 161, 0.4) !important; /* Thinner and transparent border */
    color: rgba(238, 207, 161, 0.6) !important; /* Muted icon color */
    box-shadow: none !important; /* Removed shadow for lower profile */
    overflow: visible !important;
    backdrop-filter: blur(2px);
    transition: all 0.3s ease !important;
}

#goTop .border-progress {
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px !important;
    width: 100% !important;
    height: 100% !important;
    top: 0 !important;
    left: 0 !important;
    border-color: rgba(238, 207, 161, 0.3) !important; /* Very subtle progress border */
    opacity: 0.3;
}

#goTop:hover {
    transform: rotate(5deg) scale(1.1);
    background: rgba(20, 20, 20, 0.8) !important;
    border-color: var(--primary-gold) !important;
    color: var(--primary-gold) !important;
    box-shadow: 0 0 10px rgba(0,0,0,0.5) !important;
}

#goTop:hover .hand-drawn-arrow {
    stroke: var(--primary-gold);
    opacity: 1;
}

.hand-drawn-arrow {
    width: 20px;
    height: 20px;
    stroke: currentColor; /* Use text color */
    transition: all 0.3s ease;
    opacity: 0.7;
}
</style>
