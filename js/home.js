seedData();
bindTopBar();

const user = getCurrentUser();
const nameNode = document.querySelector("#home-user");
const roleNode = document.querySelector("#home-role");
const extraActions = document.querySelector("#home-extra-actions");
const feedNode = document.querySelector("#home-feed");
const fab = document.querySelector("#new-report-fab");
const topbarTitle = document.querySelector(".topbar__title");
const pageTitle = document.querySelector("title");

if (!user) {
  window.location.href = "./index.html";
} else if (user.role === "collector") {
  if (topbarTitle) topbarTitle.textContent = "Pedidos de coleta";
  if (pageTitle) pageTitle.textContent = "Pedidos de coleta | EcoLogic";
  window.location.href = "./coletor.html";
} else {
  nameNode.textContent = user.name;
  roleNode.textContent = labelRole(user.role);
  extraActions.innerHTML = `<p class="meta">Use o botao + para criar novo reporte.</p>`;
  fab.hidden = false;
  renderPanelFeed();
}

function renderPanelFeed() {
  const posts = getPosts();

  if (!posts.length) {
    feedNode.innerHTML = `<div class="card"><p>Nenhum reporte publicado.</p></div>`;
    return;
  }

  feedNode.innerHTML = posts
    .map((post) => {
      const isClaimed = post.status === "claimed";
      const badge = isClaimed ? `Em coleta por ${post.collectorName}` : "Aguardando coleta";
      const badgeClass = isClaimed ? "badge badge--success" : "badge badge--warning";
      const canManage = user.role === "reporter" && user.id === post.reporterId;
      const canDelete = canManage && !post.isSeed;

      return `
        <article class="card">
          ${post.image ? `<img class="card__image" src="${post.image}" alt="${post.title}" />` : ""}
          <div class="card__top">
            <h3>${post.title}</h3>
            <span class="${badgeClass}">${badge}</span>
          </div>
          <p class="meta">${formatWasteType(post.wasteType)} | ${post.locationLabel}</p>
          <p>${post.description}</p>
          <p class="meta">Publicado por ${post.reporterName} em ${formatDate(post.createdAt)}</p>
          ${
            canManage
              ? `
                <div class="card__actions card__actions--row">
                  <a class="btn btn--alt" href="./reportar.html?edit=${post.id}">Editar</a>
                  ${
                    canDelete
                      ? `<button class="btn btn--danger" type="button" data-delete-post="${post.id}">Excluir</button>`
                      : `<button class="btn btn--ghost" type="button" disabled>Post de exemplo</button>`
                  }
                </div>
              `
              : ""
          }
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-delete-post]").forEach((button) => {
    button.addEventListener("click", () => {
      const confirmed = window.confirm("Deseja excluir este reporte?");
      if (!confirmed) return;

      const ok = deletePost(button.dataset.deletePost, user.id);
      toast(ok ? "Reporte excluido." : "Voce nao pode excluir post de outra pessoa.");
      renderPanelFeed();
    });
  });
}
