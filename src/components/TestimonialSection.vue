<template>
    <section class="section-roadmap">
        <div class="container">
            <!-- Header -->
            <div class="section-header wow fadeInUp">
                <h2 class="section-title">{{ t('testimonial.futureJourneyLine1') }} {{ t('testimonial.futureJourneyLine2') }}</h2>
                <p class="section-subtitle">{{ t('testimonial.yourselfShapesFuture') }}</p>
            </div>

            <!-- Roadmap Content -->
            <div class="roadmap-container">
                <div class="galaxy-bg">
                    <div class="stars"></div>
                    <div class="twinkling"></div>
                </div>
                
                <div class="timeline">
                    <!-- Phase 1: Genesis -->
                    <div class="timeline-item left wow fadeInUp" data-wow-delay="0.1s">
                        <div class="content">
                            <div class="phase-badge">{{ t('testimonial.genesisEn') }}</div>
                            <h3 class="phase-title">{{ t('testimonial.genesis') }}</h3>
                            <p class="phase-desc">{{ t('testimonial.genesisDesc') }}</p>
                        </div>
                    </div>

                    <!-- Phase 2: Expansion -->
                    <div class="timeline-item right wow fadeInUp" data-wow-delay="0.2s">
                        <div class="content">
                            <div class="phase-badge">{{ t('testimonial.expansionEn') }}</div>
                            <h3 class="phase-title">{{ t('testimonial.expansion') }}</h3>
                            <p class="phase-desc">{{ t('testimonial.expansionDesc') }}</p>
                        </div>
                    </div>

                    <!-- Phase 3: The Handover -->
                    <div class="timeline-item left wow fadeInUp" data-wow-delay="0.3s">
                        <div class="content">
                            <div class="phase-badge">{{ t('testimonial.handoverEn') }}</div>
                            <h3 class="phase-title">{{ t('testimonial.handover') }}</h3>
                            <p class="phase-desc">{{ t('testimonial.handoverDesc') }}</p>
                        </div>
                    </div>

                    <!-- Phase 4: The Dissolution -->
                    <div class="timeline-item right wow fadeInUp" data-wow-delay="0.4s">
                        <div class="content">
                            <div class="phase-badge">{{ t('testimonial.dissolutionEn') }}</div>
                            <h3 class="phase-title">{{ t('testimonial.dissolution') }}</h3>
                            <p class="phase-desc">{{ t('testimonial.dissolutionDesc') }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { t } from '@/i18n';

export default {
    name: 'TestimonialSection',
    setup() {
        return {
            t,
        };
    }
}
</script>

<style scoped lang="scss">
.section-roadmap {
    position: relative;
    padding: 40px 0; /* Reduced from 60px */
    overflow: hidden;
}

.section-header {
    text-align: center;
    margin-bottom: 20px; /* Reduced from 40px */
    position: relative;
    z-index: 2;
}

.section-title {
    font-size: 2rem; /* Reduced from 2.5rem */
    color: #fff;
    margin-bottom: 8px; /* Reduced from 16px */
    text-transform: uppercase;
    letter-spacing: 2px;
}

.section-subtitle {
    color: var(--primary-gold);
    font-size: 0.9rem; /* Reduced from 1.1rem */
    font-family: var(--font-mono);
}

/* Galaxy Background */
.galaxy-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.stars, .twinkling {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
}

.stars {
    background: transparent url('/asset/images/section/stars.png') repeat top center;
    z-index: 0;
}

.twinkling {
    background: transparent url('/asset/images/section/twinkling.png') repeat top center;
    z-index: 1;
    animation: move-twinkling 200s linear infinite;
    opacity: 0.3;
}

@keyframes move-twinkling {
    from {background-position:0 0;}
    to {background-position:-10000px 5000px;}
}

/* Timeline */
.roadmap-container {
    position: relative;
    max-width: 900px; /* Reduced max-width */
    margin: 0 auto;
    z-index: 2;
}

.timeline {
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        width: 2px;
        background: var(--text-muted); /* Chalk line style */
        top: 0;
        bottom: 0;
        left: 50%;
        margin-left: -1px;
        mask-image: url("data:image/svg+xml,%3Csvg width='2' height='10' viewBox='0 0 2 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 0 L1 10' stroke='black' stroke-width='2' stroke-dasharray='4 2'/%3E%3C/svg%3E");
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='2' height='10' viewBox='0 0 2 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 0 L1 10' stroke='black' stroke-width='2' stroke-dasharray='4 2'/%3E%3C/svg%3E");
        opacity: 0.5;
    }
}

