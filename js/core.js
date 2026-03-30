const STORAGE_KEYS = {
  users: "eco-curitiba-users",
  posts: "eco-curitiba-posts",
  session: "eco-curitiba-session",
  seedVersion: "eco-curitiba-seed-version",
};

const CURITIBA_CENTER = [-25.4294, -49.2719];

function seedData() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    const users = [
      {
        id: crypto.randomUUID(),
        name: "Maria Reporta",
        username: "reportador",
        email: "maria@eco.com",
        password: "1234",
        role: "reporter",
      },
      {
        id: crypto.randomUUID(),
        name: "Joao Coleta",
        username: "coletor",
        email: "joao@eco.com",
        password: "1234",
        role: "collector",
      },
    ];
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }

  if (!localStorage.getItem(STORAGE_KEYS.posts)) {
    localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify([]));
  }

  // Seed incremental: adiciona exemplos novos sem apagar dados existentes do usuario.
  if (localStorage.getItem(STORAGE_KEYS.seedVersion) !== "v5") {
    const users = getUsers();
    const collector = users.find((user) => user.role === "collector");
    const posts = getPosts();
    const now = Date.now();

    const samples = [
      {
        title: "Papelao organizado perto da padaria",
        description: "Caixas secas e dobradas na calcada lateral.",
        wasteType: "papelao",
        image:
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
        lat: -25.4297,
        lng: -49.2668,
        locationLabel: "Batel, Curitiba",
        reporterName: "Comunidade Curitiba",
        reporterId: "seed-reporter",
      },
      {
        title: "Sacos de reciclavel misto na esquina",
        description: "Garrafas PET e aluminio separados em 3 sacos transparentes.",
        wasteType: "reciclavel",
        image:
          "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80",
        lat: -25.4428,
        lng: -49.2745,
        locationLabel: "Agua Verde, Curitiba",
        reporterName: "Comunidade Curitiba",
        reporterId: "seed-reporter",
      },
      {
        title: "Entulho leve de mudanca",
        description: "Somente papelao e plastico bolha, sem material perigoso.",
        wasteType: "entulho",
        image:
          "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1200&q=80",
        lat: -25.4216,
        lng: -49.2591,
        locationLabel: "Centro Civico, Curitiba",
        reporterName: "Comunidade Curitiba",
        reporterId: "seed-reporter",
      },
      {
        title: "Lote de caixas no fundo de mercado",
        description: "Ponto de coleta com acesso pela rua lateral.",
        wasteType: "papelao",
        image:
          "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
        lat: -25.4542,
        lng: -49.287,
        locationLabel: "Portao, Curitiba",
        reporterName: "Comunidade Curitiba",
        reporterId: "seed-reporter",
        status: collector ? "claimed" : "open",
        collectorId: collector?.id || null,
        collectorName: collector?.name || null,
      },
    ];

    samples.forEach((sample, index) => {
      const exists = posts.some((post) => post.title === sample.title);
      if (exists) return;

      posts.push({
        id: crypto.randomUUID(),
        image: sample.image || "",
        isSeed: true,
        status: sample.status || "open",
        collectorId: sample.collectorId || null,
        collectorName: sample.collectorName || null,
        createdAt: new Date(now - index * 3600 * 1000).toISOString(),
        ...sample,
      });
    });

    const sampleImageByTitle = {};
    samples.forEach((sample) => {
      sampleImageByTitle[sample.title] = sample.image || "";
    });

    // Migra posts de exemplo existentes para ter imagem.
    posts.forEach((post) => {
      if (!post.image && sampleImageByTitle[post.title]) {
        post.image = sampleImageByTitle[post.title];
      }
      if (sampleImageByTitle[post.title]) {
        post.isSeed = true;
        post.reporterId = "seed-reporter";
        post.reporterName = "Comunidade Curitiba";
      }
    });

    savePosts(posts);
    localStorage.setItem(STORAGE_KEYS.seedVersion, "v5");
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getPosts() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.posts) || "[]");
}

function savePosts(posts) {
  localStorage.setItem(STORAGE_KEYS.posts, JSON.stringify(posts));
}

function getSessionUserId() {
  return sessionStorage.getItem(STORAGE_KEYS.session);
}

function setSessionUserId(userId) {
  if (userId) {
    sessionStorage.setItem(STORAGE_KEYS.session, userId);
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.session);
  }
}

function getCurrentUser() {
  const userId = getSessionUserId();
  if (!userId) return null;
  return getUsers().find((user) => user.id === userId) || null;
}

function login(identifier, password) {
  const key = identifier.trim().toLowerCase();
  const user = getUsers().find((item) => {
    const matchesIdentity =
      item.email.toLowerCase() === key ||
      item.name.toLowerCase() === key ||
      (item.username || "").toLowerCase() === key ||
      (key === "coletor" && item.role === "collector") ||
      (key === "reportador" && item.role === "reporter");

    return matchesIdentity && item.password === password;
  });

  if (!user) return null;
  setSessionUserId(user.id);
  return user;
}

