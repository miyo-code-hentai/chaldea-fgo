# Panduan Aset Chaldea

Semua gambar berformat **.webp** (jpg/png juga boleh kalau kamu ubah ekstensi di `src/lib/lore.ts` bagian `img`). Letakkan file di bawah `public/assets/` dengan nama persis seperti di tabel. File yang belum ada akan tampil sebagai placeholder yang menulis path-nya, jadi kamu bisa mengisi bertahap.

## Ringkasan struktur
```
public/assets/
├─ hero/bleached-earth.webp            (opsional, ganti globe procedural)
├─ about/chaldea-facility.webp         (gambar hero halaman About)
├─ audio/bgm/                          (musik: main, incineration, remnant, lostbelt, ordeal .mp3)
├─ characters/<slug>.webp              (semua potret karakter, 3:4)
└─ chapters/<chapter>/
   ├─ cover.webp                       (kartu chapter, 3:4)
   └─ <record>/banner.webp + map.webp  (16:9 dan 4:3)
```

## Ukuran yang disarankan
| Jenis | Rasio | Ukuran |
|---|---|---|
| Potret karakter | 3:4 | 800×1067 |
| Cover chapter | 3:4 | 900×1200 |
| Banner record | 16:9 | 1920×1080 |
| Peta | 4:3 | 1600×1200 |
| Hero Bleached Earth | 1:1 | 1400×1400 |
| About facility | 4:5 | 1200×1500 |

## Musik (BGM)
| File | Dipakai di |
|---|---|
| `audio/bgm/main.mp3` | Website utama, profil, login |
| `audio/bgm/incineration.mp3` | Chapter Human Order Incineration |
| `audio/bgm/remnant.mp3` | Chapter Epic of Remnant |
| `audio/bgm/lostbelt.mp3` | Chapter Cosmos in the Lostbelt |
| `audio/bgm/ordeal.mp3` | Chapter Ordeal Call |

Musik baru mulai setelah klik pertama (aturan browser). Pastikan kamu punya hak memakai lagunya.

## Cover chapter
| Chapter | File |
|---|---|
| incineration | `chapters/incineration/cover.webp` |
| remnant | `chapters/remnant/cover.webp` |
| lostbelt | `chapters/lostbelt/cover.webp` |
| ordeal | `chapters/ordeal/cover.webp` |

## Banner & peta tiap record
| Chapter | Record | Banner | Peta |
|---|---|---|---|
| incineration | Fuyuki | `chapters/incineration/fuyuki/banner.webp` | `chapters/incineration/fuyuki/map.webp` |
| incineration | Orleans | `chapters/incineration/orleans/banner.webp` | `chapters/incineration/orleans/map.webp` |
| incineration | Septem | `chapters/incineration/septem/banner.webp` | `chapters/incineration/septem/map.webp` |
| incineration | Okeanos | `chapters/incineration/okeanos/banner.webp` | `chapters/incineration/okeanos/map.webp` |
| incineration | London | `chapters/incineration/london/banner.webp` | `chapters/incineration/london/map.webp` |
| incineration | E Pluribus Unum | `chapters/incineration/e-pluribus-unum/banner.webp` | `chapters/incineration/e-pluribus-unum/map.webp` |
| incineration | Camelot | `chapters/incineration/camelot/banner.webp` | `chapters/incineration/camelot/map.webp` |
| incineration | Babylonia | `chapters/incineration/babylonia/banner.webp` | `chapters/incineration/babylonia/map.webp` |
| incineration | Solomon | `chapters/incineration/solomon/banner.webp` | `chapters/incineration/solomon/map.webp` |
| remnant | Shinjuku | `chapters/remnant/shinjuku/banner.webp` | `chapters/remnant/shinjuku/map.webp` |
| remnant | Agartha | `chapters/remnant/agartha/banner.webp` | `chapters/remnant/agartha/map.webp` |
| remnant | Shimosa | `chapters/remnant/shimosa/banner.webp` | `chapters/remnant/shimosa/map.webp` |
| remnant | Salem | `chapters/remnant/salem/banner.webp` | `chapters/remnant/salem/map.webp` |
| remnant | SE.RA.PH | `chapters/remnant/seraph/banner.webp` | `chapters/remnant/seraph/map.webp` |
| lostbelt | Anastasia | `chapters/lostbelt/anastasia/banner.webp` | `chapters/lostbelt/anastasia/map.webp` |
| lostbelt | Götterdämmerung | `chapters/lostbelt/gotterdammerung/banner.webp` | `chapters/lostbelt/gotterdammerung/map.webp` |
| lostbelt | SIN | `chapters/lostbelt/sin/banner.webp` | `chapters/lostbelt/sin/map.webp` |
| lostbelt | Yuga Kshetra | `chapters/lostbelt/yugakshetra/banner.webp` | `chapters/lostbelt/yugakshetra/map.webp` |
| lostbelt | Atlantis | `chapters/lostbelt/atlantis/banner.webp` | `chapters/lostbelt/atlantis/map.webp` |
| lostbelt | Olympus | `chapters/lostbelt/olympus/banner.webp` | `chapters/lostbelt/olympus/map.webp` |
| lostbelt | Heian-kyo | `chapters/lostbelt/heian-kyo/banner.webp` | `chapters/lostbelt/heian-kyo/map.webp` |
| lostbelt | Avalon le Fae | `chapters/lostbelt/avalon-le-fae/banner.webp` | `chapters/lostbelt/avalon-le-fae/map.webp` |
| lostbelt | Traum | `chapters/lostbelt/traum/banner.webp` | `chapters/lostbelt/traum/map.webp` |
| lostbelt | Nahui Mictlan | `chapters/lostbelt/nahui-mictlan/banner.webp` | `chapters/lostbelt/nahui-mictlan/map.webp` |
| ordeal | Prologue | `chapters/ordeal/ordeal-call-0/banner.webp` | `chapters/ordeal/ordeal-call-0/map.webp` |
| ordeal | Paper Moon | `chapters/ordeal/paper-moon/banner.webp` | `chapters/ordeal/paper-moon/map.webp` |
| ordeal | Id | `chapters/ordeal/id/banner.webp` | `chapters/ordeal/id/map.webp` |
| ordeal | Archetype Inception | `chapters/ordeal/archetype-inception/banner.webp` | `chapters/ordeal/archetype-inception/map.webp` |
| ordeal | Trinity Metatronius | `chapters/ordeal/trinity-metatronius/banner.webp` | `chapters/ordeal/trinity-metatronius/map.webp` |

