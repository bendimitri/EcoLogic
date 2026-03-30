seedData();
bindTopBar();

const user = getCurrentUser();
if (!user || user.role !== "collector") {
  window.location.href = "./home.html";
}

const list = document.querySelector("#collector-list");

function renderCollector() {
  if (!user || user.role !== "collector") return;

  const posts = getPosts();
  if (!posts.length) {
    list.innerHTML = `<div class="card"><p>Nenhum pedido disponivel.</p></div>`;
    return;
  }

  list.innerHTML = posts
    .map((post) => {
      const isMine = post.status === "claimed" && post.collectorId === user.id;
      const claimedByOther = post.status === "claimed" && post.collectorId !== user.id;

      const badgeClass = isMine ? "badge badge--success" : "badge badge--warning";
      const badgeText = isMine
        ? "Seu atendimento"
        : claimedByOther
          ? `Indisponivel (com ${post.collectorName})`
          : "Disponivel";

      return `
        <article class="card">
          ${post.image ? `<img class="card__image" src="${post.image}" alt="${post.title}" />` : ""}
          <div class="card__top">
            <h3>${post.title}</h3>
            <span class="${badgeClass}">${badgeText}</span>
          </div>
          <p class="meta">${formatWasteType(post.wasteType)} | ${post.locationLabel}</p>
          <p>${post.description}</p>
          <div class="card__actions">
            ${
              isMine
                ? `
                  <button class="btn btn--alt" data-route="${post.id}">Abrir rota</button>
                  <button class="btn btn--ghost" data-release="${post.id}">Desistir da coleta</button>
                  <button class="btn" data-complete="${post.id}">Marcar como coletado</button>
                `
                : claimedByOther
                  ? `<button class="btn btn--ghost" type="button" disabled>Outro coletor ja aceitou</button>`
                  : `<button class="btn" data-claim="${post.id}">Aceitar coleta</button>`
            }
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-claim]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = claimPost(button.dataset.claim, user);
      if (!result.ok) {
        toast("Pedido indisponivel.");
      } else if (result.replacedPrevious) {
        toast("Nova rota ativada. A rota anterior foi liberada.");
      } else {
        toast("Coleta aceita.");
      }
      renderCollector();
    });
  });

  document.querySelectorAll("[data-release]").forEach((button) => {
    button.addEventListener("click", () => {
      const ok = releaseClaim(button.dataset.release, user.id);
      toast(ok ? "Voce desistiu da coleta. Pedido voltou para aberto." : "Nao foi possivel desistir.");
      renderCollector();
    });
  });

  document.querySelectorAll("[data-complete]").forEach((button) => {
    button.addEventListener("click", () => {
      const ok = completeCollection(button.dataset.complete, user.id);
      toast(ok ? "Coleta concluida. Post removido do sistema." : "Nao foi possivel concluir.");
      renderCollector();
    });
  });

  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      const post = getPosts().find((item) => item.id === button.dataset.route);
      if (!post) return;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${post.lat},${post.lng}`;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  });
}

renderCollector();