function register(name, email, password, role) {
  const users = getUsers();
  const identifier = email.trim().toLowerCase();
  if (
    users.some(
      (user) =>
        user.email.toLowerCase() === identifier || (user.username || "").toLowerCase() === identifier
    )
  ) {
    return { ok: false, message: "Este e-mail/usuario ja esta cadastrado." };
  }

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    username: identifier,
    email: identifier,
    password,
    role,
  };

  users.unshift(user);
  saveUsers(users);
  setSessionUserId(user.id);
  return { ok: true, user };
}

function logout() {
  setSessionUserId(null);
}

function createPost(payload) {
  const posts = getPosts();
  posts.unshift({
    id: crypto.randomUUID(),
    collectorId: null,
    collectorName: null,
    status: "open",
    createdAt: new Date().toISOString(),
    ...payload,
  });
  savePosts(posts);
}

function getPostById(postId) {
  return getPosts().find((post) => post.id === postId) || null;
}

function updatePost(postId, payload, actorUserId) {
  const posts = getPosts();
  const post = posts.find((item) => item.id === postId);
  if (!post || post.isSeed || post.reporterId !== actorUserId) return false;

  Object.assign(post, payload, { updatedAt: new Date().toISOString() });
  savePosts(posts);
  return true;
}

function deletePost(postId, actorUserId) {
  const posts = getPosts();
  const target = posts.find((post) => post.id === postId);
  if (!target || target.isSeed || target.reporterId !== actorUserId) return false;

  const next = posts.filter((post) => post.id !== postId);
  if (next.length === posts.length) return false;
  savePosts(next);
  return true;
}

function claimPost(postId, collector) {
  const posts = getPosts();
  const post = posts.find((item) => item.id === postId && item.status === "open");
  if (!post) return { ok: false, replacedPrevious: false };

  let replacedPrevious = false;
  posts.forEach((item) => {
    if (item.status === "claimed" && item.collectorId === collector.id) {
      item.status = "open";
      item.collectorId = null;
      item.collectorName = null;
      item.updatedAt = new Date().toISOString();
      replacedPrevious = true;
    }
  });

  post.status = "claimed";
  post.collectorId = collector.id;
  post.collectorName = collector.name;
  post.updatedAt = new Date().toISOString();
  savePosts(posts);
  return { ok: true, replacedPrevious };
}

function releaseClaim(postId, collectorId) {
  const posts = getPosts();
  const post = posts.find((item) => item.id === postId);
  if (!post || post.status !== "claimed" || post.collectorId !== collectorId) return false;

  post.status = "open";
  post.collectorId = null;
  post.collectorName = null;
  post.updatedAt = new Date().toISOString();
  savePosts(posts);
  return true;
}

function completeCollection(postId, collectorId) {
  const posts = getPosts();
  const post = posts.find((item) => item.id === postId);
  if (!post || post.status !== "claimed" || post.collectorId !== collectorId) return false;

  const next = posts.filter((item) => item.id !== postId);
  savePosts(next);
  return true;
}

function labelRole(role) {
  return role === "collector" ? "Coletor" : "Reportador";
}

function formatWasteType(type) {
  const labels = {
    papelao: "Papelao",
    reciclavel: "Reciclavel misto",
    entulho: "Entulho leve",
    organico: "Lixo organico",
  };
  return labels[type] || type;
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function toast(message) {
  const box = document.querySelector("#toast");
  if (!box) return;
  box.textContent = message;
  box.classList.add("is-visible");
  clearTimeout(toast.timeoutId);
  toast.timeoutId = setTimeout(() => box.classList.remove("is-visible"), 2400);
}

function bindTopBar() {
  const backButton = document.querySelector("[data-back]");
  const menuButton = document.querySelector("#menu-toggle");
  const menu = document.querySelector("#menu-panel");
  const menuUser = document.querySelector("#menu-user");
  const loginItem = document.querySelector("#menu-login");
  const logoutItem = document.querySelector("#menu-logout");
  const user = getCurrentUser();

  if (backButton) {
    backButton.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "./index.html";
      }
    });
  }

  if (menuUser) {
    menuUser.textContent = user
      ? `${user.name} (${labelRole(user.role)})`
      : "Nenhum usuario logado";
  }

  if (loginItem) {
    loginItem.hidden = !!user;
    loginItem.addEventListener("click", () => {
      window.location.href = "./index.html";
    });
  }

  if (logoutItem) {
    logoutItem.hidden = !user;
    logoutItem.addEventListener("click", () => {
      logout();
      window.location.href = "./index.html";
    });
  }

  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      menu.classList.toggle("is-open");
    });

    document.addEventListener("click", (event) => {
      if (!menu.contains(event.target) && event.target !== menuButton) {
        menu.classList.remove("is-open");
      }
    });
  }
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result?.toString() || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
