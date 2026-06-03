const HOST_ID = "boss-helper-root";
const PANEL_POSITION_KEY = "boss-helper:panel-position";
const MAX_LOGS = 200;
const MAX_JOB_RETRIES = 2;
const AUTO_REPLY_POLL_MS = 1400;
const AUTO_REPLY_MIN_INTERVAL = 6000;

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
    ".info-desc"
  ],
  detailTitle: [
    ".job-detail-box .job-title",
    ".job-detail-box .name",
    ".job-banner .name",
    ".job-primary .name"
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
    ".job-detail-box .btn-chat",
    ".job-detail-box .btn",
    "button",
    "a"
  ],
  stayButtons: [
    ".dialog-footer button",
    ".boss-dialog button",
    ".dialog-container button",
    ".modal button",
    "button",
    "a"
  ],
  deliverButtons: [
    ".job-detail-box .btn.btn-main",
    ".btn-apply",
    ".job-detail-box .btn-primary"
  ],
  chatInput: [
    "textarea",
    "[contenteditable='true']",
    ".chat-input",
    ".input-area textarea"
  ],
  chatSend: [
    ".btn-send",
    ".send-btn",
    "button[type='submit']"
  ],
  chatMessages: [
    ".chat-message",
    ".msg-item",
    ".message-item",
    "[class*='chat-msg']",
    "[class*='msg-item']",
    "[class*='message']"
  ]
};

const state = {
  settings: { ...DEFAULT_SETTINGS },
  running: false,
  processing: false,
  preloading: false,
  observer: null,
  loopTimer: null,
  autoReplyTimer: null,
  shadowRoot: null,
  host: null,
  visitedJobs: new Set(),
  skippedJobs: new Set(),
  failedJobAttempts: new Map(),
  lastSnapshotSignature: "",
  selectedJobIndex: -1,
  currentJob: null,
  lastGreetingPreview: "",
  lastAutoReplySignature: "",
  lastAutoReplyAt: 0,
  autoReplyInFlight: false,
  panelMinimized: false,
  logs: [],
  startButtonLocked: false
};

const ACTION_RESULT = {
  greeted: "greeted",
  delivered: "delivered",
  pending: "pending",
  failed: "failed"
};

const JOB_PAGE_HINTS = [
  "/web/geek/job",
  "/job_detail/",
  "/job_detail",
  "/c101",
  "/web/geek/recommend"
];

if (!document.getElementById(HOST_ID)) {
  void bootstrap();
}

async function bootstrap() {
  try {
    state.settings = await loadSettings();
    mountHelper();
    bindEvents();
    restorePanelPosition();
    chrome.storage.onChanged.addListener(handleStorageChanges);
    logEvent("初始化", "扩展已注入页面。");
    refreshPageSnapshot("初始化完成");
    installObservers();
    startAutoReplyLoop();
    syncButtonState();
  } catch (error) {
    console.error("[boss-helper] bootstrap failed", error);
  }
}