.timeline-item {
    padding: 5px 30px; /* Reduced vertical padding */
    position: relative;
    background-color: inherit;
    width: 50%;
    
    /* Horizontal Connector Line */
    &::before {
        content: '';
        position: absolute;
        top: 22px; /* Center with the dot */
        height: 2px;
        width: 30px; /* Spans the padding area */
        background: var(--border-gold);
        mask-image: url("data:image/svg+xml,%3Csvg width='10' height='2' viewBox='0 0 10 2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 1 L10 1' stroke='black' stroke-width='2' stroke-dasharray='2 2'/%3E%3C/svg%3E");
        -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='10' height='2' viewBox='0 0 10 2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 1 L10 1' stroke='black' stroke-width='2' stroke-dasharray='2 2'/%3E%3C/svg%3E");
        opacity: 0.6;
        z-index: 0;
    }
    
    &.left {
        left: 0;
        text-align: right;
        
        &::before {
            right: 0;
        }

        .content {
            margin-left: 0;
            margin-right: auto;
        }
        
        &::after { /* Dot */
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            right: -8px; /* Center on line */
            background-color: var(--primary-gold);
            border: 3px solid var(--bg-main);
            box-shadow: 0 0 0 1px var(--primary-gold); /* Outer thin ring */
            top: 14px; /* Adjusted top position */
            border-radius: 50%;
            z-index: 1;
        }
    }
    
    &.right {
        left: 50%;
        
        &::before {
            left: 0;
        }

        .content {
            margin-left: auto;
            margin-right: 0;
        }
        
        &::after { /* Dot */
            content: '';
            position: absolute;
            width: 16px;
            height: 16px;
            left: -8px; /* Center on line */
            background-color: var(--primary-gold);
            border: 3px solid var(--bg-main);
            box-shadow: 0 0 0 1px var(--primary-gold); /* Outer thin ring */
            top: 14px; /* Adjusted top position */
            border-radius: 50%;
            z-index: 1;
        }
    }
}

.content {
    padding: 16px;
    background: transparent; /* Removed glass background */
    backdrop-filter: none; /* Removed blur */
    border: 2px solid var(--border-light); /* Chalk border */
    position: relative;
    /* Hand drawn box style */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px) rotate(0.5deg); /* Slight organic movement */
        border-color: var(--primary-gold);
        box-shadow: none; /* Removed shadow */
        background: rgba(255, 255, 255, 0.02); /* Very subtle highlight */
    }
}

.phase-badge {
    display: inline-block;
    padding: 2px 8px; /* Smaller badge */
    background: rgba(212, 175, 55, 0.1);
    color: var(--primary-gold);
    border-radius: 100px;
    font-size: 0.7rem; /* Smaller font */
    font-weight: 600;
    margin-bottom: 4px; /* Reduced margin */
    border: 1px solid rgba(212, 175, 55, 0.2);
}

.phase-title {
    color: #fff;
    font-size: 1.1rem; /* Reduced font */
    margin-bottom: 4px; /* Reduced margin */
}

.phase-desc {
    color: var(--text-secondary);
    line-height: 1.4; /* More compact line height */
    font-size: 0.85rem; /* Slightly smaller font */
}

/* Mobile Responsive */
@media screen and (max-width: 768px) {
    .section-roadmap {
        padding: 30px 0;
    }

    .timeline::after {
        left: 15px; /* Adjusted for smaller padding */
    }
    
    .timeline-item {
        width: 100%;
        padding-left: 50px; /* Increased left padding for better spacing */
        padding-right: 0; /* Removed right padding */
        text-align: left;
        padding-bottom: 20px; /* Increased bottom padding */
        
        &::before {
            left: 15px !important; /* Connect from the vertical line */
            width: 35px !important; /* Reach the content */
            right: auto !important;
        }
        
        &.left, &.right {
            left: 0;
            text-align: left;
            
            &::after {
                left: 7px; /* Center on the vertical line (15px) -> 15 - 8 = 7 */
            }
        }
    }
}
</style>
