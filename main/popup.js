const estado = document.getElementById("estado");
const tituloEstado = document.getElementById("tituloEstado");
const detalleEstado = document.getElementById("detalleEstado");
const dominio = document.getElementById("dominio");
const bloqueados = document.getElementById("bloqueados");
const interruptor = document.getElementById("interruptor");
const opciones = document.getElementById("opciones");
const recargar = document.getElementById("recargar");

const dominioDe = (url) => {
  try {
    return new URL(url).hostname || "Pagina interna";
  } catch {
    return "Pagina interna";
  }
};

const pintar = (activo) => {
  interruptor.setAttribute("aria-pressed", String(activo));
  document.body.classList.toggle("pausado", !activo);
  estado.textContent = activo ? "Proteccion activa" : "Proteccion pausada";
  tituloEstado.textContent = activo ? "Proteccion activada" : "Proteccion pausada";
  detalleEstado.textContent = activo ? "Estas navegando sin anuncios" : "Este sitio no esta protegido";
};

const pestanaActual = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};

const contarBloqueos = async (tabId) => {
  if (!tabId) return 0;

  try {
    const cincoMinutos = Date.now() - 300000;
    const datos = await chrome.declarativeNetRequest.getMatchedRules({
      tabId,
      minTimeStamp: cincoMinutos
    });
    return datos.rulesMatchedInfo?.length ?? 0;
  } catch {
    return 0;
  }
};

const iniciar = async () => {
  const [{ activo = true }, tab] = await Promise.all([
    chrome.storage.local.get({ activo: true }),
    pestanaActual()
  ]);

  pintar(activo);
  dominio.textContent = dominioDe(tab?.url);
  bloqueados.textContent = await contarBloqueos(tab?.id);
};

interruptor.addEventListener("click", async () => {
  const { activo = true } = await chrome.storage.local.get({ activo: true });
  await chrome.storage.local.set({ activo: !activo });
  pintar(!activo);
});

opciones.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

recargar.addEventListener("click", async () => {
  const tab = await pestanaActual();
  if (tab?.id) chrome.tabs.reload(tab.id);
});

iniciar();
