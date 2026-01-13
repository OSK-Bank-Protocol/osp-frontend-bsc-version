<template>
    <div class="offcanvas offcanvas-start" id="mobileMenu" tabindex="-1">
        <div class="mobile-menu-container">
            <!-- Header -->
            <div class="mobile-header">
                <div class="logo-wrapper">
                    <img src="/asset/images/logo/OSK-BANK-LOGO.png" alt="LOGO">
                </div>
                <button class="close-btn" data-bs-dismiss="offcanvas">
                    <i class="icon icon-close"></i>
                </button>
            </div>

            <!-- Navigation -->
            <div class="mobile-body">
                <ul class="mobile-nav">
                    <li class="mobile-nav-item">
                        <router-link to="/" class="mobile-link" active-class="active">Home</router-link>
                    </li>
                    <li class="mobile-nav-item">
                        <router-link to="/blog" class="mobile-link" active-class="active">Blog</router-link>
                    </li>
                    <li class="mobile-nav-item accordion-item">
                        <div class="accordion-header" @click="toggleAccordion('pages')">
                            <span class="mobile-link">Pages</span>
                            <i class="icon icon-arrow-caret-down" :class="{ 'rotate': openAccordions.includes('pages') }"></i>
                        </div>
                        <ul class="accordion-content" v-show="openAccordions.includes('pages')">
                            <li><router-link to="/about-us" class="sub-link">About Us</router-link></li>
                            <li><router-link to="/faq" class="sub-link">FAQs</router-link></li>
                            <li><router-link to="/pricing" class="sub-link">Pricing</router-link></li>
                            <li><router-link to="/use-case" class="sub-link">Use Case</router-link></li>
                            <li><router-link to="/use-case-detail" class="sub-link">Use Case Detail</router-link></li>
                        </ul>
                    </li>
                    <li class="mobile-nav-item">
                        <router-link to="/contact-us" class="mobile-link" active-class="active">Contact Us</router-link>
                    </li>
                </ul>
            </div>

            <!-- Footer/Actions -->
            <div class="mobile-footer">
                <button class="action-btn" @click="$emit('open-get-started-modal')" data-bs-dismiss="offcanvas">
                    Connect Wallet
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';

export default {
    name: 'MobileMenu',
    setup() {
        const openAccordions = ref([]);

        const toggleAccordion = (id) => {
            if (openAccordions.value.includes(id)) {
                openAccordions.value = openAccordions.value.filter(item => item !== id);
            } else {
                openAccordions.value.push(id);
            }
        };

        return {
            openAccordions,
            toggleAccordion
        }
    }
}
</script>

<style scoped lang="scss">
.offcanvas {
    background: var(--bg-main);
    border-right: 2px solid var(--border-light);
    width: 300px;
    /* Hand drawn edge */
    border-radius: 0 15px 255px 0 / 0 255px 15px 0;
}

.mobile-menu-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-main);
    color: var(--text-primary);
}

.mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 2px solid var(--border-light);
    /* Irregular border bottom */
    border-radius: 0 0 255px 15px / 0 0 15px 255px;

    .logo-wrapper img {
        height: 54px;
        width: auto;
        filter: sepia(0.5) contrast(1.1);
    }

    .close-btn {
        color: var(--text-secondary);
        font-size: 24px;
        padding: 4px;
        background: transparent;
        border: none;
        
        &:hover {
            color: var(--primary-gold);
            transform: rotate(90deg);
            transition: all 0.3s ease;
        }
    }
}

.mobile-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 0;
}

.mobile-nav {
    display: flex;
    flex-direction: column;
}

.mobile-nav-item {
    border-bottom: 1px dashed var(--border-light);
}

.mobile-link {
    display: block;
    padding: 16px 24px;
    font-size: 1.1rem;
    color: var(--text-secondary);
    font-weight: 500;
    transition: all 0.3s ease;
    font-family: var(--font-body);

    &:hover, &.active {
        color: var(--primary-gold);
        background: rgba(212, 175, 55, 0.05);
        padding-left: 30px; /* Slight movement */
    }
}

.accordion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    
    .mobile-link {
        flex: 1;
        pointer-events: none;
    }

    i {
        margin-right: 24px;
        color: var(--text-secondary);
        transition: transform 0.3s ease;
        
        &.rotate {
            transform: rotate(180deg);
            color: var(--primary-gold);
        }
    }
}

.accordion-content {
    background: rgba(0, 0, 0, 0.3);
    padding: 0;
    
    .sub-link {
        display: block;
        padding: 12px 24px 12px 40px;
        font-size: 0.9rem;
        color: var(--text-muted);
        font-family: var(--font-body);
        
        &:hover {
            color: var(--primary-gold);
        }
    }
}

.mobile-footer {
    padding: 20px;
    border-top: 2px solid var(--border-light);
    /* Irregular border top */
    border-radius: 15px 255px 0 0 / 255px 15px 0 0;

    .action-btn {
        width: 100%;
        padding: 14px;
        background: transparent;
        border: 2px solid var(--primary-gold);
        color: var(--primary-gold);
        /* Hand drawn pill */
        border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
        font-weight: 600;
        font-family: var(--font-body);
        transition: all 0.3s ease;
        
        &:hover {
            background: rgba(212, 175, 55, 0.1);
            color: var(--primary-gold);
            transform: rotate(-1deg);
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
        }
    }
}
</style>
