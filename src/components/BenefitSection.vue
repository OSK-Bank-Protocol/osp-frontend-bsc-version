<template>
    <section class="section-benefit">
        <!-- == Head Section -->
        <div class="sect-header">
            <div class="container">
                <div class="s-meta text-caption font-2">
                    <p class="s-number_order wg-counter">
                        [ <span class="text-white">0<span class="odometer" data-number="3">0</span></span> / 09 ]
                    </p>
                    <p class="s-label">[ <span class="text-white hacker-text_transform">BENEFITS</span> ]</p>
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
                    <p class="s-name text-caption font-2">
                        <span class="bar-group type-left">
                            <span class="bar_center"></span>
                        </span>
                        <span class="hacker-text_transform no-delay">
                            WHY OSK Bank WORKS SMARTER.
                        </span>
                        <span class="bar-group type-right">
                            <span class="bar_center"></span>
                        </span>
                    </p>
                </div>
            </div>
        </div>
        <span class="br-line"></span>
        <!-- == Main Section -->
        <div class="sect-main">
            <div class="container">
                <div class="place-video">
                    <div class="visual-object">
                        <div class="object_img wow bounceInScale">
                            <div class="image" style="position: relative; width: 100%; height: 100%;">
                                <img src="/asset/images/artora-img/anime-3.gif" alt="Image" class="benefit-gif-3 gif-place-3">
                                <div class="gif-fade-overlay" 
                                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; background: radial-gradient(ellipse 85% 65% at center, rgba(12, 12, 14, 0) 25%, rgba(12, 12, 14, 1) 75%);">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="sect-title wow fadeInUp friend-title-position">
                        <h2 class="s-title font-3">
                            为您而苏醒的<br>
                            投资道路
                        </h2>
                        <p class="s-sub_title">
                            捐赠至底池的资金，将依额度每日累积， <br
                                class="d-none d-lg-block">
                            — 最高享 1.2% 自动复利，周期不超过 30 天。
                        </p>
                    </div>
                </div>
                <div class="position-relative">
                    <div class="grid-box_icon tf-grid-layout sm-col-2 md-col-2 friends-position">
                        <div class="box-icon-text wow fadeInUp">
                            <div class="icon">
                                <img src="/asset/images/section/platform.svg" alt="Icon">
                            </div>
                            <div class="content">
                                <!-- <p class="title text-main-2">您的业绩</p> -->
                                <h5 class="title s-title font-3">呼朋唤友之力</h5>
                                <p class="sub-title text-body-3">
                                    $ 52739.3913 Token
                                </p>
                            </div>
                        </div>
                        <div class="box-icon-text wow fadeInUp">
                            <div class="icon">
                                <img src="/asset/images/section/ai-core.svg" alt="Icon">
                            </div>
                            <div class="content">
                                <h5 class="title s-title font-3">发送契约链接</h5>
                                <p class="sub-title text-body-3">
                                    http://localhost:5173/
                                </p>
                            </div>
                        </div>
                    </div>
                    <span class="hafl-plus pst-left_bot item_bot wow bounceInScale"></span>
                    <span class="hafl-plus pst-right_bot item_bot wow bounceInScale"></span>
                </div>
            </div>
        </div>
        <span class="br-line"></span>
        <!-- == Bottom Section -->
        <div class="sect-bottom">
            <div class="container">
                <div class="box-hacker has-overlay_linear mx-1">
                    <p class="hacker-text text-caption font-2 text-uppercase hackerText">
                        qW8bL2nRM4ZpYk5gJfXvCt1uHdEo93NTaVxBYmOe7rPQnKDlcUs0AjzhFiGSwLXtRpUo6NMJvqa7bT2EfyCdx9KWZhgL1nFMR3YUJ5toepXAGvqBzNcdwskLm4iT7OPuVHxayJZErm5QbgCnX1UL2D9ptYfOEK0sWhRAgJmzliNu67BXFoQYPCHtvnwMJeaZKRxdo3TfLUGqc48sbE9NYpJAgmWTVrhXxLFo517zkidC3
                    </p>
                </div>
            </div>
        </div>
        <span class="br-line"></span>
    </section>
</template>
<script>
export default {
    name: 'BenefitSection'
}
</script>
<style scoped>
.benefit-gif-2 {
    transform: scale(1.5);
}

.gif-place-2 {
    padding-top: 0px !important;
    margin-bottom: 30px !important;
}

.benefit-gif-3 {
    transform: scale(1.0);
    width: 200px;
    height: 200px;
}

.gif-place-3 {
    padding-top: 0px !important;
    margin-bottom: 30px !important;
}

.friend-title-position {
    margin-top: 0px;
}

.friends-position {
    display: flex;
    flex-direction: row;
    justify-content: center;
}
</style>
