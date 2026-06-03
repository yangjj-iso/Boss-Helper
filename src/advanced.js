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
  pollIntervalMs: 1800,
  autoReplyEnabled: false,
  autoReplyProvider: "deepseek",
  autoReplySystemPrompt: "你是求职者，正在和BOSS直聘上的招聘负责人沟通。请用简洁礼貌的中文回复，并在必要时追问关键信息。",
  autoReplyTemperature: 0.6,
  autoReplyMaxTokens: 512,
  doubaoApiKey: "",
  deepseekApiKey: "",
  yuanbaoApiKey: "",
  doubaoEndpoint: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  deepseekEndpoint: "https://api.deepseek.com/chat/completions",
  yuanbaoEndpoint: "https://api.hunyuan.cloud.tencent.com/v1/chat/completions",
  doubaoModel: "",
  deepseekModel: "deepseek-chat",
  yuanbaoModel: "hunyuan-lite"
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
  autoReplyEnabled: document.getElementById("autoReplyEnabled"),
  autoReplyProvider: document.getElementById("autoReplyProvider"),
  autoReplySystemPrompt: document.getElementById("autoReplySystemPrompt"),
  autoReplyTemperature: document.getElementById("autoReplyTemperature"),
  autoReplyMaxTokens: document.getElementById("autoReplyMaxTokens"),
  doubaoApiKey: document.getElementById("doubaoApiKey"),
  doubaoEndpoint: document.getElementById("doubaoEndpoint"),
  doubaoModel: document.getElementById("doubaoModel"),
  deepseekApiKey: document.getElementById("deepseekApiKey"),
  deepseekEndpoint: document.getElementById("deepseekEndpoint"),
  deepseekModel: document.getElementById("deepseekModel"),
  yuanbaoApiKey: document.getElementById("yuanbaoApiKey"),
  yuanbaoEndpoint: document.getElementById("yuanbaoEndpoint"),
  yuanbaoModel: document.getElementById("yuanbaoModel"),
  autoReplyTestInput: document.getElementById("autoReplyTestInput"),
  autoReplyTestButton: document.getElementById("autoReplyTestButton"),
  autoReplyTestResult: document.getElementById("autoReplyTestResult"),
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
  setCheckedValue(elements.autoReplyEnabled, Boolean(settings.autoReplyEnabled));
  setInputValue(elements.autoReplyProvider, settings.autoReplyProvider || DEFAULT_SETTINGS.autoReplyProvider);
  setInputValue(elements.autoReplySystemPrompt, settings.autoReplySystemPrompt || DEFAULT_SETTINGS.autoReplySystemPrompt);
  setInputValue(elements.autoReplyTemperature, String(settings.autoReplyTemperature ?? DEFAULT_SETTINGS.autoReplyTemperature));
  setInputValue(elements.autoReplyMaxTokens, String(settings.autoReplyMaxTokens ?? DEFAULT_SETTINGS.autoReplyMaxTokens));
  setInputValue(elements.doubaoApiKey, settings.doubaoApiKey || "");
  setInputValue(elements.doubaoEndpoint, settings.doubaoEndpoint || DEFAULT_SETTINGS.doubaoEndpoint);
  setInputValue(elements.doubaoModel, settings.doubaoModel || DEFAULT_SETTINGS.doubaoModel);
  setInputValue(elements.deepseekApiKey, settings.deepseekApiKey || "");
  setInputValue(elements.deepseekEndpoint, settings.deepseekEndpoint || DEFAULT_SETTINGS.deepseekEndpoint);
  setInputValue(elements.deepseekModel, settings.deepseekModel || DEFAULT_SETTINGS.deepseekModel);
  setInputValue(elements.yuanbaoApiKey, settings.yuanbaoApiKey || "");
  setInputValue(elements.yuanbaoEndpoint, settings.yuanbaoEndpoint || DEFAULT_SETTINGS.yuanbaoEndpoint);
  setInputValue(elements.yuanbaoModel, settings.yuanbaoModel || DEFAULT_SETTINGS.yuanbaoModel);
  updateProviderVisibility();
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
    "autoNext",
    "autoReplyEnabled",
    "autoReplyProvider",
    "autoReplySystemPrompt",
    "autoReplyTemperature",
    "autoReplyMaxTokens",
    "doubaoApiKey",
    "doubaoEndpoint",
    "doubaoModel",
    "deepseekApiKey",
    "deepseekEndpoint",
    "deepseekModel",
    "yuanbaoApiKey",
    "yuanbaoEndpoint",
    "yuanbaoModel"
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

  elements.autoReplyTestButton?.addEventListener("click", () => {
    void runAutoReplyTest();
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
    autoNext: Boolean(elements.autoNext?.checked),
    autoReplyEnabled: Boolean(elements.autoReplyEnabled?.checked),
    autoReplyProvider: getInputValue(elements.autoReplyProvider),
    autoReplySystemPrompt: getInputValue(elements.autoReplySystemPrompt) || DEFAULT_SETTINGS.autoReplySystemPrompt,
    autoReplyTemperature: clampNumber(Number(elements.autoReplyTemperature?.value), 0, 1, DEFAULT_SETTINGS.autoReplyTemperature),
    autoReplyMaxTokens: clampNumber(Number(elements.autoReplyMaxTokens?.value), 64, 4096, DEFAULT_SETTINGS.autoReplyMaxTokens),
    doubaoApiKey: getInputValue(elements.doubaoApiKey),
    doubaoEndpoint: getInputValue(elements.doubaoEndpoint) || DEFAULT_SETTINGS.doubaoEndpoint,
    doubaoModel: getInputValue(elements.doubaoModel) || DEFAULT_SETTINGS.doubaoModel,
    deepseekApiKey: getInputValue(elements.deepseekApiKey),
    deepseekEndpoint: getInputValue(elements.deepseekEndpoint) || DEFAULT_SETTINGS.deepseekEndpoint,
    deepseekModel: getInputValue(elements.deepseekModel) || DEFAULT_SETTINGS.deepseekModel,
    yuanbaoApiKey: getInputValue(elements.yuanbaoApiKey),
    yuanbaoEndpoint: getInputValue(elements.yuanbaoEndpoint) || DEFAULT_SETTINGS.yuanbaoEndpoint,
    yuanbaoModel: getInputValue(elements.yuanbaoModel) || DEFAULT_SETTINGS.yuanbaoModel
  });

  try {
    await chrome.storage.local.set(payload);
    updateProviderVisibility();
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
    pollIntervalMs: clampNumber(Number(payload.pollIntervalMs), 600, 15000, DEFAULT_SETTINGS.pollIntervalMs),
    autoReplyEnabled: Boolean(payload.autoReplyEnabled),
    autoReplyProvider: String(payload.autoReplyProvider || DEFAULT_SETTINGS.autoReplyProvider),
    autoReplySystemPrompt: String(payload.autoReplySystemPrompt || "").trim() || DEFAULT_SETTINGS.autoReplySystemPrompt,
    autoReplyTemperature: clampNumber(Number(payload.autoReplyTemperature), 0, 1, DEFAULT_SETTINGS.autoReplyTemperature),
    autoReplyMaxTokens: clampNumber(Number(payload.autoReplyMaxTokens), 64, 4096, DEFAULT_SETTINGS.autoReplyMaxTokens),
    doubaoApiKey: String(payload.doubaoApiKey || ""),
    deepseekApiKey: String(payload.deepseekApiKey || ""),
    yuanbaoApiKey: String(payload.yuanbaoApiKey || ""),
    doubaoEndpoint: String(payload.doubaoEndpoint || DEFAULT_SETTINGS.doubaoEndpoint),
    deepseekEndpoint: String(payload.deepseekEndpoint || DEFAULT_SETTINGS.deepseekEndpoint),
    yuanbaoEndpoint: String(payload.yuanbaoEndpoint || DEFAULT_SETTINGS.yuanbaoEndpoint),
    doubaoModel: String(payload.doubaoModel || DEFAULT_SETTINGS.doubaoModel),
    deepseekModel: String(payload.deepseekModel || DEFAULT_SETTINGS.deepseekModel),
    yuanbaoModel: String(payload.yuanbaoModel || DEFAULT_SETTINGS.yuanbaoModel)
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

async function runAutoReplyTest() {
  const provider = getProviderSettingsFromForm();
  const userText = getInputValue(elements.autoReplyTestInput) || "你好方便发份简历过来吗";

  setTextValue(elements.autoReplyTestResult, "测试中，请稍候...");
  if (elements.autoReplyTestButton) {
    elements.autoReplyTestButton.disabled = true;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: "boss-helper:call-chat-api",
      payload: {
        provider: provider.provider,
        apiKey: provider.apiKey,
        endpoint: provider.endpoint,
        model: provider.model,
        temperature: clampNumber(Number(getInputValue(elements.autoReplyTemperature)), 0, 1, DEFAULT_SETTINGS.autoReplyTemperature),
        maxTokens: clampNumber(Number(getInputValue(elements.autoReplyMaxTokens)), 64, 4096, DEFAULT_SETTINGS.autoReplyMaxTokens),
        messages: buildTestMessages(userText)
      }
    });

    if (!response?.ok) {
      throw new Error(response?.error || "测试请求失败");
    }

    const reply = response?.result?.content || "";
    setTextValue(elements.autoReplyTestResult, reply ? `回复：${reply}` : "未返回有效内容。");
  } catch (error) {
    setTextValue(elements.autoReplyTestResult, `测试失败：${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (elements.autoReplyTestButton) {
      elements.autoReplyTestButton.disabled = false;
    }
  }
}

function buildTestMessages(userText) {
  const systemPrompt = getInputValue(elements.autoReplySystemPrompt) || DEFAULT_SETTINGS.autoReplySystemPrompt;
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userText }
  ];
}

function getProviderSettingsFromForm() {
  const provider = getInputValue(elements.autoReplyProvider);
  if (provider === "doubao") {
    return {
      provider,
      apiKey: getInputValue(elements.doubaoApiKey),
      endpoint: getInputValue(elements.doubaoEndpoint) || DEFAULT_SETTINGS.doubaoEndpoint,
      model: getInputValue(elements.doubaoModel) || DEFAULT_SETTINGS.doubaoModel
    };
  }

  if (provider === "yuanbao") {
    return {
      provider,
      apiKey: getInputValue(elements.yuanbaoApiKey),
      endpoint: getInputValue(elements.yuanbaoEndpoint) || DEFAULT_SETTINGS.yuanbaoEndpoint,
      model: getInputValue(elements.yuanbaoModel) || DEFAULT_SETTINGS.yuanbaoModel
    };
  }

  return {
    provider: "deepseek",
    apiKey: getInputValue(elements.deepseekApiKey),
    endpoint: getInputValue(elements.deepseekEndpoint) || DEFAULT_SETTINGS.deepseekEndpoint,
    model: getInputValue(elements.deepseekModel) || DEFAULT_SETTINGS.deepseekModel
  };
}

function updateProviderVisibility() {
  const selected = getInputValue(elements.autoReplyProvider) || "deepseek";
  const groups = document.querySelectorAll(".provider-group");
  for (const group of groups) {
    const provider = group.dataset.provider || "";
    group.classList.toggle("active", provider === selected);
  }
}
