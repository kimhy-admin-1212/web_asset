// Ẩn nội dung trước khi pass
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.visibility = "hidden";
});

async function checkAccess() {
  try {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile) {
      // --- MOBILE ---
      document.addEventListener("copy", (e) => e.preventDefault());
      document.addEventListener("cut", (e) => e.preventDefault());
      document.addEventListener("selectstart", (e) => e.preventDefault());

      let touchTimer = 0;
      document.addEventListener(
        "touchstart",
        () => {
          touchTimer = Date.now();
        },
        { passive: true }
      );

      document.addEventListener(
        "touchend",
        () => {
          const duration = Date.now() - touchTimer;
          if (duration > 500) {
            console.warn("⚠️ Người dùng long-press!");
            // window.location.href = "/error.html";
          }
          touchTimer = 0;
        },
        { passive: true }
      );
    } else {
      // --- DESKTOP ---
      document.addEventListener("contextmenu", (e) => e.preventDefault());

      function blockKeys(e) {
        const k = (e.key || "").toLowerCase();
        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(k)) ||
          (e.ctrlKey && ["u", "s"].includes(k))
        ) {
          e.preventDefault();
          window.location.href = "/error.html";
          return false;
        }
      }
      document.addEventListener("keydown", blockKeys, true);

      // Detect DevTools (gap + jitter)
      const detectDevTools = () => {
        const gapW = Math.abs(window.outerWidth - window.innerWidth);
        const gapH = Math.abs(window.outerHeight - window.innerHeight);
        if (gapW > 300 || gapH > 300) return true;

        const t0 = performance.now();
        for (let i = 0; i < 1e5; i++); // tạo jitter
        const t1 = performance.now();
        return t1 - t0 > 200;
      };

      const antiDev = setInterval(() => {
        try {
          if (detectDevTools()) {
            clearInterval(antiDev);
            window.location.href = "/error.html";
          }
        } catch {
          clearInterval(antiDev);
          window.location.href = "/error.html";
        }
      }, 800);
    }

    // --- Self-defending ---
    setInterval(() => {
      const t0 = performance.now();
      debugger; // trick phát hiện mở DevTools
      if (performance.now() - t0 > 200) {
        window.location.href = "/error.html";
      }
    }, 2000);
  } catch (err) {
    console.error("Lỗi checkAccess:", err);
    window.location.href = "/error.html";
  } finally {
    // Luôn hiện lại nội dung sau khi kiểm tra xong
    document.body.style.visibility = "visible";
  }
}

// Gọi checkAccess khi DOM sẵn sàng
window.addEventListener("DOMContentLoaded", () => {
  checkAccess();
});
