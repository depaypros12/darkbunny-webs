document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("tiktok-url");
  const btnDownload = document.getElementById("btn-download");
  const btnText = document.getElementById("btn-text");
  const btnLoader = document.getElementById("btn-loader");
  const errorMsg = document.getElementById("error-msg");
  
  const resultCard = document.getElementById("result-card");
  const videoCover = document.getElementById("video-cover");
  const videoAuthor = document.getElementById("video-author");
  const videoTitle = document.getElementById("video-title");
  const dlNoWatermark = document.getElementById("dl-no-watermark");
  const dlAudio = document.getElementById("dl-audio");

  btnDownload.addEventListener("click", async () => {
    const inputUrl = urlInput.value.trim();

    // Validasi input
    if (!inputUrl) {
      showError("Tolong masukkan link TikTok dulu ya!");
      return;
    }

    if (!inputUrl.includes("tiktok.com")) {
      showError("URL tidak valid! Pastikan link berasal dari TikTok.");
      return;
    }

    hideError();
    setLoading(true);

    try {
      // Menggunakan TikWM API (Free Public API)
      const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(inputUrl)}`);
      const result = await response.json();

      if (result.code === 0 && result.data) {
        const data = result.data;

        // Populate Data ke Tampilan
        videoCover.src = data.cover;
        videoAuthor.textContent = `@${data.author.unique_id || data.author.nickname}`;
        videoTitle.textContent = data.title || "Video TikTok tanpa judul";

        dlNoWatermark.href = data.play; // Link MP4 tanpa watermark
        dlAudio.href = data.music;       // Link MP3 audio

        // Tampilkan Card Hasil
        resultCard.classList.remove("hidden");
      } else {
        showError("Gagal mengambil data video. Pastikan link video publik!");
      }
    } catch (err) {
      console.error(err);
      showError("Terjadi kesalahan koneksi. Coba lagi beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    if (isLoading) {
      btnText.classList.add("hidden");
      btnLoader.classList.remove("hidden");
      btnDownload.disabled = true;
    } else {
      btnText.classList.remove("hidden");
      btnLoader.classList.add("hidden");
      btnDownload.disabled = false;
    }
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove("hidden");
    resultCard.classList.add("hidden");
  }

  function hideError() {
    errorMsg.textContent = "";
    errorMsg.classList.add("hidden");
  }
});