## Potret karakter (120 file, semua di `characters/`)
| Nama | File | Sumber |
|---|---|---|
| Abigail Williams | `characters/abigail-williams.webp` | Servant (halaman About) |
| Akuta Hinako | `characters/akuta-hinako.webp` | Cerita sin |
| Alexander | `characters/alexander.webp` | Servant (halaman About) |
| Altria Alter | `characters/altria-alter.webp` | Cerita fuyuki |
| Altria Caster | `characters/altria-caster.webp` | Cerita avalon-le-fae |
| Amakusa Shirou Tokisada | `characters/amakusa-shirou-tokisada.webp` | Cerita shimosa |
| Anastasia | `characters/anastasia.webp` | Cerita anastasia |
| Artemis & Orion | `characters/artemis-orion.webp` | Cerita okeanos |
| Artoria Pendragon | `characters/artoria-pendragon.webp` | Servant (halaman About) |
| Ashiya Douman | `characters/ashiya-douman.webp` | Cerita heian-kyo |
| Ashoka | `characters/ashoka.webp` | Cerita trinity-metatronius |
| Atalante | `characters/atalante.webp` | Cerita anastasia |
| Aśvatthāman | `characters/asvatthaman.webp` | Cerita yugakshetra |
| BB | `characters/bb-dubai.webp` | Servant (halaman About) |
| BB | `characters/bb.webp` | Cerita seraph |
| Bedivere | `characters/bedivere.webp` | Cerita camelot |
| Beryl Gut | `characters/beryl-gut.webp` | Cerita avalon-le-fae |
| Bhīma | `characters/bhima.webp` | Cerita paper-moon |
| Boudica | `characters/boudica.webp` | Cerita septem |
| Caligula | `characters/caligula.webp` | Cerita septem |
| Charlemagne | `characters/charlemagne.webp` | Cerita traum |
| Charles Babbage | `characters/charles-babbage.webp` | Cerita london |
| Charles-Henri Sanson | `characters/charles-henri-sanson.webp` | Cerita salem |
| Christopher Columbus | `characters/christopher-columbus.webp` | Cerita agartha |
| Cú Chulainn | `characters/cu-chulainn-lancer.webp` | Servant (halaman About) |
| Cú Chulainn (Alter) | `characters/cu-chulainn-alter.webp` | Cerita e-pluribus-unum |
| Cú Chulainn (Caster) | `characters/cu-chulainn-caster.webp` | Cerita fuyuki |
| Dante Alighieri | `characters/dante-alighieri.webp` | Cerita trinity-metatronius |
| Daybit Sem Void | `characters/daybit-sem-void.webp` | Staf Chaldea |
| Durga | `characters/durga.webp` | Cerita paper-moon |
| Duryodhana | `characters/duryodhana.webp` | Cerita paper-moon |
| EMIYA | `characters/emiya.webp` | Servant (halaman About) |
| EMIYA Alter | `characters/emiya-alter.webp` | Cerita seraph |
| Edmond Dantes (Monte Cristo) | `characters/edmond-dantes-monte-cristo.webp` | Cerita id |
| Euryale | `characters/euryale.webp` | Cerita okeanos |
| Francis Drake | `characters/francis-drake.webp` | Servant (halaman About) |
| Gawain | `characters/gawain.webp` | Cerita camelot |
| Geronimo | `characters/geronimo.webp` | Cerita e-pluribus-unum |
| Gilgamesh | `characters/gilgamesh-archer.webp` | Servant (halaman About) |
| Gilgamesh | `characters/gilgamesh.webp` | Cerita babylonia |
| Gilles de Rais | `characters/gilles-de-rais.webp` | Cerita orleans |
| Goredolf Musik | `characters/goredolf-musik.webp` | Staf Chaldea |
| Hassan of the Hundred Personas | `characters/hassan-of-the-hundred-personas.webp` | Servant (halaman About) |
| Henry Jekyll & Hyde | `characters/henry-jekyll-hyde.webp` | Cerita london |
| Heracles | `characters/heracles.webp` | Servant (halaman About) |
| Ishtar | `characters/ishtar.webp` | Cerita babylonia |
| Ivan the Terrible | `characters/ivan-the-terrible.webp` | Cerita anastasia |
| Jack the Ripper | `characters/jack-the-ripper.webp` | Servant (halaman About) |
| James Moriarty | `characters/james-moriarty.webp` | Cerita shinjuku |
| Jason | `characters/jason.webp` | Cerita atlantis |
| Jeanne d’Arc | `characters/jeanne-d-arc.webp` | Servant (halaman About) |
| Jeanne d’Arc (Alter) | `characters/jeanne-d-arc-alter.webp` | Servant (halaman About) |
| Jing Ke | `characters/jing-ke.webp` | Cerita sin |
| Kadoc Zemlupus | `characters/kadoc-zemlupus.webp` | Cerita anastasia |
| Karna | `characters/karna-lancer.webp` | Servant (halaman About) |
| Karna | `characters/karna.webp` | Cerita yugakshetra |
| Kirschtaria Wodime | `characters/kirschtaria-wodime.webp` | Staf Chaldea |
| Kishinami Hakuno | `characters/kishinami-hakuno.webp` | Cerita archetype-inception |
| Kriemhild | `characters/kriemhild.webp` | Cerita traum |
| Kukulkan | `characters/kukulkan.webp` | Cerita nahui-mictlan |
| Lancelot | `characters/lancelot-berserker.webp` | Servant (halaman About) |
| Leonardo da Vinci | `characters/leonardo-da-vinci.webp` | Staf Chaldea |
| Lev Lainur Flauros | `characters/lev-lainur-flauros.webp` | Cerita solomon |
| Lion King (Altria Pendragon) | `characters/lion-king-altria-pendragon.webp` | Cerita camelot |
| Marie Antoinette | `characters/marie-antoinette.webp` | Cerita orleans |
| Marie Antoinette (Alter) | `characters/marie-antoinette-alter.webp` | Cerita id |
| Marisbury Animusphere | `characters/marisbury-animusphere.webp` | Staf Chaldea |
| Mash Kyrielight | `characters/mash-kyrielight.webp` | Staf Chaldea |
| Mata Hari | `characters/mata-hari.webp` | Servant (halaman About) |
| Medea | `characters/medea.webp` | Servant (halaman About) |
| Medea Lily | `characters/medea-lily.webp` | Cerita okeanos |
| Medusa | `characters/medusa-rider.webp` | Servant (halaman About) |
| Mephistopheles | `characters/mephistopheles.webp` | Cerita salem |
| Merlin | `characters/merlin.webp` | Servant (halaman About) |
| Metatron Jeanne | `characters/metatron-jeanne.webp` | Cerita trinity-metatronius |
| Miyamoto Musashi | `characters/miyamoto-musashi.webp` | Cerita shimosa |
| Mordred | `characters/mordred.webp` | Servant (halaman About) |
| Morgan le Fae | `characters/morgan-le-fae.webp` | Cerita avalon-le-fae |
| Mysterious Heroine XX (Alter) | `characters/mysterious-heroine-xx-alter.webp` | Cerita archetype-inception |
| Napoleon | `characters/napoleon.webp` | Cerita gotterdammerung |
| Nero Claudius | `characters/nero-claudius.webp` | Servant (halaman About) |
| Oberon Vortigern | `characters/oberon-vortigern.webp` | Cerita avalon-le-fae |
| Odysseus | `characters/odysseus.webp` | Cerita atlantis |
| Olga Marie Animusphere | `characters/olga-marie-animusphere.webp` | Staf Chaldea |
| Ophelia Phamrsolone | `characters/ophelia-phamrsolone.webp` | Cerita gotterdammerung |
| Orion | `characters/orion.webp` | Servant (halaman About) |
| Ozymandias | `characters/ozymandias.webp` | Cerita camelot |
| Penthesilea | `characters/penthesilea.webp` | Cerita agartha |
| Prince of Lan Ling | `characters/prince-of-lan-ling.webp` | Cerita sin |
| Qin Shi Huang | `characters/qin-shi-huang.webp` | Cerita sin |
| Queen Medb | `characters/queen-medb.webp` | Cerita e-pluribus-unum |
| Rama | `characters/rama.webp` | Cerita yugakshetra |
| Rani XII | `characters/rani-xii.webp` | Cerita paper-moon |
| Ritsuka Fujimaru | `characters/ritsuka-fujimaru.webp` | Staf Chaldea |
| Roland | `characters/roland.webp` | Cerita traum |
| Romani Archaman | `characters/romani-archaman.webp` | Staf Chaldea |
| Romulus-Quirinus | `characters/romulus-quirinus.webp` | Cerita olympus |
| Sakata Kintoki | `characters/sakata-kintoki.webp` | Cerita heian-kyo |
| Scandinavia Peperoncino | `characters/scandinavia-peperoncino.webp` | Cerita yugakshetra |
| Scheherazade | `characters/scheherazade.webp` | Cerita agartha |
| Scáthach | `characters/scathach.webp` | Servant (halaman About) |
| Scáthach-Skaði | `characters/scathach-skai.webp` | Cerita gotterdammerung |
| Senji Muramasa | `characters/senji-muramasa.webp` | Cerita shimosa |
| Sherlock Holmes | `characters/sherlock-holmes.webp` | Staf Chaldea |
| Sigurd | `characters/sigurd.webp` | Cerita gotterdammerung |
| Sion Eltnam Atlasia | `characters/sion-eltnam-atlasia.webp` | Cerita nahui-mictlan |
| Solomon | `characters/solomon.webp` | Cerita solomon |
| Spartacus | `characters/spartacus.webp` | Servant (halaman About) |
| Super Orion | `characters/super-orion.webp` | Cerita atlantis |
| Taira no Kagekiyo | `characters/taira-no-kagekiyo.webp` | Cerita heian-kyo |
| Tamamo Cat | `characters/tamamo-cat.webp` | Cerita seraph |
| Tamamo no Mae | `characters/tamamo-no-mae.webp` | Servant (halaman About) |
| Tenochtitlan | `characters/tenochtitlan.webp` | Cerita archetype-inception |
| Tezcatlipoca | `characters/tezcatlipoca.webp` | Cerita nahui-mictlan |
| Thomas Edison | `characters/thomas-edison.webp` | Cerita e-pluribus-unum |
| Tiamat | `characters/tiamat.webp` | Cerita babylonia |
| Tomoe Gozen | `characters/tomoe-gozen.webp` | Cerita shimosa |
| Watanabe no Tsuna | `characters/watanabe-no-tsuna.webp` | Cerita heian-kyo |
| Wu Zetian | `characters/wu-zetian.webp` | Cerita agartha |
| Zeus | `characters/zeus.webp` | Cerita olympus |

