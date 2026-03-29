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
      <header class="site-header akaru-header">
        <div class="akaru-logo">
          <a href="index.html">Reflections</a>
        </div>
        <button class="menu-toggle closed" type="button" aria-label="Toggle menu" aria-expanded="false">
          <div class="menu-toggle-icon">
            <div class="hamburger">
              <div class="menu-bar" data-position="top"></div>
              <div class="menu-bar" data-position="bottom"></div>
            </div>
          </div>
          <div class="menu-copy"><p>Menu</p></div>
        </button>
        <div class="menu" aria-hidden="true">
          <div class="col col-1">
            <div class="menu-logo"><a href="index.html">Reflections</a></div>
            <div class="links">
              <div class="link"><a data-page-link="home" href="index.html">Home</a></div>
              <div class="link"><a data-page-link="about" href="about.html">About</a></div>
              <div class="link"><a data-page-link="case-studies" href="case-studies.html">Case Studies</a></div>
              <div class="link"><a data-page-link="contact" href="contact.html">Contact</a></div>
            </div>
            <div class="video-wrapper">
              <video autoplay muted loop playsinline>
                <source src="cg-akaru-menu-js/assets/video.mp4" type="video/mp4">
              </video>
            </div>
          </div>
          <div class="col col-2">
            <div class="socials">
              <div class="sub-col">
                <p>Reflections</p>
                <p>Creative District</p>
                <p>New York, USA</p>
                <p>Remote-first</p>
                <br>
                <p>hello@reflections.agency</p>
                <p>jobs@reflections.agency</p>
              </div>
              <div class="sub-col">
                <p>Instagram</p>
                <p>LinkedIn</p>
                <p>X / Twitter</p>
                <p>Dribbble</p>
                <br>
                <p>+1 555 123 4578</p>
              </div>
            </div>
            <div class="header"><h1>Reflections</h1></div>
          </div>
        </div>
      </header>
    `;
    footerTarget.innerHTML = `
      <footer class="site-footer footer-neo">
        <div class="container footer-neo-grid">
          <div class="footer-neo-top">
            <div class="footer-neo-col">
              <p class="footer-neo-label">Socials</p>
              <div class="footer-neo-socials">
                <a href="#" aria-label="X (Twitter)">X (Twitter)</a>
                <a href="#" aria-label="LinkedIn">LinkedIn</a>
                <a href="#" aria-label="Instagram">Instagram</a>
              </div>
              <div class="footer-neo-links">
                <a href="index.html">Home</a>
                <a href="about.html">About</a>
                <a href="case-studies.html">Case Studies</a>
                <a href="contact.html">Contact</a>
              </div>
            </div>
            <div class="footer-neo-col footer-neo-reach">
              <p class="footer-neo-label">Reach out</p>
              <a class="footer-neo-email" href="mailto:hello@reflections.agency">hello@reflections.agency</a>
            </div>
          </div>
          <div class="footer-neo-bottom">
            <div>
              <p class="footer-neo-brand">Reflections.</p>
              <p class="footer-neo-copy">All rights reserved <span id="footer-year"></span></p>
            </div>
          </div>
          <div class="footer-neo-orb-wrap" aria-hidden="true">
            <div class="footer-neo-orb"></div>
            <div class="footer-neo-ring">LET'S TALK ABOUT YOUR NEXT PROJECT</div>
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

let appLenis;
let splitCardsMM;
let splitCardsResizeTimer;
let splitCardsResizeBound = false;
let baCardsResizeTimer;
let baCardsResizeBound = false;
let scrollScenesStabilized = false;

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

