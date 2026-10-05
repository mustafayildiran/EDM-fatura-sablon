const KEY = "edmPresetsV4";
const NOTES_KEY = "edmNotesV1";
const DEFAULTS = [
  { kisa: "KR-G", malHizmet: "KR-G: Kare Parke Taşı (20x20 - Gri)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "KR-S", malHizmet: "KR-S: Kare Parke Taşı (20x20 - Siyah)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "KR-B", malHizmet: "KR-B: Kare Parke Taşı (20x20 - Beyaz)", miktar: "1", olcuBirim: "Metrekare", fiyat: "330", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "KR-K", malHizmet: "KR-K: Kare Parke Taşı (20x20 - Kırmızı)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "DG-G", malHizmet: "DG-G: Prizma Parke Taşı (20x10 - Gri)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "DG-S", malHizmet: "DG-S: Prizma Parke Taşı (20x10 - Siyah)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "DG-B", malHizmet: "DG-B: Prizma Parke Taşı (20x10 - Beyaz)", miktar: "1", olcuBirim: "Metrekare", fiyat: "330", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "DG-K", malHizmet: "DG-K: Prizma Parke Taşı (20x10 - Kırmızı)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "KLT-G", malHizmet: "KLT-G: Kilit Parke Taşı (8cm-Gri)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "KLT-S", malHizmet: "KLT-S: Kilit Parke Taşı (8cm-Siyah)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "KLT-B", malHizmet: "KLT-B: Kilit Parke Taşı (8cm-Beyaz)", miktar: "1", olcuBirim: "Metrekare", fiyat: "330", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "KLT-K", malHizmet: "KLT-K: Kilit Parke Taşı (8cm-Kırmızı)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "KL-G", malHizmet: "KL-G: Kaldırım Parke Taşı (6cm - Gri)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "KL-S", malHizmet: "KL-S: Kaldırım Parke Taşı (6cm - Siyah)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "KL-B", malHizmet: "KL-B: Kaldırım Parke Taşı (6cm - Beyaz)", miktar: "1", olcuBirim: "Metrekare", fiyat: "330", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" },
  { kisa: "KL-K", malHizmet: "KL-K: Kaldırım Parke Taşı (6cm - Kırmızı)", miktar: "1", olcuBirim: "Metrekare", fiyat: "280", iskontoTip: "İskonto", iskontoOran: "0", kdvOran: "20" }
];

function load(cb) {
  chrome.storage.sync.get([KEY], (r) => {
    if (r[KEY] && r[KEY].length) return cb(r[KEY]);
    chrome.storage.local.get([KEY], (r2) => cb(r2[KEY] && r2[KEY].length ? r2[KEY] : DEFAULTS));
  });
}
function save(data, cb) {
  chrome.storage.sync.set({ [KEY]: data }, () => {
    if (chrome.runtime.lastError) chrome.storage.local.set({ [KEY]: data }, cb);
    else { chrome.storage.local.set({ [KEY]: data }); cb && cb(); }
  });
}
function loadNotes() {
  chrome.storage.sync.get([NOTES_KEY], (r) => {
    const v = (r && r[NOTES_KEY]) || null;
    if (v && (v.company || v.iban)) {
      document.getElementById("notesCompany").value = v.company || "";
      document.getElementById("notesIban").value = v.iban || "";
      return;
    }
    chrome.storage.local.get([NOTES_KEY], (r2) => {
      const v2 = (r2 && r2[NOTES_KEY]) || { company: "", iban: "" };
      document.getElementById("notesCompany").value = v2.company || "";
      document.getElementById("notesIban").value = v2.iban || "";
    });
  });
}
function saveNotes() {
  const data = {
    company: document.getElementById("notesCompany").value.trim(),
    iban: document.getElementById("notesIban").value.trim()
  };
  chrome.storage.sync.set({ [NOTES_KEY]: data }, () => {
    chrome.storage.local.set({ [NOTES_KEY]: data });
  });
}
document.getElementById("notesCompany").addEventListener("change", saveNotes);
document.getElementById("notesIban").addEventListener("change", saveNotes);
loadNotes();