## Mengubah / menambah
- Teks & daftar chapter: `src/lib/lore.json` (record, karakter) dan `src/lib/lore.ts` (tema, BGM, kelas servant).
- Karakter baru: tambahkan di lore.json, nama file otomatis = slug dari namanya (huruf kecil, tanpa aksen, spasi jadi `-`).


---

## Pembaruan: struktur chapter, musik per record, dan halaman About

### Chapter
Hanya **tiga chapter** di Grand Order: I (Human Order Incineration), I.5 (Epic of Remnant), II (Cosmos in the Lostbelt).
**Ordeal Call** adalah sub-tab di dalam Chapter II: muncul setelah Nahui Mictlan, lalu berisi Ordeal Call I–IV dan
record spesial **Lostbelt No.0**. Cover `chapters/ordeal/cover.webp` tidak dipakai lagi.

Penomoran: Singularity F, 1–7, lalu Solomon (Ω). Pseudo-Singularity I, EX, II, III, IV. Lostbelt 1, 2, 3, 4, 5 (Atlantis), 5 (Olympus), 5.5, 6, 6.5, 7.

### Gambar baru
| File | Dipakai di |
|---|---|
| `hero/home-bg.webp` (16:9, 2400×1350) | Background hero halaman Home (menggantikan CHALDEAS/globe) |
| `hero/grand-order-bg.webp` (16:9) | Background hero halaman Grand Order |
| `about/chaldeas-bg.webp` (16:9, besar) | Background besar sistem CHALDEAS (sistem terakhir) |
| `about/chaldea-facility.webp`, `about/shadow-border.webp`, `about/novum-chaldea.webp`, `about/seraphix.webp`, `about/moonlight-lostroom.webp` | Kartu Headquarters |
| `classes/<id>.webp` (3:4) dengan id: `saber archer lancer rider caster assassin berserker extra-1 extra-2` | Template kelas Servant di bawah sistem FATE |
| `chapters/ordeal/lostbelt-0/banner.webp` + `map.webp` | Record Lostbelt No.0 |
| `chapters/ordeal/gate/banner.webp` | Panel pintu "Ordeal Call" setelah Nahui Mictlan |

