<template>
    <section class="section-cta" v-if="showEntrance">
        <!-- == Head Section -->
        <div class="sect-header">
            <div class="container">
                <div class="s-meta text-caption font-2">
                    <p class="s-number_order wg-counter">
                        [ <span class="text-white">OSK Bank<span class="odometer" data-number=""></span></span> ]
                    </p>
                    <p class="s-label">[ <span class="text-white hacker-text_transform">xBrokers</span> ]</p>
                </div>
            </div>
        </div>
        <span class="br-line"></span>
        <!-- == Tagline Section -->
        <div class="sect-tagline">
            <div class="container">
                <div class="sect-tagline_inner">
                    <span class="hafl-plus pst-left_bot wow bounceInScale"></span>
                    <span class="hafl-plus pst-right_bot wow bounceInScale"></span>
                    <h6 class="s-name text-caption font-2">
                        <span class="bar-group type-left">
                            <span class="bar_center"></span>
                        </span>
                        <span class="hacker-text_transform no-delay">
                            Let the synchronization begin
                        </span>
                        <span class="bar-group type-right">
                            <span class="bar_center"></span>
                        </span>
                    </h6>
                </div>
            </div>
        </div>
        <span class="br-line"></span>
        <!-- == Main Section -->
        <div class="sect-main position-relative">
            <div class="s-img_item">
                <img class="lazyload" src="/asset/images/section/color-bg-2.webp"
                    data-src="/asset/images/section/color-bg-2.webp" alt="BG">
            </div>
            <div class="container">
                <div class="sect-title wow fadeInUp">
                    <h2 class="s-title font-3" style="color: #fff;">
                        OSKBANK & ??? <br>
                        官方生态战略合作
                    </h2>
                    <p class="s-sub_title" style="color: #fff;">
                        OSKBANK <br>
                        获取4倍???算力收益
                    </p>
                </div>
                <div name="goJUchain">
                    <div class="d-flex justify-content-center my-5" style="margin-top: 2rem !important;">
                        <a @click.prevent="handleInvestClick" href="#" class="tf-btn text-body-3 style-2 animate-btn animate-dark" style="height: 50px; width: 200px; line-height: 50px;">
                            去投资???算力
                        </a>
                    </div>
                </div>
                <div class="row">
                    <div class="col-11 col-md-8 col-xl-4 mx-auto">
                        <p class="form-note text-center">
                            ??? · 全球化金融服务平台<br/>自由、透明、高效化资本流动
                        </p>
                    </div>
                </div>
                <div class="position-relative has-hafl_plus">
                    <span class="hafl-plus pst-left_bot item_bot wow bounceInScale"></span>
                    <span class="hafl-plus pst-right_bot item_bot wow bounceInScale"></span>
                </div>
            </div>
        </div>
        <span class="br-line"></span>
        <!-- == Bottom Section -->
        <div class="sect-bottom">
            <div class="container">
                <div class="box-hacker has-overlay_linear">
                    <p class="hacker-text text-caption font-2 text-uppercase hackerText">
                        qW8bL2nRM4ZpYk5gJfXvCt1uHdEo93NTaVxBYmOe7rPQnKDlcUs0AjzhFiGSwLXtRpUo6NMJvqa7bT2EfyCdx9KWZhgL1nFMR3YUJ5toepXAGvqBzNcdwskLm4iT7OPuVHxayJZErm5QbgCnX1UL2D9ptYfOEK0sWhRAgJmzliNu67BXFoQYPCHtvnwMJeaZKRxdo3TfLUGqc48sbE9NYpJAgmWTVrhXxLFo517zkidC3
                    </p>
                </div>
            </div>
        </div>
        <span class="br-line"></span>
    </section>
</template>
<script setup>
import { ref } from 'vue';
import { walletState } from '@/services/wallet';
import { showToast } from '@/services/notification';
import { t } from '@/i18n';
import { useRouter } from 'vue-router';
import { getUserStakedBalance } from '@/services/contracts';

const showEntrance = ref(false); // Force hidden
const router = useRouter();

const handleInvestClick = async () => {
  // Logic removed
};

</script>
<script>
export default {
    name: 'CTASection',
    mounted() {
        // window.REQUIRED_CODE_ERROR_MESSAGE = 'Please choose a country code';
        // window.LOCALE = 'en';
        // window.EMAIL_INVALID_MESSAGE = window.SMS_INVALID_MESSAGE = "The information provided is invalid. Please review the field format and try again.";
        // window.REQUIRED_ERROR_MESSAGE = "This field cannot be left blank. ";
        // window.GENERIC_INVALID_MESSAGE = "The information provided is invalid. Please review the field format and try again.";
        // window.translation = {
        //     common: {
        //         selectedList: '{quantity} list selected',
        //         selectedLists: '{quantity} lists selected'
        //     }
        // };
        // window.AUTOHIDE = Boolean(0);

        // const script = document.createElement('script');
        // script.src = '/asset/js/sibforms.js';
        // document.body.appendChild(script);
    }
}
</script>
<style scoped>
</style>
