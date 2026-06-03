const DEFAULT_SETTINGS = {
  salaryKeywords: "",
  companyKeywords: "",
  greetTemplate: "您好，我对{jobTitle}岗位很感兴趣，已认真阅读职位描述，期待进一步沟通。",
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

const elements = {
  salaryKeywords: document.getElementById("salaryKeywords"),
  companyKeywords: document.getElementById("companyKeywords"),
  greetTemplate: document.getElementById("greetTemplate"),
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
  const response = await chrome.runtime.sendMessage({
    type: "boss-helper:get-settings"
  });

  const settings = {
    ...DEFAULT_SETTINGS,
    ...(response?.settings ?? {})
  };

  hydrate(settings);
  bindEvents();
}

function hydrate(settings) {
  elements.salaryKeywords.value = settings.salaryKeywords || "";
  elements.companyKeywords.value = settings.companyKeywords || "";
  elements.greetTemplate.value = settings.greetTemplate || DEFAULT_SETTINGS.greetTemplate;
  elements.pollIntervalMs.value = String(settings.pollIntervalMs || DEFAULT_SETTINGS.pollIntervalMs);
  elements.autoGreet.checked = Boolean(settings.autoGreet);
  elements.autoNext.checked = Boolean(settings.autoNext);
  elements.autoReplyEnabled.checked = Boolean(settings.autoReplyEnabled);
  elements.autoReplyProvider.value = settings.autoReplyProvider || DEFAULT_SETTINGS.autoReplyProvider;
  elements.autoReplySystemPrompt.value = settings.autoReplySystemPrompt || DEFAULT_SETTINGS.autoReplySystemPrompt;
  elements.autoReplyTemperature.value = String(settings.autoReplyTemperature ?? DEFAULT_SETTINGS.autoReplyTemperature);
  elements.autoReplyMaxTokens.value = String(settings.autoReplyMaxTokens ?? DEFAULT_SETTINGS.autoReplyMaxTokens);
  elements.doubaoApiKey.value = settings.doubaoApiKey || "";
  elements.doubaoEndpoint.value = settings.doubaoEndpoint || DEFAULT_SETTINGS.doubaoEndpoint;
  elements.doubaoModel.value = settings.doubaoModel || DEFAULT_SETTINGS.doubaoModel;
  elements.deepseekApiKey.value = settings.deepseekApiKey || "";
  elements.deepseekEndpoint.value = settings.deepseekEndpoint || DEFAULT_SETTINGS.deepseekEndpoint;
  elements.deepseekModel.value = settings.deepseekModel || DEFAULT_SETTINGS.deepseekModel;
  elements.yuanbaoApiKey.value = settings.yuanbaoApiKey || "";
  elements.yuanbaoEndpoint.value = settings.yuanbaoEndpoint || DEFAULT_SETTINGS.yuanbaoEndpoint;
  elements.yuanbaoModel.value = settings.yuanbaoModel || DEFAULT_SETTINGS.yuanbaoModel;
}

function bindEvents() {
  for (const key of [
    "salaryKeywords",
    "companyKeywords",
    "greetTemplate",
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
    const eventName = element.type === "checkbox" ? "change" : "input";
    element.addEventListener(eventName, () => {
      void saveSettings();
    });
  }

  elements.closeButton.addEventListener("click", () => {
    window.close();
  });

  elements.autoReplyTestButton.addEventListener("click", () => {
    void runAutoReplyTest();
  });
}

async function runAutoReplyTest() {
  const provider = getProviderSettingsFromForm();
  const userText = elements.autoReplyTestInput.value.trim() || "你好方便发份简历过来吗";

  elements.autoReplyTestResult.textContent = "测试中，请稍候...";
  elements.autoReplyTestButton.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "boss-helper:call-chat-api",
      payload: {
        provider: provider.provider,
        apiKey: provider.apiKey,
        endpoint: provider.endpoint,
        model: provider.model,
        temperature: clampNumber(Number(elements.autoReplyTemperature.value), 0, 1, DEFAULT_SETTINGS.autoReplyTemperature),
        maxTokens: clampNumber(Number(elements.autoReplyMaxTokens.value), 64, 4096, DEFAULT_SETTINGS.autoReplyMaxTokens),
        messages: buildTestMessages(userText)
      }
    });

    if (!response?.ok) {
      throw new Error(response?.error || "测试请求失败");
    }

    const reply = response?.result?.content || "";
    elements.autoReplyTestResult.textContent = reply ? `回复：${reply}` : "未返回有效内容。";
  } catch (error) {
    elements.autoReplyTestResult.textContent = `测试失败：${error instanceof Error ? error.message : String(error)}`;
  } finally {
    elements.autoReplyTestButton.disabled = false;
  }
}

