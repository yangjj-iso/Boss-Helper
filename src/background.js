const DEFAULT_SETTINGS = {
  jobKeywords: "",
  locationKeywords: "",
  jobMatchMode: "any",
  excludeJobKeywords: "",
  salaryKeywords: "",
  companyKeywords: "",
  excludeCompanyKeywords: "",
  recruiterActiveStatuses: [],
  greetTemplate: "您好，我对{jobTitle}岗位很感兴趣，已认真阅读职位描述，期待进一步沟通。",
  greetTemplates: [
    "您好，我对{jobTitle}岗位很感兴趣，已认真阅读职位描述，期待进一步沟通。",
    "您好，看到{companyName}的{jobTitle}很匹配我的方向，方便进一步了解吗？",
    "您好，我有相关项目经验，对{jobTitle}（{location}/{salary}）很感兴趣，期待沟通。"
  ],
  greetRotate: true,
  dailyLimit: 50,
  dailyCount: 0,
  dailyCountDate: "",
  historyRecords: [],
  sendImageResume: false,
  imageResumeFileName: "",
  imageResumeDataUrl: "",
  imageResumeMimeType: "",
  autoGreet: true,
  autoNext: true,
  enabled: true,
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
  yuanbaoModel: "hunyuan-lite",
  otherApiKey: "",
  otherEndpoint: "https://api.openai.com/v1/chat/completions",
  otherModel: "gpt-4o"
};

const DEFAULT_RUNTIME = {
  lastStartAt: "",
  lastStatus: "idle"
};

let advancedWindowId = null;

chrome.runtime.onInstalled.addListener(() => {
  void ensureDefaultsSeeded();
});

chrome.runtime.onStartup?.addListener?.(() => {
  void ensureDefaultsSeeded();
});

// 点击扩展图标时给出入口提示，并尽量打开高级设置
chrome.action?.onClicked?.addListener(() => {
  void openAdvancedWindow().catch((error) => {
    console.warn("[boss-helper] open advanced from action failed", error);
  });
});

