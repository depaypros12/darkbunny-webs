document.addEventListener("DOMContentLoaded", () => {
  const introScreen = document.getElementById("intro-screen");

  if (!introScreen) return;

  // Cek apakah user pernah lihat intro
  if (sessionStorage.getItem("hasSeenIntro")) {
    introScreen.remove();
  } else {
    // Tampilkan animasi 2 detik lalu fade out & hapus dari HTML
    setTimeout(() => {
      introScreen.classList.add("fade-out");
      sessionStorage.setItem("hasSeenIntro", "true");

      setTimeout(() => {
        if (introScreen) introScreen.remove();
      }, 800);
    }, 2000);
  }
});