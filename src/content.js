const HOST_ID = "boss-helper-root";
const PANEL_POSITION_KEY = "boss-helper:panel-position";
const MAX_LOGS = 200;
const MAX_JOB_RETRIES = 3;
const AUTO_REPLY_POLL_MS = 1400;
const AUTO_REPLY_MIN_INTERVAL = 6000;
const DETAIL_WAIT_ATTEMPTS = 16;
const DETAIL_WAIT_STEP_MS = 280;
const ACTION_WAIT_ATTEMPTS = 12;
const ACTION_WAIT_STEP_MS = 320;
const COMMUNICATION_LIMIT_HINTS = [
  "无法进行沟通",
  "150位boss沟通",
  "150位BOSS沟通",
  "休息一下",
  "明天再来"
];

const RECRUITER_ACTIVITY_OPTIONS = [
  "在线",
  "刚刚活跃",
  "今日活跃",
  "3日内活跃",
  "本周活跃"
];

// 地点别名：筛选项与列表文案对齐（比较前会再去市/区后缀）
const LOCATION_ALIASES = {
  北京: ["beijing", "bj", "帝都"],
  上海: ["shanghai", "sh", "魔都"],
  深圳: ["shenzhen", "sz"],
  广州: ["guangzhou", "gz"],
  杭州: ["hangzhou", "hz"],
  成都: ["chengdu", "cd"],
  重庆: ["chongqing", "cq"],
  武汉: ["wuhan", "wh"],
  西安: ["xian", "西安市"],
  南京: ["nanjing", "nj"],
  苏州: ["suzhou"],
  天津: ["tianjin", "tj"],
  长沙: ["changsha"],
  郑州: ["zhengzhou"],
  青岛: ["qingdao"],
  厦门: ["xiamen"],
  合肥: ["hefei"],
  远程: ["remote", "居家", "在家办公", "wfh", "异地办公"],
  浦东: ["浦东新区"],
  闵行: ["闵行区"],
  徐汇: ["徐汇区"],
  静安: ["静安区"],
  杨浦: ["杨浦区"],
  虹口: ["虹口区"],
  长宁: ["长宁区"],
  普陀: ["普陀区"],
  宝山: ["宝山区"],
  嘉定: ["嘉定区"],
  松江: ["松江区"],
  青浦: ["青浦区"],
  奉贤: ["奉贤区"],
  金山: ["金山区"],
  南汇: ["南汇区"],
  朝阳: ["朝阳区"],
  海淀: ["海淀区"],
  东城: ["东城区"],
  西城: ["西城区"],
  丰台: ["丰台区"],
  通州: ["通州区"],
  昌平: ["昌平区"],
  大兴: ["大兴区"],
  南山: ["南山区"],
  福田: ["福田区"],
  宝安: ["宝安区"],
  龙岗: ["龙岗区"],
  龙华: ["龙华区"],
  天河: ["天河区"],
  番禺: ["番禺区"],
  海珠: ["海珠区"],
  越秀: ["越秀区"],
  西湖: ["西湖区"],
  余杭: ["余杭区"],
  滨江: ["滨江区"],
  萧山: ["萧山区"]
};

const FILTER_PRESETS = [
  {
    id: "backend",
    name: "后端开发",
    jobKeywords: "后端, Java, Go, 服务端",
    excludeJobKeywords: "实习, 外包, 驻场",
    jobMatchMode: "any",
    salaryKeywords: "20-40K"
  },
  {
    id: "frontend",
    name: "前端开发",
    jobKeywords: "前端, React, Vue, 大前端",
    excludeJobKeywords: "实习, 外包",
    jobMatchMode: "any",
    salaryKeywords: "18-35K"
  },
  {
    id: "fullstack",
    name: "全栈",
    jobKeywords: "全栈, Node, 前后端",
    excludeJobKeywords: "实习",
    jobMatchMode: "any",
    salaryKeywords: "20-40K"
  },
  {
    id: "product",
    name: "产品经理",
    jobKeywords: "产品经理, 产品专员, PM",
    excludeJobKeywords: "实习, 助理",
    jobMatchMode: "any",
    salaryKeywords: "15-30K"
  }
];

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

const SELECTORS = {
  listContainers: [
    ".job-list-box",
    ".job-list-container",
    ".search-job-list",
    "[class*='job-list-box']"
  ],
  listItems: [
    ".job-card-wrapper",
    ".job-list-item",
    "[class*='job-card']"
  ],
  listTitle: [
    ".job-name",
    "[class*='job-name']",
    "a[ka*='search_list']",
    "h3"
  ],
  listSalary: [
    ".salary",
    "[class*='salary']",
    ".red"
  ],
  listCompany: [
    ".company-name",
    "[class*='company-name']",
    ".company-text",
    ".company-info h3",
    ".company-info a"
  ],
  listLocation: [
    ".job-area",
    "[class*='job-area']",
    ".job-area-wrapper",
    ".info-desc",
    ".job-address"
  ],
  listRecruiterStatus: [
    ".boss-online-tag",
    ".online-tag",
    ".info-public .status",
    "[class*='online']",
    "[class*='active-status']",
    ".boss-info .tag",
    ".job-card-footer .tag"
  ],
  detailTitle: [
    ".job-detail-box .job-title",
    ".job-detail-box .name",
    ".job-banner .name",
    ".job-primary .name",
    ".job-detail .name"
  ],
  detailCompany: [
    ".job-detail-box .company-name",
    ".company-info .name",
    ".job-company .company-name"
  ],
  detailSalary: [
    ".job-detail-box .salary",
    ".job-banner .salary",
    ".job-primary .salary"
  ],
  detailLocation: [
    ".job-detail-box .text-city",
    ".job-banner .text-city",
    ".job-primary .info-primary span"
  ],
  detailTags: [
    ".job-detail-box .tag-list li",
    ".job-detail-box .job-labels span"
  ],
  detailDescription: [
    ".job-detail-box .job-sec-text",
    ".job-detail-box .text",
    ".detail-content"
  ],
  detailContainers: [
    ".job-detail-box",
    ".job-detail-wrap",
    ".job-card-right",
    ".job-detail",
    "[class*='job-detail']"
  ],
  dialogContainers: [
    ".dialog-container",
    ".boss-dialog",
    ".dialog-wrap",
    ".modal",
    "[role='dialog']"
  ],
  greetButtons: [
    ".op-btn.op-btn-chat",
    ".btn-startchat",
    ".btn-start-chat",
    ".job-detail-box .btn-chat",
    ".job-detail-box .btn",
    ".job-detail .btn",
    "[ka*='chat']",
    "button",
    "a"
  ],
  stayButtons: [
    ".dialog-footer button",
    ".boss-dialog button",
    ".dialog-container button",
    ".modal button",
    ".dialog-con button",
    "button",
    "a"
  ],
  deliverButtons: [
    ".job-detail-box .btn.btn-main",
    ".btn-apply",
    ".job-detail-box .btn-primary",
    ".job-detail .btn-primary"
  ],
  chatInput: [
    ".chat-input textarea",
    ".chat-editor textarea",
    ".input-area textarea",
    ".chat-conversation textarea",
    "textarea",
    "[contenteditable='true']",
    ".chat-input",
    "[class*='chat-input']"
  ],
  chatSend: [
    ".btn-send",
    ".send-btn",
    ".chat-op .btn",
    ".submit-btn",
    "button[type='submit']",
    "[class*='send']"
  ],
  imageResumeInput: [
    ".chat-op input[type='file']",
    ".chat-tools input[type='file']",
    ".upload input[type='file']",
    "input[type='file'][accept*='image']",
    "input[type='file']"
  ],
  imageResumeTriggers: [
    ".chat-op button",
    ".chat-tools button",
    ".upload button",
    "button",
    "label",
    "span",
    "a"
  ],
  chatMessages: [
    ".chat-message",
    ".msg-item",
    ".message-item",
    "[class*='chat-msg']",
    "[class*='msg-item']"
  ]
};

const state = {
  settings: { ...DEFAULT_SETTINGS },
  running: false,
  processing: false,
  preloading: false,
  observer: null,
  loopTimer: null,
  shadowRoot: null,
  host: null,
  visitedJobs: new Set(),
  skippedJobs: new Set(),
  failedJobAttempts: new Map(),
  lastSnapshotSignature: "",
  selectedJobIndex: -1,
  currentJob: null,
  lastGreetingPreview: "",
  panelMinimized: false,
  logs: [],
  startButtonLocked: false,
  fullListReadComplete: false,
  autoReplyTimer: null,
  lastAutoReplySignature: "",
  lastAutoReplyAt: 0,
  autoReplyInFlight: false,
  autoReplyDebug: "",
  statusText: "就绪",
  lastFilterHint: "",
  sessionCompleted: 0,
  sessionSkipped: 0,
  sessionFailed: 0,
  sessionStartedAt: "",
  onlyJobKey: "",
  matchListExpanded: true
};

const ACTION_RESULT = {
  greeted: "greeted",
  delivered: "delivered",
  pending: "pending",
  failed: "failed",
  paused: "paused"
};

const JOB_PAGE_HINTS = [
  "/web/geek/job",
  "/web/geek/jobs",
  "/web/geek/job-recommend",
  "/web/geek/recommend",
  "/job_detail/",
  "/job_detail",
  "/c101",
  "/gongsi/",
  "positionList",
  "joblist"
];

if (!document.getElementById(HOST_ID)) {
  void bootstrap();
}

async function bootstrap() {
  try {
    state.settings = await loadSettings();
    ensureDailyCounter();
    mountHelper();
    bindEvents();
    restorePanelPosition();
    chrome.storage.onChanged.addListener(handleStorageChanges);
    logEvent("初始化", "扩展已注入页面。");
    refreshPageSnapshot("初始化完成");
    installObservers();
    startAutoReplyLoop();
    syncButtonState();
    // 首屏可能还在懒加载，稍后自动再扫一次
    setTimeout(() => refreshPageSnapshot("延迟复检"), 1200);
    setTimeout(() => refreshPageSnapshot("延迟复检"), 3200);
  } catch (error) {
    console.error("[boss-helper] bootstrap failed", error);
    try {
      // 即使设置读取失败，也尽量挂出面板，避免用户“完全看不见”
      state.settings = { ...DEFAULT_SETTINGS };
      if (!state.shadowRoot) {
        mountHelper();
        bindEvents();
        restorePanelPosition();
      }
      setStatus("助手已启动，但设置读取异常，已使用默认配置", "warn");
      refreshPageSnapshot("初始化降级");
      installObservers();
      syncButtonState();
    } catch (mountError) {
      console.error("[boss-helper] fallback mount failed", mountError);
    }
  }
}

async function loadSettings() {
  // 优先直读 storage，避免 service worker 休眠导致 sendMessage 失败
  try {
    if (chrome?.storage?.local?.get) {
      const direct = await chrome.storage.local.get(DEFAULT_SETTINGS);
      return normalizeLoadedSettings(direct);
    }
  } catch (error) {
    logEvent("设置读取", `直读 storage 失败：${asMessage(error)}`);
  }

  try {
    const response = await chrome.runtime.sendMessage({ type: "boss-helper:get-settings" });
    if (response?.ok === false) {
      throw new Error(response.error || "后台返回失败");
    }
    return normalizeLoadedSettings(response?.settings || {});
  } catch (error) {
    logEvent("设置读取", `消息通道失败，使用默认设置：${asMessage(error)}`);
    return { ...DEFAULT_SETTINGS };
  }
}

function normalizeLoadedSettings(raw = {}) {
  const merged = {
    ...DEFAULT_SETTINGS,
    ...raw
  };
  merged.jobKeywords = String(merged.jobKeywords || "");
  merged.locationKeywords = String(merged.locationKeywords || "");
  merged.salaryKeywords = String(merged.salaryKeywords || "");
  merged.excludeJobKeywords = String(merged.excludeJobKeywords || "");
  merged.companyKeywords = String(merged.companyKeywords || "");
  merged.excludeCompanyKeywords = String(merged.excludeCompanyKeywords || "");
  merged.jobMatchMode = merged.jobMatchMode === "all" ? "all" : "any";
  merged.dailyLimit = clampNumber(Number(merged.dailyLimit), 1, 150, DEFAULT_SETTINGS.dailyLimit);
  merged.dailyCount = clampNumber(Number(merged.dailyCount), 0, 9999, 0);
  merged.dailyCountDate = String(merged.dailyCountDate || "");
  merged.pollIntervalMs = clampNumber(Number(merged.pollIntervalMs), 600, 15000, DEFAULT_SETTINGS.pollIntervalMs);
  merged.greetTemplates = Array.isArray(merged.greetTemplates)
    ? merged.greetTemplates.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 8)
    : [...DEFAULT_SETTINGS.greetTemplates];
  if (!merged.greetTemplates.length) {
    merged.greetTemplates = [...DEFAULT_SETTINGS.greetTemplates];
  }
  merged.greetTemplate = String(merged.greetTemplate || merged.greetTemplates[0] || DEFAULT_SETTINGS.greetTemplate);
  merged.historyRecords = Array.isArray(merged.historyRecords) ? merged.historyRecords.slice(0, 300) : [];
  merged.recruiterActiveStatuses = Array.isArray(merged.recruiterActiveStatuses)
    ? merged.recruiterActiveStatuses.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  merged.autoGreet = merged.autoGreet !== false;
  merged.autoNext = merged.autoNext !== false;
  merged.enabled = merged.enabled !== false;
  merged.greetRotate = merged.greetRotate !== false;
  return merged;
}

function mountHelper() {
  const host = document.createElement("div");
  host.id = HOST_ID;
  Object.assign(host.style, {
    position: "fixed",
    top: "24px",
    right: "24px",
    zIndex: "2147483647"
  });

  const shadowRoot = host.attachShadow({ mode: "open" });
  shadowRoot.appendChild(buildStyles());
  shadowRoot.appendChild(buildPanel());
  document.documentElement.appendChild(host);

  state.host = host;
  state.shadowRoot = shadowRoot;
  hydrateForm();
}

