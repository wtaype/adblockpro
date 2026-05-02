const estado = document.getElementById("estado");
const dominio = document.getElementById("dominio");
const interruptor = document.getElementById("interruptor");
const opciones = document.getElementById("opciones");
const recargar = document.getElementById("recargar");

const obtenerDominio = (url) => {
  try {
    return new URL(url).hostname || "Pagina interna";
  } catch {
    return "Pagina interna";
  }
};

const pintarEstado = (activo) => {
  interruptor.setAttribute("aria-pressed", String(activo));
  estado.textContent = activo ? "Proteccion activa" : "Proteccion pausada";
};

const obtenerPestana = async () => {
  const [pestana] = await chrome.tabs.query({ active: true, currentWindow: true });
  return pestana;
};

const iniciar = async () => {
  const [{ activo = true }, pestana] = await Promise.all([
    chrome.storage.local.get({ activo: true }),
    obtenerPestana()
  ]);

  pintarEstado(activo);
  dominio.textContent = obtenerDominio(pestana?.url);
};

interruptor.addEventListener("click", async () => {
  const { activo = true } = await chrome.storage.local.get({ activo: true });
  await chrome.storage.local.set({ activo: !activo });
  pintarEstado(!activo);
});

opciones.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

recargar.addEventListener("click", async () => {
  const pestana = await obtenerPestana();
  if (pestana?.id) chrome.tabs.reload(pestana.id);
});

iniciar();
