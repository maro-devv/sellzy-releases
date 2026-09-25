// All editable constants for the landing page live here. No other file hard-codes them.
window.SELLZY_CONFIG = {
  WHATSAPP_NUMBER: '201202191790',
  WHATSAPP_MESSAGE: 'أهلاً، شفت صفحة Sellzy وعايز أعرف أكتر عن البرنامج',
  WHATSAPP_URL_BASE: 'https://wa.me/',

  // Needs the latest published (non-draft, non-pre-release) release to contain an asset named exactly SellzySetup.exe
  DOWNLOAD_URL: 'https://github.com/maro-devv/sellzy-releases/releases/latest/download/SellzySetup.exe',
  GITHUB_REPO: 'maro-devv/sellzy-releases',
  GITHUB_API_BASE: 'https://api.github.com/repos/',
  RELEASE_ASSET_NAME: 'SellzySetup.exe',

  PRICE_LIFETIME_OLD: 5000,
  PRICE_LIFETIME: 4000,
  PRICE_MONTHLY: 400,

  // Manual counters, not connected to any payment system — Marwan updates FOUNDING_OFFER_SOLD by hand after each lifetime sale closes.
  FOUNDING_OFFER_TOTAL: 10,
  FOUNDING_OFFER_SOLD: 2
};