function render(list) {
  const box = document.getElementById("list");
  box.innerHTML = "";
  list.forEach((p, idx) => {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `
      <label>Kısa isim</label>
      <input data-k="kisa" value="${escapeHtml(p.kisa||"")}">
      <label>Mal veya Hizmet</label>
      <input data-k="malHizmet" value="${escapeHtml(p.malHizmet||"")}">
      <div class="grid2">
        <div><label>Miktar</label><input data-k="miktar" value="${escapeHtml(p.miktar||"1")}"></div>
        <div><label>Ölçü Birim</label><input data-k="olcuBirim" value="${escapeHtml(p.olcuBirim||"Metrekare")}" list="olcuList"></div>
        <div><label>Fiyat</label><input data-k="fiyat" value="${escapeHtml(p.fiyat||"")}"></div>
        <div><label>KDV</label><input data-k="kdvOran" value="${escapeHtml(p.kdvOran||"20")}"></div>
      </div>
      <button class="danger" data-del="${idx}">Sil</button>
    `;
    div.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("change", () => {
        list[idx][inp.dataset.k] = inp.value;
        save(list);
      });
    });
    div.querySelector("[data-del]").addEventListener("click", () => {
      list.splice(idx,1);
      save(list, () => render(list));
    });
    box.appendChild(div);
  });
  let dl = document.getElementById("olcuList");
  if (!dl) {
    dl = document.createElement("datalist");
    dl.id = "olcuList";
    ["Adet","Metre","Metrekare","Metreküp","Kilogram","Ton","Litre","Saat","Gün","Paket","Kutu"].forEach(v=>{
      const o=document.createElement("option"); o.value=v; dl.appendChild(o);
    });
    box.appendChild(dl);
  }
  document.getElementById("json").value = JSON.stringify(list, null, 2);
}
function escapeHtml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

const EXACT_MAP = {
  "KLT-G": "KLT-G: Kilit Parke Taşı (8cm-Gri)",
  "KLT-K": "KLT-K: Kilit Parke Taşı (8cm-Kırmızı)",
  "KLT-S": "KLT-S: Kilit Parke Taşı (8cm-Siyah)",
  "KLT-B": "KLT-B: Kilit Parke Taşı (8cm-Beyaz)",
  "KR-S": "KR-S: Kare Parke Taşı (20x20 - Siyah)",
  "KR-G": "KR-G: Kare Parke Taşı (20x20 - Gri)",
  "KR-B": "KR-B: Kare Parke Taşı (20x20 - Beyaz)",
  "KR-K": "KR-K: Kare Parke Taşı (20x20 - Kırmızı)",
  "DG-G": "DG-G: Prizma Parke Taşı (20x10 - Gri)",
  "DG-B": "DG-B: Prizma Parke Taşı (20x10 - Beyaz)",
  "DG-K": "DG-K: Prizma Parke Taşı (20x10 - Kırmızı)",
  "DG-S": "DG-S: Prizma Parke Taşı (20x10 - Siyah)",
  "KL-G": "KL-G: Kaldırım Parke Taşı (6cm - Gri)",
  "KL-B": "KL-B: Kaldırım Parke Taşı (6cm - Beyaz)",
  "KL-S": "KL-S: Kaldırım Parke Taşı (6cm - Siyah)",
  "KL-K": "KL-K: Kaldırım Parke Taşı (6cm - Kırmızı)"
};
const PRICE_MAP = { G: "280", S: "280", B: "330", K: "280" };
function updatePreview() {
  const t = document.getElementById("tip").value;
  const c = document.getElementById("renk").value;
  const kisa = `${t}-${c}`;
  const long = EXACT_MAP[kisa] || kisa;
  const fiyat = PRICE_MAP[c] || "";
  document.getElementById("preview").textContent = `${kisa}: ${long} / ${fiyat} TL`;
}
document.getElementById("tip").addEventListener("change", updatePreview);
document.getElementById("renk").addEventListener("change", updatePreview);
updatePreview();

