// --- check_access.js (fixed & hardened) ---

// 1) Bảo đảm thư viện Supabase đã có
if (!window.supabase || !window.supabase.createClient) {
  console.error(
    "Supabase UMD chưa sẵn sàng – hãy đặt script Supabase trước file này (và dùng defer)."
  );
}

// 2) Chỉ gán nếu chưa có (tránh redeclare)
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
      .maybeSingle(); // an toàn hơn .single()

    row = data || null;

    if (error || !row || Number(row.status) !== 0) {
      window.location.href = "/error.html";
      return;
    }

    // --- ĐÃ PASS: bật nội dung & setup chống copy/devtools ---
    console.log("%cSTOP!", "font-size:48px;font-weight:bold;color:red;");
    console.log(
      "%cĐây là khu vực nhà phát triển. Đừng dán code lạ vào đây!",
      "font-size:16px"
    );

    // Chặn chuột phải & phím tắt phổ biến
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("keydown", (e) => {
      const k = (e.key || "").toLowerCase();
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(k)) ||
        (e.ctrlKey && ["u", "s"].includes(k))
      ) {
        e.preventDefault();
        alert("Không được phép!");
      }
    });

    // Phát hiện DevTools: size-check + jitter time (không dùng debugger để tránh treo)
    const detectDevTools = () => {
      const gapW = Math.abs(window.outerWidth - window.innerWidth);
      const gapH = Math.abs(window.outerHeight - window.innerHeight);
      if (gapW > 160 || gapH > 160) return true;

      // Jitter timing: công việc nhỏ rồi đo thời gian
      const t0 = performance.now();
      for (let i = 0; i < 1e5; i++); // vòng lặp nhẹ
      const t1 = performance.now();
      return t1 - t0 > 60; // ngưỡng tuỳ trình duyệt
    };

    let antiDevTimer = setInterval(async () => {
      try {
        if (detectDevTools()) {
          clearInterval(antiDevTimer);
          try {
            await supabase
              .from("themes_status")
              .update({ status: 1 })
              .eq("id", row.id);
          } catch (e) {
            console.error("Update status thất bại:", e);
          }
          window.location.href = "/error.html";
        }
      } catch (e) {
        // Bất kỳ lỗi nào cũng chuyển hướng phòng thủ
        clearInterval(antiDevTimer);
        window.location.href = "/error.html";
      }
    }, 800);

    // Self-defending (giảm tải xuống 5s/lần)
    setInterval(() => {
      try {
        (function f() {
          ("" + f).includes("[native code]") || eval("throw 'blocked'");
        })();
      } catch {
        window.location.href = "/error.html";
      }
    }, 5000);
  } catch (err) {
    console.error("Lỗi checkAccess:", err);
    window.location.href = "/error.html";
  } finally {
    // Luôn hiện lại nội dung tránh trắng trang khi có lỗi JS khác
    document.body.style.visibility = "visible";
  }
}

window.addEventListener("DOMContentLoaded", checkAccess);
