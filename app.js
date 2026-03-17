const viewer = document.getElementById("viewer");
const fileInput = document.getElementById("glbInput");
const dropzone = document.getElementById("dropzone");
const statusText = document.getElementById("status");
const remoteUrlInput = document.getElementById("remoteUrl");
const openRemoteButton = document.getElementById("openRemote");

let activeObjectUrl = null;

function setStatus(message, type = "") {
  statusText.textContent = message;
  statusText.classList.remove("error", "success");

  if (type) {
    statusText.classList.add(type);
  }
}

function clearObjectUrl() {
  if (!activeObjectUrl) {
    return;
  }

  URL.revokeObjectURL(activeObjectUrl);
  activeObjectUrl = null;
}

function setModelSource(src, label) {
  viewer.src = src;
  viewer.dismissPoster();
  setStatus(`Loading ${label}...`);
}

function isValidGlbUrl(urlValue) {
  try {
    const parsed = new URL(urlValue, window.location.href);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function loadFromFile(file) {
  if (!file) {
    return;
  }

  if (!file.name.toLowerCase().endsWith(".glb")) {
    setStatus("Please upload a valid .glb file.", "error");
    return;
  }

  clearObjectUrl();
  activeObjectUrl = URL.createObjectURL(file);
  setModelSource(activeObjectUrl, file.name);
}

function loadFromUrl(url) {
  const cleanUrl = url.trim();

  if (!isValidGlbUrl(cleanUrl)) {
    setStatus("Please enter a valid http or https model URL.", "error");
    return;
  }

  clearObjectUrl();
  setModelSource(cleanUrl, "model URL");
}

viewer.addEventListener("load", () => {
  setStatus("Model loaded successfully.", "success");
});

viewer.addEventListener("error", () => {
  setStatus("Could not load model. Check file format, URL, or CORS settings.", "error");
});

fileInput.addEventListener("change", (event) => {
  loadFromFile(event.target.files?.[0]);
});

openRemoteButton.addEventListener("click", () => {
  loadFromUrl(remoteUrlInput.value);
});

remoteUrlInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    loadFromUrl(remoteUrlInput.value);
  }
});

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("active");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("active");
  });
});

dropzone.addEventListener("drop", (event) => {
  const file = event.dataTransfer?.files?.[0];
  loadFromFile(file);
});

dropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

const urlParams = new URLSearchParams(window.location.search);
const sharedModelUrl = urlParams.get("model");

if (sharedModelUrl) {
  remoteUrlInput.value = sharedModelUrl;
  loadFromUrl(sharedModelUrl);
} else {
  setStatus("No model loaded.");
}
