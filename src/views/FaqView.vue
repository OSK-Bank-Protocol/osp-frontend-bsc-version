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
              <div class="breadcrumbs-list">
                <router-link to="/" class="text-white link font-2">
                  HOME
                </router-link>
                <span>/</span>
                <span class="hacker-text_transform no-delay current-page">
                  FAQS
                </span>
              </div>
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
    <!-- FAQs -->
    <section class="section-faq flat-spacing-3">
      <div class="container">
        <h2 class="s-title only-title ol-tt-2 font-3 text-linear text-center px-16">
          Qore and <br>
          frequently asked questions
        </h2>
        <div class="row">
          <div class="col-lg-10 col-xl-8 mx-auto">
            <div class="faq-accordion-list px-16 px-xl-0" id="frequently-ask">
              <div class="faq-accordion_item">
                <div class="img-item-1">
                  <img loading="lazy" width="600" height="152" src="/asset/images/item/item-bg-2.png" alt="Image">
                </div>
                <div class="accordion-title collapsed" data-bs-target="#data-safe" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="data-safe">
                  <span class="text fw-medium h5 font-3">Is my data safe when using Qore?</span>
                  <span class="icon ic-accordion-custom"></span>
                </div>
                <div id="data-safe" class="collapse" data-bs-parent="#frequently-ask">
                  <div class="accordion-body">
                    <p class="text-main-2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc iaculis diam ut suscipit dapibus. Nunc
                      sodales velit a tellus ultrices, quis scelerisque libero tempus.
                    </p>
                  </div>
                </div>
              </div>
              <div class="faq-accordion_item active">
                <div class="img-item-1">
                  <img loading="lazy" width="600" height="152" src="/asset/images/item/item-bg-2.png" alt="Image">
                </div>
                <div class="accordion-title" data-bs-target="#how-start" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="how-start">
                  <span class="text fw-medium h5 font-3">How can I start using Qore?</span>
                  <span class="icon ic-accordion-custom"></span>
                </div>
                <div id="how-start" class="collapse show" data-bs-parent="#frequently-ask">
                  <div class="accordion-body">
                    <p class="text-main-2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc iaculis diam ut suscipit dapibus. Nunc
                      sodales velit a tellus ultrices, quis scelerisque libero tempus.
                    </p>
                  </div>
                </div>
              </div>
              <div class="faq-accordion_item">
                <div class="img-item-1">
                  <img loading="lazy" width="600" height="152" src="/asset/images/item/item-bg-2.png" alt="Image">
                </div>
                <div class="accordion-title collapsed" data-bs-target="#the-risk" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="the-risk">
                  <span class="text fw-medium h5 font-3">What are the risks of using Qore?</span>
                  <span class="icon ic-accordion-custom"></span>
                </div>
                <div id="the-risk" class="collapse" data-bs-parent="#frequently-ask">
                  <div class="accordion-body">
                    <p class="text-main-2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc iaculis diam ut suscipit dapibus. Nunc
                      sodales velit a tellus ultrices, quis scelerisque libero tempus.
                    </p>
                  </div>
                </div>
              </div>
              <div class="faq-accordion_item">
                <div class="img-item-1">
                  <img loading="lazy" width="600" height="152" src="/asset/images/item/item-bg-2.png" alt="Image">
                </div>
                <div class="accordion-title collapsed" data-bs-target="#can-trust" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="can-trust">
                  <span class="text fw-medium h5 font-3">Can I trust the answers from an Qore?</span>
                  <span class="icon ic-accordion-custom"></span>
                </div>
                <div id="can-trust" class="collapse" data-bs-parent="#frequently-ask">
                  <div class="accordion-body">
                    <p class="text-main-2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc iaculis diam ut suscipit dapibus. Nunc
                      sodales velit a tellus ultrices, quis scelerisque libero tempus.
                    </p>
                  </div>
                </div>
              </div>
              <div class="faq-accordion_item">
                <div class="img-item-1">
                  <img loading="lazy" width="600" height="152" src="/asset/images/item/item-bg-2.png" alt="Image">
                </div>
                <div class="accordion-title collapsed" data-bs-target="#does-ai" role="button" data-bs-toggle="collapse" aria-expanded="false" aria-controls="does-ai">
                  <span class="text fw-medium h5 font-3">Does AI need an internet connection to work?</span>
                  <span class="icon ic-accordion-custom"></span>
                </div>
                <div id="does-ai" class="collapse" data-bs-parent="#frequently-ask">
                  <div class="accordion-body">
                    <p class="text-main-2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc iaculis diam ut suscipit dapibus. Nunc
                      sodales velit a tellus ultrices, quis scelerisque libero tempus.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- /FAQs -->
    <!-- Break Section -->
    <div class="section-break">
      <div class="position-relative z-5">
        <div class="container">
          <div class="has-hafl_plus">
            <span class="hafl-plus pst-left_bot item_bot wow bounceInScale"></span>
            <span class="hafl-plus pst-right_bot item_bot wow bounceInScale"></span>
          </div>
        </div>
      </div>
      <span class="br-line"></span>
      <div class="sect-bottom">
        <div class="container">
          <div class="box-hacker has-overlay_linear mx-1">
            <p class="hacker-text text-caption font-2 text-uppercase hackerText">
              qW8bL2nRM4ZpYk5gJfXvCt1uHdEo93NTaVxBYmOe7rPQnKDlcUs0AjzhFiGSwLXtRpUo6NMJvqa7bT2EfyCdx9KWZhgL1nFMR3YUJ5toepXAGvqBzNcdwskLm4iT7OPuVHxayJZErm5QbgCnX1UL2D9ptYfOEK0sWhRAgJmzliNu67BXFoQYPCHtvnwMJeaZKRxdo3TfLUGqc48sbE9NYpJAgmWTVrhXxLFo517zkidC3
            </p>
          </div>
        </div>
      </div>
      <div class="position-relative z-5">
        <div class="container">
          <div class="has-hafl_plus">
            <span class="hafl-plus pst-left_bot item_top wow bounceInScale"></span>
            <span class="hafl-plus pst-right_bot item_top wow bounceInScale"></span>
          </div>
        </div>
      </div>
      <span class="br-line"></span>
    </div>
    <!-- /Break Section -->
    <!-- Get In Touch -->
    <section class="section-get-in flat-spacing-3">
      <div class="container">
        <div class="row">
          <div class="col-lg-10 mx-auto">
            <h2 class="s-title only-title font-3 text-linear px-16 px-xl-0">
              Get in touch
            </h2>
          </div>
        </div>
        <div class="row">
          <div class="col-lg-3 offset-lg-1">
            <ul class="info-us-list px-16 px-lg-0 mb-lg-0">
              <li>
                <p class="title-sub text-body-3">Office</p>
                <a href="https://www.google.com/maps?q=2715+Ash+Dr.+San+Jose,+South+Dakota+83475" target="_blank" class="text-body-3 link text-white">
                  2715 Ash Dr. San Jose, South Dakota 83475
                </a>
              </li>
              <li class="br-line has-dot"></li>
              <li>
                <p class="title-sub text-body-3">Email</p>
                <a href="mailto:qore@support.com" class="h5 fw-medium link text-white font-3">
                  qore@support.com
                </a>
              </li>
              <li class="br-line has-dot"></li>
              <li>
                <p class="title-sub text-body-3">Phone</p>
                <a href="tel:3035550105" class="h5 fw-medium link text-white font-3">
                  (303) 555-0105
                </a>
              </li>
            </ul>
          </div>
          <div class="col-lg-7">
            <form class="form-get_in px-16 px-xl-0">
              <div class="form-content-2">
                <div class="tf-grid-layout sm-col-2">
                  <fieldset>
                    <label class="label-text text-body-3 text-white" for="first-name">First name</label>
                    <input type="text" id="first-name" placeholder="John" required>
                  </fieldset>
                  <fieldset>
                    <label class="label-text text-body-3 text-white" for="last-name">Last name</label>
                    <input type="text" id="last-name" placeholder="Doe" required>
                  </fieldset>
                </div>
                <div class="tf-grid-layout sm-col-2">
                  <fieldset>
                    <label class="label-text text-body-3 text-white" for="email">Email</label>
                    <input type="text" id="email" placeholder="john@example.com" required>
                  </fieldset>
                  <fieldset>
                    <label class="label-text text-body-3 text-white" for="phone">Phone</label>
                    <input type="number" id="phone" placeholder="(303) 555-0105" required>
                  </fieldset>
                </div>
                <fieldset class="d-grid">
                  <label class="label-text text-body-3 text-white" for="message">Message</label>
                  <textarea id="message" placeholder="Message"></textarea>
                </fieldset>
              </div>
              <button type="submit" class="tf-btn text-body-3 style-2 animate-btn animate-dark style-high">
                Send message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
    <!-- /Get In Touch -->
  </div>
</template>

<script>
export default {
  name: 'FaqView',
};
</script>
