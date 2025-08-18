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

// ✅ Lấy tên thư mục từ URL
const currentFolder = window.location.pathname.split("/")[1];

// ✅ Ẩn body trước khi kiểm tra
document.body.style.display = "none";

async function checkAccess() {
  const { data, error } = await supabase
    .from("themes_status")
    .select("status")
    .eq("folder_name", currentFolder)
    .single();

  if (error || !data || Number(data.status) !== 0) {
    window.location.href = "/error.html";
  } else {
    document.body.style.display = "block";

    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j"].includes(key)) ||
        (e.ctrlKey && key === "u")
      ) {
        e.preventDefault();
        alert("Không được phép!");
      }
    });

    // 🛑 Cảnh báo trong Console
    console.log("%cDừng lại!", "font-size:48px;font-weight:bold;color:red;");
    console.log(
      "%cĐây là tính năng của trình duyệt cho nhà phát triển. Đừng dán code lạ vào đây, bạn có thể bị lừa mất tài khoản.",
      "font-size:16px;"
    );
  }
}

// ✅ Gọi hàm sau khi DOM đã sẵn sàng
window.addEventListener("DOMContentLoaded", checkAccess);