async function ensureDefaultsSeeded() {
  try {
    const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
    const runtime = await chrome.storage.local.get(DEFAULT_RUNTIME);
    const normalized = normalizeSettings({
      ...DEFAULT_SETTINGS,
      ...settings
    });
    await chrome.storage.local.set({
      ...normalized,
      ...DEFAULT_RUNTIME,
      ...runtime
    });
  } catch (error) {
    console.error("[boss-helper] seed defaults failed", error);
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "boss-helper:get-settings") {
    ensureDefaultsSeeded()
      .then(() => chrome.storage.local.get(DEFAULT_SETTINGS))
      .then((settings) => {
        sendResponse({ ok: true, settings: normalizeSettings(settings) });
      })
      .catch((error) => {
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

  if (message?.type === "boss-helper:call-chat-api") {
    callChatApi(message.payload).then((result) => {
      sendResponse({ ok: true, result });
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
  const pageUrl = chrome.runtime.getURL("advanced.html");

  if (advancedWindowId !== null && chrome.windows?.update) {
    try {
      await chrome.windows.update(advancedWindowId, { focused: true });
      return advancedWindowId;
    } catch (_error) {
      advancedWindowId = null;
    }
  }

  // 优先弹窗；无 windows 权限或失败时，退回新标签页，保证设置页可打开
  if (chrome.windows?.create) {
    try {
      const created = await chrome.windows.create({
        url: pageUrl,
        type: "popup",
        focused: true,
        width: 460,
        height: 720
      });
      advancedWindowId = created.id ?? null;
      return advancedWindowId;
    } catch (error) {
      console.warn("[boss-helper] windows.create failed, fallback to tab", error);
    }
  }

  if (chrome.tabs?.create) {
    const tab = await chrome.tabs.create({ url: pageUrl, active: true });
    return tab?.id ?? null;
  }

  throw new Error("无法打开高级设置页，请检查扩展权限后重试。");
}

function normalizeSettings(payload = {}) {
  const greetTemplates = normalizeGreetingTemplates(payload.greetTemplates, payload.greetTemplate);
  return {
    ...DEFAULT_SETTINGS,
    ...payload,
    jobMatchMode: payload.jobMatchMode === "all" ? "all" : "any",
    excludeJobKeywords: String(payload.excludeJobKeywords || "").trim(),
    excludeCompanyKeywords: String(payload.excludeCompanyKeywords || "").trim(),
    recruiterActiveStatuses: normalizeStringArray(payload.recruiterActiveStatuses),
    greetTemplate: greetTemplates[0] || DEFAULT_SETTINGS.greetTemplate,
    greetTemplates,
    greetRotate: payload.greetRotate !== false,
    dailyLimit: clampNumber(Number(payload.dailyLimit), 1, 150, DEFAULT_SETTINGS.dailyLimit),
    dailyCount: clampNumber(Number(payload.dailyCount), 0, 9999, 0),
    dailyCountDate: String(payload.dailyCountDate || ""),
    historyRecords: normalizeHistoryRecords(payload.historyRecords),
    sendImageResume: Boolean(payload.sendImageResume),
    imageResumeFileName: String(payload.imageResumeFileName || "").trim(),
    imageResumeDataUrl: typeof payload.imageResumeDataUrl === "string" ? payload.imageResumeDataUrl : "",
    imageResumeMimeType: typeof payload.imageResumeMimeType === "string" ? payload.imageResumeMimeType : "",
    pollIntervalMs: clampNumber(Number(payload.pollIntervalMs), 600, 15000, DEFAULT_SETTINGS.pollIntervalMs),
    autoGreet: Boolean(payload.autoGreet),
    autoNext: Boolean(payload.autoNext),
    enabled: payload.enabled !== false,
    autoReplyEnabled: Boolean(payload.autoReplyEnabled),
    autoReplyTemperature: clampNumber(Number(payload.autoReplyTemperature), 0, 1, DEFAULT_SETTINGS.autoReplyTemperature),
    autoReplyMaxTokens: clampNumber(Number(payload.autoReplyMaxTokens), 64, 4096, DEFAULT_SETTINGS.autoReplyMaxTokens)
  };
}

function normalizeGreetingTemplates(list, fallback) {
  const fromList = Array.isArray(list)
    ? list.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  if (fromList.length) {
    return fromList.slice(0, 8);
  }
  const single = String(fallback || "").trim();
  return single ? [single] : [...DEFAULT_SETTINGS.greetTemplates];
}

function normalizeHistoryRecords(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item) => item && typeof item === "object")
    .slice(0, 300)
    .map((item) => ({
      id: String(item.id || ""),
      at: String(item.at || ""),
      title: String(item.title || ""),
      company: String(item.company || ""),
      salary: String(item.salary || ""),
      location: String(item.location || ""),
      status: String(item.status || "")
    }));
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

async function callChatApi(payload = {}) {
  const endpoint = String(payload.endpoint || "").trim();
  const apiKey = String(payload.apiKey || "").trim();
  const model = String(payload.model || "").trim();
  const temperature = clampNumber(Number(payload.temperature), 0, 1, 0.6);
  const maxTokens = clampNumber(Number(payload.maxTokens), 64, 4096, 512);
  const messages = Array.isArray(payload.messages) ? payload.messages : [];

  if (!endpoint) {
    throw new Error("未设置 API Endpoint。请在高级设置中填写。");
  }
  if (!apiKey) {
    throw new Error("未设置 API Key。请在高级设置中填写。");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`API 请求失败(${response.status})：${bodyText}`);
  }

  const data = await response.json();
  const content = extractReplyContent(data);
  if (!content) {
    throw new Error("API 返回为空或未识别到内容。");
  }
  return { content };
}

function extractReplyContent(data) {
  if (!data) {
    return "";
  }

  const openAiLike = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text;
  if (openAiLike) {
    return String(openAiLike).trim();
  }

  if (data?.result) {
    return String(data.result).trim();
  }

  if (data?.output?.text) {
    return String(data.output.text).trim();
  }

  return "";
}
