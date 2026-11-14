'use strict';
// Katalog üretici (otomasyon): başlangıç paketini CANLI resmî marketplace.json ile doğrular ve catalog/remote.json yazar.
// Uygulama bu dosyayı config.catalogUrl üzerinden günde bir kez alabilir; böylece metinler uygulama sürümü beklemeden yenilenir.
//   node scripts/build-catalog.js            → GitHub'daki resmî marketplace.json'u indirir
//   node scripts/build-catalog.js --local    → yerel ~/.claude/plugins/marketplaces kopyasını kullanır (çevrimdışı test)
const fs = require('fs');
const os = require('os');
const path = require('path');

const OFFICIAL_URL = process.env.CATALOG_SOURCE_URL || 'https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/.claude-plugin/marketplace.json';
const local = process.argv.includes('--local');
const bundled = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'catalog', 'starter.json'), 'utf8'));

async function loadOfficial() {
  if (local) return { src: 'yerel', mp: JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude', 'plugins', 'marketplaces', 'claude-plugins-official', '.claude-plugin', 'marketplace.json'), 'utf8')) };
  const res = await fetch(OFFICIAL_URL);
  if (!res.ok) throw new Error(`Katalog indirilemedi: HTTP ${res.status} (${OFFICIAL_URL})`);
  return { src: OFFICIAL_URL, mp: await res.json() };
}

(async () => {
  const { src, mp } = await loadOfficial();
  if (!Array.isArray(mp.plugins) || mp.plugins.length < 50) throw new Error('Beklenmeyen katalog biçimi veya çok az eklenti: ' + (mp.plugins && mp.plugins.length));
  const names = new Set(mp.plugins.map((p) => p.name));
  const alive = bundled.starter.filter((s) => s.marketplace !== 'claude-plugins-official' || names.has(s.plugin));
  const dropped = bundled.starter.filter((s) => !alive.includes(s)).map((s) => s.plugin);
  const out = { version: bundled.version, generatedAt: new Date().toISOString(), source: src, officialPlugins: mp.plugins.length, dropped, starter: alive, signals: bundled.signals, glossary: bundled.glossary };
  const target = path.join(__dirname, '..', 'catalog', 'remote.json');
  let prev = null; try { prev = JSON.parse(fs.readFileSync(target, 'utf8')); } catch { /* ilk çalıştırma */ }
  const strip = (o) => JSON.stringify({ ...o, generatedAt: undefined });
  if (prev && strip(prev) === strip(out)) { console.log('İçerik değişmedi, remote.json yazılmadı (günlük gereksiz commit önlendi).'); return; }
  fs.writeFileSync(target, JSON.stringify(out, null, 2));
  console.log(`catalog/remote.json yazıldı: ${alive.length}/${bundled.starter.length} başlangıç girdisi canlı, kaynak ${src} (${mp.plugins.length} eklenti)`);
  if (dropped.length) console.warn('Katalogdan kalkan girdiler (starter.json güncellenmeli):', dropped.join(', '));
  if (dropped.length > bundled.starter.length * 0.3) { console.error('Girdilerin %30’dan fazlası kalktı: elle inceleme gerekir.'); process.exit(2); }
})().catch((e) => { console.error('HATA', e.message); process.exit(1); });
