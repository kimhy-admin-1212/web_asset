// ✅ Chỉ gán nếu chưa có biến (tránh lỗi khai báo lại)
if (!window.SUPABASE_URL || !window.SUPABASE_KEY) {
  window.SUPABASE_URL = "https://quoniplztuaxcqncuirq.supabase.co";
  window.SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1b25pcGx6dHVheGNxbmN1aXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNTYxNjgsImV4cCI6MjA2NTYzMjE2OH0.nw0p8kBuV_-FuqZ0LtY8FEGPIFLUhzlWgn31ZbRWS-4";
}

// ✅ Supabase UMD cần dòng này nếu bạn dùng bản supabase.min.js
const supabase = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY
);

const currentFolder = window.location.pathname.split("/")[1];

// ✅ Ẩn body trước khi kiểm tra
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.visibility = "hidden"; // chỉ ẩn tạm
});

async function checkAccess() {
  const { data, error } = await supabase
    .from("themes_status")
    .select("id, status")
    .eq("folder_name", currentFolder)
    .single();

  if (error || !data || Number(data.status) !== 0) {
    window.location.href = "/error.html";
    return;
  } else {
    document.body.style.visibility = "visible"; // hiện lại

    (function () {
      console.log("%cSTOP!", "font-size:48px;font-weight:bold;color:red;");
      console.log(
        "%cĐây là khu vực nhà phát triển. Đừng dán code lạ vào đây!",
        "font-size:16px"
      );

      let antiDevInterval;

      // 🔎 Hàm chống DevTools
      async function antiDev() {
        if (
          window.outerWidth - window.innerWidth > 160 ||
          window.outerHeight - window.innerHeight > 160
        ) {
          try {
            await supabase
              .from("themes_status")
              .update({ status: 1 })
              .eq("id", data.id);
          } catch (err) {
            console.error("Lỗi update:", err);
          }
          clearInterval(antiDevInterval);
          window.location.href = "/error.html";
        }
      }

      // ⛔ Chặn phím tắt
      function blockKeys() {
        document.addEventListener("contextmenu", (e) => e.preventDefault());
        document.addEventListener("keydown", (e) => {
          const k = e.key.toLowerCase();
          if (
            e.key === "F12" ||
            (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(k)) ||
            (e.ctrlKey && ["u", "s"].includes(k))
          ) {
            e.preventDefault();
            alert("Không được phép!");
          }
        });
      }

      // 🛡️ Anti-debug
      function antiDebug() {
        setInterval(function () {
          const s = performance.now();
          const e = performance.now();
          if (e - s > 200) {
            window.location.href = "/error.html";
          }
        }, 1000);
      }

      // 🌀 Self-defending
      setInterval(function () {
        try {
          (function f() {
            ("" + f).includes("[native code]") || eval("throw 'blocked'");
          })();
        } catch (err) {
          window.location.href = "/error.html";
        }
      }, 5000);

      // 🚀 Khởi chạy
      window.addEventListener("load", () => {
        document.body.style.display = "block";
        blockKeys();
        antiDebug();
        antiDevInterval = setInterval(antiDev, 1000);
      });
    })();
  }
}

window.addEventListener("DOMContentLoaded", checkAccess);
