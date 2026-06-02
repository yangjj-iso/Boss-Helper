const DEFAULT_SETTINGS = {
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
  pollIntervalMs: 1800
};

const RECRUITER_ACTIVITY_OPTIONS = [
  "在线",
  "刚刚活跃",
  "今日活跃",
  "3日内活跃",
  "本周活跃"
];

const elements = {
  salaryKeywords: document.getElementById("salaryKeywords"),
  companyKeywords: document.getElementById("companyKeywords"),
  excludeCompanyKeywords: document.getElementById("excludeCompanyKeywords"),
  recruiterActivityOptions: Array.from(document.querySelectorAll("[data-activity-option]")),
  greetTemplate: document.getElementById("greetTemplate"),
  sendImageResume: document.getElementById("sendImageResume"),
  imageResumeInput: document.getElementById("imageResumeInput"),
  imageResumeButton: document.getElementById("imageResumeButton"),
  imageResumeName: document.getElementById("imageResumeName"),
  pollIntervalMs: document.getElementById("pollIntervalMs"),
  autoGreet: document.getElementById("autoGreet"),
  autoNext: document.getElementById("autoNext"),
  saveStatus: document.getElementById("saveStatus"),
  closeButton: document.getElementById("closeButton")
};

void bootstrap();

async function bootstrap() {
  try {
    const settings = normalizeSettings(await chrome.storage.local.get(DEFAULT_SETTINGS));
    hydrate(settings);
    bindEvents();
  } catch (error) {
    if (elements.saveStatus) {
      elements.saveStatus.textContent = error instanceof Error ? error.message : String(error);
    }
  }
}

function hydrate(settings) {
  setInputValue(elements.salaryKeywords, settings.salaryKeywords || "");
  setInputValue(elements.companyKeywords, settings.companyKeywords || "");
  setInputValue(elements.excludeCompanyKeywords, settings.excludeCompanyKeywords || "");
  setInputValue(elements.greetTemplate, settings.greetTemplate || DEFAULT_SETTINGS.greetTemplate);
  setCheckedValue(elements.sendImageResume, Boolean(settings.sendImageResume));
  setTextValue(elements.imageResumeName, settings.imageResumeFileName || "未选择");
  setDatasetValue(elements.imageResumeName, "fileName", settings.imageResumeFileName || "");
  setDatasetValue(elements.imageResumeName, "dataUrl", settings.imageResumeDataUrl || "");
  setDatasetValue(elements.imageResumeName, "mimeType", settings.imageResumeMimeType || "");
  setTextValue(elements.imageResumeButton, settings.imageResumeFileName ? "更换图片简历" : "添加图片简历");
  setInputValue(elements.pollIntervalMs, String(settings.pollIntervalMs || DEFAULT_SETTINGS.pollIntervalMs));
  setCheckedValue(elements.autoGreet, Boolean(settings.autoGreet));
  setCheckedValue(elements.autoNext, Boolean(settings.autoNext));
  hydrateRecruiterActivityOptions(settings.recruiterActiveStatuses || []);
}

function bindEvents() {
  for (const key of [
    "salaryKeywords",
    "companyKeywords",
    "excludeCompanyKeywords",
    "greetTemplate",
    "sendImageResume",
    "pollIntervalMs",
    "autoGreet",
    "autoNext"
  ]) {
    const element = elements[key];
    if (!element) {
      continue;
    }
    const eventName = element.type === "checkbox" ? "change" : "input";
    element.addEventListener(eventName, () => {
      void saveSettings();
    });
  }

  for (const element of elements.recruiterActivityOptions) {
    element.addEventListener("change", () => {
      void saveSettings();
    });
  }

  if (elements.imageResumeButton && elements.imageResumeInput) {
    elements.imageResumeButton.addEventListener("click", () => {
      elements.imageResumeInput.click();
    });

    elements.imageResumeInput.addEventListener("change", () => {
      void handleImageResumeSelection();
    });
  }

  elements.closeButton?.addEventListener("click", async () => {
    await saveSettings({ silent: true });
    window.close();
  });
}

