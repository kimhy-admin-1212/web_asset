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

// 3) Lấy folder an toàn
const pathParts = window.location.pathname.split("/").filter(Boolean);
const currentFolder = pathParts[0] || "";

// 4) Ẩn mềm nội dung cho tới khi pass
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.visibility = "hidden";
});

async function checkAccess() {
  let row = null;

  try {
    const { data, error } = await supabase
      .from("themes_status")
      .select("id, status")
      .eq("folder_name", currentFolder)
      .maybeSingle();

    row = data || null;

    if (error || !row || Number(row.status) !== 0) {
      window.location.href = "/error.html";
      return;
    }

    // --- ĐÃ PASS: bật nội dung & setup bảo vệ ---
    console.log("%cSTOP!", "font-size:48px;font-weight:bold;color:red;");
    console.log(
      "%cĐây là khu vực nhà phát triển. Đừng dán code lạ vào đây!",
      "font-size:16px"
    );

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile) {
      // --- MOBILE: chống copy, chống long-press ---
      document.addEventListener("copy", (e) => e.preventDefault());
      document.addEventListener("cut", (e) => e.preventDefault());
      document.addEventListener("selectstart", (e) => e.preventDefault());

      // Chặn menu long-press
      document.addEventListener(
        "touchstart",
        function preventLongPress(e) {
          if (e.touches.length > 1) return; // cho phép zoom 2 ngón
          e.preventDefault();
        },
        { passive: false }
      );
    } else {
      // --- DESKTOP: chống chuột phải + phím tắt ---
      document.addEventListener("contextmenu", (e) => e.preventDefault());

      let badKeyCount = 0;
      async function blockKeys(e) {
        const k = (e.key || "").toLowerCase();

        if (
          e.key === "F12" ||
          (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(k)) ||
          (e.ctrlKey && ["u", "s"].includes(k))
        ) {
          e.preventDefault();
          e.stopPropagation();

          badKeyCount++;
          window.location.href = "/error.html";
          return false;
        }
      }
      document.addEventListener("keydown", blockKeys, true);
      document.addEventListener("keyup", blockKeys, true);

      // --- Phát hiện DevTools ---
      const detectDevTools = () => {
        const gapW = Math.abs(window.outerWidth - window.innerWidth);
        const gapH = Math.abs(window.outerHeight - window.innerHeight);
        if (gapW > 300 || gapH > 300) return true;

        // Jitter timing
        const t0 = performance.now();
        for (let i = 0; i < 1e5; i++);
        const t1 = performance.now();
        return t1 - t0 > 200;
      };

      let antiDevTimer = setInterval(async () => {
        try {
          if (detectDevTools()) {
            clearInterval(antiDevTimer);
            window.location.href = "/error.html";
          }
        } catch (e) {
          clearInterval(antiDevTimer);
          window.location.href = "/error.html";
        }
      }, 800);
    }

    // --- Self-defending (cả mobile & desktop) ---
    setInterval(() => {
      try {
        if (
          window.console &&
          console.log.toString().indexOf("[native code]") === -1
        ) {
          throw "blocked";
        }
      } catch {
        window.location.href = "/error.html";
      }
    }, 5000);
  } catch (err) {
    console.error("Lỗi checkAccess:", err);
    window.location.href = "/error.html";
  } finally {
    // Luôn hiện lại nội dung tránh trắng trang khi có lỗi khác
    document.body.style.visibility = "visible";
  }
}

window.addEventListener("DOMContentLoaded", checkAccess);
