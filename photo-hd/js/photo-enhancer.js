document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("drop-zone");
  const photoInput = document.getElementById("photo-input");
  const processSection = document.getElementById("process-section");
  const imgBefore = document.getElementById("img-before");
  const imgAfter = document.getElementById("img-after");
  const afterWrapper = document.getElementById("after-wrapper");
  const sliderRange = document.getElementById("slider-range");
  const sliderButton = document.getElementById("slider-button");
  const btnEnhance = document.getElementById("btn-enhance");
  const btnDownload = document.getElementById("btn-download-photo");

  dropZone.addEventListener("click", () => photoInput.click());
  photoInput.addEventListener("change", handleFile);

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length) {
      photoInput.files = e.dataTransfer.files;
      handleFile();
    }
  });

  function handleFile() {
    const file = photoInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imgUrl = e.target.result;
      imgBefore.src = imgUrl;
      imgAfter.src = imgUrl;

      dropZone.classList.add("hidden");
      processSection.classList.remove("hidden");

      setTimeout(() => {
        imgAfter.style.width = `${imgBefore.offsetWidth}px`;
      }, 100);
    };
    reader.readAsDataURL(file);
  }

  sliderRange.addEventListener("input", (e) => {
    const sliderValue = e.target.value;
    afterWrapper.style.width = `${sliderValue}%`;
    sliderButton.style.left = `${sliderValue}%`;
  });

  // Algoritma Sharpening (Konvolusi Matriks) tanpa API
  function sharpenImage(ctx, width, height, mix) {
    const weights = [
      0, -1,  0,
     -1,  5, -1,
      0, -1,  0
    ];
    
    const katet = Math.round(Math.sqrt(weights.length));
    const half = (katet * 0.5) | 0;
    const imgData = ctx.getImageData(0, 0, width, height);
    const dstData = ctx.createImageData(width, height);
    const src = imgData.data;
    const dst = dstData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sy = y;
        const sx = x;
        const dstOff = (y * width + x) * 4;
        let r = 0, g = 0, b = 0;

        for (let cy = 0; cy < katet; cy++) {
          for (let cx = 0; cx < katet; cx++) {
            const scy = sy + cy - half;
            const scx = sx + cx - half;

            if (scy >= 0 && scy < height && scx >= 0 && scx < width) {
              const srcOff = (scy * width + scx) * 4;
              const wt = weights[cy * katet + cx];
              r += src[srcOff] * wt;
              g += src[srcOff + 1] * wt;
              b += src[srcOff + 2] * wt;
            }
          }
        }

        dst[dstOff] = r * mix + src[dstOff] * (1 - mix);
        dst[dstOff + 1] = g * mix + src[dstOff + 1] * (1 - mix);
        dst[dstOff + 2] = b * mix + src[dstOff + 2] * (1 - mix);
        dst[dstOff + 3] = src[dstOff + 3];
      }
    }
    ctx.putImageData(dstData, 0, 0);
  }

  // Proses Enhance HD
  btnEnhance.addEventListener("click", () => {
    btnEnhance.innerText = "Processing HD...";
    btnEnhance.disabled = true;

    setTimeout(() => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Upscale resolusi 2x lipat
      const scale = 2;
      canvas.width = imgBefore.naturalWidth * scale;
      canvas.height = imgBefore.naturalHeight * scale;

      // Filter penjernih warna dasar
      ctx.filter = "contrast(110%) brightness(103%) saturate(105%)";
      ctx.drawImage(imgBefore, 0, 0, canvas.width, canvas.height);

      // Jalankan algoritma sharpening per piksel
      sharpenImage(ctx, canvas.width, canvas.height, 0.4);

      const enhancedUrl = canvas.toDataURL("image/png", 1.0);
      imgAfter.src = enhancedUrl;

      btnEnhance.innerText = "Photo Enhanced!";
      btnDownload.classList.remove("hidden");
      btnDownload.href = enhancedUrl;
    }, 500);
  });

  window.addEventListener("resize", () => {
    if (imgBefore.offsetWidth > 0) {
      imgAfter.style.width = `${imgBefore.offsetWidth}px`;
    }
  });
});