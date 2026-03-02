async function loadPartials() {
  const headerTarget = document.getElementById("site-header");
  const footerTarget = document.getElementById("site-footer");

  if (!headerTarget || !footerTarget) {
    return;
  }

  try {
    const [headerResponse, footerResponse] = await Promise.all([
      fetch("components/header.html"),
      fetch("components/footer.html")
    ]);

    if (!headerResponse.ok || !footerResponse.ok) {
      throw new Error("Component request failed.");
    }

    headerTarget.innerHTML = await headerResponse.text();
    footerTarget.innerHTML = await footerResponse.text();
  } catch (error) {
    console.error("Header/footer dynamic load failed.", error);
    headerTarget.innerHTML = `
      <header class="site-header fixed-top">
        <nav class="navbar navbar-expand-lg">
          <div class="container">
            <a class="navbar-brand brand-mark" href="index.html">REFLECTIONS</a>
            <div class="navbar-nav ms-auto flex-row gap-3">
              <a class="nav-link" data-page-link="home" href="index.html">Home</a>
              <a class="nav-link" data-page-link="about" href="about.html">About</a>
              <a class="nav-link" data-page-link="case-studies" href="case-studies.html">Case Studies</a>
              <a class="nav-link" data-page-link="contact" href="contact.html">Contact</a>
            </div>
          </div>
        </nav>
      </header>
    `;
    footerTarget.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-bottom d-flex justify-content-between align-items-center pt-3">
            <small>&copy; <span id="footer-year"></span> Reflections Digital Agency</small>
            <small>All rights reserved</small>
          </div>
        </div>
      </footer>
    `;
  }

  setActiveNav();
  setFooterYear();
}

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function setActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;

  document.querySelectorAll("[data-page-link]").forEach((link) => {
    const isActive = link.getAttribute("data-page-link") === page;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function setFooterYear() {
  const yearNode = document.getElementById("footer-year");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }
}

function getCgImages() {
  return [
    "assets/img/cg/img1.jpg",
    "assets/img/cg/img2.jpg",
    "assets/img/cg/img3.jpg",
    "assets/img/cg/img4.jpg",
    "assets/img/cg/img5.jpg",
    "assets/img/cg/img6.jpg",
    "assets/img/cg/img7.jpg",
    "assets/img/cg/img8.jpg",
    "assets/img/cg/img9.jpg"
  ];
}

function pickRandomImage(exclude = "") {
  const images = getCgImages().filter((img) => img !== exclude);
  if (!images.length) return getCgImages()[0];
  return images[Math.floor(Math.random() * images.length)];
}

function applyRandomImages() {
  const breadcrumb = document.querySelector("[data-random-breadcrumb]");
  const subHero = document.querySelector(".sub-hero");
  const targetBreadcrumb = breadcrumb || subHero;
  if (targetBreadcrumb) {
    targetBreadcrumb.classList.forEach((cls) => {
      if (/^breadcrumb-img-\d+$/.test(cls)) targetBreadcrumb.classList.remove(cls);
    });
    const randomIndex = Math.floor(Math.random() * getCgImages().length) + 1;
    targetBreadcrumb.classList.add(`breadcrumb-img-${randomIndex}`);
  }

  let last = "";
  document.querySelectorAll("[data-random-home-image]").forEach((img) => {
    const next = pickRandomImage(last);
    img.src = next;
    last = next;
  });

  const heroFallback = document.querySelector("[data-random-hero-fallback]");
  if (heroFallback) {
    heroFallback.style.backgroundImage = `url('${pickRandomImage(last)}')`;
  }
}

function initLenis() {
  if (typeof Lenis === "undefined") return;
  const lenis = new Lenis();
  if (typeof ScrollTrigger !== "undefined") {
    lenis.on("scroll", ScrollTrigger.update);
  }
  if (typeof gsap !== "undefined") {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }
}

function runPreloader() {
  const preloader = document.getElementById("global-preloader");
  const counter = document.getElementById("preloader-counter");
  if (!preloader) return;
  const isFullPreloader = document.body.dataset.preloader === "full";
  if (!isFullPreloader && counter) {
    counter.style.display = "none";
  }

  if (isFullPreloader && counter) {
    let value = 0;
    const tick = setInterval(() => {
      value += Math.floor(Math.random() * 9) + 1;
      if (value >= 100) {
        value = 100;
        clearInterval(tick);
      }
      counter.textContent = `${value}%`;
    }, 45);
  }

  const triangleCount = isFullPreloader ? 42 : 20;
  for (let i = 0; i < triangleCount; i += 1) {
    const size = Math.floor(Math.random() * 14) + 6;
    const triangle = document.createElement("span");
    const hueShift = Math.floor(Math.random() * 20) - 10;
    triangle.className = "triangle";
    triangle.style.left = `${Math.random() * 100}%`;
    triangle.style.top = `${Math.random() * 100}%`;
    triangle.style.borderLeftWidth = `${size / 2}px`;
    triangle.style.borderRightWidth = `${size / 2}px`;
    triangle.style.borderBottomWidth = `${size}px`;
    triangle.style.borderBottomColor = `hsl(${146 + hueShift} 55% 65%)`;
    triangle.style.transform = `rotate(${Math.random() * 360}deg)`;
    preloader.appendChild(triangle);

    gsap.to(triangle, {
      opacity: Math.random() * 0.75 + 0.2,
      y: `${(Math.random() - 0.5) * 30}`,
      x: `${(Math.random() - 0.5) * 35}`,
      rotation: `+=${(Math.random() - 0.5) * 70}`,
      duration: Math.random() * 0.7 + 0.35,
      repeat: 1,
      yoyo: true,
      delay: Math.random() * 1.3,
      ease: "power2.inOut",
      onComplete: () => triangle.remove()
    });
  }

  gsap.to(preloader, {
    opacity: 0,
    duration: 0.8,
    delay: isFullPreloader ? 1.6 : 0.85,
    onStart: () => {
      runPageAnimations();
    },
    onComplete: () => {
      preloader.querySelectorAll(".triangle").forEach((el) => el.remove());
      preloader.style.display = "none";
    }
  });
}

function initHeroVideo() {
  const heroSection = document.querySelector(".hero-section");
  const video = document.querySelector(".hero-video");
  if (!heroSection || !video) return;
  const randomVideos = [
    "https://videos.pexels.com/video-files/3255275/3255275-sd_960_506_25fps.mp4",
    "https://videos.pexels.com/video-files/3195394/3195394-sd_960_506_25fps.mp4",
    "https://videos.pexels.com/video-files/3129957/3129957-sd_960_506_24fps.mp4"
  ];
  const selectedVideo = randomVideos[Math.floor(Math.random() * randomVideos.length)];
  video.src = selectedVideo;
  video.load();

  const onVideoFail = () => {
    heroSection.classList.add("video-fallback");
  };

  video.addEventListener("error", onVideoFail);
  video.addEventListener("stalled", onVideoFail);
  video.addEventListener("abort", onVideoFail);
  video.addEventListener("canplay", () => heroSection.classList.remove("video-fallback"));

  setTimeout(() => {
    if (video.readyState < 2) onVideoFail();
  }, 2200);

  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => onVideoFail());
  }
}

function runPageAnimations() {
  if (document.querySelector(".hero-content")) {
    gsap.to(".hero-title", { y: 0, opacity: 1, duration: 1, clearProps: "transform" });
    gsap.to(".hero-text, .hero-content .btn-accent", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.15,
      delay: 0.2,
      clearProps: "transform"
    });
  }

  if (document.querySelector(".process-cards")) {
    gsap.from(".process-cards .card-glass", {
      y: 50,
      opacity: 0,
      stagger: 0.15,
      duration: 0.65,
      scrollTrigger: {
        trigger: ".process-cards",
        start: "top 75%"
      }
    });
  }

  if (document.querySelector(".reveal-up")) {
    gsap.from(".reveal-up", {
      y: 45,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".about-reference",
        start: "top 70%"
      }
    });
  }
}

function initCaseMasks() {
  const casePage = document.querySelector(".cg-case");
  if (!casePage || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const initialClipPaths = [
    "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
    "polygon(33% 0%, 33% 0%, 33% 0%, 33% 0%)",
    "polygon(66% 0%, 66% 0%, 66% 0%, 66% 0%)",
    "polygon(0% 33%, 0% 33%, 0% 33%, 0% 33%)",
    "polygon(33% 33%, 33% 33%, 33% 33%, 33% 33%)",
    "polygon(66% 33%, 66% 33%, 66% 33%, 66% 33%)",
    "polygon(0% 66%, 0% 66%, 0% 66%, 0% 66%)",
    "polygon(33% 66%, 33% 66%, 33% 66%, 33% 66%)",
    "polygon(66% 66%, 66% 66%, 66% 66%, 66% 66%)"
  ];
  const finalClipPaths = [
    "polygon(0% 0%, 33.5% 0%, 33.5% 33%, 0% 33.5%)",
    "polygon(33% 0%, 66.5% 0%, 66.5% 33%, 33% 33.5%)",
    "polygon(66% 0%, 100% 0%, 100% 33%, 66% 33.5%)",
    "polygon(0% 33%, 33.5% 33%, 33.5% 66%, 0% 66.5%)",
    "polygon(33% 33%, 66.5% 33%, 66.5% 66%, 33% 66.5%)",
    "polygon(66% 33%, 100% 33%, 100% 66%, 66% 66.5%)",
    "polygon(0% 66%, 33.5% 66%, 33.5% 100%, 0% 100%)",
    "polygon(33% 66%, 66.5% 66%, 66.5% 100%, 33% 100%)",
    "polygon(66% 66%, 100% 66%, 100% 100%, 66% 100%)"
  ];

  const blocks = casePage.querySelectorAll(".img");
  blocks.forEach((img) => {
    img.querySelectorAll(".mask").forEach((m) => m.remove());
    for (let i = 1; i <= 9; i += 1) {
      const mask = document.createElement("div");
      mask.className = `mask mask-${i}`;
      img.appendChild(mask);
    }
  });

  const rows = gsap.utils.toArray(".cg-case .row");
  rows.forEach((row) => {
    const imgs = row.querySelectorAll(".img");
    imgs.forEach((img) => {
      const masks = img.querySelectorAll(".mask");
      masks.forEach((mask, index) => {
        gsap.set(mask, { clipPath: initialClipPaths[index] });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: "top 75%"
        }
      });

      const animationOrder = [
        [".mask-1"],
        [".mask-2", ".mask-4"],
        [".mask-3", ".mask-5", ".mask-7"],
        [".mask-6", ".mask-8"],
        [".mask-9"]
      ];

      animationOrder.forEach((targets, index) => {
        tl.to(
          targets.map((cls) => img.querySelector(cls)),
          {
            clipPath: (k, el) => finalClipPaths[Array.from(masks).indexOf(el)],
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.1
          },
          index * 0.125
        );
      });
    });
  });

  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.refresh();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadPartials();
  applyRandomImages();
  initLenis();
  initCaseMasks();
  initHeroVideo();
  runPreloader();
});