function setStatus(text, isErr) {
  const el = document.getElementById("status");
  el.textContent = text;
  el.className = isErr ? "err" : "ok";
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function refreshRows() {
  try {
    const tab = await getActiveTab();
    if (!tab || !tab.url || !tab.url.includes("edmbilisim.com.tr")) {
      document.getElementById("satir").innerHTML = `<option value="">Önce fatura sayfasını aç</option>`;
      return;
    }
    const res = await chrome.tabs.sendMessage(tab.id, { type: "EDM_LIST" });
    const sel = document.getElementById("satir");
    sel.innerHTML = "";
    if (!res || !res.rows || !res.rows.length) {
      sel.innerHTML = `<option value="">Satır bulunamadı</option>`;
      return;
    }
    res.rows.forEach((r) => {
      const opt = document.createElement("option");
      opt.value = String(r.index);
      opt.textContent = r.label;
      sel.appendChild(opt);
    });
  } catch (e) {
    document.getElementById("satir").innerHTML = `<option value="">Sayfayı yenile</option>`;
  }
}
document.getElementById("yenile").addEventListener("click", refreshRows);
refreshRows();

document.getElementById("sifirla").addEventListener("click", async () => {
  const rowIndex = document.getElementById("satir").value === "" ? undefined : Number(document.getElementById("satir").value);
  try {
    const tab = await getActiveTab();
    const res = await chrome.tabs.sendMessage(tab.id, { type: "EDM_CLEAR", rowIndex });
    const failed = (res.details || []).some((d) => /bulunamadı|HATA/i.test(d));
    setStatus(failed ? `Sıfırla hatası (${res.via}):\n${(res.details || []).join("\n")}` : `Sıfırlandı (${res.via})`, failed);
    refreshRows();
  } catch (e) { setStatus("Sıfırlama hatası: " + e.message, true); }
});

document.getElementById("uygula").addEventListener("click", async () => {
  const tCode = document.getElementById("tip").value;
  const cCode = document.getElementById("renk").value;
  const rowVal = document.getElementById("satir").value;
  const rowIndex = rowVal === "" ? undefined : Number(rowVal);
  setStatus("Gönderiliyor...");
  try {
    const tab = await getActiveTab();
    if (!tab || !tab.id) { setStatus("Aktif sekme bulunamadı", true); return; }
    if (!tab.url || !tab.url.includes("edmbilisim.com.tr")) {
      setStatus("Fatura sekmesinde değilsin. Önce fatura sayfasını açıp sonra popup'ı aç.", true);
      return;
    }
    const res = await chrome.tabs.sendMessage(tab.id, { type: "EDM_FILL", tCode, cCode, rowIndex });
    if (!res) { setStatus("Yanıt yok. Sayfayı yenileyip eklentiyi yeniden yükle.", true); return; }
    if (res.ok) {
      setStatus(`Yazıldı (${res.via}): ${res.preset.kisa} → ${res.preset.malHizmet} / ${res.preset.fiyat} TL`, false);
    } else {
      setStatus(`YAZILAMADI: ${res.reason || "bilinmiyor"}\n${(res.details||[]).join("\n")}\nSatır sayısı: ${res.rowCount ?? res.inspect?.rowCount ?? "?"}`, true);
      if (res.inspect) document.getElementById("debug").value = JSON.stringify(res.inspect, null, 2).slice(0, 6000);
    }
    refreshRows();
  } catch (e) {
    setStatus("Hata: " + e.message + "\nSayfayı yenile + chrome://extensions → Yeniden yükle.", true);
  }
});

document.getElementById("notyaz").addEventListener("click", async () => {
  try {
    const tab = await getActiveTab();
    const res = await chrome.tabs.sendMessage(tab.id, { type: "EDM_NOTE" });
    const r = res && res.result;
    setStatus(!r ? "Yanıt yok" : r.ok ? (r.skipped ? "Notlar zaten yazılı" : "Notlar yazıldı") : ("Not hatası: " + r.why), !(r && r.ok));
  } catch (e) { setStatus("Not hatası: " + e.message, true); }
});

document.getElementById("inspect").addEventListener("click", async () => {
  try {
    const tab = await getActiveTab();
    const res = await chrome.tabs.sendMessage(tab.id, { type: "EDM_INSPECT" });
    document.getElementById("debug").value = JSON.stringify(res.inspect, null, 2).slice(0, 8000);
    setStatus(`Satır sayısı: ${res.inspect.rowCount}.`, res.inspect.rowCount === 0);
  } catch (e) {
    setStatus("İnceleme hatası: " + e.message, true);
  }
});

document.getElementById("add").addEventListener("click", ()=>{
  load((list)=>{ list.push({kisa:"yeni-urun", malHizmet:"", miktar:"1", olcuBirim:"Metrekare", fiyat:"0", kdvOran:"20"}); save(list, ()=>render(list)); });
});
document.getElementById("export").addEventListener("click", ()=>{
  document.getElementById("json").select();
  document.execCommand("copy");
});
document.getElementById("import").addEventListener("click", ()=>{
  try {
    const arr = JSON.parse(document.getElementById("json").value);
    if (!Array.isArray(arr)) throw new Error("dizi olmalı");
    save(arr, ()=>render(arr));
  } catch(e){ alert("JSON hatalı: "+e.message); }
});
load(render);
