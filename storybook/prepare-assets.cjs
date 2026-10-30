const path = require('node:path');
const sharp = require('C:/Users/Тёма/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source = 'C:/Users/Тёма/.codex/generated_images/01a16cfd-9145-7cb2-bc23-69498e48faac';
const sources = [
  ['exec-e726e061-bd97-4b69-8fac-d7d79c7e62f3.png', 'theatre-clean.webp', 1672],
  ['exec-eb20302b-297f-43e8-92da-2c9edb15aaad.png', 'curtain-panel.webp', 720],
  ['exec-9c1572c6-0602-4478-83fd-98294ede4bdd.png', 'stage-mist.webp', 1100],
  ['exec-91237e10-5b04-4383-9dd3-ac69d411dbbd.png', 'hell-theatre.webp', 1672],
  ['exec-e763c7b5-54a3-4aa3-ab9b-ff6ec4e39b42.png', 'imp-dance.webp', 1000],
  ['exec-f4a7591c-8093-4b76-9e50-fc28f1597d25.png', 'violin-player.webp', 420],
  ['exec-2cd5323e-1ac4-443e-ad2a-c08fe479307e.png', 'violin-bow.webp', 600],
  ['exec-379f081d-bd76-49b1-adcb-5bd8a13a90c1.png', 'forest-ribbons.webp', 1672],
  ['exec-50b7b896-cadd-46a6-ac9a-8989a0e46e85.png', 'imp-smile.webp', 760],
  ['exec-68ec446c-8f0e-4b23-8d29-265a5980eee6.png', 'suspended-girl.webp', 900],
  ['exec-09bd34e2-03c9-4172-b7ac-1f8ce8287ee5.png', 'snow-queen.webp', 1440],
  ['exec-eb8c7103-1454-4eb0-bd8b-cacf73977648.png', 'mermaid.webp', 1440],
  ['exec-2bc042ce-ed65-468f-8a89-cd5024f7e13b.png', 'red-shoes.webp', 1440]
];
Promise.all(sources.map(async ([file, name, width]) => {
  const result = await sharp(path.join(source, file)).resize({ width, withoutEnlargement: true }).webp({ quality: 86, alphaQuality: 100 }).toFile(path.join(__dirname, 'assets', name));
  console.log(`${name}: ${result.width}x${result.height}, ${Math.round(result.size / 1024)} KB`);
})).catch(error => { console.error(error.message); process.exitCode = 1; });