function buildTestMessages(userText) {
  const systemPrompt = elements.autoReplySystemPrompt.value.trim() || DEFAULT_SETTINGS.autoReplySystemPrompt;
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: userText }
  ];
}

function getProviderSettingsFromForm() {
  const provider = elements.autoReplyProvider.value;
  if (provider === "doubao") {
    return {
      provider,
      apiKey: elements.doubaoApiKey.value.trim(),
      endpoint: elements.doubaoEndpoint.value.trim() || DEFAULT_SETTINGS.doubaoEndpoint,
      model: elements.doubaoModel.value.trim() || DEFAULT_SETTINGS.doubaoModel
    };
  }

  if (provider === "yuanbao") {
    return {
      provider,
      apiKey: elements.yuanbaoApiKey.value.trim(),
      endpoint: elements.yuanbaoEndpoint.value.trim() || DEFAULT_SETTINGS.yuanbaoEndpoint,
      model: elements.yuanbaoModel.value.trim() || DEFAULT_SETTINGS.yuanbaoModel
    };
  }

  return {
    provider: "deepseek",
    apiKey: elements.deepseekApiKey.value.trim(),
    endpoint: elements.deepseekEndpoint.value.trim() || DEFAULT_SETTINGS.deepseekEndpoint,
    model: elements.deepseekModel.value.trim() || DEFAULT_SETTINGS.deepseekModel
  };
}

async function saveSettings() {
  const payload = {
    salaryKeywords: elements.salaryKeywords.value.trim(),
    companyKeywords: elements.companyKeywords.value.trim(),
    greetTemplate: elements.greetTemplate.value.trim() || DEFAULT_SETTINGS.greetTemplate,
    pollIntervalMs: clampNumber(Number(elements.pollIntervalMs.value), 600, 15000, DEFAULT_SETTINGS.pollIntervalMs),
    autoGreet: elements.autoGreet.checked,
    autoNext: elements.autoNext.checked,
    autoReplyEnabled: elements.autoReplyEnabled.checked,
    autoReplyProvider: elements.autoReplyProvider.value,
    autoReplySystemPrompt: elements.autoReplySystemPrompt.value.trim() || DEFAULT_SETTINGS.autoReplySystemPrompt,
    autoReplyTemperature: clampNumber(Number(elements.autoReplyTemperature.value), 0, 1, DEFAULT_SETTINGS.autoReplyTemperature),
    autoReplyMaxTokens: clampNumber(Number(elements.autoReplyMaxTokens.value), 64, 4096, DEFAULT_SETTINGS.autoReplyMaxTokens),
    doubaoApiKey: elements.doubaoApiKey.value.trim(),
    doubaoEndpoint: elements.doubaoEndpoint.value.trim() || DEFAULT_SETTINGS.doubaoEndpoint,
    doubaoModel: elements.doubaoModel.value.trim() || DEFAULT_SETTINGS.doubaoModel,
    deepseekApiKey: elements.deepseekApiKey.value.trim(),
    deepseekEndpoint: elements.deepseekEndpoint.value.trim() || DEFAULT_SETTINGS.deepseekEndpoint,
    deepseekModel: elements.deepseekModel.value.trim() || DEFAULT_SETTINGS.deepseekModel,
    yuanbaoApiKey: elements.yuanbaoApiKey.value.trim(),
    yuanbaoEndpoint: elements.yuanbaoEndpoint.value.trim() || DEFAULT_SETTINGS.yuanbaoEndpoint,
    yuanbaoModel: elements.yuanbaoModel.value.trim() || DEFAULT_SETTINGS.yuanbaoModel
  };

  try {
    await chrome.runtime.sendMessage({
      type: "boss-helper:save-settings",
      payload
    });
    elements.saveStatus.textContent = `已保存 ${new Date().toLocaleTimeString()}`;
  } catch (error) {
    elements.saveStatus.textContent = error instanceof Error ? error.message : String(error);
  }
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, min), max);
}