function buildStyles() {
  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; font-family: Inter, "Segoe UI", Arial, "Microsoft YaHei", sans-serif; }
    button, input, textarea, select { font: inherit; }
    button { appearance: none; -webkit-appearance: none; }
    .panel {
      width: 428px;
      max-height: calc(100vh - 28px);
      border-radius: 28px;
      background:
        radial-gradient(circle at 92% 0%, rgba(45, 212, 191, 0.16), transparent 36%),
        radial-gradient(circle at 8% 100%, rgba(56, 189, 248, 0.12), transparent 42%),
        linear-gradient(165deg, rgba(255,255,255,0.98) 0%, rgba(244,248,252,0.98) 100%);
      border: 1px solid rgba(226, 232, 240, 0.95);
      box-shadow:
        0 28px 64px rgba(15, 23, 42, 0.16),
        0 8px 20px rgba(15, 23, 42, 0.06),
        inset 0 1px 0 rgba(255,255,255,0.92);
      color: #0f172a;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(18px);
    }
    .panel.minimized {
      width: 268px;
      border-radius: 999px;
    }
    .header {
      padding: 18px 18px 14px;
      background:
        radial-gradient(circle at top right, rgba(20, 184, 166, 0.16), transparent 42%),
        linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%);
      border-bottom: 1px solid rgba(226, 232, 240, 0.88);
      cursor: move;
      user-select: none;
    }
    .header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      flex: 1 1 auto;
    }
    .logo {
      width: 48px;
      height: 48px;
      border-radius: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(145deg, #0f766e 0%, #0ea5e9 100%);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.28),
        0 14px 28px rgba(8,145,178,0.28);
      color: #fff;
      flex: 0 0 auto;
    }
    .logo svg {
      width: 22px;
      height: 22px;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .title {
      min-width: 0;
    }
    .title strong {
      display: block;
      font-size: 18px;
      font-weight: 760;
      letter-spacing: 0;
      color: #0f172a;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .subtitle {
      margin-top: 5px;
      font-size: 12px;
      line-height: 1.4;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tools {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px;
      border: 1px solid rgba(226, 232, 240, 0.95);
      border-radius: 999px;
      background: rgba(255,255,255,0.92);
      box-shadow: 0 8px 20px rgba(15,23,42,0.05);
      flex: 0 0 auto;
    }
    .icon-btn {
      width: 34px;
      height: 34px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: #64748b;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
    }
    .icon-btn svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      fill: none;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .icon-btn:hover {
      background: rgba(241, 245, 249, 0.98);
      color: #0f172a;
      transform: translateY(-1px);
      box-shadow: 0 6px 12px rgba(15, 23, 42, 0.06);
    }
    .icon-btn:focus-visible,
    .button:focus-visible,
    .field input:focus-visible,
    .field select:focus-visible {
      outline: none;
      box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.16);
    }
    .icon-btn[data-action="close"]:hover {
      background: rgba(254, 226, 226, 0.96);
      color: #dc2626;
    }
    .body {
      display: grid;
      gap: 16px;
      min-height: 0;
      overflow: auto;
      padding: 18px;
      background: linear-gradient(180deg, rgba(248,250,252,0.72) 0%, rgba(241,245,249,0.88) 100%);
    }
    .panel.minimized .subtitle,
    .panel.minimized .body {
      display: none;
    }
    .panel.minimized .title {
      display: none;
    }
    .panel.minimized .header {
      padding: 10px 12px;
    }
    .panel.minimized .logo {
      width: 40px;
      height: 40px;
      border-radius: 999px;
    }
    .form-area {
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: 22px;
      background: rgba(255,255,255,0.78);
      border: 1px solid rgba(226, 232, 240, 0.95);
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }
    .field.full {
      grid-column: 1 / -1;
    }
    .field label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      padding-left: 4px;
    }
    .field input,
    .field select {
      width: 100%;
      height: 48px;
      border-radius: 16px;
      border: 1px solid #dbe4ee;
      background: rgba(255,255,255,0.98);
      padding: 0 16px;
      font-size: 14px;
      color: #0f172a;
      outline: none;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(15, 23, 42, 0.02);
      transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, transform 0.16s ease;
    }
    .field input::placeholder {
      color: #94a3b8;
    }
    .field input:focus,
    .field select:focus {
      border-color: #2dd4bf;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.14), 0 8px 18px rgba(15, 23, 42, 0.04);
    }
    .helper-strip {
      padding: 12px 14px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(240, 253, 250, 0.95), rgba(239, 246, 255, 0.92));
      border: 1px solid rgba(204, 251, 241, 0.95);
      color: #0f766e;
      font-size: 12px;
      line-height: 1.55;
    }
    .setup-guide {
      display: none;
      padding: 12px 14px;
      border-radius: 16px;
      border: 1px solid rgba(251, 191, 36, 0.4);
      background: linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(254, 243, 199, 0.7));
      color: #92400e;
      font-size: 12px;
      line-height: 1.55;
    }
    .setup-guide.visible {
      display: block;
    }
    .setup-guide strong {
      color: #78350f;
    }
    .status-strip {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 13px 14px;
      border-radius: 18px;
      background: rgba(240, 253, 250, 0.96);
      border: 1px solid rgba(153, 246, 228, 0.9);
      color: #0f766e;
      font-size: 12px;
      line-height: 1.55;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
    }
    .status-strip[data-tone="warn"] {
      background: rgba(255, 251, 235, 0.98);
      border-color: rgba(253, 230, 138, 0.95);
      color: #b45309;
    }
    .status-strip[data-tone="error"] {
      background: rgba(254, 242, 242, 0.98);
      border-color: rgba(254, 202, 202, 0.95);
      color: #b91c1c;
    }
    .status-strip[data-tone="run"] {
      background: rgba(239, 246, 255, 0.98);
      border-color: rgba(191, 219, 254, 0.95);
      color: #1d4ed8;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      margin-top: 4px;
      border-radius: 999px;
      background: currentColor;
      flex: 0 0 auto;
      box-shadow: 0 0 0 5px rgba(15, 118, 110, 0.12);
    }
    .status-strip[data-tone="run"] .status-dot {
      animation: pulse 1.2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.45; transform: scale(0.85); }
    }
    .actions {
      display: grid;
      grid-template-columns: 1.35fr 0.9fr;
      gap: 12px;
    }
    .button {
      height: 50px;
      border: 0;
      border-radius: 999px;
      font-size: 15px;
      font-weight: 760;
      cursor: pointer;
      transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
    }
    .button:disabled {
      cursor: not-allowed;
      opacity: 0.56;
      transform: none;
      box-shadow: none;
    }
    .button:not(:disabled):hover {
      transform: translateY(-1px);
    }
    .button.primary {
      background: linear-gradient(135deg, #0f766e 0%, #0891b2 55%, #0ea5e9 100%);
      color: #fff;
      box-shadow: 0 16px 30px rgba(15,118,110,0.24), inset 0 1px 0 rgba(255,255,255,0.22);
    }
    .button.primary:not(:disabled):hover {
      box-shadow: 0 18px 34px rgba(15,118,110,0.28), inset 0 1px 0 rgba(255,255,255,0.22);
    }
    .button.secondary {
      background: rgba(255,255,255,0.96);
      color: #334155;
      border: 1px solid rgba(203, 213, 225, 0.96);
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .stat {
      padding: 14px 8px 12px;
      border-radius: 20px;
      background: linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%);
      border: 1px solid rgba(226, 232, 240, 0.95);
      text-align: center;
      box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
    }
    .stat strong {
      display: block;
      font-size: 18px;
      line-height: 1;
      font-weight: 780;
      color: #0f172a;
    }
    .stat span {
      display: block;
      margin-top: 8px;
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .stat.accent {
      background: linear-gradient(180deg, rgba(240,253,250,0.98) 0%, rgba(236,254,255,0.95) 100%);
      border-color: rgba(153, 246, 228, 0.9);
    }
    .stat.accent strong {
      color: #0f766e;
    }
    .quick-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chip {
      height: 32px;
      padding: 0 12px;
      border-radius: 999px;
      border: 1px solid rgba(203, 213, 225, 0.95);
      background: rgba(255,255,255,0.96);
      color: #334155;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .chip:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 14px rgba(15, 23, 42, 0.06);
    }
    .chip.active {
      background: linear-gradient(135deg, rgba(240,253,250,0.98), rgba(224,242,254,0.96));
      border-color: rgba(45, 212, 191, 0.55);
      color: #0f766e;
    }
    .session-card {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      padding: 12px;
      border-radius: 18px;
      background: rgba(255,255,255,0.82);
      border: 1px solid rgba(226, 232, 240, 0.95);
    }
    .session-item {
      text-align: center;
      padding: 8px 4px;
      border-radius: 14px;
      background: rgba(248,250,252,0.96);
    }
    .session-item strong {
      display: block;
      font-size: 16px;
      color: #0f172a;
    }
    .session-item span {
      display: block;
      margin-top: 4px;
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .match-panel {
      border-radius: 20px;
      background: rgba(255,255,255,0.88);
      border: 1px solid rgba(226, 232, 240, 0.95);
      overflow: hidden;
      box-shadow: 0 10px 22px rgba(15, 23, 42, 0.04);
    }
    .match-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      border-bottom: 1px solid rgba(226, 232, 240, 0.9);
    }
    .match-head strong {
      font-size: 13px;
      color: #0f172a;
    }
    .match-actions {
      display: flex;
      gap: 6px;
    }
    .mini-btn {
      height: 30px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid rgba(203, 213, 225, 0.95);
      background: #fff;
      color: #475569;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
    }
    .mini-btn:hover {
      background: #f8fafc;
    }
    .match-list {
      max-height: 220px;
      overflow: auto;
      display: grid;
      gap: 0;
    }
    .match-item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      padding: 11px 12px;
      border-bottom: 1px solid rgba(241, 245, 249, 0.98);
      align-items: center;
    }
    .match-item:last-child {
      border-bottom: 0;
    }
    .match-item.done {
      opacity: 0.55;
    }
    .match-item.skipped {
      opacity: 0.45;
    }
    .match-main {
      min-width: 0;
      cursor: pointer;
    }
    .match-title {
      font-size: 13px;
      font-weight: 720;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .match-meta {
      margin-top: 3px;
      font-size: 11px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .match-ops {
      display: flex;
      gap: 4px;
    }
    .icon-mini {
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 999px;
      background: #f1f5f9;
      color: #475569;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }
    .icon-mini:hover {
      background: #e2e8f0;
    }
    .icon-mini.danger:hover {
      background: #fee2e2;
      color: #dc2626;
    }
    .empty-match {
      padding: 18px 14px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
      line-height: 1.5;
    }
    .footer-actions {
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .footer {
      padding: 2px 2px 0;
      font-size: 11px;
      line-height: 1.5;
      color: #94a3b8;
      text-align: center;
    }
  `;
  return style;
}

function buildPanel() {
  const wrapper = document.createElement("div");
  wrapper.className = "panel";
  wrapper.innerHTML = `
    <div class="header" data-drag-handle="true">
      <div class="header-top">
        <div class="brand">
          <div class="logo" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"></path>
              <rect x="4" y="7" width="16" height="11" rx="3"></rect>
              <path d="M4 12h16"></path>
              <path d="M10 12v2"></path>
              <path d="M14 12v2"></path>
            </svg>
          </div>
          <div class="title">
            <strong>BOSS海投助手</strong>
            <div class="subtitle">智能筛选 · 一键沟通</div>
          </div>
        </div>
        <div class="tools">
          <button class="icon-btn" type="button" data-action="advanced" title="高级选项" aria-label="高级选项">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .33-1.82 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.82.33h.01A1.7 1.7 0 0 0 10.03 3H10a2 2 0 1 1 4 0h.03a1.7 1.7 0 0 0 1.56 1.03h.01a1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.33 1.82v.01A1.7 1.7 0 0 0 21 10.03V10a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z"></path>
            </svg>
          </button>
          <button class="icon-btn" type="button" data-action="minimize" title="最小化" aria-label="最小化">
            <svg viewBox="0 0 24 24">
              <path d="M6 12h12"></path>
            </svg>
          </button>
          <button class="icon-btn" type="button" data-action="refresh" title="刷新" aria-label="刷新">
            <svg viewBox="0 0 24 24">
              <path d="M21 12a9 9 0 1 1-2.64-6.36"></path>
              <path d="M21 3v6h-6"></path>
            </svg>
          </button>
          <button class="icon-btn" type="button" data-action="close" title="关闭" aria-label="关闭">
            <svg viewBox="0 0 24 24">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="body">
      <section class="form-area">
        <div class="quick-row" id="presetRow">
          <button class="chip" type="button" data-preset="backend">后端</button>
          <button class="chip" type="button" data-preset="frontend">前端</button>
          <button class="chip" type="button" data-preset="fullstack">全栈</button>
          <button class="chip" type="button" data-preset="product">产品</button>
        </div>
        <div class="grid">
          <div class="field full">
            <label for="jobKeywords">职位关键词</label>
            <input id="jobKeywords" placeholder="后端, Java, +Go, -实习" />
          </div>
          <div class="field">
            <label for="locationKeywords">工作地点</label>
            <input id="locationKeywords" placeholder="上海, 浦东, 远程" />
          </div>
          <div class="field">
            <label for="salaryKeywords">薪资要求</label>
            <input id="salaryKeywords" placeholder="20-35K" />
          </div>
          <div class="field">
            <label for="jobMatchMode">关键词模式</label>
            <select id="jobMatchMode">
              <option value="any">任一命中</option>
              <option value="all">全部命中</option>
            </select>
          </div>
          <div class="field">
            <label for="dailyLimit">每日上限</label>
            <input id="dailyLimit" type="number" min="1" max="150" step="1" />
          </div>
          <div class="field full">
            <label for="excludeJobKeywords">排除职位词</label>
            <input id="excludeJobKeywords" placeholder="实习, 外包, 驻场" />
          </div>
        </div>
        <div class="helper-strip">先填关键词或点上方预设，再点「开始沟通」。招呼语、公司筛选等可在右上角高级选项设置。</div>
        <div class="setup-guide" id="setupGuide"></div>
        <div class="status-strip" id="statusStrip" data-tone="idle">
          <span class="status-dot" aria-hidden="true"></span>
          <span id="statusText">准备就绪</span>
        </div>
        <div class="actions">
          <button class="button primary" type="button" id="startButton" data-action="start">开始沟通</button>
          <button class="button secondary" type="button" id="stopButton" data-action="stop">暂停</button>
        </div>
      </section>
      <section>
        <div class="stats">
          <div class="stat"><strong id="jobCount">0</strong><span>职位</span></div>
          <div class="stat accent"><strong id="matchCount">0</strong><span>匹配</span></div>
          <div class="stat"><strong id="pendingCount">0</strong><span>待沟通</span></div>
          <div class="stat"><strong id="visitedCount">0</strong><span>已完成</span></div>
        </div>
      </section>
      <section class="session-card">
        <div class="session-item"><strong id="sessionDone">0</strong><span>本轮完成</span></div>
        <div class="session-item"><strong id="sessionSkip">0</strong><span>本轮跳过</span></div>
        <div class="session-item"><strong id="dailyDone">0</strong><span>今日已沟通</span></div>
      </section>
      <section class="match-panel">
        <div class="match-head">
          <strong>匹配职位</strong>
          <div class="match-actions">
            <button class="mini-btn" type="button" id="toggleMatchList">收起</button>
            <button class="mini-btn" type="button" id="exportHistory">导出记录</button>
          </div>
        </div>
        <div class="match-list" id="matchList">
          <div class="empty-match">填写筛选条件后，这里会显示匹配职位。</div>
        </div>
      </section>
      <div class="footer">在 BOSS 职位页使用</div>
    </div>
  `;
  return wrapper;
}

function hydrateForm() {
  ensureDailyCounter();
  setValue("jobKeywords", state.settings.jobKeywords);
  setValue("locationKeywords", state.settings.locationKeywords);
  setValue("salaryKeywords", state.settings.salaryKeywords || "");
  setValue("jobMatchMode", state.settings.jobMatchMode || "any");
  setValue("excludeJobKeywords", state.settings.excludeJobKeywords || "");
  setValue("dailyLimit", String(state.settings.dailyLimit || 50));
  setText("dailyDone", String(state.settings.dailyCount || 0));
  setText("sessionDone", String(state.sessionCompleted || 0));
  setText("sessionSkip", String(state.sessionSkipped || 0));
}

function bindEvents() {
  const shadowRoot = state.shadowRoot;
  shadowRoot.querySelector('[data-action="close"]').addEventListener("click", cleanup);
  shadowRoot.querySelector('[data-action="refresh"]').addEventListener("click", () => {
    logEvent("手动刷新", "重新扫描页面职位和详情。");
    refreshPageSnapshot("手动刷新");
  });
  shadowRoot.querySelector('[data-action="advanced"]').addEventListener("click", () => {
    void openAdvancedWindow();
  });
  shadowRoot.querySelector('[data-action="minimize"]').addEventListener("click", toggleMinimize);
  shadowRoot.querySelector('[data-action="start"]').addEventListener("click", () => void startAutomation());
  shadowRoot.querySelector('[data-action="stop"]').addEventListener("click", () => {
    stopAutomation();
  });

  shadowRoot.getElementById("toggleMatchList")?.addEventListener("click", () => {
    state.matchListExpanded = !state.matchListExpanded;
    const list = shadowRoot.getElementById("matchList");
    const btn = shadowRoot.getElementById("toggleMatchList");
    if (list) {
      list.style.display = state.matchListExpanded ? "grid" : "none";
    }
    if (btn) {
      btn.textContent = state.matchListExpanded ? "收起" : "展开";
    }
  });

  shadowRoot.getElementById("exportHistory")?.addEventListener("click", () => {
    exportHistoryRecords();
  });

  shadowRoot.getElementById("presetRow")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-preset]");
    if (!button) {
      return;
    }
    applyFilterPreset(button.dataset.preset);
  });

  shadowRoot.getElementById("matchList")?.addEventListener("click", (event) => {
    const actionBtn = event.target.closest("[data-job-action]");
    const item = event.target.closest("[data-job-key]");
    if (!item) {
      return;
    }
    const key = item.dataset.jobKey;
    if (!key) {
      return;
    }
    if (actionBtn) {
      handleMatchListAction(actionBtn.dataset.jobAction, key);
      return;
    }
    void focusMatchedJob(key);
  });

  bindFormPersistence();
  bindDrag();
}

function bindFormPersistence() {
  for (const id of ["jobKeywords", "locationKeywords", "salaryKeywords", "jobMatchMode", "excludeJobKeywords", "dailyLimit"]) {
    const element = state.shadowRoot.getElementById(id);
    if (!element) {
      continue;
    }
    const eventName = element.tagName === "SELECT" || element.type === "checkbox" || element.type === "number" ? "change" : "input";
    element.addEventListener(eventName, () => {
      void persistSettingsFromForm();
    });
  }
}

async function openAdvancedWindow() {
  const toggle = state.shadowRoot.querySelector('[data-action="advanced"]');
  toggle.classList.add("active");
  try {
    const response = await chrome.runtime.sendMessage({
      type: "boss-helper:open-advanced-window"
    });
    if (response?.ok === false) {
      throw new Error(response.error || "打开高级设置失败");
    }
    setStatus("已打开高级设置，保存后会自动同步到这里", "idle");
  } catch (error) {
    // 后台开窗失败时，尽量直接打开扩展内页面
    try {
      const url = chrome.runtime.getURL("advanced.html");
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("已尝试打开高级设置页", "idle");
    } catch (fallbackError) {
      setStatus("高级设置打开失败，请重新加载扩展后再试", "error");
      logEvent("开窗失败", `${asMessage(error)} | ${asMessage(fallbackError)}`);
    }
  } finally {
    setTimeout(() => {
      toggle.classList.remove("active");
    }, 180);
  }
}

function bindDrag() {
  const handle = state.shadowRoot.querySelector("[data-drag-handle='true']");
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  handle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) {
      return;
    }
    const rect = state.host.getBoundingClientRect();
    dragging = true;
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!dragging) {
      return;
    }
    const left = clamp(event.clientX - offsetX, 8, window.innerWidth - state.host.offsetWidth - 8);
    const top = clamp(event.clientY - offsetY, 8, window.innerHeight - state.host.offsetHeight - 8);
    state.host.style.left = `${left}px`;
    state.host.style.top = `${top}px`;
    state.host.style.right = "auto";
  });

  handle.addEventListener("pointerup", (event) => {
    if (!dragging) {
      return;
    }
    dragging = false;
    handle.releasePointerCapture(event.pointerId);
    savePanelPosition();
  });
}

async function persistSettingsFromForm() {
  state.settings = {
    ...state.settings,
    jobKeywords: getValue("jobKeywords"),
    locationKeywords: getValue("locationKeywords"),
    salaryKeywords: getValue("salaryKeywords"),
    jobMatchMode: getValue("jobMatchMode") === "all" ? "all" : "any",
    excludeJobKeywords: getValue("excludeJobKeywords"),
    dailyLimit: clampNumber(Number(getValue("dailyLimit")), 1, 150, 50)
  };

  const payload = { ...state.settings };
  let saved = false;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "boss-helper:save-settings",
      payload
    });
    if (response?.ok === false) {
      throw new Error(response.error || "后台保存失败");
    }
    if (response?.settings) {
      state.settings = normalizeLoadedSettings(response.settings);
    }
    saved = true;
  } catch (error) {
    logEvent("保存失败", `消息通道：${asMessage(error)}`);
  }

  // service worker 休眠时直写 storage，避免设置丢失
  if (!saved && chrome?.storage?.local?.set) {
    try {
      await chrome.storage.local.set(payload);
      saved = true;
    } catch (error) {
      logEvent("保存失败", `直写 storage：${asMessage(error)}`);
      setStatus("设置暂未保存成功，请检查扩展是否仍启用", "warn");
    }
  }

  if (saved) {
    ensureDailyCounter();
    hydrateForm();
  }

  refreshPageSnapshot("筛选条件更新");
  if (state.running) {
    restartAutomationLoop();
  }
}

function applyFilterPreset(presetId) {
  const preset = FILTER_PRESETS.find((item) => item.id === presetId);
  if (!preset) {
    return;
  }

  state.settings = {
    ...state.settings,
    jobKeywords: preset.jobKeywords,
    excludeJobKeywords: preset.excludeJobKeywords,
    jobMatchMode: preset.jobMatchMode || "any",
    salaryKeywords: preset.salaryKeywords || state.settings.salaryKeywords
  };

  hydrateForm();
  void persistSettingsFromForm();
  setStatus(`已应用「${preset.name}」筛选`, "idle");

  const chips = state.shadowRoot?.querySelectorAll("[data-preset]") || [];
  for (const chip of chips) {
    chip.classList.toggle("active", chip.dataset.preset === presetId);
  }
}

function ensureDailyCounter() {
  const today = getTodayKey();
  if (state.settings.dailyCountDate !== today) {
    state.settings.dailyCountDate = today;
    state.settings.dailyCount = 0;
  }
}

function getTodayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function getRemainingDailyQuota() {
  ensureDailyCounter();
  const limit = clampNumber(Number(state.settings.dailyLimit), 1, 150, 50);
  const used = clampNumber(Number(state.settings.dailyCount), 0, 9999, 0);
  return Math.max(limit - used, 0);
}

async function bumpDailyCountAndHistory(job, status = "greeted") {
  ensureDailyCounter();
  state.settings.dailyCount = clampNumber(Number(state.settings.dailyCount), 0, 9999, 0) + 1;
  state.sessionCompleted += 1;

  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    title: job?.title || "",
    company: job?.company || "",
    salary: job?.salary || "",
    location: job?.location || "",
    status
  };

  const history = Array.isArray(state.settings.historyRecords) ? state.settings.historyRecords.slice() : [];
  history.unshift(record);
  state.settings.historyRecords = history.slice(0, 300);

  setText("dailyDone", String(state.settings.dailyCount));
  setText("sessionDone", String(state.sessionCompleted));

  try {
    await chrome.runtime.sendMessage({
      type: "boss-helper:save-settings",
      payload: {
        dailyCount: state.settings.dailyCount,
        dailyCountDate: state.settings.dailyCountDate,
        historyRecords: state.settings.historyRecords
      }
    });
  } catch (error) {
    logEvent("保存统计失败", asMessage(error));
  }
}

function exportHistoryRecords() {
  const records = Array.isArray(state.settings.historyRecords) ? state.settings.historyRecords : [];
  if (!records.length) {
    setStatus("暂无沟通记录可导出", "warn");
    return;
  }

  const header = ["时间", "职位", "公司", "薪资", "地点", "状态"];
  const lines = [header.join(",")].concat(records.map((item) => {
    return [
      item.at || "",
      item.title || "",
      item.company || "",
      item.salary || "",
      item.location || "",
      item.status || ""
    ].map(csvEscape).join(",");
  }));

  const blob = new Blob([`\uFEFF${lines.join("\n")}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `boss-helper-history-${getTodayKey()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus(`已导出 ${records.length} 条沟通记录`, "idle");
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

async function focusMatchedJob(key) {
  const snapshot = collectPageSnapshot();
  const job = snapshot.jobs.find((item) => item.key === key);
  if (!job) {
    setStatus("未找到该职位，请刷新后重试", "warn");
    return;
  }
  setStatus(`已定位：${job.title || "职位"}`, "idle");
  await focusJob(job);
}

function handleMatchListAction(action, key) {
  if (action === "skip") {
    state.skippedJobs.add(key);
    state.sessionSkipped += 1;
    setText("sessionSkip", String(state.sessionSkipped));
    setStatus("已跳过该职位", "warn");
    refreshPageSnapshot("手动跳过职位");
    return;
  }

  if (action === "only") {
    state.onlyJobKey = key;
    setStatus("将仅沟通该职位", "run");
    if (!state.running) {
      void startAutomation();
    }
  }
}

function renderMatchList(snapshot) {
  const list = state.shadowRoot?.getElementById("matchList");
  if (!list) {
    return;
  }

  const matched = snapshot.jobs.filter((job) => job.matches).slice(0, 30);
  if (!matched.length) {
    let emptyText = "填写职位关键词或点上方预设后，这里会显示匹配职位。";
    if (!snapshot.onJobPage) {
      emptyText = "请先打开 BOSS「职位」列表页。";
    } else if (snapshot.jobs.length) {
      const shortHint = buildShortMismatchHint(snapshot.jobs);
      emptyText = shortHint
        ? `当前条件暂无匹配。${shortHint}`
        : "当前条件暂无匹配职位，可放宽筛选后再试。";
    } else {
      emptyText = "职位列表还在加载，或页面结构未识别。可点刷新重试。";
    }
    list.innerHTML = `<div class="empty-match">${escapeHtml(emptyText)}</div>`;
    return;
  }

  list.innerHTML = matched.map((job) => {
    const done = state.visitedJobs.has(job.key);
    const skipped = state.skippedJobs.has(job.key);
    const className = ["match-item", done ? "done" : "", skipped ? "skipped" : ""].filter(Boolean).join(" ");
    const badge = done ? "已完成" : skipped ? "已跳过" : (job.salary || "待沟通");
    return `
      <div class="${className}" data-job-key="${escapeHtml(job.key)}">
        <div class="match-main" title="点击定位职位">
          <div class="match-title">${escapeHtml(job.title || "未识别职位")}</div>
          <div class="match-meta">${escapeHtml([job.company, job.location, badge].filter(Boolean).join(" · "))}</div>
        </div>
        <div class="match-ops">
          <button class="icon-mini" type="button" data-job-action="only" title="仅沟通此项">1</button>
          <button class="icon-mini danger" type="button" data-job-action="skip" title="跳过">×</button>
        </div>
      </div>
    `;
  }).join("");
}

function handleStorageChanges(changes, areaName) {
  if (areaName !== "local") {
    return;
  }

  let settingsChanged = false;
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (changes[key]) {
      state.settings[key] = changes[key].newValue;
      settingsChanged = true;
    }
  }

  if (!settingsChanged) {
    return;
  }

  state.settings = normalizeLoadedSettings(state.settings);
  ensureDailyCounter();
  hydrateForm();
  if (state.running) {
    restartAutomationLoop();
  }
  refreshPageSnapshot("设置已更新");
}

function installObservers() {
  const observer = new MutationObserver(() => {
    debounceRefresh();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "href"]
  });
  state.observer = observer;
  window.addEventListener("popstate", handleUrlMaybeChanged);
  window.addEventListener("hashchange", handleUrlMaybeChanged);
}

function startAutoReplyLoop() {
  clearInterval(state.autoReplyTimer);
  state.lastAutoReplySignature = "";
  state.autoReplyDebug = "";
  if (state.settings.autoReplyEnabled) {
    logEvent("自动回复", "聊天监控已启动，等待聊天窗口出现。");
  }
  state.autoReplyTimer = setInterval(() => {
    void tryAutoReply();
  }, AUTO_REPLY_POLL_MS);
}

function handleUrlMaybeChanged() {
  state.visitedJobs.clear();
  state.skippedJobs.clear();
  state.failedJobAttempts.clear();
  state.fullListReadComplete = false;
  logEvent("路由变化", "页面地址变化，已清空已处理列表。");
  refreshPageSnapshot("检测到页面路由变化");
}

let refreshTimer = null;

function debounceRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    if (state.running && pauseForCommunicationLimit("页面内容更新")) {
      return;
    }
    refreshPageSnapshot("页面内容更新");
  }, 260);
}

function refreshPageSnapshot(reason) {
  const snapshot = collectPageSnapshot();
  const signature = JSON.stringify({
    url: snapshot.url,
    currentJobKey: snapshot.currentJob?.key,
    listedJobs: snapshot.jobs.map((job) => job.key)
  });

  if (signature === state.lastSnapshotSignature && reason !== "手动刷新") {
    renderSnapshot(snapshot, reason);
    return;
  }

  state.lastSnapshotSignature = signature;
  state.currentJob = snapshot.currentJob;
  renderSnapshot(snapshot, reason);
}

function collectPageSnapshot() {
  const pageState = detectPageState();
  const onJobPage = pageState.ready;
  const jobs = onJobPage ? collectJobList() : [];
  const currentJob = onJobPage ? collectCurrentJobFromList(jobs) : null;

  if (currentJob?.key) {
    state.selectedJobIndex = jobs.findIndex((job) => job.key === currentJob.key);
  } else {
    state.selectedJobIndex = jobs.findIndex((job) => job.active);
  }

  if (state.selectedJobIndex >= 0 && jobs[state.selectedJobIndex]) {
    jobs[state.selectedJobIndex].active = true;
  }

  return {
    url: location.href,
    title: document.title,
    onJobPage,
    pageState,
    jobs,
    currentJob,
    capturedAt: new Date().toLocaleTimeString()
  };
}

function collectJobList() {
  const container = findJobListContainer();
  if (!container) {
    return [];
  }

  const seen = new Set();
  const results = [];

  for (const selector of SELECTORS.listItems) {
    const nodes = Array.from(container.querySelectorAll(selector));
    for (const node of nodes) {
      const card = normalizeJobElement(node);
      if (!card || seen.has(card) || !isLikelyJobListCard(card)) {
        continue;
      }
      seen.add(card);
      results.push(card);
    }
    if (results.length) {
      break;
    }
  }

  return results
    .map((element, index) => parseJobCard(element, index))
    .filter((job) => job.title || job.company || job.salary)
    .filter((job) => !looksLikeDetailPollution(job));
}

function normalizeJobElement(node) {
  if (!(node instanceof HTMLElement)) {
    return null;
  }
  if (node.matches(".job-card-wrapper")) {
    return node;
  }
  return node.closest(".job-card-wrapper, .job-list-item, [class*='job-card']") || node;
}

function parseJobCard(element, index) {
  const title = firstNonEmpty([
    pickText(element, SELECTORS.listTitle),
    findLineLikeTitle(element)
  ]);

  const salary = firstNonEmpty([
    pickText(element, SELECTORS.listSalary),
    findSalaryLikeText(element)
  ]);

  const company = firstNonEmpty([
    pickText(element, SELECTORS.listCompany),
    findCompanyLikeText(element, title, salary)
  ]);

  const location = firstNonEmpty([
    pickText(element, SELECTORS.listLocation),
    findLocationLikeText(element)
  ]);

  const recruiterStatus = firstNonEmpty([
    pickText(element, SELECTORS.listRecruiterStatus),
    findRecruiterActivityLikeText(element),
    extractRecruiterActivityFromText(element.textContent)
  ]);

  const matchDetails = getJobMatchDetails({ title, company, salary, location, recruiterStatus });

  return {
    key: buildJobKey({ title, company, salary, location, index }),
    title,
    company,
    salary,
    location,
    recruiterStatus,
    fullText: normalizeText(element.textContent),
    matches: matchDetails.matches,
    matchDetails,
    active: isJobCardActive(element),
    index,
    element
  };
}

function looksLikeDetailPollution(job) {
  const text = `${job.title} ${job.company} ${job.location} ${job.salary}`;
  return /职位描述|查看更多信息|人力经纪人/.test(text);
}

function findJobListContainer() {
  const candidates = queryAllExisting(SELECTORS.listContainers)
    .filter((element) => element instanceof HTMLElement);

  return candidates.find((element) => {
    const rect = element.getBoundingClientRect();
    const hasCards = Boolean(element.querySelector(".job-card-wrapper, .job-list-item, [class*='job-card']"));
    const leftSide = rect.left < window.innerWidth * 0.5;
    return hasCards && leftSide;
  }) || null;
}

function isLikelyJobListCard(element) {
  const text = normalizeText(element.textContent);
  if (!text || text.length < 8) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.left > window.innerWidth * 0.55) {
    return false;
  }

  const hasSalary = Boolean(pickText(element, SELECTORS.listSalary) || findSalaryLikeText(element));
  const hasCompany = Boolean(pickText(element, SELECTORS.listCompany) || findCompanyLikeText(element, "", ""));
  const hasTitle = Boolean(pickText(element, SELECTORS.listTitle) || findLineLikeTitle(element));

  return hasTitle && (hasSalary || hasCompany);
}

function collectCurrentJobFromList(jobs) {
  const activeJob = jobs.find((job) => job.active);
  if (activeJob) {
    return {
      key: activeJob.key,
      title: activeJob.title,
      company: activeJob.company,
      salary: activeJob.salary,
      location: activeJob.location,
      recruiterStatus: activeJob.recruiterStatus,
      tags: [],
      description: ""
    };
  }

  return collectCurrentDetail(jobs);
}

function collectCurrentDetail(jobs) {
  const title = queryText(SELECTORS.detailTitle);
  const company = queryText(SELECTORS.detailCompany);
  const salary = queryText(SELECTORS.detailSalary);
  const location = cleanLocationText(queryText(SELECTORS.detailLocation));
  const tags = queryAllTexts(SELECTORS.detailTags).slice(0, 6);
  const description = truncateText(queryText(SELECTORS.detailDescription), 220);

  if (!title && !company && !description) {
    return null;
  }

  const exactJob = jobs.find((job) => sameMeaningfulText(job.title, title) || sameMeaningfulText(job.company, company));
  const recruiterStatus = firstNonEmpty([
    exactJob?.recruiterStatus,
    extractRecruiterActivityFromText(tags.join(" ")),
    extractRecruiterActivityFromText(description)
  ]);
  return {
    key: exactJob?.key || buildJobKey({ title, company, salary, location, index: 0 }),
    title,
    company,
    salary,
    location,
    recruiterStatus,
    tags,
    description
  };
}

function renderSnapshot(snapshot, reason) {
  ensureDailyCounter();
  const matchedJobs = snapshot.jobs.filter((job) => job.matches);
  const pendingCount = matchedJobs.filter((job) => {
    return !state.visitedJobs.has(job.key) && !state.skippedJobs.has(job.key);
  }).length;
  const showKnownCounts = state.fullListReadComplete || state.preloading || state.running || matchedJobs.length > 0;
  setText("jobCount", showKnownCounts ? String(snapshot.jobs.length) : "—");
  setText("matchCount", showKnownCounts ? String(matchedJobs.length) : "—");
  setText("pendingCount", showKnownCounts ? String(pendingCount) : "—");
  setText("visitedCount", String(state.visitedJobs.size));
  setText("dailyDone", String(state.settings.dailyCount || 0));
  setText("sessionDone", String(state.sessionCompleted || 0));
  setText("sessionSkip", String(state.sessionSkipped || 0));
  updateStatusStrip(snapshot, reason, matchedJobs.length, pendingCount);
  renderMatchList(snapshot);
  syncButtonState(snapshot);
}

function updateStatusStrip(snapshot, reason, matchedCount, pendingCount) {
  if (!state.shadowRoot) {
    return;
  }

  const readiness = evaluateReadiness(snapshot, matchedCount, pendingCount);
  renderSetupGuide(readiness);

  let tone = "idle";
  let text = state.statusText || "就绪";

  if (state.running || state.preloading || state.processing) {
    // 运行态优先保留当前状态
  } else if (readiness.blockingMessage) {
    tone = readiness.tone || "warn";
    text = readiness.blockingMessage;
  }

  if (!snapshot.onJobPage) {
    tone = "warn";
    text = readiness.blockingMessage || "请先打开 BOSS 职位列表页";
  } else if (state.preloading) {
    tone = "run";
    text = "正在准备职位列表...";
  } else if (state.running && state.processing) {
    tone = "run";
    text = `正在沟通：${state.currentJob?.title || "当前职位"}`;
  } else if (state.running) {
    tone = "run";
    text = pendingCount > 0
      ? `沟通进行中，还有 ${pendingCount} 个待沟通`
      : "沟通进行中，等待更多匹配职位";
  } else if (reason === "手动暂停" || reason === "检测到沟通上限") {
    tone = reason === "检测到沟通上限" ? "error" : "warn";
    text = state.statusText || (reason === "检测到沟通上限" ? "今日沟通次数已达上限" : "已暂停");
  } else if (reason === "筛选条件更新" || reason === "设置已更新" || reason === "手动刷新") {
    tone = matchedCount > 0 ? "idle" : "warn";
    text = readiness.blockingMessage
      || (snapshot.jobs.length
        ? `已匹配 ${matchedCount} 个职位，待沟通 ${pendingCount}`
        : "页面已打开，正在等待职位列表加载");
    if (!matchedCount && snapshot.jobs.length) {
      const hint = buildMismatchSummary(snapshot.jobs);
      if (hint && hint !== state.lastFilterHint) {
        state.lastFilterHint = hint;
        logEvent("筛选提示", hint.replace(/\n/g, " | "));
      }
    }
  } else if (String(reason || "").includes("失败") || String(reason || "").includes("上限")) {
    tone = "error";
    text = state.statusText || reason || "出现异常";
  } else if (state.fullListReadComplete) {
    tone = matchedCount > 0 ? "idle" : "warn";
    text = readiness.blockingMessage
      || (matchedCount > 0
        ? `准备就绪：匹配 ${matchedCount}，待沟通 ${pendingCount}`
        : "暂无匹配职位，可放宽筛选条件");
  } else if (snapshot.onJobPage && !readiness.blockingMessage) {
    tone = matchedCount > 0 ? "idle" : "idle";
    text = matchedCount > 0
      ? `已识别 ${snapshot.jobs.length} 个职位，匹配 ${matchedCount}`
      : (snapshot.jobs.length ? "职位已识别，可继续调整筛选" : "职位页已打开，等待列表加载");
  }

  state.statusText = text;
  const strip = state.shadowRoot.getElementById("statusStrip");
  const label = state.shadowRoot.getElementById("statusText");
  if (strip) {
    strip.dataset.tone = tone;
  }
  if (label) {
    label.textContent = text;
  }
}

function evaluateReadiness(snapshot, matchedCount = 0, pendingCount = 0) {
  const pageState = snapshot.pageState || detectPageState();
  const hasJobKeywords = Boolean(String(state.settings.jobKeywords || "").trim());
  const remainingQuota = getRemainingDailyQuota();
  const tips = [];
  let tone = "idle";
  let blockingMessage = "";
  // 职位列表可能懒加载：页面就绪时允许启动，由启动流程负责完整读取
  let canStart = pageState.ready && remainingQuota > 0;

  if (!pageState.ready) {
    canStart = false;
    tone = "warn";
    blockingMessage = pageState.message;
    tips.push(pageState.tip || "请打开 BOSS 顶部「职位」页，并确保左侧有职位列表。");
  } else if (remainingQuota <= 0) {
    canStart = false;
    tone = "error";
    blockingMessage = "今日沟通次数已达设置上限";
    tips.push(`当前每日上限 ${state.settings.dailyLimit}，可在面板调高后继续。`);
  }

  if (pageState.ready && !hasJobKeywords) {
    tone = "warn";
    tips.push("还没填职位关键词：会匹配当前列表中的大部分职位。建议点上方预设，或填写如「后端, Java」。");
  }

  if (pageState.ready && snapshot.jobs.length === 0) {
    tone = "warn";
    if (!blockingMessage) {
      blockingMessage = "暂未识别到职位列表，可点开始尝试加载";
    }
    tips.push("请确认已登录 BOSS，并等待左侧职位列表加载；也可直接点开始沟通自动滚动加载。");
  }

  if (pageState.ready && snapshot.jobs.length > 0 && matchedCount === 0) {
    tone = "warn";
    const shortHint = buildShortMismatchHint(snapshot.jobs);
    if (state.fullListReadComplete) {
      // 完整列表已读完仍无匹配，才真正拦截
      canStart = false;
      blockingMessage = "当前筛选条件下没有可沟通职位";
      if (shortHint) {
        tips.push(shortHint);
      }
      tips.push("可放宽关键词、地点、薪资，或切换为「任一命中」。");
    } else {
      blockingMessage = shortHint
        ? `当前可见职位未匹配（${shortHint}）`
        : "当前可见职位未匹配，可点开始继续加载更多";
      tips.push("先点「开始沟通」，助手会自动滚动加载完整列表再筛选。");
      if (shortHint) {
        tips.push(shortHint);
      }
    }
  }

  if (pageState.ready && matchedCount > 0 && remainingQuota > 0) {
    tips.push(`今日还可沟通 ${remainingQuota} 次 · 待沟通 ${pendingCount}`);
  }

  if (state.settings.sendImageResume && !state.settings.imageResumeDataUrl) {
    tips.push("已开启图片简历，但还没上传文件，请到高级选项补充。");
  }

  return {
    canStart,
    tone,
    blockingMessage,
    tips: uniqueStrings(tips).slice(0, 3),
    remainingQuota,
    hasJobKeywords,
    pageState
  };
}

function renderSetupGuide(readiness) {
  const guide = state.shadowRoot?.getElementById("setupGuide");
  if (!guide) {
    return;
  }

  if (!readiness?.tips?.length || state.running || state.preloading) {
    guide.classList.remove("visible");
    guide.innerHTML = "";
    return;
  }

  const title = readiness.canStart ? "使用提示" : "还差一步就能开始";
  guide.innerHTML = `<strong>${title}</strong><br>${readiness.tips.map((tip) => `• ${escapeHtml(tip)}`).join("<br>")}`;
  guide.classList.add("visible");
}

function buildShortMismatchHint(jobs) {
  const sample = (jobs || []).filter((job) => !job.matches).slice(0, 8);
  if (!sample.length) {
    return "";
  }

  const counters = {
    title: 0,
    excludeTitle: 0,
    location: 0,
    company: 0,
    excludeCompany: 0,
    salary: 0,
    recruiter: 0
  };

  for (const job of sample) {
    const details = job.matchDetails || {};
    if (!details.titleOk) counters.title += 1;
    if (!details.excludeTitleOk) counters.excludeTitle += 1;
    if (!details.locationOk) counters.location += 1;
    if (!details.companyOk) counters.company += 1;
    if (!details.excludeCompanyOk) counters.excludeCompany += 1;
    if (!details.salaryOk) counters.salary += 1;
    if (!details.recruiterStatusOk) counters.recruiter += 1;
  }

  const ranked = [
    [counters.title, "职位关键词没命中"],
    [counters.excludeTitle, "命中了排除职位词"],
    [counters.location, "工作地点不符"],
    [counters.salary, "薪资要求过严或岗位无薪资"],
    [counters.company, "公司关键词没命中"],
    [counters.excludeCompany, "命中了排除公司词"],
    [counters.recruiter, "招聘方活跃状态不符"]
  ].filter(([count]) => count > 0).sort((a, b) => b[0] - a[0]);

  if (!ranked.length) {
    return "列表有职位，但都被当前筛选挡掉了。";
  }

  return `主要卡在：${ranked.slice(0, 2).map((item) => item[1]).join("、")}`;
}

function setStatus(text, tone = "idle") {
  state.statusText = text;
  const strip = state.shadowRoot?.getElementById("statusStrip");
  const label = state.shadowRoot?.getElementById("statusText");
  if (strip) {
    strip.dataset.tone = tone;
  }
  if (label) {
    label.textContent = text;
  }
}

// 保留内部记录能力，默认不在界面展示（面向客户）
function logEvent(type, message) {
  state.logs.unshift({
    type,
    message,
    time: new Date().toLocaleTimeString()
  });
  state.logs = state.logs.slice(0, MAX_LOGS);
}

function syncButtonState(snapshot = collectPageSnapshot()) {
  const startButton = state.shadowRoot.getElementById("startButton");
  const stopButton = state.shadowRoot.getElementById("stopButton");
  if (!startButton || !stopButton) {
    return;
  }

  const matchedCount = snapshot.jobs.filter((job) => job.matches).length;
  const pendingCount = snapshot.jobs.filter((job) => {
    return job.matches && !state.visitedJobs.has(job.key) && !state.skippedJobs.has(job.key);
  }).length;
  const readiness = evaluateReadiness(snapshot, matchedCount, pendingCount);

  const blocked = state.running || state.startButtonLocked || state.preloading || !readiness.canStart;
  startButton.disabled = blocked;
  stopButton.disabled = !state.running;

  if (state.running) {
    startButton.textContent = state.processing ? "沟通中..." : "进行中";
  } else if (state.preloading) {
    startButton.textContent = "准备中...";
  } else if (!snapshot.onJobPage) {
    startButton.textContent = "请进入职位页";
  } else if (getRemainingDailyQuota() <= 0) {
    startButton.textContent = "今日已达上限";
  } else if (snapshot.jobs.length > 0 && !matchedCount && state.fullListReadComplete) {
    startButton.textContent = "暂无匹配";
  } else {
    startButton.textContent = "开始沟通";
  }
}

async function startAutomation() {
  if (state.running || state.startButtonLocked) {
    return;
  }

  let snapshot = collectPageSnapshot();
  const matchedPreview = snapshot.jobs.filter((job) => job.matches).length;
  const readiness = evaluateReadiness(snapshot, matchedPreview, matchedPreview);
  renderSetupGuide(readiness);

  if (!snapshot.onJobPage) {
    setStatus(readiness.blockingMessage || "请先打开职位列表页", "error");
    logEvent("启动失败", readiness.pageState?.tip || "当前不是职位页。请点击顶部“职位”导航后再启动。");
    refreshPageSnapshot("启动失败：非职位页");
    return;
  }

  if (getRemainingDailyQuota() <= 0) {
    setStatus("今日沟通次数已达设置上限，可在面板调高每日上限", "error");
    refreshPageSnapshot("启动失败：达到每日上限");
    return;
  }

  if (!String(state.settings.jobKeywords || "").trim()) {
    setStatus("未填职位关键词，将按当前列表宽匹配启动", "warn");
  }

  state.startButtonLocked = true;
  state.fullListReadComplete = false;
  state.skippedJobs.clear();
  state.failedJobAttempts.clear();
  state.sessionCompleted = 0;
  state.sessionSkipped = 0;
  state.sessionFailed = 0;
  state.sessionStartedAt = new Date().toISOString();
  setText("sessionDone", "0");
  setText("sessionSkip", "0");
  setStatus("正在准备匹配职位...", "run");
  syncButtonState(snapshot);

  try {
    await persistSettingsFromForm();
    await preloadFullJobList();
    snapshot = collectPageSnapshot();

    if (detectCommunicationLimitModal()) {
      setStatus("BOSS 提示今日沟通次数已达上限，请明天再试", "error");
      logEvent("启动失败", "检测到“无法进行沟通”提示，今天的沟通额度可能已用完，请明天再试。");
      refreshPageSnapshot("启动失败：沟通额度已达上限");
      return;
    }

    if (!snapshot.jobs.length) {
      setStatus("还没识别到职位列表，请确认已登录并等待页面加载", "error");
      logEvent("启动失败", "已经滑动到底，但仍未识别到职位列表。");
      refreshPageSnapshot("启动失败：未识别职位列表");
      return;
    }

    const matchedJobs = snapshot.jobs.filter((job) => job.matches);
    if (!matchedJobs.length) {
      const summary = buildMismatchSummary(snapshot.jobs);
      const shortHint = buildShortMismatchHint(snapshot.jobs);
      setStatus(shortHint ? `暂无匹配：${shortHint}` : "暂无匹配职位，可放宽筛选条件", "error");
      logEvent("启动失败", "完整读取列表后仍没有职位命中筛选条件，请调整关键词或放宽可选筛选。");
      if (summary) {
        logEvent("筛选提示", summary.replace(/\n/g, " | "));
      }
      refreshPageSnapshot("启动失败：没有匹配职位");
      return;
    }

    if (state.onlyJobKey && !matchedJobs.some((job) => job.key === state.onlyJobKey)) {
      state.onlyJobKey = "";
    }

    try {
      await chrome.runtime.sendMessage({ type: "boss-helper:start-delivery" });
    } catch (error) {
      // 后台仅做运行态记录，失败不阻断主流程
      logEvent("启动提示", `后台状态记录失败（不影响沟通）：${asMessage(error)}`);
    }

    state.running = true;
    const quota = getRemainingDailyQuota();
    setStatus(`开始沟通：匹配 ${matchedJobs.length}，今日剩余 ${quota}`, "run");
    logEvent("启动成功", `开始自动海投，命中 ${matchedJobs.length}，轮询间隔 ${state.settings.pollIntervalMs}ms。`);
    refreshPageSnapshot("启动海投");
    restartAutomationLoop();
  } catch (error) {
    setStatus(`启动失败：${asMessage(error)}`, "error");
    logEvent("启动失败", asMessage(error));
    refreshPageSnapshot("启动失败：消息发送异常");
  } finally {
    state.startButtonLocked = false;
    syncButtonState();
  }
}

function stopAutomation(options = {}) {
  const {
    runtimeStatus = "paused",
    logType = "已暂停",
    logMessage = "自动海投已暂停。",
    refreshReason = "手动暂停"
  } = options;

  if (!state.running) {
    return false;
  }
  state.running = false;
  state.processing = false;
  clearTimeout(state.loopTimer);
  setStatus(runtimeStatus === "communication_limit" ? "今日沟通次数已达上限" : "已暂停", "warn");
  void chrome.runtime.sendMessage({
    type: "boss-helper:update-runtime",
    payload: { lastStatus: runtimeStatus }
  });
  if (logType && logMessage) {
    logEvent(logType, logMessage);
  }
  refreshPageSnapshot(refreshReason);
  return true;
}

function restartAutomationLoop() {
  clearTimeout(state.loopTimer);
  if (!state.running) {
    return;
  }
  state.loopTimer = setTimeout(() => {
    void automationTick();
  }, state.settings.pollIntervalMs);
}

async function automationTick() {
  if (!state.running || state.processing) {
    restartAutomationLoop();
    return;
  }

  state.processing = true;
  refreshPageSnapshot("轮询中");
  syncButtonState();

  try {
    if (pauseForCommunicationLimit("轮询开始")) {
      return;
    }

    if (getRemainingDailyQuota() <= 0) {
      stopAutomation({
        runtimeStatus: "daily_limit",
        logType: "达到上限",
        logMessage: "已达到设置的每日沟通上限。",
        refreshReason: "达到每日上限"
      });
      setStatus("今日沟通次数已达设置上限", "error");
      return;
    }

    const snapshot = collectPageSnapshot();
    const nextJob = snapshot.jobs.find((job) => {
      if (!job.matches || state.visitedJobs.has(job.key) || state.skippedJobs.has(job.key)) {
        return false;
      }
      if (state.onlyJobKey) {
        return job.key === state.onlyJobKey;
      }
      return true;
    });

    if (!nextJob) {
      const matchedCount = snapshot.jobs.filter((job) => job.matches).length;
      if (state.onlyJobKey) {
        state.onlyJobKey = "";
        stopAutomation({
          runtimeStatus: "completed",
          logType: "完成",
          logMessage: "指定职位已处理完成。",
          refreshReason: "单职位处理完成"
        });
        setStatus("指定职位已处理完成", "idle");
        return;
      }
      setStatus("暂无待沟通职位，正在查找更多", "run");
      logEvent("等待中", `没有可继续处理的匹配职位。命中 ${matchedCount}，已处理 ${state.visitedJobs.size}，已跳过 ${state.skippedJobs.size}。`);
      await tryLoadMoreJobsFromList();
      refreshPageSnapshot("没有新的匹配职位");
      return;
    }

    state.currentJob = nextJob;
    setStatus(`正在沟通：${nextJob.title || "当前职位"}`, "run");
    logEvent("选中职位", `${nextJob.title || "未识别职位"} / ${nextJob.company || "-"} / ${nextJob.location || "-"}`);
    const focused = await focusJob(nextJob);
    if (!state.running) {
      return;
    }
    if (!focused) {
      const attempts = registerJobFailure(nextJob);
      logEvent("未完成", `详情未切换到目标职位：${nextJob.title || "当前职位"} (${attempts}/${MAX_JOB_RETRIES})`);
      if (attempts >= MAX_JOB_RETRIES) {
        state.skippedJobs.add(nextJob.key);
        state.sessionSkipped += 1;
        setText("sessionSkip", String(state.sessionSkipped));
        logEvent("已跳过", `${nextJob.title || "当前职位"} 详情切换失败，已跳过。`);
      }
      refreshPageSnapshot("详情切换失败");
      return;
    }

    refreshPageSnapshot("已点击职位卡片");
    await wait(500);
    if (!state.running || pauseForCommunicationLimit("切换职位后")) {
      return;
    }

    let actionResult = {
      status: ACTION_RESULT.pending,
      message: "未执行动作。"
    };
    if (state.settings.autoGreet) {
      actionResult = await tryPrimaryAction(nextJob);
    } else {
      actionResult = {
        status: ACTION_RESULT.greeted,
        message: "已关闭自动打招呼，仅切换职位。"
      };
    }
    if (actionResult.message) {
      logEvent("执行动作", actionResult.message);
    }

    if (actionResult.status === ACTION_RESULT.paused) {
      setStatus("今日沟通次数已达上限", "error");
      refreshPageSnapshot("检测到沟通上限");
      return;
    }

    if (actionResult.status === ACTION_RESULT.greeted || actionResult.status === ACTION_RESULT.delivered) {
      state.visitedJobs.add(nextJob.key);
      state.failedJobAttempts.delete(nextJob.key);
      await bumpDailyCountAndHistory(nextJob, actionResult.status);
      setStatus(`已完成：${nextJob.title || "当前职位"}（今日 ${state.settings.dailyCount}/${state.settings.dailyLimit}）`, "run");
      refreshPageSnapshot("处理完成");
      logEvent("完成", `已处理 ${nextJob.title || "当前职位"}。`);

      if (state.onlyJobKey === nextJob.key) {
        state.onlyJobKey = "";
        stopAutomation({
          runtimeStatus: "completed",
          logType: "完成",
          logMessage: "指定职位沟通完成。",
          refreshReason: "单职位处理完成"
        });
        setStatus("指定职位沟通完成", "idle");
        return;
      }

      if (getRemainingDailyQuota() <= 0) {
        stopAutomation({
          runtimeStatus: "daily_limit",
          logType: "达到上限",
          logMessage: "已达到设置的每日沟通上限。",
          refreshReason: "达到每日上限"
        });
        setStatus("今日沟通次数已达设置上限", "error");
      }
    } else {
      const attempts = registerJobFailure(nextJob);
      refreshPageSnapshot("沟通未完成");
      if (attempts >= MAX_JOB_RETRIES) {
        state.skippedJobs.add(nextJob.key);
        state.sessionSkipped += 1;
        state.sessionFailed += 1;
        setText("sessionSkip", String(state.sessionSkipped));
        logEvent("已跳过", `${nextJob.title || "当前职位"} 连续 ${attempts} 次沟通失败，已跳过以避免循环。`);
      } else {
        await tryLoadMoreJobs(nextJob);
        logEvent("未完成", `未能完成沟通，${nextJob.title || "当前职位"} 将稍后重试(${attempts}/${MAX_JOB_RETRIES})。`);
      }
    }
  } catch (error) {
    logEvent("执行异常", asMessage(error));
    refreshPageSnapshot("执行异常");
  } finally {
    state.processing = false;
    syncButtonState();
    restartAutomationLoop();
  }
}

function registerJobFailure(job) {
  const current = state.failedJobAttempts.get(job.key) || 0;
  const next = current + 1;
  state.failedJobAttempts.set(job.key, next);
  return next;
}

async function focusJob(job) {
  job.element.scrollIntoView({ block: "center", behavior: "smooth" });
  await wait(180);
  const clickable = findSafeClickable(job.element) || job.element;
  triggerSafeClick(clickable);
  return waitForJobDetail(job);
}

async function tryPrimaryAction(job) {
  if (pauseForCommunicationLimit("执行沟通前")) {
    return buildPausedActionResult();
  }

  // 优先在右侧详情区找沟通按钮，避免点到列表里无关按钮
  const detailRoot = findRootBySelectors(SELECTORS.detailContainers) || document;
  const greetButton = await waitForClickable(
    SELECTORS.greetButtons,
    ["立即沟通", "沟通", "打招呼", "继续沟通", "继续聊天"],
    { root: detailRoot, preferExact: true },
    ACTION_WAIT_ATTEMPTS,
    ACTION_WAIT_STEP_MS
  );

  if (greetButton) {
    const buttonLabel = normalizeText(greetButton.textContent) || "立即沟通";
    const alreadyChatting = /继续沟通|继续聊天|已沟通/.test(buttonLabel);

    if (alreadyChatting) {
      return {
        status: ACTION_RESULT.greeted,
        message: `该职位已处于沟通状态：${job.title || "当前职位"}`
      };
    }

    const clicked = triggerSafeClick(greetButton);
    let choseStayOnPage = false;
    if (!clicked) {
      return {
        status: ACTION_RESULT.failed,
        message: `已识别到 ${buttonLabel} 按钮，但当前不可点击：${job.title || "当前职位"}`
      };
    }

    await wait(700);
    if (!state.running || pauseForCommunicationLimit("点击沟通后")) {
      return buildPausedActionResult();
    }

    // 弹窗可能稍后出现，多轮探测「留在此页」
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const stayButton = findClickable(SELECTORS.stayButtons, ["留在此页"], {
        root: findVisibleDialogRoot() || document,
        preferExact: true
      });
      if (stayButton && triggerSafeClick(stayButton)) {
        await wait(350);
        choseStayOnPage = true;
        break;
      }
      await wait(220);
    }

    const continueButton = findClickable(
      SELECTORS.greetButtons.concat(SELECTORS.stayButtons),
      ["继续沟通", "继续聊天", "已沟通"],
      { root: detailRoot }
    );
    if (continueButton) {
      return {
        status: ACTION_RESULT.greeted,
        message: choseStayOnPage
          ? `已点击 ${buttonLabel}，留在当前页并进入继续沟通状态：${job.title || "当前职位"}`
          : `已触发 ${buttonLabel}，页面已切换到继续沟通状态：${job.title || "当前职位"}`
      };
    }

    const greetResult = await trySendGreeting(job);
    if (greetResult.sent) {
      return {
        status: ACTION_RESULT.greeted,
        message: choseStayOnPage ? `已留在当前页；${greetResult.message}` : greetResult.message
      };
    }

    if (!state.running || pauseForCommunicationLimit("沟通反馈检测")) {
      return buildPausedActionResult();
    }

    // 点击沟通后若出现聊天输入框，也视为进入沟通链路
    if (findVisibleChatInput()) {
      return {
        status: ACTION_RESULT.greeted,
        message: choseStayOnPage
          ? `已点击 ${buttonLabel} 并留在此页，聊天框已出现：${job.title || "当前职位"}`
          : `已点击 ${buttonLabel}，聊天框已出现：${job.title || "当前职位"}`
      };
    }

    return {
      status: ACTION_RESULT.failed,
      message: greetResult.message
        || `已尝试点击 ${buttonLabel}，但页面没有出现沟通反馈：${job.title || "当前职位"}`
    };
  }

  const deliverButton = findClickable(SELECTORS.deliverButtons, ["投递", "立即投递", "申请"], {
    root: detailRoot
  });
  if (deliverButton && triggerSafeClick(deliverButton)) {
    await wait(500);
    return {
      status: ACTION_RESULT.delivered,
      message: "未找到沟通按钮，已点击投递按钮。"
    };
  }

  return {
    status: ACTION_RESULT.failed,
    message: "未识别到沟通或投递按钮。"
  };
}

function buildGreetingMessage(job) {
  const templates = getGreetingTemplates();
  const template = templates[Math.floor(Math.random() * templates.length)]
    || state.settings.greetTemplate
    || DEFAULT_SETTINGS.greetTemplate;
  const message = template
    .replaceAll("{jobTitle}", job.title || "该岗位")
    .replaceAll("{companyName}", job.company || "贵公司")
    .replaceAll("{location}", job.location || "该城市")
    .replaceAll("{salary}", job.salary || "该薪资范围");
  state.lastGreetingPreview = message;
  return message;
}

function getGreetingTemplates() {
  const fromList = Array.isArray(state.settings.greetTemplates)
    ? state.settings.greetTemplates.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const fromSingle = String(state.settings.greetTemplate || "").trim();
  const merged = fromList.length ? fromList : (fromSingle ? [fromSingle] : [DEFAULT_SETTINGS.greetTemplate]);

  if (state.settings.greetRotate === false) {
    return [merged[0]];
  }
  return uniqueStrings(merged);
}

function fillChatInput(message) {
  for (const selector of SELECTORS.chatInput) {
    const elements = Array.from(document.querySelectorAll(selector));
    for (const element of elements) {
      if (!(element instanceof HTMLElement) || !isElementVisible(element)) {
        continue;
      }

      if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
        element.focus();
        const prototype = Object.getPrototypeOf(element);
        const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
        if (valueSetter) {
          valueSetter.call(element, message);
        } else {
          element.value = message;
        }
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
        element.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Unidentified" }));
        element.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "Unidentified" }));
        return { filled: true, element };
      }

      if (element.getAttribute("contenteditable") === "true") {
        element.focus();
        try {
          document.execCommand("selectAll", false, null);
          document.execCommand("insertText", false, message);
        } catch (_error) {
          element.textContent = message;
        }
        element.dispatchEvent(new InputEvent("input", {
          bubbles: true,
          data: message,
          inputType: "insertText"
        }));
        return { filled: true, element };
      }
    }
  }

  return { filled: false };
}

function clickChatSend() {
  // 优先文案精确匹配「发送」，再回退到选择器
  const byText = findClickable(SELECTORS.chatSend, ["发送", "send"], {
    root: document,
    preferExact: true
  });
  if (byText && triggerSafeClick(byText)) {
    return true;
  }

  for (const selector of SELECTORS.chatSend) {
    for (const element of Array.from(document.querySelectorAll(selector))) {
      if (!(element instanceof HTMLElement) || !isElementVisible(element) || isElementDisabled(element)) {
        continue;
      }
      const text = normalizeText(element.textContent);
      if (!text || /发送|send/i.test(text)) {
        if (triggerSafeClick(element)) {
          return true;
        }
      }
    }
  }
  return false;
}

async function trySendGreeting(job) {
  // 聊天框可能晚于按钮出现，先轮询输入框
  let inputReady = findVisibleChatInput();
  for (let attempt = 0; attempt < 8 && !inputReady; attempt += 1) {
    await wait(280);
    inputReady = findVisibleChatInput();
  }

  if (!inputReady) {
    return {
      sent: false,
      message: "未出现聊天输入框。"
    };
  }

  const imageResumeResult = await tryUploadImageResumeIfNeeded();
  const message = buildGreetingMessage(job);
  const fillResult = fillChatInput(message);
  if (!fillResult.filled) {
    return {
      sent: false,
      imageUploaded: imageResumeResult.uploaded,
      message: "已找到聊天输入框，但无法填入招呼语。"
    };
  }

  await wait(280);
  if (!clickChatSend()) {
    // 部分页面支持 Ctrl/Cmd + Enter 发送
    fillResult.element?.dispatchEvent(new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
      code: "Enter",
      ctrlKey: true
    }));
    await wait(200);
  }

  const sentConfirmed = await waitForGreetingSent(message, 8);
  if (sentConfirmed || !findVisibleChatInputHasText(message)) {
    const parts = [];
    if (imageResumeResult.uploaded) {
      parts.push("已发送图片简历");
    } else if (imageResumeResult.attempted && imageResumeResult.message) {
      parts.push(imageResumeResult.message);
    }
    parts.push(`已发送招呼语：${truncateText(message, 26)}`);
    return {
      sent: true,
      message: parts.join("；")
    };
  }

  return {
    sent: false,
    message: imageResumeResult.uploaded
      ? "已发送图片简历，但招呼语发送未确认。"
      : "已填入招呼语，但发送未确认。"
  };
}

function findVisibleChatInputHasText(message) {
  const expected = normalizeCompareText(message);
  const input = findVisibleChatInput();
  if (!input) {
    return false;
  }
  const current = normalizeCompareText(
    input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement
      ? input.value
      : input.textContent
  );
  return Boolean(current) && (current === expected || current.includes(expected.slice(0, 12)));
}

async function waitForGreetingSent(message, attempts = 8) {
  const expected = normalizeCompareText(message).slice(0, 18);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (!findVisibleChatInputHasText(message)) {
      return true;
    }
    // 聊天区出现自己刚发的文案也算成功
    const chatTexts = Array.from(document.querySelectorAll(SELECTORS.chatMessages.join(",")))
      .map((node) => normalizeCompareText(node.textContent))
      .filter(Boolean);
    if (expected && chatTexts.some((text) => text.includes(expected))) {
      return true;
    }
    await wait(260);
  }
  return false;
}

async function tryUploadImageResumeIfNeeded() {
  if (!state.settings.sendImageResume || !state.settings.imageResumeDataUrl) {
    return { uploaded: false, attempted: false };
  }

  let input = findImageResumeInput();
  if (!input) {
    const trigger = findClickable(SELECTORS.imageResumeTriggers, ["图片简历", "发送图片", "上传图片", "图片"], {
      root: document
    });
    if (trigger) {
      triggerSafeClick(trigger);
      await wait(250);
      input = findImageResumeInput();
    }
  }

  if (!input) {
    return {
      uploaded: false,
      attempted: true,
      message: "未找到图片上传入口"
    };
  }

  try {
    const file = dataUrlToFile(
      state.settings.imageResumeDataUrl,
      state.settings.imageResumeFileName || "resume.jpg",
      state.settings.imageResumeMimeType || "image/jpeg"
    );
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await wait(500);
    return {
      uploaded: true,
      attempted: true
    };
  } catch (_error) {
    return {
      uploaded: false,
      attempted: true,
      message: "图片简历上传失败"
    };
  }
}

function buildPausedActionResult() {
  return {
    status: ACTION_RESULT.paused,
    message: ""
  };
}

function pauseForCommunicationLimit(source = "") {
  const modal = detectCommunicationLimitModal();
  if (!modal) {
    return false;
  }

  const paused = stopAutomation({
    runtimeStatus: "communication_limit",
    logType: "触发上限",
    logMessage: "检测到“无法进行沟通”提示，已自动暂停海投。",
    refreshReason: "检测到沟通上限"
  });

  if (!paused) {
    return false;
  }

  if (modal.confirmButton && triggerSafeClick(modal.confirmButton)) {
    logEvent("弹窗处理", `已自动点击“确定”关闭提示${source ? `：${source}` : ""}。`);
  }

  return true;
}

function detectCommunicationLimitModal() {
  const roots = queryAllExisting(SELECTORS.dialogContainers)
    .filter((element) => element instanceof HTMLElement && isElementVisible(element));

  for (const root of roots) {
    const compareText = normalizeCompareText(root.textContent);
    const looksLikeLimitModal = compareText.includes(normalizeCompareText("无法进行沟通"))
      && (
        compareText.includes(normalizeCompareText("150位boss沟通"))
        || compareText.includes(normalizeCompareText("休息一下"))
        || compareText.includes(normalizeCompareText("明天再来"))
      );

    if (!looksLikeLimitModal) {
      continue;
    }

    return {
      root,
      confirmButton: findClickable(SELECTORS.stayButtons, ["确定", "知道了"], {
        root,
        preferExact: true
      })
    };
  }

  const pageText = normalizeCompareText(document.body?.textContent);
  const hasTitleHint = pageText.includes(normalizeCompareText(COMMUNICATION_LIMIT_HINTS[0]));
  const hasQuotaHint = pageText.includes(normalizeCompareText(COMMUNICATION_LIMIT_HINTS[1]))
    || pageText.includes(normalizeCompareText(COMMUNICATION_LIMIT_HINTS[2]));
  const hasRestHint = pageText.includes(normalizeCompareText(COMMUNICATION_LIMIT_HINTS[3]))
    || pageText.includes(normalizeCompareText(COMMUNICATION_LIMIT_HINTS[4]));
  if (hasTitleHint && (hasQuotaHint || hasRestHint)) {
    return {
      root: null,
      confirmButton: findClickable(["button", "a"], ["确定", "知道了"], {
        preferExact: true
      })
    };
  }

  return null;
}

async function tryLoadMoreJobs(job) {
  if (!state.settings.autoNext) {
    return;
  }

  try {
    job.element.scrollIntoView({ block: "end", behavior: "smooth" });
    window.scrollBy({ top: 480, behavior: "smooth" });
    await wait(900);
    logEvent("继续加载", "已尝试下滚列表，寻找更多匹配职位。");
  } catch (_error) {
    // ignore loading issues
  }
}

async function tryLoadMoreJobsFromList() {
  if (!state.settings.autoNext) {
    return;
  }

  const listScroller = findJobListScroller();
  if (listScroller) {
    listScroller.scrollBy({ top: 520, behavior: "smooth" });
  } else {
    window.scrollBy({ top: 520, behavior: "smooth" });
  }
  await wait(800);
  logEvent("继续加载", "已尝试继续下滚职位列表。");
}

async function preloadFullJobList() {
  state.preloading = true;
  state.fullListReadComplete = false;
  setStatus("正在准备职位列表...", "run");
  syncButtonState();
  logEvent("预加载", "正在滑动到列表底部，加载完整职位信息。");

  try {
    const listScroller = findJobListScroller();
    let lastCount = collectJobList().length;
    let stableRounds = 0;
    let lastScrollTop = -1;

    for (let round = 0; round < 24; round += 1) {
      if (listScroller) {
        const nextTop = Math.min(listScroller.scrollTop + Math.max(listScroller.clientHeight * 0.9, 480), listScroller.scrollHeight);
        listScroller.scrollTo({
          top: nextTop,
          behavior: "smooth"
        });
        if (Math.abs(nextTop - lastScrollTop) < 2) {
          listScroller.scrollTop = listScroller.scrollHeight;
        }
        lastScrollTop = listScroller.scrollTop;
      } else {
        window.scrollBy({
          top: Math.max(window.innerHeight * 0.8, 600),
          behavior: "smooth"
        });
      }

      await wait(900);
      const nextCount = collectJobList().length;
      setText("jobCount", String(nextCount));
      setStatus(`准备中：已发现 ${nextCount} 个职位`, "run");

      if (nextCount <= lastCount) {
        stableRounds += 1;
      } else {
        stableRounds = 0;
        lastCount = nextCount;
        logEvent("预加载", `已识别 ${nextCount} 个职位，继续加载。`);
      }

      if (stableRounds >= 3) {
        break;
      }
    }

    // 回到列表顶部，便于从第一个命中职位开始
    if (listScroller) {
      listScroller.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    await wait(400);

    state.fullListReadComplete = true;
    refreshPageSnapshot("职位列表预加载完成");
    logEvent("预加载", `职位列表加载完成，当前识别 ${collectJobList().length} 个职位。`);
  } finally {
    state.preloading = false;
    syncButtonState();
  }
}

function findJobListScroller() {
  const listContainer = findJobListContainer();
  const candidates = listContainer
    ? [listContainer, ...Array.from(listContainer.querySelectorAll("*"))]
    : [];

  return candidates.find((element) => {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    if (rect.left > window.innerWidth * 0.55) {
      return false;
    }

    const style = getComputedStyle(element);
    const canScroll = /(auto|scroll)/.test(`${style.overflowY}${style.overflow}`);
    return canScroll && element.scrollHeight > element.clientHeight + 20;
  }) || null;
}

function handleJobListClick(event) {
  const target = event.target.closest("[data-job-key]");
  if (!target) {
    return;
  }
  const key = target.dataset.jobKey;
  const snapshot = collectPageSnapshot();
  const job = snapshot.jobs.find((item) => item.key === key);
  if (!job) {
    return;
  }
  logEvent("手动选中", `${job.title || "未识别职位"} / ${job.company || "-"}`);
  void focusJob(job);
}

function toggleMinimize() {
  state.panelMinimized = !state.panelMinimized;
  state.shadowRoot.querySelector(".panel").classList.toggle("minimized", state.panelMinimized);
}

function cleanup() {
  clearTimeout(refreshTimer);
  clearTimeout(state.loopTimer);
  clearInterval(state.autoReplyTimer);
  state.observer?.disconnect();
  window.removeEventListener("popstate", handleUrlMaybeChanged);
  window.removeEventListener("hashchange", handleUrlMaybeChanged);
  chrome.storage.onChanged.removeListener(handleStorageChanges);
  if (state.running) {
    void chrome.runtime.sendMessage({
      type: "boss-helper:update-runtime",
      payload: { lastStatus: "closed" }
    });
  }
  state.host?.remove();
}

async function tryAutoReply() {
  if (!state.settings.autoReplyEnabled) {
    return;
  }
  if (state.autoReplyInFlight) {
    return;
  }

  const now = Date.now();
  if (now - state.lastAutoReplyAt < AUTO_REPLY_MIN_INTERVAL) {
    return;
  }

  const hasChatInput = Boolean(findVisibleChatInput());
  const chatMessages = hasChatInput ? collectChatMessages() : [];
  const lastIsUser = chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === "user";

  const status = [
    hasChatInput ? "有输入框" : "无输入框",
    chatMessages.length ? `消息${chatMessages.length}条` : "无消息",
    lastIsUser ? "对方最后发言" : (chatMessages.length ? "自己最后发言" : "-")
  ].join(" | ");

  if (status !== state.autoReplyDebug) {
    state.autoReplyDebug = status;
    logEvent("自动回复检测", status);
  }

  if (!hasChatInput || !chatMessages.length || !lastIsUser) {
    return;
  }

  const lastMessage = chatMessages[chatMessages.length - 1];
  const signature = normalizeCompareText(lastMessage.content).slice(0, 180);
  if (!signature || signature === state.lastAutoReplySignature) {
    return;
  }

  const provider = getProviderSettings();
  if (!provider.apiKey || !provider.endpoint) {
    logEvent("自动回复", "未配置 API Key 或 Endpoint，已跳过自动回复。请在高级设置中填写。");
    state.lastAutoReplySignature = signature;
    return;
  }

  state.autoReplyInFlight = true;
  try {
    const payload = buildChatPayload(chatMessages, provider);
    const response = await chrome.runtime.sendMessage({
      type: "boss-helper:call-chat-api",
      payload
    });

    if (!response?.ok) {
      throw new Error(response?.error || "API 请求失败");
    }

    const reply = normalizeText(response?.result?.content);
    if (!reply) {
      throw new Error("API 返回为空");
    }

    const sent = await sendAutoReply(reply);
    if (sent) {
      state.lastAutoReplySignature = signature;
      state.lastAutoReplyAt = Date.now();
      logEvent("自动回复", `已发送：${truncateText(reply, 24)}`);
    } else {
      logEvent("自动回复", "已生成回复，但未找到发送入口。");
    }
  } catch (error) {
    logEvent("自动回复失败", asMessage(error));
  } finally {
    state.autoReplyInFlight = false;
  }
}

function getProviderSettings() {
  const provider = state.settings.autoReplyProvider;
  if (provider === "doubao") {
    return {
      provider,
      apiKey: state.settings.doubaoApiKey,
      endpoint: state.settings.doubaoEndpoint,
      model: state.settings.doubaoModel
    };
  }
  if (provider === "yuanbao") {
    return {
      provider,
      apiKey: state.settings.yuanbaoApiKey,
      endpoint: state.settings.yuanbaoEndpoint,
      model: state.settings.yuanbaoModel
    };
  }
  if (provider === "other") {
    return {
      provider,
      apiKey: state.settings.otherApiKey,
      endpoint: state.settings.otherEndpoint,
      model: state.settings.otherModel
    };
  }
  return {
    provider: "deepseek",
    apiKey: state.settings.deepseekApiKey,
    endpoint: state.settings.deepseekEndpoint,
    model: state.settings.deepseekModel
  };
}

function buildChatPayload(chatMessages, provider) {
  const systemPrompt = state.settings.autoReplySystemPrompt || DEFAULT_SETTINGS.autoReplySystemPrompt;
  return {
    provider: provider.provider,
    apiKey: provider.apiKey,
    endpoint: provider.endpoint,
    model: provider.model,
    temperature: state.settings.autoReplyTemperature,
    maxTokens: state.settings.autoReplyMaxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      ...chatMessages.slice(-6)
    ]
  };
}

function collectChatMessages() {
  const elements = findChatMessageElements();
  if (!elements.length) {
    return [];
  }

  const messages = [];
  for (const element of elements) {
    const content = normalizeText(element.textContent);
    if (!content) {
      continue;
    }
    messages.push({
      role: getChatMessageRole(element),
      content
    });
  }

  return messages.filter((item) => item.content.length <= 600);
}

function findChatMessageElements() {
  return queryAllExisting(SELECTORS.chatMessages)
    .filter((element) => element instanceof HTMLElement && isElementVisible(element));
}

function getChatMessageRole(element) {
  const classText = String(element.className || "").toLowerCase();
  const selfContainer = element.closest("[class*='self'], [class*='right'], [class*='me'], [class*='mine']");
  if (selfContainer || /self|right|mine|me/.test(classText)) {
    return "assistant";
  }

  const otherContainer = element.closest("[class*='other'], [class*='left']");
  if (otherContainer || /other|left/.test(classText)) {
    return "user";
  }

  return "user";
}

function findVisibleChatInput() {
  for (const selector of SELECTORS.chatInput) {
    const element = document.querySelector(selector);
    if (element && isElementVisible(element)) {
      return element;
    }
  }
  return null;
}

async function sendAutoReply(message) {
  const fillResult = fillChatInput(message);
  if (!fillResult.filled) {
    return false;
  }

  await wait(200);
  return clickChatSend();
}

function isBossJobPage() {
  return detectPageState().ready;
}

function detectPageState() {
  const path = location.pathname || "";
  const href = location.href || "";
  const host = location.hostname || "";

  if (!/zhipin\.com$/i.test(host) && !/\.zhipin\.com$/i.test(host)) {
    return {
      ready: false,
      code: "wrong_site",
      message: "请在 BOSS 直聘网站使用本助手",
      tip: "请打开 www.zhipin.com，并进入顶部「职位」页面。"
    };
  }

  // 常见非职位页
  if (/\/web\/geek\/chat|\/web\/geek\/resume|\/web\/user|\/web\/geek\/notify/i.test(path)) {
    return {
      ready: false,
      code: "wrong_route",
      message: "当前是消息/简历页，请切换到「职位」",
      tip: "点击顶部导航「职位」，进入左侧有职位列表的页面后再开始。"
    };
  }

  const hasJobList = Boolean(
    document.querySelector(".job-list-box, .search-job-result, .search-job-list, .job-card-wrapper, .job-list-item, [class*='job-card']")
  );
  const hintMatched = JOB_PAGE_HINTS.some((hint) => path.includes(hint) || href.includes(hint));
  const activeNav = Array.from(document.querySelectorAll("a, span"))
    .map((node) => normalizeText(node.textContent))
    .some((text) => text === "职位");

  if (hasJobList || (hintMatched && activeNav) || hintMatched) {
    // 有列表 DOM 或职位路由，都视为可用页；列表为空时由上层继续提示
    return {
      ready: true,
      code: hasJobList ? "ready" : "route_ready",
      message: "",
      tip: hasJobList ? "" : "职位页已打开，若列表为空请稍等或点刷新。"
    };
  }

  if (/\/web\/geek\//i.test(path)) {
    return {
      ready: false,
      code: "geek_other",
      message: "请进入「职位」列表页再开始",
      tip: "在 BOSS 顶部点「职位」，等左侧职位卡片出现后再点开始沟通。"
    };
  }

  return {
    ready: false,
    code: "not_job_page",
    message: "请先打开 BOSS 职位列表页",
    tip: "推荐路径：登录 BOSS → 顶部「职位」→ 看到左侧职位列表。"
  };
}

function isJobCardActive(element) {
  return Boolean(element.matches(".active, .cur, .selected") || element.querySelector(".active, .cur, .selected"));
}

function findRootBySelectors(selectors) {
  return queryAllExisting(selectors).find((element) => {
    return element instanceof HTMLElement && isElementVisible(element);
  }) || null;
}

function findVisibleDialogRoot() {
  return findRootBySelectors(SELECTORS.dialogContainers);
}

function findSafeClickable(element) {
  const candidates = [
    ...Array.from(element.querySelectorAll("button")),
    ...Array.from(element.querySelectorAll("[role='button']")),
    ...Array.from(element.querySelectorAll(".job-card-left, .job-name, .job-info")),
    ...Array.from(element.querySelectorAll("a[href]"))
  ];

  for (const candidate of candidates) {
    if (!(candidate instanceof HTMLElement)) {
      continue;
    }
    if (candidate.matches("a[href]")) {
      const href = candidate.getAttribute("href") || "";
      if (href.trim().toLowerCase().startsWith("javascript:")) {
        continue;
      }
    }
    return candidate;
  }

  return null;
}

function triggerSafeClick(element) {
  if (!(element instanceof HTMLElement) || !isElementVisible(element) || isElementDisabled(element)) {
    return false;
  }

  element.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
  element.focus?.({ preventScroll: true });

  const href = element.matches("a[href]") ? (element.getAttribute("href") || "") : "";
  const preventJavascriptHref = href.trim().toLowerCase().startsWith("javascript:");
  const swallowDefault = (event) => {
    event.preventDefault();
  };

  if (preventJavascriptHref) {
    element.addEventListener("click", swallowDefault, true);
  }

  try {
    if (window.PointerEvent) {
      element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerId: 1 }));
      element.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true, pointerId: 1 }));
    }

    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
    element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    return true;
  } finally {
    if (preventJavascriptHref) {
      window.setTimeout(() => element.removeEventListener("click", swallowDefault, true), 0);
    }
  }
}

function isElementVisible(element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return !element.hidden
    && style.display !== "none"
    && style.visibility !== "hidden"
    && style.pointerEvents !== "none"
    && rect.width > 0
    && rect.height > 0;
}

function isElementDisabled(element) {
  return element.hasAttribute("disabled")
    || element.getAttribute("aria-disabled") === "true"
    || element.classList.contains("disabled");
}

async function waitForJobDetail(job) {
  for (let attempt = 0; attempt < DETAIL_WAIT_ATTEMPTS; attempt += 1) {
    const detailTitle = queryText(SELECTORS.detailTitle);
    const detailCompany = queryText(SELECTORS.detailCompany);
    const titleMatched = sameMeaningfulText(detailTitle, job.title);
    const companyMatched = sameMeaningfulText(detailCompany, job.company);

    if (titleMatched || (detailTitle && companyMatched && fuzzyIncludes(detailTitle, job.title))) {
      return true;
    }

    // 卡片高亮也视为切换成功的弱信号
    if (isJobCardActive(job.element) && attempt >= 3 && (detailTitle || detailCompany)) {
      return true;
    }

    await wait(DETAIL_WAIT_STEP_MS);
  }
  return false;
}

async function waitForClickable(selectorGroups, textHints, options = {}, attempts = 8, stepMs = 280) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const button = findClickable(selectorGroups, textHints, options);
    if (button) {
      return button;
    }
    await wait(stepMs);
  }
  return null;
}

function findClickable(selectorGroups, textHints, options = {}) {
  const root = options.root instanceof HTMLElement || options.root instanceof Document ? options.root : document;
  const preferExact = Boolean(options.preferExact);
  const candidates = [];
  const seen = new Set();
  const hints = textHints.map((hint) => normalizeCompareText(hint)).filter(Boolean);

  for (const selector of selectorGroups) {
    for (const element of Array.from(root.querySelectorAll(selector))) {
      if (!(element instanceof HTMLElement) || seen.has(element)) {
        continue;
      }
      seen.add(element);
      candidates.push(element);
    }
  }

  return candidates
    .filter((element) => isElementVisible(element) && !isElementDisabled(element))
    .map((element) => {
      const text = normalizeCompareText(element.textContent);
      let score = 0;

      if (hints.some((hint) => text === hint)) {
        score += 120;
      } else if (hints.some((hint) => text.startsWith(hint))) {
        score += 90;
      } else if (hints.some((hint) => text.includes(hint))) {
        score += 60;
      }

      if (preferExact && !hints.some((hint) => text === hint || text.startsWith(hint))) {
        score -= 40;
      }

      // 过滤明显无关按钮，减少误点
      if (/收藏|分享|举报|不感兴趣|关闭|取消|下载app|登录|注册/.test(text)) {
        score -= 100;
      }

      if (element.tagName === "BUTTON") {
        score += 20;
      }
      if (element.matches(".btn, .op-btn, .btn-startchat, [role='button']")) {
        score += 15;
      }
      if (element.closest(".job-detail-box, .job-card-right, .boss-dialog, .dialog-container, .modal, [role='dialog']")) {
        score += 10;
      }

      return { element, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)[0]?.element || null;
}

function queryText(selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const text = normalizeText(element?.textContent);
    if (text) {
      return text;
    }
  }
  return "";
}

function queryAllTexts(selectors) {
  const texts = [];
  for (const selector of selectors) {
    const elements = Array.from(document.querySelectorAll(selector));
    for (const element of elements) {
      const text = normalizeText(element.textContent);
      if (text && !texts.includes(text)) {
        texts.push(text);
      }
    }
    if (texts.length) {
      break;
    }
  }
  return texts;
}

function queryFirstExisting(selectors, all = false) {
  for (const selector of selectors) {
    const results = Array.from(document.querySelectorAll(selector));
    if (results.length) {
      return all ? results : results[0];
    }
  }
  return all ? [] : null;
}

function queryAllExisting(selectors) {
  const results = [];
  const seen = new Set();

  for (const selector of selectors) {
    for (const element of Array.from(document.querySelectorAll(selector))) {
      if (!seen.has(element)) {
        seen.add(element);
        results.push(element);
      }
    }
  }

  return results;
}

function pickText(root, selectors) {
  for (const selector of selectors) {
    const element = root.querySelector(selector);
    const text = normalizeText(element?.textContent);
    if (text) {
      return cleanTextByContext(text, selector);
    }
  }
  return "";
}

function cleanTextByContext(text, selector) {
  if (selector.includes("salary")) {
    return findSalaryFragment(text);
  }
  if (selector.includes("area") || selector.includes("city") || selector.includes("desc")) {
    return cleanLocationText(text);
  }
  return normalizeText(text);
}

function getJobMatchDetails(job) {
  const titleOk = matchesJobKeywords(job.title, state.settings.jobKeywords, state.settings.jobMatchMode);
  const excludeTitleOk = !matchesExcludedTokens(job.title, state.settings.excludeJobKeywords);
  const locationOk = matchesLocation(job.location, state.settings.locationKeywords);
  const companyOk = matchesKeywordExpression(job.company, state.settings.companyKeywords, "any");
  const excludeCompanyOk = !matchesExcludedTokens(job.company, state.settings.excludeCompanyKeywords);
  const salaryOk = matchesSalary(job.salary, state.settings.salaryKeywords);
  const recruiterStatusOk = matchesRecruiterActivity(job.recruiterStatus, state.settings.recruiterActiveStatuses);
  return {
    matches: titleOk && excludeTitleOk && locationOk && companyOk && excludeCompanyOk && salaryOk && recruiterStatusOk,
    titleOk,
    excludeTitleOk,
    locationOk,
    companyOk,
    excludeCompanyOk,
    salaryOk,
    recruiterStatusOk
  };
}

// 职位关键词：支持 +必须 / -排除；模式 any=任一命中，all=全部命中
function matchesJobKeywords(text, keywordString, mode = "any") {
  return matchesKeywordExpression(text, keywordString, mode);
}

function matchesKeywordExpression(text, keywordString, mode = "any") {
  const expression = parseKeywordExpression(keywordString);
  const haystack = normalizeCompareText(text);

  if (expression.exclude.some((token) => tokenMatchesHaystack(haystack, token))) {
    return false;
  }

  if (!expression.include.length) {
    return true;
  }

  if (mode === "all" || expression.requireAll) {
    return expression.include.every((token) => tokenMatchesHaystack(haystack, token));
  }

  return expression.include.some((token) => tokenMatchesHaystack(haystack, token));
}

function matchesExcludedTokens(text, keywordString) {
  const tokens = splitKeywords(keywordString);
  if (!tokens.length) {
    return false;
  }
  const haystack = normalizeCompareText(text);
  return tokens.some((token) => tokenMatchesHaystack(haystack, normalizeCompareText(token.replace(/^[-+]/, ""))));
}

function parseKeywordExpression(input) {
  const rawTokens = splitKeywords(input);
  const include = [];
  const exclude = [];
  let requireAll = false;

  for (const raw of rawTokens) {
    if (raw.startsWith("-") && raw.length > 1) {
      exclude.push(normalizeCompareText(raw.slice(1)));
      continue;
    }
    if (raw.startsWith("+") && raw.length > 1) {
      include.push(normalizeCompareText(raw.slice(1)));
      requireAll = true;
      continue;
    }
    include.push(normalizeCompareText(raw));
  }

  return {
    include: uniqueStrings(include.filter(Boolean)),
    exclude: uniqueStrings(exclude.filter(Boolean)),
    requireAll
  };
}

function tokenMatchesHaystack(haystack, token) {
  const needle = normalizeCompareText(token);
  if (!needle) {
    return false;
  }

  // 短英文词做边界匹配，避免 go 误伤 google
  if (/^[a-z0-9+#.+]+$/i.test(needle) && needle.length <= 3) {
    const pattern = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(needle)}(?:$|[^a-z0-9])`, "i");
    return pattern.test(haystack);
  }

  return haystack.includes(needle);
}

function matchesLooseTokens(text, keywordString) {
  return matchesKeywordExpression(text, keywordString, "any");
}

function matchesExcludedCompany(text, keywordString) {
  return matchesExcludedTokens(text, keywordString);
}

function matchesLocation(text, keywordString) {
  const tokens = splitKeywords(keywordString);
  if (!tokens.length) {
    return true;
  }

  const haystack = expandLocationText(text);
  const primaryLocation = expandLocationText(extractPrimaryLocation(text));

  return tokens.some((token) => {
    const expandedToken = expandLocationText(token);
    return locationTokenHit(primaryLocation, expandedToken) || locationTokenHit(haystack, expandedToken);
  });
}

function locationTokenHit(haystack, token) {
  if (!token) {
    return false;
  }
  if (haystack === token || haystack.includes(token) || token.includes(haystack)) {
    return true;
  }
  // 别名展开后的片段再比一次
  const haystackParts = haystack.split("|").filter(Boolean);
  const tokenParts = token.split("|").filter(Boolean);
  return tokenParts.some((part) => haystackParts.some((item) => item === part || item.includes(part) || part.includes(item)));
}

function expandLocationText(text) {
  const normalized = normalizeLocationForCompare(text);
  if (!normalized) {
    return "";
  }

  const aliases = [normalized];
  for (const [canonical, list] of Object.entries(LOCATION_ALIASES)) {
    const canon = normalizeLocationForCompare(canonical);
    const all = [canon, ...list.map((item) => normalizeLocationForCompare(item))];
    if (all.some((item) => item && (normalized.includes(item) || item.includes(normalized)))) {
      aliases.push(...all);
    }
  }

  return uniqueStrings(aliases.filter(Boolean)).join("|");
}

function matchesSalary(jobSalary, keywordString) {
  const tokens = splitKeywords(keywordString);
  if (!tokens.length) {
    return true;
  }
  const parsedJob = parseSalaryRange(jobSalary);
  if (!parsedJob) {
    // 面议/薪资缺失时：若用户填了明确薪资区间，默认不命中，避免误投
    const hasNumericFilter = tokens.some((token) => Boolean(parseSalaryRange(token)));
    if (hasNumericFilter) {
      return false;
    }
    return tokens.some((token) => normalizeCompareText(jobSalary).includes(normalizeCompareText(token)));
  }

  return tokens.some((token) => {
    const parsedToken = parseSalaryRange(token);
    if (parsedToken) {
      return rangesOverlap(parsedJob, parsedToken);
    }
    return normalizeCompareText(jobSalary).includes(normalizeCompareText(token));
  });
}

function parseSalaryRange(text) {
  const value = normalizeText(text).toUpperCase();
  if (!value) {
    return null;
  }

  const match = value.match(/(\d+(?:\.\d+)?)\s*(K|千|万)?(?:\s*[-~]\s*(\d+(?:\.\d+)?)\s*(K|千|万)?)?/i);
  if (!match) {
    return null;
  }

  const min = normalizeSalaryValue(Number(match[1]), match[2] || "K");
  const max = match[3] ? normalizeSalaryValue(Number(match[3]), match[4] || match[2] || "K") : min;
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return null;
  }

  return { min: Math.min(min, max), max: Math.max(min, max) };
}

function normalizeSalaryValue(value, unit) {
  if (!Number.isFinite(value)) {
    return NaN;
  }
  if (unit === "万") {
    return value * 10;
  }
  if (unit === "千") {
    return value;
  }
  return value;
}

function rangesOverlap(left, right) {
  return left.min <= right.max && right.min <= left.max;
}

function splitKeywords(input) {
  return String(input || "").split(/[,，、\n]+/).map((item) => item.trim()).filter(Boolean);
}

function matchesRecruiterActivity(text, selectedStatuses) {
  const statuses = normalizeStringArray(selectedStatuses);
  if (!statuses.length) {
    return true;
  }

  const status = normalizeRecruiterActivity(text);
  if (!status) {
    return false;
  }

  return statuses.some((item) => normalizeRecruiterActivity(item) === status);
}

function normalizeRecruiterActivity(text) {
  const value = normalizeCompareText(text);
  if (!value) {
    return "";
  }

  return RECRUITER_ACTIVITY_OPTIONS.find((option) => {
    return value.includes(normalizeCompareText(option));
  }) || "";
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

function buildMismatchSummary(jobs) {
  if (!jobs.length) {
    return "";
  }

  const unmatched = jobs.filter((job) => !job.matches).slice(0, 3);
  if (!unmatched.length) {
    return "筛选结果：当前条件已有命中。";
  }

  const lines = unmatched.map((job, index) => {
    const reasons = [];
    if (!job.matchDetails?.titleOk) {
      reasons.push(`职位不符(${job.title || "-"})`);
    }
    if (!job.matchDetails?.excludeTitleOk) {
      reasons.push(`职位已排除(${job.title || "-"})`);
    }
    if (!job.matchDetails?.locationOk) {
      reasons.push(`地点不符(${job.location || "-"})`);
    }
    if (!job.matchDetails?.companyOk) {
      reasons.push(`公司不符(${job.company || "-"})`);
    }
    if (!job.matchDetails?.excludeCompanyOk) {
      reasons.push(`公司已排除(${job.company || "-"})`);
    }
    if (!job.matchDetails?.salaryOk) {
      reasons.push(`薪资不符(${job.salary || "-"})`);
    }
    if (!job.matchDetails?.recruiterStatusOk) {
      reasons.push(`状态不符(${job.recruiterStatus || "未识别"})`);
    }
    return `${index + 1}. ${job.title || "未识别职位"}：${reasons.join("，") || "条件未命中"}`;
  });

  return `未命中原因：\n${lines.join("\n")}`;
}

function buildJobKey(job) {
  const stableParts = [
    normalizeCompareText(job.title),
    normalizeCompareText(job.company),
    normalizeCompareText(job.salary),
    normalizeLocationForCompare(extractPrimaryLocation(job.location))
  ].filter(Boolean);

  if (stableParts.length >= 2) {
    return stableParts.join("|");
  }

  return [...stableParts, String(job.index ?? "")].join("|");
}

function normalizeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function normalizeCompareText(text) {
  return normalizeText(text).toLowerCase().replace(/\s+/g, "");
}

function truncateText(text, maxLength) {
  const value = normalizeText(text);
  return value.length <= maxLength ? value : `${value.slice(0, maxLength)}...`;
}

function firstNonEmpty(values) {
  return values.find((value) => normalizeText(value)) || "";
}

function findSalaryLikeText(root) {
  return findTextCandidates(root).map(findSalaryFragment).find(Boolean) || "";
}

function findSalaryFragment(text) {
  const value = normalizeText(text);
  const match = value.match(/\d+(?:\.\d+)?(?:K|k|千|万)(?:[-~]\d+(?:\.\d+)?(?:K|k|千|万))?\+?/);
  return match ? match[0].toUpperCase() : "";
}

function findLineLikeTitle(root) {
  const lines = findTextCandidates(root);
  return lines.find((line) => line.length >= 2 && line.length <= 40 && !findSalaryFragment(line) && !looksLikeCompany(line) && !looksLikeLocation(line)) || "";
}

function findCompanyLikeText(root, title, salary) {
  return findTextCandidates(root).find((line) => line !== title && line !== salary && looksLikeCompany(line)) || "";
}

function findLocationLikeText(root) {
  return findTextCandidates(root).map(cleanLocationText).filter(Boolean).find(looksLikeLocation) || "";
}

function findRecruiterActivityLikeText(root) {
  return findTextCandidates(root).map(extractRecruiterActivityFromText).find(Boolean) || "";
}

function extractRecruiterActivityFromText(text) {
  const value = normalizeText(text);
  if (!value) {
    return "";
  }

  return RECRUITER_ACTIVITY_OPTIONS.find((item) => {
    return normalizeCompareText(value).includes(normalizeCompareText(item));
  }) || "";
}

function findTextCandidates(root) {
  const texts = new Set();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const value = normalizeText(walker.currentNode.nodeValue);
    if (value && value.length <= 80) {
      texts.add(value);
    }
  }
  return Array.from(texts);
}

function findImageResumeInput() {
  for (const selector of SELECTORS.imageResumeInput) {
    const candidates = Array.from(document.querySelectorAll(selector));
    const match = candidates.find((element) => {
      return element instanceof HTMLInputElement
        && element.type === "file"
        && /image/i.test(element.accept || "image/*");
    }) || candidates.find((element) => element instanceof HTMLInputElement && element.type === "file");

    if (match instanceof HTMLInputElement) {
      return match;
    }
  }

  return null;
}

function dataUrlToFile(dataUrl, fileName, mimeType) {
  const [header, body] = String(dataUrl || "").split(",");
  if (!header || !body) {
    throw new Error("invalid data url");
  }

  const inferredMimeType = header.match(/data:(.*?);base64/i)?.[1] || mimeType || "image/jpeg";
  const bytes = atob(body);
  const array = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) {
    array[index] = bytes.charCodeAt(index);
  }
  return new File([array], fileName || "resume.jpg", { type: inferredMimeType });
}