async function loadSettings() {
  const response = await chrome.runtime.sendMessage({ type: "boss-helper:get-settings" });
  return {
    ...DEFAULT_SETTINGS,
    ...(response?.settings ?? {})
  };
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
    * { box-sizing: border-box; font-family: Inter, Arial, "Microsoft YaHei", sans-serif; }
    button, input, textarea { font: inherit; }
    .panel { width: 408px; max-height: calc(100vh - 40px); border-radius: 20px; background: rgba(255,255,255,0.97); box-shadow: 0 24px 60px rgba(15,23,42,0.2); border: 1px solid rgba(226,232,240,0.95); color: #0f172a; overflow: hidden; display: flex; flex-direction: column; backdrop-filter: blur(12px); }
    .panel.minimized { width: 240px; }
    .header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 18px; border-bottom:1px solid #e8eef8; background:linear-gradient(180deg, rgba(248,251,255,0.95) 0%, rgba(255,255,255,0.95) 100%); cursor:move; user-select:none; }
    .brand { display:flex; align-items:center; gap:12px; min-width:0; }
    .logo { width:44px; height:44px; border-radius:14px; display:inline-flex; align-items:center; justify-content:center; font-size:20px; background:linear-gradient(180deg, #5b8def 0%, #2f6ae6 100%); color:#fff; flex:0 0 auto; }
    .title strong { display:block; font-size:17px; font-weight:700; color:#3774ee; white-space:nowrap; }
    .subtitle { margin-top:2px; font-size:12px; color:#6b7a90; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .tools { display:flex; gap:6px; flex:0 0 auto; }
    .icon-btn { width:30px; height:30px; border:0; border-radius:50%; background:transparent; color:#64748b; cursor:pointer; font-size:18px; }
    .icon-btn:hover { background:#eef4ff; color:#2563eb; }
    .body { display:flex; flex-direction:column; min-height:0; overflow:auto; background:linear-gradient(180deg, #f7fbff 0%, #fff 180px); }
    .panel.minimized .body { display:none; }
    .section { padding:14px 16px; }
    .surface { border-radius:18px; background:rgba(255,255,255,0.88); border:1px solid #dfe9f8; box-shadow:0 8px 24px rgba(37,99,235,0.06); }
    .form { padding:14px; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .field { display:flex; flex-direction:column; gap:6px; min-width:0; }
    .field.span-2 { grid-column:1 / -1; }
    .field label { font-size:12px; color:#4b5a71; }
    .field input, .field textarea { width:100%; border-radius:14px; border:1px solid #c9d7ea; background:#fff; padding:10px 14px; font-size:14px; color:#0f172a; outline:none; }
    .field input { height:42px; }
    .field textarea { min-height:76px; resize:vertical; line-height:1.5; }
    .field input:focus, .field textarea:focus { border-color:#6da4ff; box-shadow:0 0 0 3px rgba(59,130,246,0.14); }
    .hint { font-size:11px; color:#7a889d; }
    .subtle-note {
      margin-top: 10px;
      font-size: 12px;
      color: #7a889d;
      line-height: 1.5;
    }
    .icon-btn.active {
      background:#eef4ff;
      color:#2563eb;
    }
    .toggles { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px; }
    .toggle { display:flex; align-items:center; gap:8px; min-height:36px; border-radius:12px; padding:0 10px; background:#f8fbff; color:#334155; font-size:13px; }
    .actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px; }
    .button { height:46px; border:0; border-radius:14px; font-size:16px; font-weight:600; cursor:pointer; transition: opacity 0.18s ease; }
    .button:disabled { cursor:not-allowed; opacity:0.58; }
    .button.primary { background:linear-gradient(180deg, #4d8cff 0%, #2f6ae6 100%); color:#fff; box-shadow:0 12px 24px rgba(47,106,230,0.28); }
    .button.secondary { background:#e9eff8; color:#334155; }
    .stats { display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; }
    .stat { border-radius:16px; background:rgba(255,255,255,0.86); border:1px solid #e7eef8; padding:14px 10px; text-align:center; }
    .stat strong { display:block; font-size:18px; font-weight:700; color:#0f172a; }
    .stat span { display:block; margin-top:4px; font-size:12px; color:#74839a; }
    .log-card {
      margin-top: 12px;
      border-radius: 16px;
      background: rgba(255,255,255,0.9);
      border: 1px solid #e7eef8;
      padding: 12px 14px;
    }
    .log-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      font-size: 13px;
      color: #506077;
      margin-bottom: 8px;
    }
    .log-card-count {
      color: #2563eb;
      font-size: 12px;
      font-weight: 600;
    }
    .log-card-body {
      min-height: 72px;
      max-height: 220px;
      overflow: auto;
      white-space: pre-wrap;
      font-size: 12px;
      line-height: 1.55;
      color: #475569;
    }
    .section-title { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; font-size:13px; color:#506077; }
    .pill { display:inline-flex; align-items:center; height:22px; padding:0 9px; border-radius:999px; background:#edf4ff; color:#316fe7; font-size:11px; font-weight:600; }
    .footer { padding:12px 16px 16px; border-top:1px solid #e8eef8; background:rgba(255,255,255,0.95); font-size:12px; color:#90a0b7; text-align:center; }
  `;
  return style;
}

function buildPanel() {
  const wrapper = document.createElement("div");
  wrapper.className = "panel";
  wrapper.innerHTML = `
    <div class="header" data-drag-handle="true">
      <div class="brand">
        <div class="logo">⚓</div>
        <div class="title">
          <strong>BOSS海投助手</strong>
          <div class="subtitle">自动筛选 · 自动沟通 · 页面内悬浮</div>
        </div>
      </div>
      <div class="tools">
        <button class="icon-btn" type="button" data-action="advanced" title="高级选项">⚙</button>
        <button class="icon-btn" type="button" data-action="minimize" title="最小化">-</button>
        <button class="icon-btn" type="button" data-action="refresh" title="刷新">↻</button>
        <button class="icon-btn" type="button" data-action="close" title="关闭">×</button>
      </div>
    </div>
    <div class="body">
      <div class="section">
        <div class="surface form">
          <div class="grid">
            <div class="field"><label for="jobKeywords">职位名包含</label><input id="jobKeywords" placeholder="后端, Java, Go" /></div>
            <div class="field"><label for="locationKeywords">工作地包含</label><input id="locationKeywords" placeholder="上海, 浦东, 远程" /></div>
          </div>
          <div class="subtle-note">点击开始海投后，会先自动滑动到列表底部，读取完整职位信息。薪资、公司、招呼语模板等可选项已移到右上角高级设置。</div>
          <div class="actions">
            <button class="button primary" type="button" id="startButton" data-action="start">启动海投</button>
            <button class="button secondary" type="button" id="stopButton" data-action="stop">暂停</button>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="stats">
          <div class="stat"><strong id="jobCount">0</strong><span>列表职位</span></div>
          <div class="stat"><strong id="matchCount">0</strong><span>全条件命中</span></div>
          <div class="stat"><strong id="visitedCount">0</strong><span>已处理</span></div>
        </div>
        <div class="log-card">
          <div class="log-card-header">
            <span>运行日志</span>
            <span class="log-card-count" id="logCount">0 条</span>
          </div>
          <div class="log-card-body" id="logCardBody">暂无日志。</div>
        </div>
      </div>
      <div class="footer">当前仅对 BOSS 页面生效，刷新或切页后会自动重连</div>
    </div>
  `;
  return wrapper;
}

function hydrateForm() {
  setValue("jobKeywords", state.settings.jobKeywords);
  setValue("locationKeywords", state.settings.locationKeywords);
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
  shadowRoot.querySelector('[data-action="stop"]').addEventListener("click", stopAutomation);
  bindFormPersistence();
  bindDrag();
}

function bindFormPersistence() {
  for (const id of ["jobKeywords", "locationKeywords"]) {
    const element = state.shadowRoot.getElementById(id);
    const eventName = element.type === "checkbox" ? "change" : "input";
    element.addEventListener(eventName, () => {
      void persistSettingsFromForm();
    });
  }
}

async function openAdvancedWindow() {
  const toggle = state.shadowRoot.querySelector('[data-action="advanced"]');
  toggle.classList.add("active");
  try {
    await chrome.runtime.sendMessage({
      type: "boss-helper:open-advanced-window"
    });
  } catch (error) {
    logEvent("开窗失败", asMessage(error));
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
    locationKeywords: getValue("locationKeywords")
  };

  try {
    await chrome.runtime.sendMessage({
      type: "boss-helper:save-settings",
      payload: state.settings
    });
  } catch (error) {
    logEvent("保存失败", asMessage(error));
  }

  if (state.running) {
    restartAutomationLoop();
  }
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
  state.autoReplyTimer = setInterval(() => {
    void tryAutoReply();
  }, AUTO_REPLY_POLL_MS);
}

function handleUrlMaybeChanged() {
  state.visitedJobs.clear();
  state.skippedJobs.clear();
  state.failedJobAttempts.clear();
  logEvent("路由变化", "页面地址变化，已清空已处理列表。");
  refreshPageSnapshot("检测到页面路由变化");
}

let refreshTimer = null;

function debounceRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
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
  const onJobPage = isBossJobPage();
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

  const matchDetails = getJobMatchDetails({ title, company, salary, location });

  return {
    key: buildJobKey({ title, company, salary, location, index }),
    title,
    company,
    salary,
    location,
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
  return /职位描述|查看更多信息|人力经纪人|刚刚活跃/.test(text);
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
  return {
    key: exactJob?.key || buildJobKey({ title, company, salary, location, index: 0 }),
    title,
    company,
    salary,
    location,
    tags,
    description
  };
}

function renderSnapshot(snapshot, reason) {
  const matchedCount = snapshot.jobs.filter((job) => job.matches).length;
  setText("jobCount", String(snapshot.jobs.length));
  setText("matchCount", String(matchedCount));
  setText("visitedCount", String(state.visitedJobs.size));
  renderLogCard();
  syncButtonState(snapshot);
}

function logEvent(type, message) {
  state.logs.unshift({
    type,
    message,
    time: new Date().toLocaleTimeString()
  });
  state.logs = state.logs.slice(0, MAX_LOGS);
  renderLogCard();
}

function renderLogCard() {
  if (!state.shadowRoot) {
    return;
  }

  const count = state.shadowRoot.getElementById("logCount");
  const body = state.shadowRoot.getElementById("logCardBody");
  if (!count || !body) {
    return;
  }

  count.textContent = `${state.logs.length} 条`;
  body.textContent = state.logs.length
    ? state.logs.slice(0, 20).map((item) => `${item.time} ${item.type}：${item.message}`).join("\n")
    : "暂无日志。";
}

function syncButtonState(snapshot = collectPageSnapshot()) {
  const startButton = state.shadowRoot.getElementById("startButton");
  const stopButton = state.shadowRoot.getElementById("stopButton");

  startButton.disabled = state.running || state.startButtonLocked || state.preloading || !snapshot.onJobPage;
  stopButton.disabled = !state.running;

  if (state.running) {
    startButton.textContent = state.processing ? "执行中..." : "运行中";
  } else if (state.preloading) {
    startButton.textContent = "读取职位中...";
  } else if (!snapshot.onJobPage) {
    startButton.textContent = "请进入职位页";
  } else {
    startButton.textContent = "开始海投";
  }
}

async function startAutomation() {
  if (state.running || state.startButtonLocked) {
    return;
  }

  let snapshot = collectPageSnapshot();
  if (!snapshot.onJobPage) {
    logEvent("启动失败", "当前不是职位页。请点击顶部“职位”导航后再启动。");
    refreshPageSnapshot("启动失败：非职位页");
    return;
  }

  state.startButtonLocked = true;
  state.skippedJobs.clear();
  state.failedJobAttempts.clear();
  syncButtonState(snapshot);

  try {
    await persistSettingsFromForm();
    await preloadFullJobList();
    snapshot = collectPageSnapshot();

    if (!snapshot.jobs.length) {
      logEvent("启动失败", "已经滑动到底，但仍未识别到职位列表。");
      refreshPageSnapshot("启动失败：未识别职位列表");
      return;
    }

    if (!snapshot.jobs.some((job) => job.matches)) {
      logEvent("启动失败", "完整读取列表后仍没有职位命中筛选条件，请调整关键词或放宽可选筛选。");
      refreshPageSnapshot("启动失败：没有匹配职位");
      return;
    }

    await chrome.runtime.sendMessage({ type: "boss-helper:start-delivery" });
    state.running = true;
    logEvent("启动成功", `开始自动海投，轮询间隔 ${state.settings.pollIntervalMs}ms。`);
    refreshPageSnapshot("启动海投");
    restartAutomationLoop();
  } catch (error) {
    logEvent("启动失败", asMessage(error));
    refreshPageSnapshot("启动失败：消息发送异常");
  } finally {
    state.startButtonLocked = false;
    syncButtonState();
  }
}

function stopAutomation() {
  if (!state.running) {
    return;
  }
  state.running = false;
  state.processing = false;
  clearTimeout(state.loopTimer);
  void chrome.runtime.sendMessage({
    type: "boss-helper:update-runtime",
    payload: { lastStatus: "paused" }
  });
  logEvent("已暂停", "自动海投已暂停。");
  refreshPageSnapshot("手动暂停");
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
    const snapshot = collectPageSnapshot();
    const nextJob = snapshot.jobs.find((job) => {
      return job.matches && !state.visitedJobs.has(job.key) && !state.skippedJobs.has(job.key);
    });

    if (!nextJob) {
      const matchedCount = snapshot.jobs.filter((job) => job.matches).length;
      logEvent("等待中", `没有可继续处理的匹配职位。命中 ${matchedCount}，已处理 ${state.visitedJobs.size}，已跳过 ${state.skippedJobs.size}。`);
      await tryLoadMoreJobsFromList();
      refreshPageSnapshot("没有新的匹配职位");
      return;
    }

    logEvent("选中职位", `${nextJob.title || "未识别职位"} / ${nextJob.company || "-"}`);
    await focusJob(nextJob);
    refreshPageSnapshot("已点击职位卡片");
    await wait(1000);

    let actionResult = {
      status: ACTION_RESULT.pending,
      message: "未执行动作。"
    };
    if (state.settings.autoGreet) {
      actionResult = await tryPrimaryAction(nextJob);
    } else {
      actionResult = {
        status: ACTION_RESULT.pending,
        message: "已关闭自动打招呼，仅切换职位。"
      };
    }
    logEvent("执行动作", actionResult.message);

    if (actionResult.status === ACTION_RESULT.greeted || actionResult.status === ACTION_RESULT.delivered) {
      state.visitedJobs.add(nextJob.key);
      refreshPageSnapshot("处理完成");
      logEvent("完成", `已处理 ${nextJob.title || "当前职位"}。`);
    } else {
      const attempts = registerJobFailure(nextJob);
      refreshPageSnapshot("沟通未完成");
      if (attempts >= MAX_JOB_RETRIES) {
        state.skippedJobs.add(nextJob.key);
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
  const clickable = findSafeClickable(job.element) || job.element;
  triggerSafeClick(clickable);
  job.element.scrollIntoView({ block: "center", behavior: "smooth" });
  await waitForJobDetail(job);
}

async function tryPrimaryAction(job) {
  const detailRoot = findRootBySelectors(SELECTORS.detailContainers) || document;
  const greetButton = findClickable(SELECTORS.greetButtons, ["立即沟通", "沟通", "打招呼"], {
    root: detailRoot,
    preferExact: true
  });
  if (greetButton) {
    const buttonLabel = normalizeText(greetButton.textContent) || "立即沟通";
    const clicked = triggerSafeClick(greetButton);
    if (!clicked) {
      return {
        status: ACTION_RESULT.failed,
        message: `已识别到 ${buttonLabel} 按钮，但当前不可点击：${job.title || "当前职位"}`
      };
    }

    await wait(1200);

    const stayButton = findClickable(SELECTORS.stayButtons, ["留在此页"], {
      root: findVisibleDialogRoot() || document,
      preferExact: true
    });
    if (stayButton && triggerSafeClick(stayButton)) {
      await wait(400);
      return {
        status: ACTION_RESULT.greeted,
        message: `已点击 ${buttonLabel}，并选择留在此页：${job.title || "当前职位"}`
      };
    }

    const continueButton = findClickable(SELECTORS.stayButtons, ["继续沟通", "继续聊天", "已沟通"], {
      root: detailRoot
    });
    if (continueButton) {
      return {
        status: ACTION_RESULT.greeted,
        message: `已触发 ${buttonLabel}，页面已切换到继续沟通状态：${job.title || "当前职位"}`
      };
    }

    const greetResult = await trySendGreeting(job);
    if (greetResult.sent) {
      return {
        status: ACTION_RESULT.greeted,
        message: greetResult.message
      };
    }

    return {
      status: ACTION_RESULT.failed,
      message: `已尝试点击 ${buttonLabel}，但页面没有出现沟通反馈：${job.title || "当前职位"}`
    };
  }

  const deliverButton = findClickable(SELECTORS.deliverButtons, ["投递", "立即投递", "申请"], {
    root: detailRoot
  });
  if (deliverButton && triggerSafeClick(deliverButton)) {
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
  const template = state.settings.greetTemplate || DEFAULT_SETTINGS.greetTemplate;
  const message = template
    .replaceAll("{jobTitle}", job.title || "该岗位")
    .replaceAll("{companyName}", job.company || "贵公司")
    .replaceAll("{location}", job.location || "该城市")
    .replaceAll("{salary}", job.salary || "该薪资范围");
  state.lastGreetingPreview = message;
  return message;
}

function fillChatInput(message) {
  for (const selector of SELECTORS.chatInput) {
    const element = document.querySelector(selector);
    if (!element) {
      continue;
    }

    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      if (!isElementVisible(element)) {
        continue;
      }
      element.focus();
      element.value = message;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      return { filled: true };
    }

    if (element instanceof HTMLElement && element.getAttribute("contenteditable") === "true") {
      if (!isElementVisible(element)) {
        continue;
      }
      element.focus();
      element.textContent = message;
      element.dispatchEvent(new InputEvent("input", { bubbles: true, data: message, inputType: "insertText" }));
      return { filled: true };
    }
  }

  return { filled: false };
}

function clickChatSend() {
  for (const selector of SELECTORS.chatSend) {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement && isElementVisible(element) && !isElementDisabled(element)) {
      const text = normalizeText(element.textContent);
      if (!text || text.includes("发送") || text.includes("send")) {
        return triggerSafeClick(element);
      }
    }
  }
  return false;
}

async function trySendGreeting(job) {
  const message = buildGreetingMessage(job);
  const fillResult = fillChatInput(message);
  if (!fillResult.filled) {
    return { sent: false };
  }

  await wait(250);
  if (clickChatSend()) {
    return {
      sent: true,
      message: `已发送招呼语：${truncateText(message, 26)}`
    };
  }

  return {
    sent: false,
    message: "已打开聊天输入框，但未找到发送按钮。"
  };
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
  syncButtonState();
  logEvent("预加载", "正在滑动到列表底部，加载完整职位信息。");

  try {
    const listScroller = findJobListScroller();
    let lastCount = collectJobList().length;
    let stableRounds = 0;

    for (let round = 0; round < 18; round += 1) {
      if (listScroller) {
        listScroller.scrollTo({
          top: listScroller.scrollHeight,
          behavior: "smooth"
        });
      } else {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth"
        });
      }

      await wait(850);
      const nextCount = collectJobList().length;
      setText("jobCount", String(nextCount));

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

  if (!findVisibleChatInput()) {
    return;
  }

  const chatMessages = collectChatMessages();
  if (!chatMessages.length) {
    return;
  }

  const lastMessage = chatMessages[chatMessages.length - 1];
  if (lastMessage.role !== "user") {
    return;
  }

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
  return {
    provider: "deepseek",
    apiKey: state.settings.deepseekApiKey,
    endpoint: state.settings.deepseekEndpoint,
    model: state.settings.deepseekModel
  };
}

function buildChatPayload(chatMessages, provider) {
  const systemPrompt = state.settings.autoReplySystemPrompt || DEFAULT_SETTINGS.autoReplySystemPrompt;
  const messages = [
    { role: "system", content: systemPrompt },
    ...chatMessages.slice(-6)
  ];

  return {
    provider: provider.provider,
    apiKey: provider.apiKey,
    endpoint: provider.endpoint,
    model: provider.model,
    temperature: state.settings.autoReplyTemperature,
    maxTokens: state.settings.autoReplyMaxTokens,
    messages
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
  const path = location.pathname || "";
  const href = location.href || "";
  if (JOB_PAGE_HINTS.some((hint) => path.includes(hint) || href.includes(hint))) {
    return true;
  }

  const activeNav = Array.from(document.querySelectorAll("a, span"))
    .map((node) => normalizeText(node.textContent))
    .find((text) => text === "职位");

  const hasJobList = Boolean(
    document.querySelector(".job-list-box, .search-job-result, .search-job-list, .job-card-wrapper")
  );

  return Boolean(activeNav && hasJobList);
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
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const detailTitle = queryText(SELECTORS.detailTitle);
    const detailCompany = queryText(SELECTORS.detailCompany);
    if (sameMeaningfulText(detailTitle, job.title) || (sameMeaningfulText(detailTitle, job.title) && sameMeaningfulText(detailCompany, job.company))) {
      return true;
    }
    await wait(260);
  }
  return false;
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

      if (preferExact && !hints.some((hint) => text === hint)) {
        score -= 40;
      }

      if (element.tagName === "BUTTON") {
        score += 20;
      }
      if (element.matches(".btn, .op-btn, [role='button']")) {
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
  const titleOk = matchesLooseTokens(job.title, state.settings.jobKeywords);
  const locationOk = matchesLocation(job.location, state.settings.locationKeywords);
  const companyOk = matchesLooseTokens(job.company, state.settings.companyKeywords);
  const salaryOk = matchesSalary(job.salary, state.settings.salaryKeywords);
  return {
    matches: titleOk && locationOk && companyOk && salaryOk,
    titleOk,
    locationOk,
    companyOk,
    salaryOk
  };
}

function matchesLooseTokens(text, keywordString) {
  const tokens = splitKeywords(keywordString);
  if (!tokens.length) {
    return true;
  }
  const haystack = normalizeCompareText(text);
  return tokens.some((token) => haystack.includes(normalizeCompareText(token)));
}

function matchesLocation(text, keywordString) {
  const tokens = splitKeywords(keywordString);
  if (!tokens.length) {
    return true;
  }

  const haystack = normalizeLocationForCompare(text);
  const primaryLocation = normalizeLocationForCompare(extractPrimaryLocation(text));
  return tokens.some((token) => {
    const normalizedToken = normalizeLocationForCompare(token);
    return primaryLocation === normalizedToken || haystack.includes(normalizedToken);
  });
}

function matchesSalary(jobSalary, keywordString) {
  const tokens = splitKeywords(keywordString);
  if (!tokens.length) {
    return true;
  }
  const parsedJob = parseSalaryRange(jobSalary);
  if (!parsedJob) {
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
    if (!job.matchDetails?.locationOk) {
      reasons.push(`地点不符(${job.location || "-"})`);
    }
    if (!job.matchDetails?.companyOk) {
      reasons.push(`公司不符(${job.company || "-"})`);
    }
    if (!job.matchDetails?.salaryOk) {
      reasons.push(`薪资不符(${job.salary || "-"})`);
    }
    return `${index + 1}. ${job.title || "未识别职位"}：${reasons.join("，")}`;
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

function asMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function setValue(id, value) {
  state.shadowRoot.getElementById(id).value = value;
}

function getValue(id) {
  return state.shadowRoot.getElementById(id).value.trim();
}

function setChecked(id, checked) {
  state.shadowRoot.getElementById(id).checked = Boolean(checked);
}

function getChecked(id) {
  return state.shadowRoot.getElementById(id).checked;
}

function setText(id, value) {
  state.shadowRoot.getElementById(id).textContent = value;
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
