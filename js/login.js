seedData();
bindTopBar();

const user = getCurrentUser();
if (user) {
  window.location.href = "./home.html";
}

document.querySelector("#login-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const identifier = data.get("identifier").toString().trim();
  const password = data.get("password").toString();
  const result = login(identifier, password);

  if (!result) {
    toast("Usuario/E-mail ou senha invalidos.");
    return;
  }

  toast("Login feito com sucesso.");
  window.location.href = result.role === "collector" ? "./coletor.html" : "./home.html";
});
