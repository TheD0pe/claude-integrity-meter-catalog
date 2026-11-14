# claude-integrity-meter-catalog

Claude Integrity Meter uygulamasının **başlangıç rehberi kataloğu**. Yalnızca herkese açık veri içerir: seçili eklenti adları, kısa Türkçe açıklamalar ve sinyal eşleşmeleri.

- `catalog/starter.json`: elle bakılan kaynak (başlangıç paketi, sinyaller, sözlük). Metin değiştirirsen `version` değerini artır.
- `catalog/remote.json`: GitHub Actions'ın her gün ürettiği doğrulanmış çıktı; uygulama bunu okur.
- `scripts/build-catalog.js`: başlangıç girdilerini canlı `anthropics/claude-plugins-official` `marketplace.json` dosyasıyla doğrular, katalogdan kalkanları ayıklar.
- `.github/workflows/catalog.yml`: günde bir çalışır, `remote.json` değiştiyse işler.

Uygulama bu veriyle yalnızca **yerel katalogda bulunan** eklentiler için kart üretir ve kurulum komutunu kendisi oluşturur; bu depodan keyfi komut gelmez.

Uygulamadaki adres: `https://raw.githubusercontent.com/TheD0pe/claude-integrity-meter-catalog/main/catalog/remote.json`
