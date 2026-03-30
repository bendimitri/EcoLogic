seedData();
bindTopBar();

const currentUser = getCurrentUser();
const list = document.querySelector("#posts-list");

function renderFeed() {
  const posts = getPosts();

  if (!posts.length) {
    list.innerHTML = `<div class="card"><p>Nenhum reporte publicado.</p></div>`;
    return;
  }

  list.innerHTML = posts
    .map((post) => {
      const badge = post.status === "open" ? "Aguardando coleta" : `Em coleta por ${post.collectorName}`;
      const badgeClass = post.status === "open" ? "badge badge--warning" : "badge badge--success";
      const canManage = currentUser && currentUser.role === "reporter" && currentUser.id === post.reporterId;
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
      const postId = button.dataset.deletePost;
      const confirmed = window.confirm("Deseja excluir este reporte?");
      if (!confirmed) return;

      const ok = deletePost(postId, currentUser?.id || "");
      toast(ok ? "Reporte excluido." : "Voce nao pode excluir post de outra pessoa.");
      renderFeed();
    });
  });
}

renderFeed();