function looksLikeCompany(text) {
  return /(公司|科技|网络|信息|集团|有限公司|有限责任|工作室|传媒|汽车|教育|财险|银行|人力)/.test(text);
}

function looksLikeLocation(text) {
  return /(市|区|县|路|街|镇|村|新区|开发区|高新区|杭州|北京|上海|深圳|广州|重庆|成都|苏州|武汉|西安|远程|浦东|闵行|徐汇)/.test(text);
}

function cleanLocationText(text) {
  return normalizeText(text).replace(/[·•]/g, " ").replace(/\s+/g, " ").split(" ").filter((item, index, list) => item && list.indexOf(item) === index).slice(0, 4).join(" ");
}

function extractPrimaryLocation(text) {
  const value = normalizeText(text);
  if (!value) {
    return "";
  }

  const first = value.split(/[·•\s/|-]+/).map((item) => item.trim()).filter(Boolean)[0] || "";
  return first;
}

function normalizeLocationForCompare(text) {
  return normalizeCompareText(text)
    .replace(/市|区|县|省/g, "")
    .replace(/新区|开发区|高新区/g, "");
}

function sameMeaningfulText(a, b) {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) {
    return false;
  }
  return left === right || left.includes(right) || right.includes(left);
}

function fuzzyIncludes(a, b) {
  const left = normalizeCompareText(a);
  const right = normalizeCompareText(b);
  if (!left || !right) {
    return false;
  }
  return left.includes(right) || right.includes(left);
}