async function saveSettings(options = {}) {
  const payload = normalizeSettings({
    salaryKeywords: getInputValue(elements.salaryKeywords),
    companyKeywords: getInputValue(elements.companyKeywords),
    excludeCompanyKeywords: getInputValue(elements.excludeCompanyKeywords),
    recruiterActiveStatuses: getSelectedRecruiterActivities(),
    greetTemplate: getInputValue(elements.greetTemplate) || DEFAULT_SETTINGS.greetTemplate,
    sendImageResume: Boolean(elements.sendImageResume?.checked),
    imageResumeFileName: elements.imageResumeName?.dataset.fileName || "",
    imageResumeDataUrl: elements.imageResumeName?.dataset.dataUrl || "",
    imageResumeMimeType: elements.imageResumeName?.dataset.mimeType || "",
    pollIntervalMs: clampNumber(Number(elements.pollIntervalMs?.value), 600, 15000, DEFAULT_SETTINGS.pollIntervalMs),
    autoGreet: Boolean(elements.autoGreet?.checked),
    autoNext: Boolean(elements.autoNext?.checked)
  });

  try {
    await chrome.storage.local.set(payload);
    if (!options.silent) {
      setTextValue(elements.saveStatus, `已保存 ${new Date().toLocaleTimeString()}`);
    }
  } catch (error) {
    setTextValue(elements.saveStatus, error instanceof Error ? error.message : String(error));
  }
}

async function handleImageResumeSelection() {
  const file = elements.imageResumeInput?.files?.[0];
  if (!file) {
    return;
  }

  const isJpg = /image\/jpeg/i.test(file.type) || /\.jpe?g$/i.test(file.name);
  if (!isJpg) {
    setTextValue(elements.saveStatus, "仅支持 JPG");
    if (elements.imageResumeInput) {
      elements.imageResumeInput.value = "";
    }
    return;
  }

  if (file.size > 2.5 * 1024 * 1024) {
    setTextValue(elements.saveStatus, "图片请控制在 2.5MB 内");
    if (elements.imageResumeInput) {
      elements.imageResumeInput.value = "";
    }
    return;
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    setTextValue(elements.imageResumeName, file.name);
    setDatasetValue(elements.imageResumeName, "fileName", file.name);
    setDatasetValue(elements.imageResumeName, "dataUrl", dataUrl);
    setDatasetValue(elements.imageResumeName, "mimeType", file.type || "image/jpeg");
    setTextValue(elements.imageResumeButton, "更换图片简历");
    await saveSettings();
  } catch (error) {
    setTextValue(elements.saveStatus, error instanceof Error ? error.message : String(error));
  }
}

function hydrateRecruiterActivityOptions(selectedStatuses) {
  const selected = new Set(normalizeStringArray(selectedStatuses));
  for (const element of elements.recruiterActivityOptions) {
    const value = element.dataset.activityOption || "";
    if ("checked" in element) {
      element.checked = selected.has(value);
    }
  }
}

function getSelectedRecruiterActivities() {
  return elements.recruiterActivityOptions
    .filter((element) => element.checked)
    .map((element) => element.dataset.activityOption || "")
    .filter((item) => RECRUITER_ACTIVITY_OPTIONS.includes(item));
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

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("读取图片失败"));
    reader.readAsDataURL(file);
  });
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}

function normalizeSettings(payload = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...payload,
    salaryKeywords: String(payload.salaryKeywords || "").trim(),
    companyKeywords: String(payload.companyKeywords || "").trim(),
    excludeCompanyKeywords: String(payload.excludeCompanyKeywords || "").trim(),
    recruiterActiveStatuses: normalizeStringArray(payload.recruiterActiveStatuses),
    greetTemplate: String(payload.greetTemplate || "").trim() || DEFAULT_SETTINGS.greetTemplate,
    sendImageResume: Boolean(payload.sendImageResume),
    imageResumeFileName: String(payload.imageResumeFileName || "").trim(),
    imageResumeDataUrl: typeof payload.imageResumeDataUrl === "string" ? payload.imageResumeDataUrl : "",
    imageResumeMimeType: typeof payload.imageResumeMimeType === "string" ? payload.imageResumeMimeType : "",
    autoGreet: Boolean(payload.autoGreet),
    autoNext: Boolean(payload.autoNext),
    pollIntervalMs: clampNumber(Number(payload.pollIntervalMs), 600, 15000, DEFAULT_SETTINGS.pollIntervalMs)
  };
}

function getInputValue(element) {
  return element?.value?.trim() || "";
}

function setInputValue(element, value) {
  if (element) {
    element.value = value;
  }
}

function setCheckedValue(element, value) {
  if (element) {
    element.checked = Boolean(value);
  }
}

function setTextValue(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setDatasetValue(element, key, value) {
  if (element?.dataset) {
    element.dataset[key] = value;
  }
}
