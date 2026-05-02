const CONFIG_INICIAL = Object.freeze({
  activo: true,
  dominiosPausados: []
});

chrome.runtime.onInstalled.addListener(async () => {
  const datos = await chrome.storage.local.get(CONFIG_INICIAL);
  await chrome.storage.local.set({
    activo: datos.activo,
    dominiosPausados: datos.dominiosPausados
  });
});

chrome.storage.onChanged.addListener((cambios, area) => {
  if (area !== "local" || !cambios.activo) return;

  chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: cambios.activo.newValue ? ["reglas_base"] : [],
    disableRulesetIds: cambios.activo.newValue ? [] : ["reglas_base"]
  });
});
