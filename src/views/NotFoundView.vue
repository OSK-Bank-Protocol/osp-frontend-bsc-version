<template>
  <div>
    <!-- Page Title -->
    <div class="section-page-title">
      <div class="sect-tagline">
        <div class="container">
          <div class="sect-tagline_inner">
            <span class="hafl-plus pst-left_bot wow bounceInScale"></span>
            <span class="hafl-plus pst-right_bot wow bounceInScale"></span>
            <div class="s-name text-caption font-2">
              <span class="bar-group type-left">
                <span class="bar_center"></span>
              </span>
              <span class="hacker-text_transform no-delay">
                PAGE NOT FOUND
              </span>
              <span class="bar-group type-right">
                <span class="bar_center"></span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <span class="br-line"></span>
    </div>
    <!-- /Page Title -->
    <!-- 404 -->
    <section class="section-404 flat-spacing-3">
      <div class="container">
        <div class="content px-16 px-lg-0">
          <div class="image">
            <img loading="lazy" width="544" height="180" src="/asset/images/section/404.png" alt="404">
          </div>
          <h2 class="title text-linear font-3">
            Page not found
          </h2>
          <p class="desc">
            Sorry, we couldn't find the page you where looking for. We suggest that <br class="d-none d-sm-block">
            you return to homepage.
          </p>
          <div class="d-flex justify-content-center">
            <router-link to="/" class="tf-btn text-body-3 style-2 style-high-2 animate-btn animate-dark">
              Back to homepage
            </router-link>
          </div>
        </div>
      </div>
    </section>
    <!-- /404 -->
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
};
</script>
