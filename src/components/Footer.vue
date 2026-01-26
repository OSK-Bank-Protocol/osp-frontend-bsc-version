<template>
    <footer class="section-footer">
        <div class="container">
            <div class="footer-content">
                <!-- Top: Logo & Socials -->
                <div class="footer-top">
                    <div class="footer-brand">
                        <img src="/asset/images/logo/OSK-BANK-LOGO.png" alt="OSKBank Logo" class="footer-logo">
                        <span class="brand-name">OSK Bank Protocol</span>
                    </div>
                    
                    <div class="footer-links">
                        <div class="link-group">
                            <h4 class="group-title">Resources</h4>
                            <ul>
                                <li>
                                    <a href="https://oskbank.gitbook.io/oskbank-docs/" target="_blank" rel="noopener noreferrer">
                                        {{ t('footer.whitepaper') }}
                                    </a>
                                </li>
                            </ul>
                        </div>
                        
                        <div class="link-group">
                            <h4 class="group-title">Social</h4>
                            <ul>
                                <li><a href="https://x.com/osk_bank" target="_blank">X / Twitter</a></li>
                                <li><a href="https://t.me/oskbank" target="_blank">Telegram</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- Bottom: Copyright -->
                <div class="footer-bottom">
                    <p class="copyright">{{ copyrightText }}</p>
                    
                    <button @click="scrollToTop" class="back-to-top">
                        <i class="icon-arrow-up"></i>
                        BACK TO TOP
                    </button>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
import { APP_ENV } from '../services/environment';
import { t } from '@/i18n';

export default {
    name: 'Footer',
    setup() {
        return {
            t,
        };
    },
    computed: {
        copyrightText() {
            let envPrefix;
            if (APP_ENV === 'PROD') {
                envPrefix = 'M-BSC-'; // Mainnet/Production
            } else if (APP_ENV === 'test') {
                envPrefix = 'T-BSC-'; // Test/Preview
            } else {
                envPrefix = 'D-BSC-'; // Dev/Local
            }
            const version = '2.0.3';
            return `${this.t('footer.copyright')} ${envPrefix}-${version}`;
        }
    },
    methods: {
        scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
}
</script>

<style scoped lang="scss">
.section-footer {
    background: var(--bg-main);
    border-top: 2px solid var(--border-light);
    /* Hand-drawn top border */
    border-radius: 255px 15px 0 0 / 15px 5px 0 0;
    padding: 80px 0 40px;
    position: relative;
    z-index: 1;
}

.footer-content {
    display: flex;
    flex-direction: column;
}

/* Top Section */
.footer-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 60px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 40px;
    }
}

.footer-brand {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .footer-logo {
        width: 48px;
        height: 48px;
        filter: sepia(0.5) contrast(1.1); /* Vintage filter */
    }
    
    .brand-name {
        font-family: var(--font-heading);
        font-size: 1.5rem;
        font-weight: 400;
        color: #fff;
        letter-spacing: 1px;
        text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
    }
}

.footer-links {
    display: flex;
    gap: 80px;
    
    @media (max-width: 768px) {
        gap: 40px;
        width: 100%;
        justify-content: space-between;
    }
}

.link-group {
    .group-title {
        font-family: var(--font-mono);
        font-size: 0.9rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 20px;
        font-weight: 600;
    }
    
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
            margin-bottom: 12px;
            
            a {
                font-family: var(--font-body);
                color: #fff;
                text-decoration: none;
                font-size: 1.1rem;
                transition: color 0.3s ease;
                
                &:hover {
                    color: var(--primary-gold);
                    text-decoration: underline;
                    text-decoration-style: wavy;
                }
            }
        }
    }
}

/* Divider - Chalk line */
.divider {
    height: 2px;
    background: var(--border-light);
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    margin-bottom: 40px;
    opacity: 0.5;
}

/* Bottom Section */
.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @media (max-width: 768px) {
        flex-direction: column-reverse;
        gap: 20px;
    }
}

.copyright {
    color: var(--text-muted);
    font-size: 0.9rem;
    font-family: var(--font-body);
}

.back-to-top {
    background: none;
    border: 2px solid var(--border-light);
    color: var(--text-secondary);
    padding: 8px 16px;
    /* Irregular Pill */
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    font-family: var(--font-mono);
    
    i {
        font-size: 1rem;
    }
    
    &:hover {
        border-color: var(--primary-gold);
        color: var(--primary-gold);
        background: rgba(238, 207, 161, 0.1);
        transform: rotate(-2deg);
    }
}
</style>