function uniqueStrings(values) {
  return values.filter((item, index, list) => item && list.indexOf(item) === index);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function asMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function setValue(id, value) {
  const element = state.shadowRoot?.getElementById(id);
  if (element) {
    element.value = value;
  }
}

function getValue(id) {
  return state.shadowRoot?.getElementById(id)?.value?.trim() || "";
}

function setChecked(id, checked) {
  const element = state.shadowRoot?.getElementById(id);
  if (element) {
    element.checked = Boolean(checked);
  }
}

function getChecked(id) {
  return Boolean(state.shadowRoot?.getElementById(id)?.checked);
}

function setText(id, value) {
  const element = state.shadowRoot?.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function savePanelPosition() {
  const left = parseFloat(state.host.style.left || "0");
  const top = parseFloat(state.host.style.top || "24");
  localStorage.setItem(PANEL_POSITION_KEY, JSON.stringify({ left, top }));
}

function restorePanelPosition() {
  try {
    const saved = JSON.parse(localStorage.getItem(PANEL_POSITION_KEY) || "null");
    if (!saved) {
      return;
    }
    state.host.style.left = `${saved.left}px`;
    state.host.style.top = `${saved.top}px`;
    state.host.style.right = "auto";
  } catch (_error) {
    // ignore broken storage
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function clampNumber(value, min, max, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return clamp(value, min, max);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
