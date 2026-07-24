/* ============================================================
   MARVEL READING CLUB — app.js
   BD: um único objeto { users, progress } que vive em dois sítios:
     - localStorage (mrc_club_state)  -> cópia local/offline, sempre atualizada
     - club-data.json no repo GitHub  -> a verdade partilhada entre dispositivos,
       lida/escrita através da GitHub Contents API (fetch, sem backend próprio)
   Configuração da sincronização (repo + token) fica em mrc_github_config,
   só neste browser — ver aviso no modal de sincronização.
   Os capítulos/livros e os filmes/séries (CHAPTERS/BOOKS_META e
   MOVIES/PHASES_META, agrupados em COLLECTIONS) vêm de data.js e são sempre
   locais/estáticos, não fazem parte do ficheiro sincronizado.
   ============================================================ */

(function () {
  "use strict";

  /* ---------------- i18n ---------------- */
  const I18N = {
    pt: {
      "app.title": "MARVEL READING CLUB",
      "app.subtitle": "Time Runs Out & Secret Wars — guia de leitura",
      "view.next": "Próximos",
      "view.history": "Histórico",
      "view.all": "Todos",
      "progress.read": "LIDOS",
      "nextup.eyebrow": "A seguir na pilha",
      "footer.note": "Guia de leitura gerado a partir do mapeamento por Omnibus. Marca cada número como lido — só tu vês o teu progresso.",
      "lock.eyebrow": "Acesso privado",
      "lock.copy": "Introduz a password para ver e marcar este progresso.",
      "lock.placeholder": "Password",
      "lock.error": "Password incorreta. Tenta outra vez.",
      "lock.submit": "Entrar",
      "adduser.eyebrow": "Novo leitor",
      "adduser.title": "Junta-te ao clube",
      "adduser.namelabel": "Nome",
      "adduser.nameplaceholder": "O teu nome",
      "adduser.passlabel": "Password",
      "adduser.passplaceholder": "Escolhe uma password",
      "adduser.error": "Esse nome já existe. Escolhe outro.",
      "adduser.submit": "Criar leitor",
      "add.tab": "＋ Novo",
      "collection.books.title": "Livros",
      "collection.movies.title": "Filmes/TV",
      "book.count": (done, total) => `${done}/${total} lidos`,
      "empty.next": "Já não há capítulos por ler nesta vista. Boa leitura! 🎉",
      "empty.history": "Ainda não marcaste nenhum capítulo como lido.",
      "empty.all": "Sem capítulos para mostrar.",
      "nextup.none": "Não há próximo capítulo — está tudo lido!",
      "locked.tag": "🔒",
      "prompt.name": "Nome do novo leitor:",
      "account.changepass": "🔑 Alterar password",
      "changepass.eyebrow": "Segurança (a sério, não muito)",
      "changepass.title": "Alterar password",
      "changepass.warning": "Isto não é segurança a sério: a password fica só ligeiramente disfarçada (não encriptada), guardada junto com o resto dos dados. Serve só para os leitores não mexerem uns nos progressos dos outros por engano — não uses aqui uma password que também uses noutro sítio.",
      "changepass.current": "Password atual",
      "changepass.new": "Nova password",
      "changepass.confirm": "Confirmar nova password",
      "changepass.submit": "Guardar nova password",
      "changepass.success": "Password alterada.",
      "changepass.error.current": "Password atual incorreta.",
      "changepass.error.match": "As passwords novas não coincidem.",
      "changepass.error.short": "A password deve ter pelo menos 4 caracteres.",
      "sync.status.off": "Sem sincronização — só neste dispositivo",
      "sync.status.syncing": "A sincronizar…",
      "sync.status.synced": "Sincronizado com o GitHub",
      "sync.status.error": "Falha na sincronização — toca para tentar",
      "sync.eyebrow": "Guardar no GitHub",
      "sync.title": "Sincronização entre dispositivos",
      "sync.warning": "O token fica guardado em texto simples neste browser (não encriptado) — não é segurança a sério. Usa sempre um token \"fine-grained\" limitado só a este repositório, com permissão apenas de \"Contents: Read and write\". Não uses um token com acesso a outros repositórios ou contas.",
      "sync.repo": "Repositório (utilizador/repo)",
      "sync.repo.placeholder": "ex: andre/marvel-reading-club",
      "sync.branch": "Ramo",
      "sync.token": "Personal Access Token",
      "sync.token.placeholder": "ghp_... ou github_pat_...",
      "sync.submit": "Guardar e sincronizar",
      "sync.disconnect": "Desligar sincronização (voltar a só este dispositivo)",
      "sync.success": "Ligado! A sincronizar…",
      "sync.error.fields": "Preenche pelo menos o repositório e o token.",
      "sync.error.generic": "Não consegui ligar ao GitHub. Confirma o repositório, o ramo e o token.",
      "sync.error.timeout": "O GitHub demorou demasiado tempo a responder (timeout). Verifica a tua ligação e tenta outra vez.",
      "sync.error.network": "Não consegui sequer contactar o GitHub — verifica a tua ligação à internet.",
      "sync.error.badtoken": "O GitHub recusou o token (credenciais inválidas). Confirma se o copiaste por inteiro e se ainda não expirou.",
      "sync.error.forbidden": "O token não tem permissão para escrever neste repositório. Confirma que o token tem \"Contents: Read and write\" ativado para este repositório.",
      "sync.error.notfound": "Não encontrei esse repositório (ou o token não tem acesso a ele). Confirma o \"utilizador/repo\".",
      "sync.error.branch": (branch) => `Não encontrei o ramo "${branch || "main"}" nesse repositório. Confirma o nome do ramo (em muitos repositórios mais antigos é "master").`,
      "sync.help": "Como criar o token: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → New token. Escolhe só este repositório e a permissão \"Contents: Read and write\".",
    },
    en: {
      "app.title": "MARVEL READING CLUB",
      "app.subtitle": "Time Runs Out & Secret Wars — reading guide",
      "view.next": "Up next",
      "view.history": "History",
      "view.all": "All",
      "progress.read": "READ",
      "nextup.eyebrow": "Next off the pile",
      "footer.note": "Reading guide generated from the Omnibus mapping. Tick off each issue — only you see your own progress.",
      "lock.eyebrow": "Private access",
      "lock.copy": "Enter the password to view and tick off this progress.",
      "lock.placeholder": "Password",
      "lock.error": "Wrong password. Try again.",
      "lock.submit": "Enter",
      "adduser.eyebrow": "New reader",
      "adduser.title": "Join the club",
      "adduser.namelabel": "Name",
      "adduser.nameplaceholder": "Your name",
      "adduser.passlabel": "Password",
      "adduser.passplaceholder": "Choose a password",
      "adduser.error": "That name already exists. Pick another.",
      "adduser.submit": "Create reader",
      "add.tab": "＋ Add",
      "collection.books.title": "Books",
      "collection.movies.title": "Movies/TV",
      "book.count": (done, total) => `${done}/${total} read`,
      "empty.next": "No unread issues left in this view. Happy reading! 🎉",
      "empty.history": "You haven't ticked off any issue yet.",
      "empty.all": "No issues to show.",
      "nextup.none": "No next issue — all caught up!",
      "locked.tag": "🔒",
      "prompt.name": "New reader's name:",
      "account.changepass": "🔑 Change password",
      "changepass.eyebrow": "Security (loosely speaking)",
      "changepass.title": "Change password",
      "changepass.warning": "This isn't real security: the password is only lightly disguised (not encrypted), stored alongside the rest of the data. It's just there so readers don't tick off each other's progress by accident — don't reuse a password from anywhere else here.",
      "changepass.current": "Current password",
      "changepass.new": "New password",
      "changepass.confirm": "Confirm new password",
      "changepass.submit": "Save new password",
      "changepass.success": "Password changed.",
      "changepass.error.current": "Current password is wrong.",
      "changepass.error.match": "The new passwords don't match.",
      "changepass.error.short": "The password must be at least 4 characters.",
      "sync.status.off": "Not synced — this device only",
      "sync.status.syncing": "Syncing…",
      "sync.status.synced": "Synced with GitHub",
      "sync.status.error": "Sync failed — tap to retry",
      "sync.eyebrow": "Save to GitHub",
      "sync.title": "Sync across devices",
      "sync.warning": "The token is stored in plain text in this browser (not encrypted) — this isn't real security. Always use a fine-grained token scoped only to this one repository, with just the \"Contents: Read and write\" permission. Don't use a token with access to other repos or accounts.",
      "sync.repo": "Repository (owner/repo)",
      "sync.repo.placeholder": "e.g. andre/marvel-reading-club",
      "sync.branch": "Branch",
      "sync.token": "Personal access token",
      "sync.token.placeholder": "ghp_... or github_pat_...",
      "sync.submit": "Save and sync",
      "sync.disconnect": "Turn off sync (back to this device only)",
      "sync.success": "Connected! Syncing…",
      "sync.error.fields": "Fill in at least the repository and the token.",
      "sync.error.generic": "Couldn't reach GitHub. Check the repository, branch and token.",
      "sync.error.timeout": "GitHub took too long to respond (timeout). Check your connection and try again.",
      "sync.error.network": "Couldn't even reach GitHub — check your internet connection.",
      "sync.error.badtoken": "GitHub rejected the token (invalid credentials). Check you copied it in full and it hasn't expired.",
      "sync.error.forbidden": "The token doesn't have permission to write to this repository. Check it has \"Contents: Read and write\" enabled for this repo.",
      "sync.error.notfound": "Couldn't find that repository (or the token can't access it). Check the \"owner/repo\".",
      "sync.error.branch": (branch) => `Couldn't find the branch "${branch || "main"}" in that repository. Check the branch name (many older repos use "master").`,
      "sync.help": "How to get a token: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → New token. Scope it to this one repository only, with \"Contents: Read and write\".",
    },
  };

  function t(key, ...args) {
    const entry = I18N[state.lang][key];
    if (typeof entry === "function") return entry(...args);
    return entry || key;
  }

  /* ---------------- tiny "hash" (obfuscation, not real security) ---------------- */
  function simpleHash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = (h * 33) ^ str.charCodeAt(i);
    }
    return (h >>> 0).toString(36);
  }

  /* ---------------- default data ---------------- */
  function emptyProgress() {
    return { books: {}, movies: {} };
  }

  function defaultClubData() {
    return {
      version: 2,
      updatedAt: new Date().toISOString(),
      users: [
        { id: "andre", name: "André", passHash: simpleHash("andre123") },
        { id: "filipe", name: "Filipe", passHash: simpleHash("filipe123") },
        { id: "duarte", name: "Duarte", passHash: simpleHash("duarte123") },
      ],
      progress: { andre: emptyProgress(), filipe: emptyProgress(), duarte: emptyProgress() },
    };
  }

  // Data created before the Movies/TV collection existed stored progress as
  // a flat { chapterId: true } map per user (implicitly "books"). Upgrade
  // that shape to { books: {...}, movies: {} } in place, so old local caches
  // and old club-data.json files keep working without losing progress.
  function migrateClubData(data) {
    if (!data || typeof data !== "object") return data;
    if (!data.progress) data.progress = {};
    (data.users || []).forEach((u) => {
      const bucket = data.progress[u.id];
      if (!bucket || typeof bucket !== "object") {
        data.progress[u.id] = emptyProgress();
      } else if (!("books" in bucket) && !("movies" in bucket)) {
        // Old flat shape: every key was a chapter id.
        data.progress[u.id] = { books: bucket, movies: {} };
      } else {
        if (!bucket.books) bucket.books = {};
        if (!bucket.movies) bucket.movies = {};
      }
    });
    data.version = 2;
    return data;
  }

  /* ---------------- local storage (offline cache / fallback) ---------------- */
  const LS_STATE = "mrc_club_state";
  const LS_LANG = "mrc_lang";
  const LS_COLLECTION = "mrc_collection";
  const LS_GH_CONFIG = "mrc_github_config";
  const DATA_PATH = "club-data.json";

  function loadLocalData() {
    const raw = localStorage.getItem(LS_STATE);
    if (raw) {
      try { return migrateClubData(JSON.parse(raw)); } catch (e) { /* fall through */ }
    }
    const data = defaultClubData();
    localStorage.setItem(LS_STATE, JSON.stringify(data));
    return data;
  }

  function saveLocalData(data) {
    localStorage.setItem(LS_STATE, JSON.stringify(data));
  }

  function loadGithubConfig() {
    const raw = localStorage.getItem(LS_GH_CONFIG);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function saveGithubConfig(cfg) {
    localStorage.setItem(LS_GH_CONFIG, JSON.stringify(cfg));
  }

  function clearGithubConfig() {
    localStorage.removeItem(LS_GH_CONFIG);
  }

  function slugify(name) {
    return name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || ("leitor-" + Date.now());
  }

  // Accepts "owner/repo", a full "https://github.com/owner/repo(.git)"
  // URL, or the same with stray slashes/whitespace — people paste all sorts.
  function parseRepoInput(raw) {
    let s = (raw || "").trim();
    s = s.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
    s = s.replace(/\.git$/i, "");
    s = s.replace(/^\/+|\/+$/g, "");
    const parts = s.split("/").map((p) => p.trim()).filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  }

  /* ---------------- GitHub Contents API ---------------- */
  function b64EncodeUnicode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function b64DecodeUnicode(str) {
    return decodeURIComponent(escape(atob(str.replace(/\n/g, ""))));
  }

  function githubApiUrl(cfg) {
    return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${DATA_PATH}`;
  }

  // ---- debug logging: every sync step goes to the console, tagged so it's
  // easy to filter (devtools console filter: "MRC sync"). Never logs the
  // token itself, only whether one is present and how long it is.
  const LOG_TAG = "[MRC sync]";
  function logInfo(...args) { console.log(LOG_TAG, ...args); }
  function logWarn(...args) { console.warn(LOG_TAG, ...args); }
  function logError(...args) { console.error(LOG_TAG, ...args); }
  function safeCfg(cfg) {
    if (!cfg) return cfg;
    return {
      owner: cfg.owner,
      repo: cfg.repo,
      branch: cfg.branch,
      token: cfg.token ? `(set, ${cfg.token.length} chars, starts "${cfg.token.slice(0, 4)}…")` : "(missing)",
    };
  }

  window.addEventListener("error", (e) => {
    logError("uncaught error", e.error || e.message, e);
  });
  window.addEventListener("unhandledrejection", (e) => {
    logError("unhandled promise rejection", e.reason);
  });

  // Plain fetch() can hang far longer than feels reasonable on a flaky
  // connection or a blocked host — abort it ourselves so the UI never
  // sits on "a sincronizar…" forever.
  const REQUEST_TIMEOUT_MS = 12000;
  async function fetchWithTimeout(url, options) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    logInfo("fetch →", options && options.method ? options.method : "GET", url);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      logInfo("fetch ←", res.status, res.statusText, url);
      return res;
    } catch (err) {
      if (err.name === "AbortError") {
        logError(`fetch timed out after ${REQUEST_TIMEOUT_MS}ms:`, url);
        throw new Error("timeout");
      }
      logError("fetch network error:", url, err);
      throw new Error("network");
    } finally {
      clearTimeout(timer);
    }
  }

  // Turns a raw error (thrown above, or a GitHub API message) into a short,
  // actionable sentence instead of a generic "something went wrong".
  function friendlyGithubError(err, cfg) {
    const msg = (err && err.message) || "";
    logError("mapping error to message:", { message: msg, status: err && err.status, cfg: safeCfg(cfg) });
    if (msg === "timeout") return t("sync.error.timeout");
    if (msg === "network") return t("sync.error.network");
    if (/bad credentials/i.test(msg)) return t("sync.error.badtoken");
    if (/not accessible|not authorized|forbidden/i.test(msg) || err.status === 403) return t("sync.error.forbidden");
    if (/branch/i.test(msg) && /not found/i.test(msg)) return t("sync.error.branch", cfg && cfg.branch);
    if (err.status === 404 || /not found/i.test(msg)) return t("sync.error.notfound");
    if (msg) return msg;
    return t("sync.error.generic");
  }

  async function fetchCloudData(cfg) {
    logInfo("fetchCloudData: starting", safeCfg(cfg));
    const headers = { Accept: "application/vnd.github+json" };
    if (cfg.token) headers.Authorization = `Bearer ${cfg.token}`;
    const url = githubApiUrl(cfg) + (cfg.branch ? `?ref=${encodeURIComponent(cfg.branch)}` : "");
    const res = await fetchWithTimeout(url, { headers });
    if (res.status === 404) {
      logWarn("fetchCloudData: 404 — file or repo/branch not found (this is normal the very first time)");
      return { sha: null, data: null };
    }
    if (!res.ok) {
      const body = await res.json().catch((e) => { logError("fetchCloudData: couldn't parse error body", e); return {}; });
      logError("fetchCloudData: GitHub returned an error", { status: res.status, body });
      const err = new Error(body.message || `github-fetch-${res.status}`);
      err.status = res.status;
      throw err;
    }
    const json = await res.json();
    const decoded = b64DecodeUnicode(json.content);
    const data = migrateClubData(JSON.parse(decoded));
    logInfo("fetchCloudData: success", { sha: json.sha, users: data.users && data.users.length, updatedAt: data.updatedAt });
    return { sha: json.sha, data };
  }

  async function pushCloudData(cfg, data, sha) {
    logInfo("pushCloudData: starting", { ...safeCfg(cfg), sha, users: data.users && data.users.length });
    if (!cfg.token) {
      logError("pushCloudData: no token configured, aborting");
      throw new Error("no-token");
    }
    const headers = {
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.token}`,
    };
    const body = {
      message: "Atualiza progresso do Marvel Reading Club",
      content: b64EncodeUnicode(JSON.stringify(data, null, 2)),
    };
    if (cfg.branch) body.branch = cfg.branch;
    if (sha) body.sha = sha;
    const res = await fetchWithTimeout(githubApiUrl(cfg), { method: "PUT", headers, body: JSON.stringify(body) });
    if (!res.ok) {
      const errJson = await res.json().catch((e) => { logError("pushCloudData: couldn't parse error body", e); return {}; });
      logError("pushCloudData: GitHub rejected the write", { status: res.status, body: errJson });
      const err = new Error(errJson.message || `github-push-${res.status}`);
      err.status = res.status;
      throw err;
    }
    const json = await res.json();
    logInfo("pushCloudData: success, new sha", json.content.sha);
    return json.content.sha;
  }

  /* ---------------- app state ---------------- */
  const state = {
    data: loadLocalData(), // { version, updatedAt, users, progress: { [userId]: { books:{}, movies:{} } } }
    currentUserId: null,
    collection: localStorage.getItem(LS_COLLECTION) === "movies" ? "movies" : "books",
    view: "proximos", // proximos | historico | todos
    lang: localStorage.getItem(LS_LANG) || "pt",
    unlocked: new Set(JSON.parse(sessionStorage.getItem("mrc_unlocked") || "[]")),
    pendingUnlockId: null,
    github: {
      config: loadGithubConfig(),
      sha: null,
      status: "off", // off | syncing | synced | error
      errorMsg: null,
    },
    syncTimer: null,
  };

  function persistUnlocked() {
    sessionStorage.setItem("mrc_unlocked", JSON.stringify([...state.unlocked]));
  }

  // The two parallel collections (Livros / Movies-TV) share all the same
  // logic below; these two helpers are the only place that decides which
  // dataset and which progress sub-bucket is "current".
  function currentItems() {
    return COLLECTIONS[state.collection].items;
  }
  function currentMeta() {
    return COLLECTIONS[state.collection].meta;
  }

  function ensureProgressBucket(userId) {
    if (!state.data.progress[userId]) state.data.progress[userId] = emptyProgress();
    const bucket = state.data.progress[userId];
    if (!bucket[state.collection]) bucket[state.collection] = {};
    return bucket[state.collection];
  }

  function isDone(chapterId) {
    if (!state.currentUserId) return false;
    return !!ensureProgressBucket(state.currentUserId)[chapterId];
  }

  /* ---------------- DOM refs ---------------- */
  const el = {
    userTabs: document.getElementById("userTabs"),
    segmented: document.getElementById("viewSegmented"),
    progressCount: document.getElementById("progressCount"),
    progressFill: document.getElementById("progressFill"),
    nextUpZone: document.getElementById("nextUpZone"),
    nextUpCard: document.getElementById("nextUpCard"),
    chapterList: document.getElementById("chapterList"),
    emptyState: document.getElementById("emptyState"),
    lockModal: document.getElementById("lockModal"),
    lockModalName: document.getElementById("lockModalName"),
    lockForm: document.getElementById("lockForm"),
    lockPassword: document.getElementById("lockPassword"),
    lockError: document.getElementById("lockError"),
    lockModalClose: document.getElementById("lockModalClose"),
    addUserModal: document.getElementById("addUserModal"),
    addUserForm: document.getElementById("addUserForm"),
    addUserName: document.getElementById("addUserName"),
    addUserPassword: document.getElementById("addUserPassword"),
    addUserError: document.getElementById("addUserError"),
    addUserModalClose: document.getElementById("addUserModalClose"),
    accountRow: document.getElementById("accountRow"),
    changePasswordBtn: document.getElementById("changePasswordBtn"),
    changePasswordModal: document.getElementById("changePasswordModal"),
    changePasswordModalClose: document.getElementById("changePasswordModalClose"),
    changePasswordForm: document.getElementById("changePasswordForm"),
    changePasswordCurrent: document.getElementById("changePasswordCurrent"),
    changePasswordNew: document.getElementById("changePasswordNew"),
    changePasswordConfirm: document.getElementById("changePasswordConfirm"),
    changePasswordError: document.getElementById("changePasswordError"),
    changePasswordSuccess: document.getElementById("changePasswordSuccess"),
    syncStatusBtn: document.getElementById("syncStatusBtn"),
    syncStatusIcon: document.getElementById("syncStatusIcon"),
    syncStatusText: document.getElementById("syncStatusText"),
    syncModal: document.getElementById("syncModal"),
    syncModalClose: document.getElementById("syncModalClose"),
    syncForm: document.getElementById("syncForm"),
    syncRepo: document.getElementById("syncRepo"),
    syncBranch: document.getElementById("syncBranch"),
    syncToken: document.getElementById("syncToken"),
    syncError: document.getElementById("syncError"),
    syncSuccess: document.getElementById("syncSuccess"),
    syncDisconnect: document.getElementById("syncDisconnect"),
  };

  /* ---------------- i18n apply ---------------- */
  function applyI18n() {
    document.documentElement.lang = state.lang === "pt" ? "pt-PT" : "en-GB";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      node.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      const key = node.getAttribute("data-i18n-placeholder");
      node.setAttribute("placeholder", t(key));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((node) => {
      const key = node.getAttribute("data-i18n-title");
      node.setAttribute("title", t(key));
    });
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      const isActive = btn.dataset.lang === state.lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
    document.querySelectorAll(".collection-btn").forEach((btn) => {
      const isActive = btn.dataset.collection === state.collection;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
    renderSyncStatus();
  }

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    const locale = state.lang === "pt" ? "pt-PT" : "en-GB";
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(d);
  }

  /* ---------------- rendering ---------------- */
  function renderTabs() {
    el.userTabs.innerHTML = "";
    state.data.users.forEach((u) => {
      const btn = document.createElement("button");
      btn.className = "tab-btn" + (u.id === state.currentUserId ? " is-active" : "");
      btn.type = "button";
      btn.dataset.userId = u.id;
      const locked = !state.unlocked.has(u.id) && u.id !== state.currentUserId;
      btn.innerHTML = `<span>${escapeHtml(u.name)}</span>` + (locked ? `<span class="tab-lock">🔒</span>` : "");
      btn.addEventListener("click", () => onSelectUser(u.id));
      el.userTabs.appendChild(btn);
    });
    const addBtn = document.createElement("button");
    addBtn.className = "tab-btn tab-add";
    addBtn.type = "button";
    addBtn.textContent = t("add.tab");
    addBtn.addEventListener("click", openAddUserModal);
    el.userTabs.appendChild(addBtn);
  }

  function renderSegmented() {
    el.segmented.querySelectorAll(".segment").forEach((btn) => {
      const active = btn.dataset.view === state.view;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function renderProgressStamp() {
    const items = currentItems();
    const total = items.length;
    const done = items.filter((c) => isDone(c.id)).length;
    el.progressCount.textContent = `${done}/${total}`;
    el.progressFill.style.width = total ? `${Math.round((done / total) * 100)}%` : "0%";
  }

  function renderNextUp() {
    const items = currentItems();
    const meta = currentMeta();
    const next = items.find((c) => !isDone(c.id));
    if (!next || state.view !== "proximos") {
      el.nextUpZone.hidden = true;
      return;
    }
    el.nextUpZone.hidden = false;
    const bookMeta = meta[next.book] || { color: "var(--blue)", short: next.book };
    el.nextUpCard.innerHTML = `
      <div class="next-up-badge">#${next.id}</div>
      <div class="next-up-body">
        <p class="next-up-edition">${escapeHtml(next.edition)}</p>
        <p class="next-up-meta">${formatDate(next.date)} · ${escapeHtml(bookMeta.short || next.book)}</p>
      </div>
    `;
  }

  function chaptersForView() {
    const items = currentItems();
    if (state.view === "proximos") return items.filter((c) => !isDone(c.id));
    if (state.view === "historico") return items.filter((c) => isDone(c.id));
    return items.slice();
  }

  function renderList() {
    const items = currentItems();
    const chapters = chaptersForView();
    el.chapterList.innerHTML = "";

    if (chapters.length === 0) {
      const key = state.view === "proximos" ? "empty.next" : state.view === "historico" ? "empty.history" : "empty.all";
      el.emptyState.textContent = t(key);
      el.emptyState.hidden = false;
      return;
    }
    el.emptyState.hidden = true;

    const groups = [];
    chapters.forEach((c) => {
      const last = groups[groups.length - 1];
      if (last && last.book === c.book) {
        last.items.push(c);
      } else {
        groups.push({ book: c.book, items: [c] });
      }
    });

    groups.forEach((group) => {
      const section = document.createElement("section");
      section.className = "book-group";

      const totalInBook = items.filter((c) => c.book === group.book).length;
      const doneInBook = items.filter((c) => c.book === group.book && isDone(c.id)).length;

      const header = document.createElement("div");
      header.className = "book-header";
      header.innerHTML = `
        <h2 class="book-title">${escapeHtml(group.book)}</h2>
        <span class="book-count">${t("book.count", doneInBook, totalInBook)}</span>
      `;
      section.appendChild(header);

      // Several sessions can land on the same day (e.g. a movie + a
      // One-Shot, or two episode batches). Cluster consecutive same-date
      // items so the day only appears once, with one card per session.
      dayClusters(group.items).forEach((cluster) => {
        if (cluster.items.length > 1) {
          const dayLabel = document.createElement("p");
          dayLabel.className = "day-cluster-label";
          dayLabel.textContent = `${formatDate(cluster.date)} · ${cluster.items.length}×`;
          section.appendChild(dayLabel);
          const wrap = document.createElement("div");
          wrap.className = "day-cluster";
          cluster.items.forEach((c) => wrap.appendChild(renderChapterCard(c, { hideDate: true })));
          section.appendChild(wrap);
        } else {
          section.appendChild(renderChapterCard(cluster.items[0]));
        }
      });

      el.chapterList.appendChild(section);
    });
  }

  function dayClusters(items) {
    const clusters = [];
    items.forEach((c) => {
      const last = clusters[clusters.length - 1];
      if (last && last.date === c.date) {
        last.items.push(c);
      } else {
        clusters.push({ date: c.date, items: [c] });
      }
    });
    return clusters;
  }

  function renderChapterCard(c, opts) {
    const hideDate = opts && opts.hideDate;
    const done = isDone(c.id);
    const meta = currentMeta()[c.book] || { color: "#333", short: c.book };
    const card = document.createElement("article");
    card.className = "chapter-card" + (done ? " is-done" : "");

    const number = document.createElement("div");
    number.className = "chapter-number";
    number.textContent = "#" + c.id;
    card.appendChild(number);

    const body = document.createElement("div");
    body.className = "chapter-body";
    body.innerHTML = `
      <p class="chapter-edition">${escapeHtml(c.edition)}</p>
      <div class="chapter-meta">
        ${hideDate ? "" : `<span class="chapter-date">${formatDate(c.date)}</span>`}
        <span class="chapter-tag" style="background:${meta.color}">${escapeHtml(meta.short || c.book)}</span>
      </div>
    `;
    card.appendChild(body);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "lido-toggle" + (done ? " is-checked" : "");
    toggle.setAttribute("aria-pressed", String(done));
    toggle.setAttribute("aria-label", "Lido");
    toggle.textContent = done ? "LIDO" : "LER";
    toggle.addEventListener("click", () => toggleChapter(c.id));
    card.appendChild(toggle);

    return card;
  }

  function renderAccountRow() {
    el.accountRow.hidden = !state.currentUserId;
  }

  function renderSyncStatus() {
    const map = {
      off: { icon: "📴", key: "sync.status.off" },
      syncing: { icon: "⏳", key: "sync.status.syncing" },
      synced: { icon: "☁️", key: "sync.status.synced" },
      error: { icon: "⚠️", key: "sync.status.error" },
    };
    const entry = map[state.github.status] || map.off;
    el.syncStatusIcon.textContent = entry.icon;
    el.syncStatusText.textContent = t(entry.key);
    el.syncStatusBtn.classList.toggle("is-error", state.github.status === "error");
    el.syncStatusBtn.classList.toggle("is-synced", state.github.status === "synced");
    el.syncStatusBtn.title = state.github.status === "error" && state.github.errorMsg ? state.github.errorMsg : "";
  }

  function renderAll() {
    renderTabs();
    renderSegmented();
    renderProgressStamp();
    renderNextUp();
    renderList();
    renderAccountRow();
    renderSyncStatus();
  }

  /* ---------------- sync orchestration ---------------- */
  function setSyncStatus(status, errorMsg) {
    state.github.status = status;
    state.github.errorMsg = errorMsg || null;
    renderSyncStatus();
  }

  function scheduleSync() {
    saveLocalData(state.data);
    if (!state.github.config) {
      logInfo("scheduleSync: no GitHub config set, staying local-only");
      return;
    }
    logInfo("scheduleSync: queued a push in 1.2s");
    if (state.syncTimer) clearTimeout(state.syncTimer);
    state.syncTimer = setTimeout(pushNow, 1200);
  }

  async function pushNow() {
    const cfg = state.github.config;
    if (!cfg) { logWarn("pushNow: called with no config, aborting"); return; }
    logInfo("pushNow: starting", safeCfg(cfg));
    setSyncStatus("syncing");
    state.data.updatedAt = new Date().toISOString();
    try {
      const newSha = await pushCloudData(cfg, state.data, state.github.sha);
      state.github.sha = newSha;
      saveLocalData(state.data);
      setSyncStatus("synced");
      logInfo("pushNow: done, status = synced");
    } catch (err) {
      logError("pushNow: push failed", err);
      if (err && err.status === 409) {
        // Someone else pushed meanwhile: fetch the latest sha and retry once,
        // keeping our local edits (simple last-write-wins for a small group).
        logWarn("pushNow: 409 conflict, refetching sha and retrying once");
        try {
          const fresh = await fetchCloudData(cfg);
          state.github.sha = fresh.sha;
          const newSha = await pushCloudData(cfg, state.data, state.github.sha);
          state.github.sha = newSha;
          saveLocalData(state.data);
          setSyncStatus("synced");
          logInfo("pushNow: retry after conflict succeeded");
          return;
        } catch (err2) {
          logError("pushNow: retry after conflict also failed", err2);
          setSyncStatus("error", friendlyGithubError(err2, cfg));
          return;
        }
      }
      setSyncStatus("error", friendlyGithubError(err, cfg));
    }
  }

  async function pullNow(initial) {
    const cfg = state.github.config;
    if (!cfg) { logInfo("pullNow: no config, status = off"); setSyncStatus("off"); return; }
    logInfo(`pullNow(initial=${!!initial}): starting`, safeCfg(cfg));
    setSyncStatus("syncing");
    try {
      const result = await fetchCloudData(cfg);
      if (result.data === null) {
        // File doesn't exist yet in the repo: create it from what we have locally.
        logInfo("pullNow: club-data.json doesn't exist yet in the repo, creating it now");
        const newSha = await pushCloudData(cfg, state.data, null);
        state.github.sha = newSha;
        setSyncStatus("synced");
        logInfo("pullNow: initial file created, status = synced");
        return;
      }
      if (result.sha !== state.github.sha) {
        logInfo("pullNow: cloud sha differs from what we had, applying cloud data", { oldSha: state.github.sha, newSha: result.sha });
        state.data = result.data;
        state.github.sha = result.sha;
        saveLocalData(state.data);
        if (state.currentUserId && !state.data.users.some((u) => u.id === state.currentUserId)) {
          state.currentUserId = null;
        }
        state.github.status = "synced";
        state.github.errorMsg = null;
        renderAll();
      } else {
        logInfo("pullNow: cloud sha unchanged, nothing to apply");
        setSyncStatus("synced");
      }
    } catch (err) {
      logError("pullNow: failed", err);
      setSyncStatus("error", friendlyGithubError(err, cfg));
    }
  }

  /* ---------------- actions ---------------- */
  function toggleChapter(chapterId) {
    const bucket = ensureProgressBucket(state.currentUserId);
    if (bucket[chapterId]) delete bucket[chapterId];
    else bucket[chapterId] = true;
    scheduleSync();
    renderProgressStamp();
    renderNextUp();
    renderList();
    renderTabs();
  }

  function onSelectUser(userId) {
    if (state.unlocked.has(userId)) {
      switchToUser(userId);
      return;
    }
    openLockModal(userId);
  }

  function switchToUser(userId) {
    state.currentUserId = userId;
    ensureProgressBucket(userId);
    renderAll();
  }

  function openLockModal(userId) {
    const user = state.data.users.find((u) => u.id === userId);
    if (!user) return;
    state.pendingUnlockId = userId;
    el.lockModalName.textContent = user.name;
    el.lockPassword.value = "";
    el.lockError.hidden = true;
    el.lockModal.hidden = false;
    setTimeout(() => el.lockPassword.focus(), 30);
  }

  function closeLockModal() {
    el.lockModal.hidden = true;
    state.pendingUnlockId = null;
  }

  function openAddUserModal() {
    el.addUserName.value = "";
    el.addUserPassword.value = "";
    el.addUserError.hidden = true;
    el.addUserModal.hidden = false;
    setTimeout(() => el.addUserName.focus(), 30);
  }

  function closeAddUserModal() {
    el.addUserModal.hidden = true;
  }

  function openChangePasswordModal() {
    el.changePasswordForm.reset();
    el.changePasswordError.hidden = true;
    el.changePasswordSuccess.hidden = true;
    el.changePasswordModal.hidden = false;
    setTimeout(() => el.changePasswordCurrent.focus(), 30);
  }

  function closeChangePasswordModal() {
    el.changePasswordModal.hidden = true;
  }

  function openSyncModal() {
    const cfg = state.github.config;
    el.syncRepo.value = cfg ? `${cfg.owner}/${cfg.repo}` : "";
    el.syncBranch.value = cfg && cfg.branch ? cfg.branch : "main";
    el.syncToken.value = cfg ? cfg.token : "";
    el.syncSuccess.hidden = true;
    el.syncDisconnect.hidden = !cfg;
    if (state.github.status === "error" && state.github.errorMsg) {
      el.syncError.textContent = state.github.errorMsg;
      el.syncError.hidden = false;
    } else {
      el.syncError.hidden = true;
    }
    el.syncModal.hidden = false;
  }

  function closeSyncModal() {
    el.syncModal.hidden = true;
  }

  /* ---------------- events ---------------- */
  el.segmented.addEventListener("click", (e) => {
    const btn = e.target.closest(".segment");
    if (!btn) return;
    state.view = btn.dataset.view;
    renderSegmented();
    renderNextUp();
    renderList();
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.lang = btn.dataset.lang;
      localStorage.setItem(LS_LANG, state.lang);
      applyI18n();
      renderAll();
    });
  });

  document.querySelectorAll(".collection-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.collection === state.collection) return;
      state.collection = btn.dataset.collection;
      localStorage.setItem(LS_COLLECTION, state.collection);
      logInfo("collection switched to", state.collection);
      applyI18n();
      renderAll();
    });
  });

  el.lockForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const userId = state.pendingUnlockId;
    const user = state.data.users.find((u) => u.id === userId);
    if (!user) return;
    const hash = simpleHash(el.lockPassword.value);
    if (hash === user.passHash) {
      state.unlocked.add(userId);
      persistUnlocked();
      closeLockModal();
      switchToUser(userId);
    } else {
      el.lockError.hidden = false;
      el.lockPassword.value = "";
      el.lockPassword.focus();
    }
  });
  el.lockModalClose.addEventListener("click", closeLockModal);
  el.lockModal.addEventListener("click", (e) => { if (e.target === el.lockModal) closeLockModal(); });

  el.addUserForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = el.addUserName.value.trim();
    const pass = el.addUserPassword.value;
    if (!name || !pass) return;
    const id = slugify(name);
    if (state.data.users.some((u) => u.id === id)) {
      el.addUserError.hidden = false;
      return;
    }
    state.data.users.push({ id, name, passHash: simpleHash(pass) });
    state.data.progress[id] = emptyProgress();
    state.unlocked.add(id);
    persistUnlocked();
    scheduleSync();
    closeAddUserModal();
    switchToUser(id);
  });
  el.addUserModalClose.addEventListener("click", closeAddUserModal);
  el.addUserModal.addEventListener("click", (e) => { if (e.target === el.addUserModal) closeAddUserModal(); });

  el.changePasswordBtn.addEventListener("click", openChangePasswordModal);
  el.changePasswordModalClose.addEventListener("click", closeChangePasswordModal);
  el.changePasswordModal.addEventListener("click", (e) => { if (e.target === el.changePasswordModal) closeChangePasswordModal(); });

  el.changePasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    el.changePasswordError.hidden = true;
    el.changePasswordSuccess.hidden = true;

    const user = state.data.users.find((u) => u.id === state.currentUserId);
    if (!user) return;

    const current = el.changePasswordCurrent.value;
    const next = el.changePasswordNew.value;
    const confirm = el.changePasswordConfirm.value;

    if (simpleHash(current) !== user.passHash) {
      el.changePasswordError.textContent = t("changepass.error.current");
      el.changePasswordError.hidden = false;
      return;
    }
    if (next.length < 4) {
      el.changePasswordError.textContent = t("changepass.error.short");
      el.changePasswordError.hidden = false;
      return;
    }
    if (next !== confirm) {
      el.changePasswordError.textContent = t("changepass.error.match");
      el.changePasswordError.hidden = false;
      return;
    }

    user.passHash = simpleHash(next);
    scheduleSync();
    el.changePasswordForm.reset();
    el.changePasswordSuccess.hidden = false;
  });

  el.syncStatusBtn.addEventListener("click", () => {
    if (state.github.status === "error") {
      // quick retry without opening the modal
      pullNow(false);
      return;
    }
    openSyncModal();
  });
  el.syncModalClose.addEventListener("click", closeSyncModal);
  el.syncModal.addEventListener("click", (e) => { if (e.target === el.syncModal) closeSyncModal(); });

  el.syncForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    logInfo("sync form submitted");
    el.syncError.hidden = true;
    el.syncSuccess.hidden = true;

    const parsed = parseRepoInput(el.syncRepo.value);
    const token = el.syncToken.value.trim();
    const branch = el.syncBranch.value.trim() || "main";

    logInfo("sync form parsed input", {
      rawRepo: el.syncRepo.value,
      parsed,
      branch,
      tokenLength: token.length,
    });

    if (!parsed || !token) {
      logWarn("sync form validation failed: missing repo/owner split or token");
      el.syncError.textContent = t("sync.error.fields");
      el.syncError.hidden = false;
      return;
    }

    const cfg = { owner: parsed.owner, repo: parsed.repo, branch, token };
    const submitBtn = el.syncForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;

    try {
      setSyncStatus("syncing");
      logInfo("sync form: fetching current cloud data", safeCfg(cfg));
      const result = await fetchCloudData(cfg);
      if (result.data === null) {
        logInfo("sync form: club-data.json missing, creating it from local data");
        const newSha = await pushCloudData(cfg, state.data, null);
        state.github.sha = newSha;
      } else {
        logInfo("sync form: club-data.json found, adopting cloud data as source of truth");
        state.data = result.data;
        state.github.sha = result.sha;
        saveLocalData(state.data);
        if (state.currentUserId && !state.data.users.some((u) => u.id === state.currentUserId)) {
          state.currentUserId = null;
        }
      }
      // Only persist the config once we've actually confirmed it works end to end.
      state.github.config = cfg;
      saveGithubConfig(cfg);
      setSyncStatus("synced");
      logInfo("sync form: success, config saved", safeCfg(cfg));
      el.syncSuccess.hidden = false;
      el.syncDisconnect.hidden = false;
      renderAll();
      setTimeout(closeSyncModal, 900);
    } catch (err) {
      logError("sync form: setup failed, reverting to local-only", err);
      state.github.config = null;
      clearGithubConfig();
      setSyncStatus("off");
      el.syncError.textContent = friendlyGithubError(err, cfg);
      el.syncError.hidden = false;
    } finally {
      submitBtn.disabled = false;
    }
  });

  el.syncDisconnect.addEventListener("click", () => {
    logInfo("sync disconnected by user");
    clearGithubConfig();
    state.github.config = null;
    state.github.sha = null;
    setSyncStatus("off");
    closeSyncModal();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.github.config && state.github.status !== "syncing") {
      logInfo("tab became visible, pulling latest cloud data");
      pullNow(false);
    }
  });

  /* ---------------- boot ---------------- */
  function init() {
    logInfo("init: booting", { githubConfigured: !!state.github.config, users: state.data.users.map((u) => u.id) });
    applyI18n();

    // Always show the app straight away from the local cache — a slow or
    // failing GitHub connection should never leave the page blank.
    const firstUser = state.data.users[0];
    if (firstUser) {
      if (state.unlocked.has(firstUser.id)) {
        switchToUser(firstUser.id);
      } else {
        state.currentUserId = null;
        renderAll();
        openLockModal(firstUser.id);
      }
    } else {
      renderAll();
    }

    // Sync with GitHub in the background, if configured; renders again
    // on its own once (if) it resolves.
    if (state.github.config) {
      logInfo("init: GitHub config found in localStorage, pulling in background", safeCfg(state.github.config));
      pullNow(true);
    } else {
      logInfo("init: no GitHub config, running local-only");
    }
  }

  init();
})();
