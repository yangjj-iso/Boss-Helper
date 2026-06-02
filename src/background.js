const DEFAULT_SETTINGS = {
  jobKeywords: "",
  locationKeywords: "",
  salaryKeywords: "",
  companyKeywords: "",
  excludeCompanyKeywords: "",
  recruiterActiveStatuses: [],
  greetTemplate: "您好，我对{jobTitle}岗位很感兴趣，已认真阅读职位描述，期待进一步沟通。",
  sendImageResume: false,
  imageResumeFileName: "",
  imageResumeDataUrl: "",
  imageResumeMimeType: "",
  autoGreet: true,
  autoNext: true,
  enabled: true,
  pollIntervalMs: 1800
};

const DEFAULT_RUNTIME = {
  lastStartAt: "",
  lastStatus: "idle"
};

let advancedWindowId = null;

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  const runtime = await chrome.storage.local.get(DEFAULT_RUNTIME);

  await chrome.storage.local.set({
    ...DEFAULT_SETTINGS,
    ...settings,
    ...DEFAULT_RUNTIME,
    ...runtime
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "boss-helper:get-settings") {
    chrome.storage.local.get(DEFAULT_SETTINGS).then((settings) => {
      sendResponse({ ok: true, settings });
    }).catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error) });
    });
    return true;
  }

  if (message?.type === "boss-helper:save-settings") {
    chrome.storage.local.get(DEFAULT_SETTINGS).then((currentSettings) => {
      const nextSettings = normalizeSettings({
        ...currentSettings,
        ...message.payload
      });
      return chrome.storage.local.set(nextSettings).then(() => {
        sendResponse({ ok: true, settings: nextSettings });
      });
    }).catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error) });
    });
    return true;
  }

  if (message?.type === "boss-helper:update-runtime") {
    const nextRuntime = {
      ...DEFAULT_RUNTIME,
      ...message.payload
    };
    chrome.storage.local.set(nextRuntime).then(() => {
      sendResponse({ ok: true, runtime: nextRuntime });
    }).catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error) });
    });
    return true;
  }

  if (message?.type === "boss-helper:start-delivery") {
    const runtime = {
      lastStartAt: new Date().toISOString(),
      lastStatus: "running"
    };

    chrome.storage.local.set(runtime).then(() => {
      sendResponse({
        ok: true,
        runtime,
        message: "后台已记录启动状态，自动流程由内容脚本在页面内执行。"
      });
    }).catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error) });
    });
    return true;
  }

  if (message?.type === "boss-helper:open-advanced-window") {
    openAdvancedWindow().then((windowId) => {
      sendResponse({ ok: true, windowId });
    }).catch((error) => {
      sendResponse({ ok: false, error: error?.message || String(error) });
    });
    return true;
  }
});

chrome.windows?.onRemoved?.addListener((windowId) => {
  if (windowId === advancedWindowId) {
    advancedWindowId = null;
  }
});

async function openAdvancedWindow() {
  if (advancedWindowId !== null) {
    try {
      await chrome.windows.update(advancedWindowId, { focused: true });
      return advancedWindowId;
    } catch (_error) {
      advancedWindowId = null;
    }
  }

  const created = await chrome.windows.create({
    url: chrome.runtime.getURL("advanced.html"),
    type: "popup",
    focused: true,
    width: 460,
    height: 720
  });

  advancedWindowId = created.id ?? null;
  return advancedWindowId;
}

function normalizeSettings(payload = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...payload,
    excludeCompanyKeywords: String(payload.excludeCompanyKeywords || "").trim(),
    recruiterActiveStatuses: normalizeStringArray(payload.recruiterActiveStatuses),
    sendImageResume: Boolean(payload.sendImageResume),
    imageResumeFileName: String(payload.imageResumeFileName || "").trim(),
    imageResumeDataUrl: typeof payload.imageResumeDataUrl === "string" ? payload.imageResumeDataUrl : "",
    imageResumeMimeType: typeof payload.imageResumeMimeType === "string" ? payload.imageResumeMimeType : "",
    pollIntervalMs: clampNumber(Number(payload.pollIntervalMs), 600, 15000, DEFAULT_SETTINGS.pollIntervalMs),
    autoGreet: Boolean(payload.autoGreet),
    autoNext: Boolean(payload.autoNext),
    enabled: payload.enabled !== false
  };
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}
