seedData();
bindTopBar();

const user = getCurrentUser();
if (user) {
  window.location.href = "./home.html";
}

document.querySelector("#register-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = data.get("name").toString();
  const email = data.get("email").toString();
  const password = data.get("password").toString();
  const role = data.get("role").toString();

  const result = register(name, email, password, role);
  if (!result.ok) {
    toast(result.message);
    return;
  }

  toast("Cadastro concluido.");
  window.location.href = result.user.role === "collector" ? "./coletor.html" : "./home.html";
});
