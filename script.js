(() => {
  "use strict";

  const config = window.BIRTHDAY_CONFIG || {};
  const fallbackPhoto = "assets/photos/IMG_20240322_125737.jpg";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const state = {
    uploadedPhotos: [],
    audioContext: null,
    musicPlaying: false,
    musicTimer: null,
    melodyIndex: 0,
    toastTimer: null
  };

  const safePhotos = Array.isArray(config.photos) && config.photos.length
    ? config.photos
    : [{ src: fallbackPhoto, caption: "A beautiful memory" }];

  function applyContent() {
    const personName = config.personName || "Someone Special";
    const senderName = config.senderName || "Your Person";

    $$('[data-person-name]').forEach((element) => {
      element.textContent = personName;
    });

    document.title = `Happy Birthday, ${personName} ✨`;
    $("#heroMessage").textContent = config.heroMessage || "Wishing you the happiest birthday.";
    $("#storyIntro").textContent = config.storyIntro || "Every chapter feels brighter with you in it.";
    $("#letterDate").textContent = config.letterDate || "On your special day";
    $("#senderName").textContent = senderName;
    $("#footerYear").textContent = `A special birthday • ${new Date().getFullYear()}`;

    const letterBody = $("#letterBody");
    letterBody.className = "letter-body";
    const paragraphs = Array.isArray(config.letterParagraphs) ? config.letterParagraphs : [];
    paragraphs.forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      letterBody.appendChild(p);
    });

    const photoAt = (index) => safePhotos[index % safePhotos.length]?.src || fallbackPhoto;
    $("#heroPhotoOne").src = photoAt(0);
    $("#heroPhotoTwo").src = photoAt(1);
    $("#heroPhotoThree").src = photoAt(2);
    $("#letterPhoto").src = photoAt(3);
  }

  function renderTimeline() {
    const timeline = $("#timeline");
    const items = Array.isArray(config.timeline) ? config.timeline : [];
    timeline.replaceChildren();

    items.forEach((item, index) => {
      const wrapper = document.createElement("article");
      wrapper.className = "timeline-item reveal";
      wrapper.style.transitionDelay = `${index * 100}ms`;

      const dot = document.createElement("span");
      dot.className = "timeline-dot";

      const card = document.createElement("div");
      card.className = "timeline-card";

      const label = document.createElement("small");
      label.textContent = item.label || `Memory ${index + 1}`;

      const title = document.createElement("h3");
      title.textContent = item.title || "A favorite chapter";

      const text = document.createElement("p");
      text.textContent = item.text || "A memory worth keeping close.";

      card.append(label, title, text);
      wrapper.append(dot, card);
      timeline.appendChild(wrapper);
    });
  }

  function renderReasons() {
    const grid = $("#reasonGrid");
    const items = Array.isArray(config.reasons) ? config.reasons : [];
    grid.replaceChildren();

    items.forEach((item, index) => {
      const article = document.createElement("article");
      article.className = "reason-card reveal";
      article.style.transitionDelay = `${(index % 3) * 90}ms`;

      const icon = document.createElement("span");
      icon.className = "reason-icon";
      icon.textContent = item.icon || "♡";

      const title = document.createElement("h3");
      title.textContent = item.title || "Your magic";

      const text = document.createElement("p");
      text.textContent = item.text || "You make the world a little brighter.";

      article.append(icon, title, text);
      grid.appendChild(article);
    });
  }

  function createMemoryCard(photo, index) {
    const card = document.createElement("figure");
    card.className = "memory-card reveal";
    card.tabIndex = 0;
    card.style.transitionDelay = `${(index % 3) * 70}ms`;

    const image = document.createElement("img");
    image.src = photo.src || fallbackPhoto;
    image.alt = photo.caption || `Birthday memory ${index + 1}`;
    image.loading = index < 3 ? "eager" : "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      image.src = fallbackPhoto;
      image.alt = "Add your photo here";
    }, { once: true });

    const caption = document.createElement("figcaption");
    const captionText = document.createElement("span");
    captionText.textContent = photo.caption || "A memory to keep forever";
    const expandIcon = document.createElement("i");
    expandIcon.textContent = "↗";
    caption.append(captionText, expandIcon);

    const open = () => openLightbox(image.src, captionText.textContent);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });

    card.append(image, caption);
    return card;
  }

  function renderGallery() {
    const gallery = $("#gallery");
    gallery.replaceChildren(...safePhotos.map(createMemoryCard));
    observeReveals(gallery);
  }

  function openLightbox(src, caption) {
    const dialog = $("#lightbox");
    $("#lightboxImage").src = src;
    $("#lightboxCaption").textContent = caption;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeLightbox() {
    const dialog = $("#lightbox");
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  let revealObserver;
  function setupRevealObserver() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach((element) => element.classList.add("visible"));
      return;
    }

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px" });

    observeReveals(document);
  }

  function observeReveals(root) {
    if (!revealObserver) return;
    $$(".reveal:not(.visible)", root).forEach((element) => revealObserver.observe(element));
  }

  /* Photo storage */
  function openPhotoDatabase() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("Browser storage is unavailable"));
        return;
      }

      const request = indexedDB.open("birthday-surprise-gallery", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("photos")) {
          db.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function readUploadedPhotos() {
    try {
      const db = await openPhotoDatabase();
      const photos = await new Promise((resolve, reject) => {
        const transaction = db.transaction("photos", "readonly");
        const request = transaction.objectStore("photos").getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
      db.close();
      state.uploadedPhotos = photos.map((photo) => ({
        id: photo.id,
        src: photo.src,
        caption: photo.caption || "A newly added memory"
      }));
      renderGallery();
    } catch (error) {
      console.info("Photo storage could not be loaded:", error.message);
    }
  }

  async function saveUploadedPhotos(photos) {
    const db = await openPhotoDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction("photos", "readwrite");
      const store = transaction.objectStore("photos");
      photos.forEach((photo) => store.add(photo));
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  }

  async function clearPhotoDatabase() {
    const db = await openPhotoDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction("photos", "readwrite");
      const request = transaction.objectStore("photos").clear();
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
    });
    db.close();
  }

  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error(`${file.name} is not a valid image`));
        image.onload = () => {
          const maxSide = 1800;
          const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve({
            src: canvas.toDataURL("image/jpeg", 0.86),
            caption: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")
          });
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handlePhotoFiles(fileList) {
    const validFiles = [...fileList].filter((file) => file.type.startsWith("image/"));
    if (!validFiles.length) {
      showToast("Please choose JPG, PNG or WEBP photos.");
      return;
    }

    showToast(`Adding ${validFiles.length} beautiful ${validFiles.length === 1 ? "memory" : "memories"}…`);

    try {
      const prepared = [];
      for (const file of validFiles) {
        prepared.push(await compressImage(file));
      }
      await saveUploadedPhotos(prepared);
      await readUploadedPhotos();
      showToast(`${prepared.length} ${prepared.length === 1 ? "photo" : "photos"} added ♡`);
    } catch (error) {
      console.error(error);
      showToast("Photos could not be saved. Try smaller files.");
    }
  }

  function setupPhotoUpload() {
    const input = $("#photoUpload");
    const card = $("#uploadCard");

    input.addEventListener("change", (event) => {
      handlePhotoFiles(event.target.files);
      input.value = "";
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      card.addEventListener(eventName, (event) => {
        event.preventDefault();
        card.classList.add("dragging");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      card.addEventListener(eventName, (event) => {
        event.preventDefault();
        card.classList.remove("dragging");
      });
    });

    card.addEventListener("drop", (event) => handlePhotoFiles(event.dataTransfer.files));

    $("#clearUploaded").addEventListener("click", async () => {
      try {
        await clearPhotoDatabase();
        state.uploadedPhotos = [];
        renderGallery();
        showToast("Uploaded photos removed.");
      } catch (error) {
        showToast("Could not remove the photos.");
      }
    });
  }

  /* A tiny synthesized birthday melody: no audio file needed. */
  const melody = [
    [392.0, 0.28], [392.0, 0.18], [440.0, 0.48], [392.0, 0.48], [523.25, 0.48], [493.88, 0.85],
    [392.0, 0.28], [392.0, 0.18], [440.0, 0.48], [392.0, 0.48], [587.33, 0.48], [523.25, 0.85],
    [392.0, 0.28], [392.0, 0.18], [783.99, 0.48], [659.25, 0.48], [523.25, 0.48], [493.88, 0.48], [440.0, 0.8],
    [698.46, 0.28], [698.46, 0.18], [659.25, 0.48], [523.25, 0.48], [587.33, 0.48], [523.25, 0.9]
  ];

  function playTone(frequency, duration) {
    const context = state.audioContext;
    if (!context) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const overtone = context.createOscillator();
    const gain = context.createGain();
    const overtoneGain = context.createGain();

    oscillator.type = "sine";
    overtone.type = "triangle";
    oscillator.frequency.value = frequency;
    overtone.frequency.value = frequency * 2;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    overtoneGain.gain.value = 0.018;

    oscillator.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    overtone.start(now);
    oscillator.stop(now + duration + 0.04);
    overtone.stop(now + duration + 0.04);
  }

  async function startMusic() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      showToast("Music is not supported in this browser.");
      return;
    }

    if (!state.audioContext) state.audioContext = new AudioContext();
    await state.audioContext.resume();
    state.musicPlaying = true;
    state.melodyIndex = 0;
    $("#musicToggle").classList.add("playing");
    $("#musicToggle").setAttribute("aria-label", "Pause birthday music");
    playNextNote();
  }

  function playNextNote() {
    if (!state.musicPlaying) return;
    const [frequency, duration] = melody[state.melodyIndex];
    playTone(frequency, duration * 0.93);
    state.melodyIndex = (state.melodyIndex + 1) % melody.length;
    const pause = state.melodyIndex === 0 ? 850 : 70;
    state.musicTimer = window.setTimeout(playNextNote, duration * 1000 + pause);
  }

  function stopMusic() {
    state.musicPlaying = false;
    window.clearTimeout(state.musicTimer);
    $("#musicToggle").classList.remove("playing");
    $("#musicToggle").setAttribute("aria-label", "Play birthday music");
  }

  function toggleMusic(forcePlay = false) {
    if (forcePlay && state.musicPlaying) return;
    if (state.musicPlaying) stopMusic();
    else startMusic().catch(() => showToast("Tap the music button to play the tune."));
  }

  /* Confetti */
  function launchConfetti(amount = 170) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = $("#confetti-canvas");
    const context = canvas.getContext("2d");
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    context.scale(pixelRatio, pixelRatio);

    const colors = ["#e98d8c", "#b84c65", "#c99544", "#79866d", "#fff2dd"];
    const pieces = Array.from({ length: amount }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * 0.55,
      w: 5 + Math.random() * 8,
      h: 7 + Math.random() * 10,
      vx: -1.5 + Math.random() * 3,
      vy: 2.8 + Math.random() * 4.8,
      rotation: Math.random() * Math.PI,
      spin: -0.12 + Math.random() * 0.24,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    let frame = 0;
    function animate() {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let active = 0;
      pieces.forEach((piece) => {
        piece.x += piece.vx + Math.sin(frame / 22) * 0.25;
        piece.y += piece.vy;
        piece.rotation += piece.spin;
        if (piece.y < window.innerHeight + 30) active += 1;

        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.rotation);
        context.fillStyle = piece.color;
        context.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
        context.restore();
      });
      frame += 1;
      if (active > 0 && frame < 520) requestAnimationFrame(animate);
      else context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    animate();
  }

  function releaseHearts(origin) {
    const rect = origin.getBoundingClientRect();
    for (let index = 0; index < 12; index += 1) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.textContent = index % 3 === 0 ? "✦" : "♡";
      heart.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 50}px`;
      heart.style.top = `${rect.top}px`;
      heart.style.setProperty("--heart-x", `${(Math.random() - 0.5) * 130}px`);
      heart.style.animationDelay = `${index * 45}ms`;
      document.body.appendChild(heart);
      window.setTimeout(() => heart.remove(), 2000);
    }
    showToast("A sweet kiss has been delivered ♥");
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function setupInteractions() {
    document.body.classList.add("gate-open");

    $("#openSurprise").addEventListener("click", () => {
      $("#surpriseGate").classList.add("hidden");
      document.body.classList.remove("gate-open");
      launchConfetti();
      toggleMusic(true);
      window.setTimeout(() => $("#surpriseGate").remove(), 800);
    });

    $("#musicToggle").addEventListener("click", () => toggleMusic());
    $("#sendHug").addEventListener("click", (event) => releaseHearts(event.currentTarget));

    $("#blowCandles").addEventListener("click", () => {
      $("#candles").classList.add("out");
      $("#wishMessage").classList.add("show");
      launchConfetti(220);
      $("#blowCandles").textContent = "Your wish is safe in my heart ♡";
      $("#blowCandles").disabled = true;
    });

    $("#lightboxClose").addEventListener("click", closeLightbox);
    $("#lightbox").addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closeLightbox();
    });
  }

  function init() {
    applyContent();
    renderTimeline();
    renderReasons();
    renderGallery();
    setupRevealObserver();
    setupInteractions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
