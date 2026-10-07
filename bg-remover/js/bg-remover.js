document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("drop-zone");
  const bgPhotoInput = document.getElementById("bg-photo-input");
  const processSection = document.getElementById("process-section");
  const imgOriginal = document.getElementById("img-original");
  const imgResult = document.getElementById("img-result");
  const loadingSpinner = document.getElementById("loading-spinner");
  const loadingText = document.getElementById("loading-text");

  const btnRemoveBg = document.getElementById("btn-remove-bg");
  const btnDownloadBg = document.getElementById("btn-download-bg");
  const canvas = document.getElementById("process-canvas");
  const ctx = canvas.getContext("2d");

  let imageSegmenter = null;

  dropZone.addEventListener("click", () => bgPhotoInput.click());
  bgPhotoInput.addEventListener("change", handleFileSelect);

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length) {
      bgPhotoInput.files = e.dataTransfer.files;
      handleFileSelect();
    }
  });

  function handleFileSelect() {
    const file = bgPhotoInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      imgOriginal.src = e.target.result;

      imgResult.src = "";
      imgResult.classList.add("hidden");
      btnDownloadBg.classList.add("hidden");
      btnRemoveBg.innerText = "Hapus Background";
      btnRemoveBg.disabled = false;

      dropZone.classList.add("hidden");
      processSection.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }

  async function initSegmenter() {
    if (imageSegmenter) return;

    const vision = await window.tasksVision.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );

    // Coba delegasi GPU dulu, kalau gagal otomatis switch ke CPU
    try {
      imageSegmenter = await window.tasksVision.ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
          delegate: "GPU"
        },
        runningMode: "IMAGE",
        outputCategoryMask: true,
        outputConfidenceMasks: false
      });
    } catch (gpuErr) {
      console.warn("GPU WebGL gagal, mencoba fallback ke CPU...", gpuErr);
      imageSegmenter = await window.tasksVision.ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
          delegate: "CPU"
        },
        runningMode: "IMAGE",
        outputCategoryMask: true,
        outputConfidenceMasks: false
      });
    }
  }

  btnRemoveBg.addEventListener("click", async () => {
    if (!imgOriginal.src) return;

    btnRemoveBg.innerText = "Memproses AI...";
    btnRemoveBg.disabled = true;
    loadingSpinner.classList.remove("hidden");
    imgResult.classList.add("hidden");

    try {
      loadingText.innerText = "Membuka Model AI...";
      await initSegmenter();

      loadingText.innerText = "Memotong Latar Belakang...";

      const img = new Image();
      img.src = imgOriginal.src;
      await img.decode();

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.drawImage(img, 0, 0);
      const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const segmentationResult = imageSegmenter.segment(img);
      const categoryMask = segmentationResult.categoryMask;
      const maskData = categoryMask.getAsUint8Array();

      const pixels = originalImageData.data;
      for (let i = 0; i < maskData.length; i++) {
        // Jika piksel bernilai 0 (Background), ubah nilai alpha menjadi 0 (transparan)
        if (maskData[i] === 0) {
          pixels[i * 4 + 3] = 0;
        }
      }

      ctx.putImageData(originalImageData, 0, 0);

      const finalUrl = canvas.toDataURL("image/png");
      imgResult.src = finalUrl;

      loadingSpinner.classList.add("hidden");
      imgResult.classList.remove("hidden");

      btnRemoveBg.innerText = "Background Removed!";
      btnDownloadBg.classList.remove("hidden");
      btnDownloadBg.href = finalUrl;

    } catch (err) {
      console.error("Detail Error:", err);
      alert("Gagal memproses gambar. Pastikan project dibuka via Live Server (http://localhost), bukan file:///");
      loadingSpinner.classList.add("hidden");
      btnRemoveBg.innerText = "Coba Lagi";
      btnRemoveBg.disabled = false;
    }
  });
});