if (!window.supabase || !window.supabase.createClient) {
  console.error(
    "Supabase UMD chưa sẵn sàng – hãy đặt script Supabase trước file này (và dùng defer)."
  );
}
if (!window.SUPABASE_URL || !window.SUPABASE_KEY) {
  window.SUPABASE_URL = "https://quoniplztuaxcqncuirq.supabase.co";
  window.SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1b25pcGx6dHVheGNxbmN1aXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNTYxNjgsImV4cCI6MjA2NTYzMjE2OH0.nw0p8kBuV_-FuqZ0LtY8FEGPIFLUhzlWgn31ZbRWS-4";
}

const supabase = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY
);

// Ẩn nội dung trước khi pass
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.visibility = "hidden";
});

async function checkAccess() {
  try {
    // 1) Lấy folder hiện tại
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const currentFolder = pathParts[0] || "";

    // 2) Query Supabase
    const { data, error } = await supabase
      .from("template_list")
      .select("id, template_status")
      .eq("folder_name", currentFolder)
      .maybeSingle();

    if (error || !data || Number(data.status) !== 0) {
      window.location.href = "/error.html";
      return;
    }

    // 3) Cảnh báo console
    console.log("%cSTOP!", "font-size:48px;font-weight:bold;color:red;");
    console.log(
      "%cĐây là khu vực nhà phát triển. Đừng dán code lạ vào đây!",
      "font-size:16px"
    );

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
        for (let i = 0; i < 1e5; i++);
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
      debugger; // trick
      if (performance.now() - t0 > 200) {
        window.location.href = "/error.html";
      }
    }, 2000);
  } catch (err) {
    console.error("Lỗi checkAccess:", err);
    window.location.href = "/error.html";
  } finally {
    // Luôn hiện lại nội dung
    document.body.style.visibility = "visible";
  }
}

window.addEventListener("DOMContentLoaded", checkAccess);
