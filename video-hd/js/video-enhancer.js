document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("drop-zone");
  const videoInput = document.getElementById("video-input");
  const processSection = document.getElementById("process-section");
  const videoPreview = document.getElementById("video-preview");
  const btnEnhance = document.getElementById("btn-enhance-video");
  const btnDownload = document.getElementById("btn-download-video");

  dropZone.addEventListener("click", () => videoInput.click());
  videoInput.addEventListener("change", handleFile);

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length) {
      videoInput.files = e.dataTransfer.files;
      handleFile();
    }
  });

  function handleFile() {
    const file = videoInput.files[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    videoPreview.src = fileUrl;

    dropZone.classList.add("hidden");
    processSection.classList.remove("hidden");
  }

  btnEnhance.addEventListener("click", () => {
    btnEnhance.innerText = "Enhancing Video...";
    btnEnhance.disabled = true;

    // Simulasi penajaman video pake CSS Filter pada player
    setTimeout(() => {
      videoPreview.style.filter = "contrast(115%) brightness(105%) saturate(110%)";
      btnEnhance.innerText = "Video Enhanced!";
      btnDownload.classList.remove("hidden");
      btnDownload.href = videoPreview.src;
    }, 2000);
  });
});