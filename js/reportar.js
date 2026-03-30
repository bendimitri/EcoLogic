seedData();
bindTopBar();

const user = getCurrentUser();
if (!user || user.role !== "reporter") {
  window.location.href = "./home.html";
}

if (user && user.role === "reporter") {
  const params = new URLSearchParams(window.location.search);
  const editingPostId = params.get("edit");
  const editingPost = editingPostId ? getPostById(editingPostId) : null;

  if (editingPost && editingPost.reporterId !== user.id) {
    toast("Voce so pode editar seus proprios reportes.");
    window.location.href = "./feed.html";
  }

  let map = null;
  let marker = null;
  let selectedLocation = null;
  const selectedLabel = document.querySelector("#selected-location-label");
  const form = document.querySelector("#report-form");
  const screenTitle = document.querySelector("#report-screen-title");
  const submitButton = document.querySelector("#report-submit-btn");

  function setLocation(lat, lng, label) {
    selectedLocation = { lat, lng, label };
    selectedLabel.textContent = `${label} (${lat.toFixed(5)}, ${lng.toFixed(5)})`;

    if (!marker) {
      marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const point = marker.getLatLng();
        setLocation(point.lat, point.lng, "Ponto ajustado");
      });
    } else {
      marker.setLatLng([lat, lng]);
    }
  }

  function clearLocation() {
    selectedLocation = null;
    selectedLabel.textContent = "Nenhum ponto selecionado";
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
  }

  map = L.map("map").setView(CURITIBA_CENTER, 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  map.on("click", (event) => {
    setLocation(event.latlng.lat, event.latlng.lng, "Ponto manual em Curitiba");
  });

  if (editingPost) {
    screenTitle.textContent = "Editar reporte";
    submitButton.textContent = "Salvar alteracoes";
    form.elements.title.value = editingPost.title;
    form.elements.description.value = editingPost.description;
    form.elements.wasteType.value = editingPost.wasteType;
    map.setView([editingPost.lat, editingPost.lng], 15);
    setLocation(editingPost.lat, editingPost.lng, editingPost.locationLabel || "Ponto salvo");
  }

  document.querySelector("#locate-btn")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      toast("Geolocalizacao indisponivel.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        map.setView([lat, lng], 16);
        setLocation(lat, lng, "Minha localizacao");
      },
      () => toast("Nao foi possivel obter sua localizacao."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  document.querySelector("#clear-location-btn")?.addEventListener("click", clearLocation);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const currentForm = event.currentTarget;
    if (!selectedLocation) {
      toast("Escolha o ponto no mapa.");
      return;
    }

    const data = new FormData(currentForm);
    const file = data.get("image");
    const image = file instanceof File && file.size > 0 ? await fileToDataUrl(file) : "";

    const payload = {
      title: data.get("title").toString().trim(),
      description: data.get("description").toString().trim(),
      wasteType: data.get("wasteType").toString(),
      image: image || editingPost?.image || "",
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      locationLabel: selectedLocation.label,
      reporterId: user.id,
      reporterName: user.name,
    };

    if (editingPostId) {
      const ok = updatePost(editingPostId, payload, user.id);
      if (!ok) {
        toast("Nao foi possivel atualizar o reporte.");
        return;
      }
      toast("Reporte atualizado.");
      window.location.href = "./feed.html";
      return;
    }

    createPost(payload);
    currentForm.reset();
    clearLocation();
    toast("Reporte publicado.");
    window.location.href = "./feed.html";
  });
}
