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
  // Use an attribute write so the src survives even if the custom element is not upgraded yet.
  viewer.setAttribute("src", src);

  if (typeof viewer.dismissPoster === "function") {
    viewer.dismissPoster();
  }

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

function buildRoutePathForModel(url) {
  return `/${encodeURIComponent(url)}`;
}

function updateAddressBarWithModel(url) {
  const nextPath = buildRoutePathForModel(url);
  const nextUrl = `${nextPath}${window.location.hash}`;

  if (`${window.location.pathname}${window.location.hash}` === nextUrl && !window.location.search) {
    return;
  }

  window.history.replaceState({}, "", nextUrl);
}

function getModelUrlFromRoute() {
  const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, "");

  if (!rawPath || rawPath.toLowerCase() === "index.html") {
    return null;
  }

  try {
    return decodeURIComponent(rawPath);
  } catch {
    return null;
  }
}

function loadFromUrl(url, { syncRoute = true } = {}) {
  const cleanUrl = url.trim();

  if (!isValidGlbUrl(cleanUrl)) {
    setStatus("Please enter a valid http or https model URL.", "error");
    return;
  }

  if (syncRoute) {
    updateAddressBarWithModel(cleanUrl);
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
const routeModelUrl = getModelUrlFromRoute();
const initialModelUrl = routeModelUrl || sharedModelUrl;

if (initialModelUrl) {
  remoteUrlInput.value = initialModelUrl;
  loadFromUrl(initialModelUrl, { syncRoute: false });
} else {
  setStatus("No model loaded.");
}