function initAkaruMenu() {
  const header = document.querySelector(".akaru-header");
  if (!header || typeof gsap === "undefined") return;

  const menuToggle = header.querySelector(".menu-toggle");
  const menu = header.querySelector(".menu");
  const links = header.querySelectorAll(".link");
  const socialLinks = header.querySelectorAll(".socials p");
  const title = header.querySelector(".header h1");
  const menuVideo = header.querySelector(".video-wrapper");

  if (!menuToggle || !menu || !title) return;
  if (menuToggle.dataset.menuBound === "1") return;
  menuToggle.dataset.menuBound = "1";

  if (typeof CustomEase !== "undefined") {
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "hop",
      "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1"
    );
  }

  if (!title.dataset.split) {
    const split = title.innerText
      .split("")
      .map((char) => `<span>${char === " " ? "&nbsp;&nbsp;" : char}</span>`)
      .join("");
    title.innerHTML = split;
    title.dataset.split = "1";
  }

  let isAnimating = false;
  const textSpans = header.querySelectorAll(".header h1 span");
  const hopEase = typeof CustomEase !== "undefined" ? "hop" : "power3.inOut";

  const closeMenu = () => {
    menuToggle.classList.remove("opened");
    menuToggle.classList.add("closed");
    menuToggle.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  };

  const openMenu = () => {
    menuToggle.classList.remove("closed");
    menuToggle.classList.add("opened");
    menuToggle.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
  };

  menuToggle.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;

    if (menuToggle.classList.contains("closed")) {
      openMenu();

      gsap.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: hopEase,
        duration: 1.5,
        onStart: () => {
          menu.style.pointerEvents = "all";
        },
        onComplete: () => {
          isAnimating = false;
        }
      });

      gsap.to(links, {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        delay: 0.85,
        duration: 1,
        ease: "power3.out"
      });

      gsap.to(socialLinks, {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        delay: 0.85,
        duration: 1,
        ease: "power3.out"
      });

      if (menuVideo) {
        gsap.to(menuVideo, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: hopEase,
          duration: 1.5,
          delay: 0.5
        });
      }

      gsap.to(textSpans, {
        rotateY: 0,
        stagger: 0.05,
        delay: 0.75,
        duration: 1.5,
        ease: "power4.out"
      });

      gsap.to(textSpans, {
        y: 0,
        scale: 1,
        stagger: 0.05,
        delay: 0.5,
        duration: 1.5,
        ease: "power4.out"
      });
    } else {
      closeMenu();

      gsap.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        ease: hopEase,
        duration: 1.5,
        onComplete: () => {
          menu.style.pointerEvents = "none";
          gsap.set(menu, {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
          });
          gsap.set(links, { y: 30, opacity: 0 });
          gsap.set(socialLinks, { y: 30, opacity: 0 });
          if (menuVideo) {
            gsap.set(menuVideo, {
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
            });
          }
          gsap.set(textSpans, {
            y: 500,
            rotateY: 90,
            scale: 0.75
          });
          isAnimating = false;
        }
      });
    }
  });

  header.querySelectorAll(".menu .link a").forEach((link) => {
    link.addEventListener("click", () => {
      if (menuToggle.classList.contains("opened")) {
        closeMenu();
      }
    });
  });
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

function getAllAssetImages() {
  return [
    ...getCgImages(),
    "assets/img/brandappart/card-img-1.jpg",
    "assets/img/brandappart/card-img-2.jpg",
    "assets/img/brandappart/card-img-3.jpg",
    "assets/img/brandappart/card-img-4.jpg",
    "assets/img/split-card/card_cover_1.jpg",
    "assets/img/split-card/card_cover_2.jpg",
    "assets/img/split-card/card_cover_3.jpg"
  ];
}

function pickRandomImage(exclude = "") {
  const images = getCgImages().filter((img) => img !== exclude);
  if (!images.length) return getCgImages()[0];
  return images[Math.floor(Math.random() * images.length)];
}

function pickRandomAssetImage(exclude = "") {
  const images = getAllAssetImages().filter((img) => img !== exclude);
  if (!images.length) return getAllAssetImages()[0];
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

  let lastAsset = "";
  document.querySelectorAll("[data-random-ba-image]").forEach((tile) => {
    const next = pickRandomAssetImage(lastAsset);
    tile.style.setProperty("--ba-logo", `url('/${next.replace(/^\/+/, "")}')`);
    lastAsset = next;
  });
}

