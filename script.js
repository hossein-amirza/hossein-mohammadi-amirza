/* =========================================================
   SCRIPT.JS — کاملاً هماهنگ با index.html و style.css
   تمام تعاملات، انیمیشن‌ها، تم، منو و شمارنده‌ها در اینجا مدیریت می‌شوند.
========================================================== */

(function () {
  "use strict";

  // =========================================================
  // ELEMENTS
  // =========================================================

  const body = document.body;
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const mainNavigation = document.getElementById("mainNavigation");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle ? themeToggle.querySelector(".theme-icon") : null;
  const progressBar = document.getElementById("readingProgressBar");
  const notification = document.getElementById("notification");
  const notificationMessage = document.getElementById("notificationMessage");

  // =========================================================
  // MOBILE MENU
  // =========================================================

  function closeMenu() {
    if (!menuToggle || !mainNavigation) return;
    menuToggle.setAttribute("aria-expanded", "false");
    mainNavigation.classList.remove("is-open");
    body.classList.remove("menu-open");
  }

  function openMenu() {
    if (!menuToggle || !mainNavigation) return;
    menuToggle.setAttribute("aria-expanded", "true");
    mainNavigation.classList.add("is-open");
    body.classList.add("menu-open");
  }

  if (menuToggle && mainNavigation) {
    menuToggle.addEventListener("click", function () {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // بستن منو با کلیک روی هر لینک
    mainNavigation.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  // بستن منو با کلید Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  // =========================================================
  // SMOOTH ANCHOR SCROLL
  // =========================================================

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });

  // =========================================================
  // HEADER SCROLL STATE
  // =========================================================

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 60);
  }

  // =========================================================
  // READING PROGRESS BAR
  // =========================================================

  function updateProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + "%";
  }

  // =========================================================
  // BACK TO TOP BUTTON
  // =========================================================

  function updateScrollButton() {
    if (!scrollTopBtn) return;
    scrollTopBtn.classList.toggle("visible", window.scrollY > 700);
  }

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // =========================================================
  // SCROLL LISTENER
  // =========================================================

  window.addEventListener(
    "scroll",
    function () {
      updateHeader();
      updateProgress();
      updateScrollButton();
    },
    { passive: true }
  );

  // مقداردهی اولیه
  updateHeader();
  updateProgress();
  updateScrollButton();

  // =========================================================
  // THEME (DARK / LIGHT MODE)
  // =========================================================

  // بازیابی تم ذخیره‌شده
  const savedTheme = localStorage.getItem("hma-theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  }

  function updateThemeIcon() {
    if (!themeIcon) return;
    themeIcon.textContent = body.classList.contains("dark-mode") ? "☀" : "◐";
  }

  updateThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const isDark = body.classList.toggle("dark-mode");
      localStorage.setItem("hma-theme", isDark ? "dark" : "light");
      updateThemeIcon();

      // اعلان تغییر تم (اختیاری)
      showNotification(isDark ? "حالت تاریک فعال شد" : "حالت روشن فعال شد");
    });
  }

  // =========================================================
  // STATS COUNTER ANIMATION
  // =========================================================

  const statNumbers = document.querySelectorAll(".stat-number");

  function toPersianNumber(value) {
    return String(value).replace(/\d/g, function (d) {
      return "۰۱۲۳۴۵۶۷۸۹"[d];
    });
  }

  function animateStats() {
    statNumbers.forEach(function (element) {
      const target = parseInt(element.dataset.count, 10);
      if (isNaN(target)) return;

      let current = 0;
      const duration = 1000;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.round(target * eased);
        element.textContent = toPersianNumber(current);
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      }
      requestAnimationFrame(tick);
    });
  }

  // =========================================================
  // INTERSECTION OBSERVER FOR STATS
  // =========================================================

  const statsSection = document.querySelector(".stats-section");
  let statsAnimated = false;

  if (statsSection && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            animateStats();
            observer.unobserve(statsSection);
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(statsSection);
  } else if (statsSection) {
    // Fallback برای مرورگرهای قدیمی
    animateStats();
  }

  // =========================================================
  // NOTIFICATION SYSTEM
  // =========================================================

  function showNotification(message, duration) {
    if (!notification || !notificationMessage) return;

    notificationMessage.textContent = message || "عملیات با موفقیت انجام شد.";
    notification.classList.add("show");

    clearTimeout(notification._timeout);
    notification._timeout = setTimeout(function () {
      notification.classList.remove("show");
    }, duration || 4000);
  }

  // دکمه بستن اعلان
  const notificationClose = notification
    ? notification.querySelector("button")
    : null;

  if (notificationClose) {
    notificationClose.addEventListener("click", function () {
      notification.classList.remove("show");
    });
  }

  // =========================================================
  // SUGGEST BOOK FORM (در صورت وجود در صفحه)
  // =========================================================

  const suggestForm = document.getElementById("suggestBookForm");

  if (suggestForm) {
    suggestForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showNotification("📚 پیشنهاد شما با موفقیت ثبت شد!");
      this.reset();
    });
  }

  // =========================================================
  // REDUCE MOTION (دسترسی‌پذیری)
  // =========================================================

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("reduce-motion");
  }

  // =========================================================
  // CONSOLE WELCOME
  // =========================================================

  console.log(
    "%c📚 حسین محمدی آمیرزا",
    "font-size:20px; font-weight:bold; color:#b78a3b;"
  );
  console.log(
    "%cنویسنده، شاعر، پژوهشگر تاریخ و فیلمنامه‌نویس",
    "font-size:14px; color:#766960;"
  );
  console.log(
    "%cوب‌سایت رسمی — تمامی حقوق محفوظ است.",
    "font-size:12px; color:#a8988a;"
  );

  // =========================================================
  // EXPOSE FUNCTIONS TO GLOBAL (برای استفاده در inline HTML)
  // =========================================================

  window.showNotification = showNotification;
  window.closeMenu = closeMenu;
  window.openMenu = openMenu;

})();
