const SUPABASE_URL = "https://quoniplztuaxcqncuirq.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1b25pcGx6dHVheGNxbmN1aXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNTYxNjgsImV4cCI6MjA2NTYzMjE2OH0.nw0p8kBuV_-FuqZ0LtY8FEGPIFLUhzlWgn31ZbRWS-4";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const currentFolder = window.location.pathname.split("/")[1]; // "theme_01", "theme_02", etc.

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
  }
}

document.body.style.display = "none";
checkAccess();
window.addEventListener("DOMContentLoaded", checkAccess);