function initLenis() {
  if (typeof Lenis === "undefined") return;
  if (appLenis && typeof appLenis.destroy === "function") {
    appLenis.destroy();
  }
  appLenis = new Lenis();
  if (typeof ScrollTrigger !== "undefined") {
    appLenis.on("scroll", ScrollTrigger.update);
  }
  if (typeof gsap !== "undefined") {
    gsap.ticker.add((time) => {
      if (appLenis) appLenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }
}

function queueScrollSceneRefresh() {
  if (typeof ScrollTrigger === "undefined") return;
  const delays = [0, 120, 380, 650];
  delays.forEach((delay) => {
    window.setTimeout(() => {
      ScrollTrigger.refresh();
      ScrollTrigger.update();
    }, delay);
  });
}

function waitForImageReady(img) {
  if (!img) return Promise.resolve();
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();

  return new Promise((resolve) => {
    const done = () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
      resolve();
    };
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  });
}

function waitForPinnedSectionAssets() {
  const targets = Array.from(
    document.querySelectorAll(".sc-card-front img, .ba-logo-img[data-random-ba-image]")
  );
  if (!targets.length) return Promise.resolve();

  const waits = targets.map((el) => {
    if (el.tagName === "IMG") {
      return waitForImageReady(el);
    }
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === "none") return Promise.resolve();

    const match = bg.match(/^url\((["']?)(.*?)\1\)$/);
    if (!match || !match[2]) return Promise.resolve();

    const probe = new Image();
    probe.src = match[2];
    return waitForImageReady(probe);
  });

  return Promise.allSettled(waits);
}

async function stabilizeScrollScenes() {
  if (scrollScenesStabilized) return;
  scrollScenesStabilized = true;

  if (document.readyState !== "complete") {
    await new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
  }

  await waitForPinnedSectionAssets();

  initSplitCards();
  initBrandAppartCards();

  queueScrollSceneRefresh();
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
      if (typeof ScrollTrigger !== "undefined") {
        queueScrollSceneRefresh();
      }
    }
  });
}

function initHeroVideo() {
  const heroSection = document.querySelector(".hero-section");
  const video = document.querySelector(".hero-video");
  if (!heroSection || !video) return;

  const sourceEl = video.querySelector("source");
  const inlineSource = sourceEl ? sourceEl.getAttribute("src") : "";
  const inlineVideoSrc = video.getAttribute("src") || "";
  const hasInlineSource = Boolean((inlineSource || inlineVideoSrc).trim());
  const useRandomVideo = video.hasAttribute("data-random-hero-video");

  if (useRandomVideo || !hasInlineSource) {
    const randomVideos = [
      "https://videos.pexels.com/video-files/3255275/3255275-sd_960_506_25fps.mp4",
      "https://videos.pexels.com/video-files/3195394/3195394-sd_960_506_25fps.mp4",
      "https://videos.pexels.com/video-files/3129957/3129957-sd_960_506_24fps.mp4"
    ];
    const selectedVideo = randomVideos[Math.floor(Math.random() * randomVideos.length)];
    video.src = selectedVideo;
    video.load();
  } else {
    video.load();
  }

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

function initSplitCards() {
  const splitWrap = document.querySelector(".sc-wrap");
  if (!splitWrap || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const sticky = splitWrap.querySelector(".sc-sticky");
  const cardContainer = splitWrap.querySelector(".sc-card-container");
  const stickyHeader = splitWrap.querySelector(".sc-header .section-intro");
  if (!sticky || !cardContainer || !stickyHeader) return;

  if (splitCardsMM) {
    splitCardsMM.revert();
    splitCardsMM = null;
  }

  ScrollTrigger.getAll()
    .filter((trigger) => trigger.vars && trigger.vars.id === "split-cards-pin")
    .forEach((trigger) => trigger.kill());

  splitCardsMM = gsap.matchMedia();

  splitCardsMM.add("(max-width: 999px)", () => {
    splitWrap.querySelectorAll(".sc-card, .sc-card-container, .sc-header .section-intro").forEach((el) => {
      el.style.cssText = "";
    });
    return () => {};
  });

  splitCardsMM.add("(min-width: 1000px)", () => {
    const splitCards = splitWrap.querySelectorAll(".sc-card");
    const firstCard = splitWrap.querySelector("#sc-card-1");
    const secondCard = splitWrap.querySelector("#sc-card-2");
    const thirdCard = splitWrap.querySelector("#sc-card-3");

    gsap.killTweensOf([cardContainer, stickyHeader, splitCards, firstCard, thirdCard]);
    gsap.set(stickyHeader, { y: 40, opacity: 0 });
    gsap.set(cardContainer, { width: "75%", gap: "0px" });
    gsap.set(splitCards, { rotationY: 0, clearProps: "y,rotationZ" });
    gsap.set(firstCard, { borderRadius: "20px 0 0 20px" });
    gsap.set(secondCard, { borderRadius: "0px" });
    gsap.set(thirdCard, { borderRadius: "0 20px 20px 0" });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: "split-cards-pin",
        trigger: sticky,
        start: "top top",
        end: () => `+=${window.innerHeight * 4}px`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    tl.to(cardContainer, { width: "60%", duration: 0.25 }, 0);
    tl.to(stickyHeader, { y: 0, opacity: 1, duration: 0.15 }, 0.1);
    tl.to(cardContainer, { gap: "20px", duration: 0.08, ease: "power3.out" }, 0.35);
    tl.to(splitCards, { borderRadius: "20px", duration: 0.08, ease: "power3.out" }, 0.35);
    tl.to(splitCards, { rotationY: 180, duration: 0.12, ease: "power3.inOut", stagger: 0.02 }, 0.7);
    tl.to(firstCard, { y: 30, rotationZ: -15, duration: 0.12, ease: "power3.inOut" }, 0.7);
    tl.to(thirdCard, { y: 30, rotationZ: 15, duration: 0.12, ease: "power3.inOut" }, 0.7);

    return () => {
      tl.kill();
    };
  });

  if (!splitCardsResizeBound) {
    window.addEventListener("resize", () => {
      clearTimeout(splitCardsResizeTimer);
      splitCardsResizeTimer = setTimeout(() => {
        initSplitCards();
      }, 250);
    });
    splitCardsResizeBound = true;
  }

  ScrollTrigger.refresh();
}

function initBrandAppartCards() {
  const section = document.querySelector(".ba-sticky-cards");
  if (!section || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  ScrollTrigger.getAll()
    .filter((trigger) => trigger.vars && trigger.vars.id === "ba-sticky-cards-pin")
    .forEach((trigger) => trigger.kill());

  const cards = section.querySelectorAll(".ba-card");
  if (!cards.length) return;

  const totalCards = cards.length;
  const transitionCount = Math.max(totalCards - 1, 1);
  const segmentSize = 1 / transitionCount;
  const cardYOffset = 4.5;
  const cardScaleStep = 0.065;

  cards.forEach((card, i) => {
    gsap.set(card, {
      xPercent: -50,
      yPercent: -50 + i * cardYOffset,
      scale: 1 - i * cardScaleStep,
      rotationX: 0
    });
  });

  ScrollTrigger.create({
    id: "ba-sticky-cards-pin",
    trigger: section,
    start: "top top",
    end: () => `+=${window.innerHeight * (transitionCount * 0.62)}px`,
    pin: true,
    pinSpacing: true,
    scrub: 1,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onRefresh: () => {
      cards.forEach((card, i) => {
        gsap.set(card, {
          xPercent: -50,
          yPercent: -50 + i * cardYOffset,
          scale: 1 - i * cardScaleStep,
          rotationX: 0
        });
      });
    },
    onUpdate: (self) => {
      const progress = self.progress;
      const activeIndex = Math.min(Math.floor(progress / segmentSize), Math.max(totalCards - 2, 0));
      const segProgress = (progress - activeIndex * segmentSize) / segmentSize;

      cards.forEach((card, i) => {
        if (i < activeIndex) {
          gsap.set(card, {
            yPercent: -250,
            rotationX: 35
          });
        } else if (i === activeIndex) {
          gsap.set(card, {
            yPercent: gsap.utils.interpolate(-50, -200, segProgress),
            rotationX: gsap.utils.interpolate(0, 35, segProgress),
            scale: 1
          });
        } else {
          const behindIndex = i - activeIndex;
          const currentYOffset = (behindIndex - segProgress) * cardYOffset;
          const currentScale = 1 - (behindIndex - segProgress) * cardScaleStep;

          gsap.set(card, {
            yPercent: -50 + currentYOffset,
            rotationX: 0,
            scale: currentScale
          });
        }
      });
    }
  });

  if (!baCardsResizeBound) {
    window.addEventListener("resize", () => {
      clearTimeout(baCardsResizeTimer);
      baCardsResizeTimer = setTimeout(() => {
        initBrandAppartCards();
      }, 250);
    });
    baCardsResizeBound = true;
  }

  ScrollTrigger.refresh();
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
            clipPath: (_, el) => finalClipPaths[Array.from(masks).indexOf(el)],
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

function initTestimonialDrag() {
  const track = document.querySelector("[data-testimonial-track]");
  if (!track) return;
  const prevBtn = document.querySelector("[data-testimonial-prev]");
  const nextBtn = document.querySelector("[data-testimonial-next]");

  const cards = Array.from(track.querySelectorAll(".t-card"));
  if (!cards.length) return;

  let lastImage = "";
  cards.forEach((card) => {
    if (!card.hasAttribute("data-random-testimonial-image")) return;
    const next = pickRandomImage(lastImage);
    const absoluteNext = `/${next.replace(/^\/+/, "")}`;
    card.style.setProperty("--t-bg", `url('${absoluteNext}')`);
    lastImage = next;
  });

  if (!track.dataset.loopReady) {
    const clonesBefore = cards.map((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.classList.add("is-clone");
      return clone;
    });

    const clonesAfter = cards.map((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.classList.add("is-clone");
      return clone;
    });

    clonesBefore.forEach((clone) => track.insertBefore(clone, track.firstChild));
    clonesAfter.forEach((clone) => track.appendChild(clone));
    track.dataset.loopReady = "1";
  }

  const allCards = Array.from(track.querySelectorAll(".t-card"));
  const originalsStartIndex = cards.length;
  const originalsWidth =
    allCards[originalsStartIndex + cards.length].offsetLeft - allCards[originalsStartIndex].offsetLeft;

  track.scrollLeft = allCards[originalsStartIndex].offsetLeft;

  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let rafId = 0;

  const loopScroll = () => {
    if (track.scrollLeft <= allCards[originalsStartIndex].offsetLeft - 1) {
      track.scrollLeft += originalsWidth;
    } else if (
      track.scrollLeft >=
      allCards[originalsStartIndex + cards.length].offsetLeft - 1
    ) {
      track.scrollLeft -= originalsWidth;
    }
  };

  const getStep = () => {
    const card = allCards[originalsStartIndex];
    if (!card) return 320;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap || styles.columnGap || "0") || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const onPointerDown = (e) => {
    isDown = true;
    track.style.scrollSnapType = "none";
    track.classList.add("is-dragging");
    startX = e.pageX || (e.touches && e.touches[0] ? e.touches[0].pageX : 0);
    scrollStart = track.scrollLeft;
  };

  const onPointerMove = (e) => {
    if (!isDown) return;
    const x = e.pageX || (e.touches && e.touches[0] ? e.touches[0].pageX : 0);
    const delta = x - startX;
    track.scrollLeft = scrollStart - delta * 0.95;
    loopScroll();
  };

  const onPointerUp = () => {
    isDown = false;
    track.classList.remove("is-dragging");
    requestAnimationFrame(() => {
      track.style.scrollSnapType = "x proximity";
    });
  };

  track.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);
  track.addEventListener("mouseleave", onPointerUp);

  track.addEventListener("touchstart", onPointerDown, { passive: true });
  track.addEventListener("touchmove", onPointerMove, { passive: true });
  track.addEventListener("touchend", onPointerUp, { passive: true });

  track.addEventListener("scroll", () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(loopScroll);
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      track.scrollBy({ left: -getStep(), behavior: "smooth" });
      setTimeout(loopScroll, 260);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      track.scrollBy({ left: getStep(), behavior: "smooth" });
      setTimeout(loopScroll, 260);
    });
  }
}

function initInteractiveDotFields() {
  const fields = Array.from(document.querySelectorAll(".dot-field-area"));
  if (!fields.length) return;

  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  fields.forEach((section) => {
    if (section.dataset.dotFieldBound === "1") return;
    section.dataset.dotFieldBound = "1";

    let dotsField = section.querySelector(".mouse-dots-bg");
    if (!dotsField) {
      dotsField = document.createElement("div");
      dotsField.className = "mouse-dots-bg";
      dotsField.setAttribute("aria-hidden", "true");
      dotsField.innerHTML = `
        <div class="mouse-dots-layer mouse-dots-layer--base"></div>
        <div class="mouse-dots-layer mouse-dots-layer--mid"></div>
        <div class="mouse-dots-layer mouse-dots-layer--near"></div>
      `;
      section.prepend(dotsField);
    }

    let rect = section.getBoundingClientRect();
    const moveField = (x, y, immediate = false) => {
      const clampedX = Math.max(0, Math.min(x, rect.width));
      const clampedY = Math.max(0, Math.min(y, rect.height));

      if (reduceMotion || typeof gsap === "undefined" || immediate) {
        dotsField.style.setProperty("--mx", `${clampedX}px`);
        dotsField.style.setProperty("--my", `${clampedY}px`);
        return;
      }

      gsap.to(dotsField, {
        "--mx": `${clampedX}px`,
        "--my": `${clampedY}px`,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true
      });
    };

    moveField(rect.width / 2, rect.height / 2, true);
    if (isCoarsePointer) return;

    section.addEventListener("pointerenter", (event) => {
      rect = section.getBoundingClientRect();
      dotsField.classList.add("is-hovering");
      moveField(event.clientX - rect.left, event.clientY - rect.top, true);
    });

    section.addEventListener("pointermove", (event) => {
      rect = section.getBoundingClientRect();
      moveField(event.clientX - rect.left, event.clientY - rect.top);
    });

    section.addEventListener("pointerleave", () => {
      dotsField.classList.remove("is-hovering");
      moveField(rect.width / 2, rect.height / 2);
    });

    window.addEventListener("resize", () => {
      rect = section.getBoundingClientRect();
      moveField(rect.width / 2, rect.height / 2, true);
    });
  });
}

function initContactFaqAccordion() {
  const items = Array.from(document.querySelectorAll(".faq-item"));
  if (!items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setAnswerHeight = (item, expanded) => {
    const answer = item.querySelector(".faq-answer");
    if (!answer) return;

    if (expanded) {
      answer.style.height = `${answer.scrollHeight}px`;
    } else {
      answer.style.height = "0px";
    }
  };

  items.forEach((item) => {
    const summary = item.querySelector("summary");
    const answer = item.querySelector(".faq-answer");
    if (!summary || !answer) return;

    setAnswerHeight(item, item.hasAttribute("open"));

    summary.addEventListener("click", (event) => {
      event.preventDefault();
      if (item.dataset.animating === "1") return;

      const isOpen = item.hasAttribute("open");

      if (reduceMotion) {
        if (isOpen) {
          item.removeAttribute("open");
        } else {
          item.setAttribute("open", "");
        }
        setAnswerHeight(item, !isOpen);
        return;
      }

      item.dataset.animating = "1";

      const onDone = (removeOpenAtEnd = false) => {
        const handleEnd = (e) => {
          if (e.propertyName !== "height") return;
          answer.removeEventListener("transitionend", handleEnd);
          if (removeOpenAtEnd) item.removeAttribute("open");
          item.classList.remove("is-collapsing");
          item.dataset.animating = "0";
        };
        answer.addEventListener("transitionend", handleEnd);
      };

      if (isOpen) {
        item.classList.add("is-collapsing");
        answer.style.height = `${answer.scrollHeight}px`;
        requestAnimationFrame(() => {
          answer.style.height = "0px";
          onDone(true);
        });
      } else {
        item.setAttribute("open", "");
        item.classList.remove("is-collapsing");
        answer.style.height = "0px";
        requestAnimationFrame(() => {
          answer.style.height = `${answer.scrollHeight}px`;
          onDone(false);
        });
      }
    });
  });

  window.addEventListener("resize", () => {
    items.forEach((item) => {
      setAnswerHeight(item, item.hasAttribute("open"));
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadPartials();
  initAkaruMenu();
  applyRandomImages();
  initLenis();
  initCaseMasks();
  initTestimonialDrag();
  initInteractiveDotFields();
  initContactFaqAccordion();
  initHeroVideo();
  runPreloader();
  stabilizeScrollScenes();

  if (typeof ScrollTrigger !== "undefined") {
    window.addEventListener("load", () => {
      queueScrollSceneRefresh();
    });

    window.addEventListener("pageshow", (e) => {
      if (appLenis) {
        appLenis.scrollTo(window.scrollY, { immediate: true, force: true });
      }
      if (e.persisted) {
        scrollScenesStabilized = false;
        stabilizeScrollScenes();
      } else {
        queueScrollSceneRefresh();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) queueScrollSceneRefresh();
    });
  }
});