Potret staf baru (`characters/<slug>.webp`): lev-lainur-flauros, ophelia-phamrsolone, kadoc-zemlupus, scandinavia-peperoncino,
solomon, galahad, captain-nemo, queen-of-sheba, sion-eltnam-sokaris, jingle-abel-meuniere, duston, sylvia, soria-najwa,
mao-maomao, kawata, octavia, tomarin, chin, kayan, cerejeira-elron, marcus, harry-akanezawa-anderson, fou, hideyasu-ajima,
almiro, arnold-beckman, marble-macintosh, holly, trapayne, kiara-sessyoin.

### Musik per record
Setiap record punya transisi sendiri dan musik sendiri saat di-scroll. Letakkan file di
`audio/bgm/<chapter>/<record>.mp3`, contoh `audio/bgm/incineration/orleans.mp3`, `audio/bgm/lostbelt/atlantis.mp3`,
`audio/bgm/ordeal/paper-moon.mp3`, `audio/bgm/ordeal/lostbelt-0.mp3`, `audio/bgm/incineration/solomon.mp3`.
Jika file record belum ada, musik chapter (`audio/bgm/<chapter>.mp3`) dipakai sebagai cadangan.
Panel pintu Ordeal Call memakai `audio/bgm/ordeal/gate.mp3` lalu `ordeal.mp3`.

## Pembaruan: logo, loading screen, komunitas

### Logo
- `public/assets/logo/chaldea-emblem.png` — lambang putih transparan. Dipakai sebagai *mask* (`Emblem.svelte`), jadi warnanya
  otomatis mengikuti tema terang/gelap. Ganti file ini untuk mengganti logo di header, footer, loading screen, dan halaman akun.
- `public/assets/logo/chaldea-logo.png` — logo lengkap (tidak dipakai di kode, disimpan sebagai arsip).
- Favicon: `public/favicon-32.png`, `favicon-256.png`, `apple-touch-icon.png`.

### Gambar loading screen
- Folder `public/assets/loading/` (01–14, format `.webp`). Urutan dan teks ada di `src/lib/loading.ts`.
- Satu gambar tampil bergantian, lalu muncul "Press Space or Enter". Tombol itu yang membuka audio (browser tidak mengizinkan
  autoplay). Layar hanya muncul sekali per sesi browser.

### Gambar yang diunggah pengguna
- Foto profil, banner, dan gambar servant yang diunggah admin disimpan di `data/uploads/` (bukan di `public/`) dan disajikan
  lewat `/uploads/<nama>`. Folder `data/` ikut dibackup bersama database `chaldea.db`.
