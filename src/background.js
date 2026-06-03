const DEFAULT_SETTINGS = {
  jobKeywords: "",
  locationKeywords: "",
  salaryKeywords: "",
  companyKeywords: "",
  greetTemplate: "您好，我对{jobTitle}岗位很感兴趣，已认真阅读职位描述，期待进一步沟通。",
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
  yuanbaoModel: "hunyuan-lite"
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
    pollIntervalMs: clampNumber(Number(payload.pollIntervalMs), 600, 15000, DEFAULT_SETTINGS.pollIntervalMs),
    autoGreet: Boolean(payload.autoGreet),
    autoNext: Boolean(payload.autoNext),
    enabled: payload.enabled !== false,
    autoReplyEnabled: Boolean(payload.autoReplyEnabled),
    autoReplyTemperature: clampNumber(Number(payload.autoReplyTemperature), 0, 1, DEFAULT_SETTINGS.autoReplyTemperature),
    autoReplyMaxTokens: clampNumber(Number(payload.autoReplyMaxTokens), 64, 4096, DEFAULT_SETTINGS.autoReplyMaxTokens)
  };
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
