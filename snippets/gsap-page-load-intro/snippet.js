<!-- <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script> -->
<!-- Give every element you want in the intro a shared class, e.g. "reveal" -->
<!--
  <p class="reveal">Welcome to</p>
  <h1 class="reveal">Build Something Extraordinary</h1>
  <p class="reveal">A short subheading that explains the product in one line.</p>
  <button class="reveal">Get Started</button>
-->

function playIntro() {
  gsap.set(".reveal", { opacity: 0, y: 40 });

  gsap.to(".reveal", {
    y: 0,
    opacity: 1,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.15,
  });
}

document.addEventListener("DOMContentLoaded", playIntro);
