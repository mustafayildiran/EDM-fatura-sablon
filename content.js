/* EDM Fatura Hızlı Doldurma - content.js
 * EDM e-Fatura portalı manuel fatura ekranında Mal/Hizmet satırlarını
 * ve Notlar alanını doldurur. Sadece ManualInvoiceEdit* sayfalarında çalışır.
 */
(function () {
  // Sadece manuel fatura düzenleme sayfasında çalış
  if (!/ManualInvoiceEdit/i.test(location.pathname + location.search + location.href)) return;
  if (window.__edmAsistanLoaded) return;
  window.__edmAsistanLoaded = true;

  const STORAGE_KEY = "edmPresetsV4";
  const NOTES_KEY = "edmNotesV1";

  // Not satırları (şirket + IBAN) kullanıcı ayarlarından okunur (popup > Not Ayarları).
  // Kod içinde gerçek şirket/IBAN bilgisi tutulmaz.
  let notesCache = null;
  function getNotesSettings() {
    return new Promise((resolve) => {
      if (notesCache) return resolve(notesCache);
      try {
        chrome.storage.sync.get([NOTES_KEY], (res) => {
          const v = res && res[NOTES_KEY];
          if (v && (v.company || v.iban)) {
            notesCache = v;
            return resolve(v);
          }
          chrome.storage.local.get([NOTES_KEY], (res2) => {
            const v2 = (res2 && res2[NOTES_KEY]) || { company: "", iban: "" };
            notesCache = v2;
            resolve(v2);
          });
        });
      } catch (e) {
        resolve({ company: "", iban: "" });
      }
    });
  }
  try {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes && changes[NOTES_KEY]) notesCache = changes[NOTES_KEY].newValue || null;
    });
  } catch (e) {}

  function findNotesField() {
    return (
      document.querySelector("[id*='NoteTextBox']") ||
      document.querySelector("textarea[placeholder*='Notlar']") ||
      [...document.querySelectorAll("textarea")].find((t) => /notlar/i.test(t.placeholder || "") || /Note/i.test(t.id || "")) ||
      null
    );
  }

  async function fillNotes() {
    const settings = await getNotesSettings();
    const company = (settings.company || "").trim();
    const iban = (settings.iban || "").trim();
    if (!company && !iban) {
      return { ok: false, why: "not ayarı boş: popup > Not Ayarları bölümünden şirket/IBAN girin" };
    }
    const el = findNotesField();
    if (!el) return { ok: false, why: "notlar alanı bulunamadı" };
    const cur = el.value || "";
    if (company && cur.includes(company) && (!iban || cur.includes(iban))) {
      return { ok: true, skipped: true, value: cur };
    }
    // İlk satırı koru (örn: "Yazı ile: # ... #"), 2. satırdan itibaren şirket + IBAN
    const lines = cur.split("\n");
    const first = (lines[0] || "").trim();
    const extra = [company, iban].filter(Boolean);
    const next = [first, ...extra].filter((x, i) => i === 0 || x).join("\n");
    const ok = setNativeValue(el, next);
    // textarea için change yeterli, Enter yok
    return { ok, value: el.value };
  }

  const DEFAULT_PRESETS = [
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

  const TYPES = [
    { code: "KR", label: "KARE", make: (renk, kisa) => `${kisa || "KR"}: Kare Parke Taşı (20x20 - ${renk})` },
    { code: "DG", label: "PRİZMA", make: (renk, kisa) => `${kisa || "DG"}: Prizma Parke Taşı (20x10 - ${renk})` },
    { code: "KLT", label: "KİLİT-8", make: (renk, kisa) => `${kisa || "KLT"}: Kilit Parke Taşı (8cm-${renk})` },
    { code: "KL", label: "KALDIRIM-6", make: (renk, kisa) => `${kisa || "KL"}: Kaldırım Parke Taşı (6cm - ${renk})` }
  ];
  const COLORS = [
    { code: "G", label: "Gri", full: "Gri", fiyat: "280" },
    { code: "S", label: "Siyah", full: "Siyah", fiyat: "280" },
    { code: "B", label: "Beyaz", full: "Beyaz", fiyat: "330" },
    { code: "K", label: "Kırmızı", full: "Kırmızı", fiyat: "280" }
  ];

  // Stok kodlu uzun metinler: "KISA: Uzun Ad"
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

  function getPresets() {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get([STORAGE_KEY], (res) => {
          let p = res && res[STORAGE_KEY];
          if (!p || !p.length) {
            chrome.storage.local.get([STORAGE_KEY], (res2) => {
              let p2 = res2 && res2[STORAGE_KEY];
              resolve(p2 && p2.length ? p2 : DEFAULT_PRESETS);
            });
            return;
          }
          resolve(p);
        });
      } catch (e) {
        resolve(DEFAULT_PRESETS);
      }
    });
  }

  function buildPresetFromSelection(tCode, cCode, presets) {
    const t = TYPES.find((x) => x.code === tCode) || TYPES[0];
    const c = COLORS.find((x) => x.code === cCode) || COLORS[0];
    const kisa = `${t.code}-${c.code}`;
    const found = (presets || []).find((p) => p.kisa === kisa);
    if (found && found.malHizmet && EXACT_MAP[kisa] && found.malHizmet === EXACT_MAP[kisa]) return found;
    // Her zaman birebir haritayı yaz (eski kayıtlı isimler ezilir)
    return {
      kisa,
      malHizmet: EXACT_MAP[kisa] || t.make(c.full, kisa),
      miktar: "1",
      olcuBirim: "Metrekare",
      fiyat: c.fiyat,
      iskontoTip: "İskonto",
      iskontoOran: "0",
      kdvOran: "20"
    };
  }

  function setNativeValue(el, value) {
    if (!el) return false;
    try { el.focus({ preventScroll: true }); } catch (e) { try { el.focus(); } catch (e2) {} }
    const proto = el.tagName === "TEXTAREA"
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    try {
      const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
      setter.call(el, value);
    } catch (e) {
      el.value = value;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    // ASP.NET / Telerik genelde blur + Enter bekler
    el.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    const ok = el.value === String(value);
    return ok;
  }

  function setSelectByText(selectOrInput, text) {
    if (!selectOrInput || text == null || text === "") return { ok: false, why: "boş" };
    const el = selectOrInput;
    if (el.tagName === "SELECT") {
      const want = String(text).toLocaleLowerCase("tr").trim();
      let found = null;
      for (const opt of el.options) {
        const t = (opt.text || "").toLocaleLowerCase("tr").trim();
        const v = (opt.value || "").toLocaleLowerCase("tr").trim();
        if (t === want || v === want) { found = opt; break; }
      }
      if (!found) {
        for (const opt of el.options) {
          const t = (opt.text || "").toLocaleLowerCase("tr").trim();
          if (t.includes(want) || want.includes(t)) { found = opt; break; }
        }
      }
      if (found) {
        el.focus();
        el.value = found.value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
        return { ok: true, matched: found.text };
      }
      return { ok: false, why: "option bulunamadı: " + text };
    }
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      const ok = setNativeValue(el, String(text));
      // Telerik dropdown varsa listeden seçmeyi dene
      setTimeout(() => {
        try {
          const lists = document.querySelectorAll(".rcbList, ul.rcbList, .rcbSlide ul, ul[class*='rcb']");
          lists.forEach((ul) => {
            if (ul.offsetParent === null && ul.style.display === "none") return;
            const items = ul.querySelectorAll("li");
            for (const li of items) {
              const lt = (li.textContent || "").toLocaleLowerCase("tr");
              if (lt.includes(String(text).toLocaleLowerCase("tr"))) { li.click(); break; }
            }
          });
        } catch (e) {}
      }, 250);
      return { ok, matched: text };
    }
    return { ok: false, why: "bilinmeyen element: " + el.tagName };
  }

  function parseRowFields(row) {
    const inputs = [...row.querySelectorAll("input, textarea")].filter((i) => {
      const t = (i.type || "").toLowerCase();
      return t !== "hidden" && t !== "button" && t !== "submit" && t !== "checkbox" && t !== "radio" && t !== "file";
    });
    const selects = [...row.querySelectorAll("select")];
    return { inputs, selects };
  }

  function isCompleteRow(tr) {
    try {
      const hasMal = !!tr.querySelector("[id*='productServiceListComboBox']");
      const hasMiktar = !!tr.querySelector("[id*='TB_Quantity']");
      const hasFiyat = !!tr.querySelector("[id*='TB_Price']");
      const hasOlcu = !!tr.querySelector("[id*='measureUnitListComboBox']");
      return hasMal && hasMiktar && hasFiyat && hasOlcu;
    } catch (e) { return false; }
  }

  function findInvoiceRows() {
    // Gerçek fatura satırı: 4 kritik alanın TAMAMI aynı <tr>'de olmalı
    // Yarım şablon satırlar elenir
    const allCandidates = [...document.querySelectorAll("table[id*='lineItemsGrid'] tr, table[class*='rgMasterTable'] tr")];
    const complete = allCandidates.filter((tr) => {
      if (tr.querySelector("[id*='Jewelry']")) return false;
      return isCompleteRow(tr);
    });
    if (complete.length) return complete;

    const strict = allCandidates.filter((tr) => {
      try {
        if (tr.querySelector("[id*='TB_Price'], [id*='productServiceListComboBox'], [id*='TB_Quantity'], [id*='measureUnitListComboBox']")) {
          if (tr.querySelector("[id*='Jewelry']") && !tr.querySelector("[id*='TB_Price']")) return false;
          return true;
        }
      } catch (e) {}
      return false;
    });
    if (strict.length) return strict;

    // Fallback: Telerik satır class'ları
    const grids = [...document.querySelectorAll("table[id*='lineItemsGrid'], table[class*='rgMasterTable']")];
    const searchTables = grids.length ? grids : [...document.querySelectorAll("table")];
    for (const table of searchTables) {
      let rows = [...table.querySelectorAll("tr.rgRow, tr.rgAltRow, tr.rgEditRow")];
      if (!rows.length) {
        rows = [...table.querySelectorAll("tr")].filter((tr) => {
          const cls = (tr.className || "").toLowerCase();
          if (cls.includes("command") || cls.includes("header") || cls.includes("footer") || cls.includes("pager")) return false;
          if (tr.querySelector("[id*='Jewelry']")) return false;
          return tr.querySelector("input[type=text], input:not([type]), select, textarea");
        });
      }
      const dataRows = rows.filter((tr) => {
        if (tr.querySelector("[id*='Jewelry']")) return false;
        const visible = [...tr.querySelectorAll("input, select, textarea")].filter((el) => (el.type || "").toLowerCase() !== "hidden");
        return visible.length >= 3;
      });
      if (dataRows.length) return dataRows;
    }
    // Son çare: "Ara" butonu içeren satırlar
    const araBtns = [...document.querySelectorAll("input[type=button], input[type=submit], button")].filter((b) =>
      /^\s*ara\s*$/i.test(b.value || b.textContent || "")
    );
    if (araBtns.length) {
      const rows = araBtns.map((b) => b.closest("tr")).filter(Boolean);
      if (rows.length) return rows;
    }
    return [];
  }

  // Son odaklanılan/tıklanan fatura satırını hatırla (popup açıkken odak popup'ta olur)
  let lastFocusedRow = null;
  document.addEventListener("focusin", (e) => {
    try {
      const tr = e.target && e.target.closest ? e.target.closest("tr") : null;
      if (tr && tr.querySelector("[id*='TB_Price'], [id*='productServiceListComboBox']")) lastFocusedRow = tr;
    } catch (err) {}
  }, true);
  document.addEventListener("click", (e) => {
    try {
      const tr = e.target && e.target.closest ? e.target.closest("tr") : null;
      if (tr && tr.querySelector("[id*='TB_Price'], [id*='productServiceListComboBox']")) lastFocusedRow = tr;
    } catch (err) {}
  }, true);

  function pickTargetRow(explicitIndex) {
    const rows = findInvoiceRows();
    if (!rows.length) return { row: null, rows };
    if (explicitIndex != null && rows[explicitIndex]) {
      return { row: rows[explicitIndex], rows, via: `seçim-satır-${explicitIndex + 1}` };
    }
    // 1 satır varsa hep ona yaz
    if (rows.length === 1) return { row: rows[0], rows, via: "tek-satır" };
    // Tıklanmış/odaklanmış satır varsa ona yaz
    if (lastFocusedRow && rows.includes(lastFocusedRow)) return { row: lastFocusedRow, rows, via: "tıklanan-satır" };
    const active = document.activeElement ? document.activeElement.closest("tr") : null;
    if (active && rows.includes(active)) return { row: active, rows, via: "odak" };
    // Boş mal kutusu öncelikli
    for (const r of rows) {
      const mal = r.querySelector("[id*='productServiceListComboBox']");
      if (mal && !mal.value) return { row: r, rows, via: "ilk-boş-mal" };
    }
    // Hepsi doluysa ilk tam satıra yaz
    return { row: rows[0], rows, via: "ilk-satır-üzerine-yaz" };
  }

  function findByIdPart(row, ...parts) {
    const els = [...row.querySelectorAll("input, select, textarea")];
    const low = (s) => (s || "").toLowerCase();
    for (const p of parts) {
      const hit = els.find((el) => low(el.id).includes(low(p)) || low(el.name).includes(low(p)));
      if (hit && (hit.type || "") !== "hidden") return hit;
    }
    return null;
  }

  function fillRow(row, preset) {
    const details = [];
    if (!row) return { ok: false, reason: "satır bulunamadı", details };
    const { inputs, selects } = parseRowFields(row);
    details.push(`satırda ${inputs.length} input, ${selects.length} select var [${row.className}]`);

    // 1) Mal veya Hizmet (Telerik RadComboBox)
    let malInput =
      findByIdPart(row, "productServiceListComboBox", "ProductService", "ItemName", "StockName", "MalHizmet", "Description") ||
      row.querySelector("input.rcbInput") ||
      inputs[0] ||
      null;
    let malSetOk = false, miktarSetOk = false, fiyatSetOk = false, olcuSetOk = false;
    if (malInput && preset.malHizmet) {
      // 1) Telerik API dene (RadComboBox metni ClientState'te tutar)
      let apiOk = false;
      try {
        const comboId = (malInput.id || "").replace(/_Input$/, "");
        let combo = null;
        if (typeof $find === "function") {
          try { combo = $find(comboId); } catch (e) {}
        }
        if (combo && typeof combo.set_text === "function") {
          combo.set_text(preset.malHizmet);
          try { combo.commitChanges && combo.commitChanges(); } catch (e) {}
          apiOk = combo.get_text ? combo.get_text() === preset.malHizmet : true;
          details.push(`malHizmet Telerik API: '${preset.malHizmet}' -> ${apiOk ? "ok" : "kısmi"}`);
        }
      } catch (e) { details.push("Telerik API hatası: " + e.message); }
      // 2) Her durumda input'a da yaz (serbest metin)
      const nativeOk = setNativeValue(malInput, preset.malHizmet);
      malSetOk = !!(apiOk || nativeOk);
      // Enter'a basma — sistemde kayıtlı ürün yoksa Enter/Ara temizliyor
      details.push(`malHizmet: '${malInput.value}' -> ${malSetOk ? "yazıldı" : "YAZILAMADI"}`);
    } else {
      details.push("malHizmet inputu BULUNAMADI");
    }

    // 2) Miktar (onblur=calcLineValues)
    let miktarInput =
      findByIdPart(row, "TB_Quantity", "txtQuantity", "txtMiktar", "Quantity", "Miktar", "txtAmount", "txtCount") ||
      inputs[1] ||
      null;
    if (miktarInput && preset.miktar != null) {
      miktarSetOk = setNativeValue(miktarInput, String(preset.miktar));
      details.push(`miktar: '${miktarInput.value}' -> ${miktarSetOk ? "ok" : "hata"}`);
    } else {
      details.push("miktar inputu bulunamadı");
    }

    // 3) Ölçü Birim (Telerik combo; zaten doğruysa dokunma)
    let olcuEl =
      findByIdPart(row, "measureUnitListComboBox", "measureUnit", "ddlUnit", "UnitList", "OlcuBirim", "Birim", "QuantityUnit", "ddlQuantityUnit") ||
      selects[0] ||
      inputs[2] ||
      null;
    if (olcuEl && preset.olcuBirim) {
      const cur = (olcuEl.value || "").trim();
      if (cur === preset.olcuBirim) {
        olcuSetOk = true;
        details.push(`olcuBirim: zaten '${cur}', dokunulmadı`);
      } else if (olcuEl.tagName === "SELECT") {
        // SELECT'te birebir eşleşme şart (Metre/Santimetre'ye kaymasın)
        const want = preset.olcuBirim.toLocaleLowerCase("tr");
        let found = null;
        for (const opt of olcuEl.options) {
          if ((opt.text || "").toLocaleLowerCase("tr").trim() === want) { found = opt; break; }
        }
        if (found) {
          olcuEl.focus();
          olcuEl.value = found.value;
          olcuEl.dispatchEvent(new Event("change", { bubbles: true }));
          olcuSetOk = true;
          details.push(`olcuBirim (SELECT): ok (${found.text})`);
        } else {
          details.push(`olcuBirim (SELECT): HATA option yok: ${preset.olcuBirim}`);
        }
      } else {
        const r = setSelectByText(olcuEl, preset.olcuBirim);
        olcuSetOk = !!r.ok;
        details.push(`olcuBirim (${olcuEl.tagName}): ${r.ok ? "ok (" + r.matched + ")" : "HATA: " + r.why}`);
      }
    } else {
      details.push("olcuBirim elementi bulunamadı");
    }

    // 4) Fiyat (onblur=calcLineValues)
    let fiyatInput =
      findByIdPart(row, "TB_Price", "txtUnitPrice", "txtPrice", "UnitPrice", "Price", "Fiyat", "txtFiyat") ||
      null;
    if (!fiyatInput) {
      const skip = new Set([malInput, miktarInput, olcuEl]);
      for (const c of inputs) {
        if (skip.has(c)) continue;
        if (preset.olcuBirim && (c.value || "") === preset.olcuBirim) continue;
        fiyatInput = c;
        break;
      }
    }
    if (fiyatInput && preset.fiyat != null) {
      fiyatSetOk = setNativeValue(fiyatInput, String(preset.fiyat));
      details.push(`fiyat (${fiyatInput.id}): '${fiyatInput.value}' -> ${fiyatSetOk ? "ok" : "HATA"}`);
      // Satır toplamını onblur ile hesaplat
      try {
        if (typeof window.calcLineValues === "function") {
          const m = /ctl0?(\d+)/.exec(fiyatInput.id || "");
          const idx = m ? parseInt(m[1], 10) - 4 : 0;
          window.calcLineValues(Math.max(0, idx));
          details.push("calcLineValues tetiklendi");
        }
      } catch (e) {}
    } else {
      details.push("fiyat inputu bulunamadı");
    }

    // 5) KDV: hep 20 geliyor, dokunma
    details.push("kdv: atlandı (varsayılan 20)");

    const ok = !!(malSetOk && miktarSetOk && fiyatSetOk);
    const reason = ok ? "" : `kontrol: mal=${malSetOk ? "ok" : "hata"}, miktar=${miktarSetOk ? "ok" : "hata"}, olcu=${olcuSetOk ? "ok" : "hata"}, fiyat=${fiyatSetOk ? "ok" : "hata"}`;
    return { ok, reason, details, inputs: inputs.length, selects: selects.length };
  }

  function inspectRows() {
    const allTrs = [...document.querySelectorAll("table[id*='lineItemsGrid'] tr, table[class*='rgMasterTable'] tr")].slice(0, 15);
    const rows = findInvoiceRows();
    return {
      url: location.href,
      rowCount: rows.length,
      allRowClasses: allTrs.map((r) => ({
        cls: r.className || "",
        id: r.id || "",
        fieldIds: [...r.querySelectorAll("input, select, textarea")]
          .filter((el) => (el.type || "") !== "hidden")
          .map((el) => el.id || el.name || el.tagName)
          .slice(0, 20)
      })),
      rows: rows.slice(0, 2).map((r, i) => ({
        index: i,
        cls: r.className || "",
        inputs: [...r.querySelectorAll("input, select, textarea")]
          .filter((el) => (el.type || "") !== "hidden")
          .map((el) => ({
            tag: el.tagName,
            type: el.type || "",
            id: el.id || "",
            class: (el.className || "").toString().slice(0, 80),
            value: (el.value || "").slice(0, 60),
            options: el.tagName === "SELECT" ? [...el.options].map((o) => o.text).slice(0, 10) : undefined
          })),
        html: r.outerHTML.slice(0, 6000)
      }))
    };
  }

  function rowCalcIndex(row) {
    try {
      const html = row.innerHTML || "";
      const m = html.match(/calcLineValues\((\d+)\)/) || (row.querySelector("[id*='TB_Price'], [id*='TB_Quantity']") || {}).id?.match(/ctl0?(\d+)/);
      if (m) {
        const n = parseInt(m[1], 10);
        // ctl04 -> satır 0
        return m[0].includes("ctl") ? Math.max(0, n - 4) : n;
      }
    } catch (e) {}
    return 0;
  }

  function forceClear(el, emptyVal) {
    if (!el) return { found: false };
    const before = el.value;
    try {
      const proto = el.tagName === "SELECT" ? window.HTMLSelectElement.prototype
        : el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const desc = Object.getOwnPropertyDescriptor(proto, "value");
      if (desc && desc.set) desc.set.call(el, emptyVal);
      else el.value = emptyVal;
    } catch (e) { el.value = emptyVal; }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    return { found: true, before, after: el.value };
  }

  function clearRow(row) {
    const details = [];
    if (!row) return { ok: false, reason: "satır yok", details };
    const mal = findByIdPart(row, "productServiceListComboBox") || row.querySelector("input.rcbInput");
    const miktar = findByIdPart(row, "TB_Quantity") || null;
    const fiyat = findByIdPart(row, "TB_Price") || null;
    const olcu = findByIdPart(row, "measureUnitListComboBox") || null;
    details.push(`hedef: mal=${mal ? mal.id : "yok"}, miktar=${miktar ? miktar.id : "yok"}, fiyat=${fiyat ? fiyat.id : "yok"}, olcu=${olcu ? olcu.id : "yok"}`);
    // Mal: Telerik API + input ikisi de temizlenir
    if (mal) {
      try {
        const comboId = (mal.id || "").replace(/_Input$/, "");
        if (typeof $find === "function") {
          const combo = $find(comboId);
          if (combo) {
            try { combo.clearSelection && combo.clearSelection(); } catch (e) {}
            try { combo.set_text && combo.set_text(""); } catch (e) {}
            try { combo.commitChanges && combo.commitChanges(); } catch (e) {}
            try { combo.updateClientState && combo.updateClientState(); } catch (e) {}
          }
        }
      } catch (e) {}
      const r = forceClear(mal, "");
      // Telerik gizli state'i de sıfırla
      try {
        const cs = row.querySelector("[id*='productServiceListComboBox_ClientState']");
        if (cs) { cs.value = ""; }
      } catch (e) {}
      details.push(`mal: '${r.before}' -> '${r.after}'`);
    } else details.push("mal bulunamadı");
    if (olcu) {
      const r = forceClear(olcu, "Metrekare");
      details.push(`olcu: '${r.before}' -> '${r.after}'`);
    } else details.push("olcu bulunamadı");
    if (miktar) { const r = forceClear(miktar, "0"); details.push(`miktar: '${r.before}' -> '${r.after}'`); }
    else details.push("miktar bulunamadı");
    if (fiyat) { const r = forceClear(fiyat, "0"); details.push(`fiyat: '${r.before}' -> '${r.after}'`); }
    else details.push("fiyat bulunamadı");
    // Satır toplamını yeniden hesaplat (doğru satır indexi ile)
    try {
      if (typeof window.calcLineValues === "function") {
        window.calcLineValues(rowCalcIndex(row));
        details.push("calc tetiklendi");
      }
    } catch (e) {}
    return { ok: true, details };
  }

  function listRows() {
    const rows = findInvoiceRows();
    return rows.map((r, i) => {
      const mal = r.querySelector("[id*='productServiceListComboBox']");
      const miktar = r.querySelector("[id*='TB_Quantity']");
      const fiyat = r.querySelector("[id*='TB_Price']");
      const label = `Satır ${i + 1}${mal && mal.value ? " — " + mal.value.slice(0, 30) : " — boş"}`;
      return { index: i, label, mal: (mal && mal.value) || "", miktar: (miktar && miktar.value) || "", fiyat: (fiyat && fiyat.value) || "" };
    });
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
      if (msg && msg.type === "EDM_FILL") {
        const presets = await getPresets();
        const preset = buildPresetFromSelection(msg.tCode, msg.cCode, presets);
        const { row, rows, via } = pickTargetRow(msg.rowIndex);
        if (!row) {
          sendResponse({ ok: false, reason: "fatura satırı bulunamadı", inspect: inspectRows() });
          return;
        }
        const res = fillRow(row, preset);
        lastFocusedRow = row;
        let notesRes = null;
        try { notesRes = await fillNotes(); } catch (e) { notesRes = { ok: false, why: e.message }; }
        row.scrollIntoView({ block: "center", behavior: "smooth" });
        try { row.style.outline = "2px solid #2d89ef"; setTimeout(() => (row.style.outline = ""), 2000); } catch (e) {}
        sendResponse({ ok: res.ok, reason: res.reason, preset, via, rowCount: rows.length, details: res.details, notes: notesRes });
      } else if (msg && msg.type === "EDM_CLEAR") {
        const { row, rows, via } = pickTargetRow(msg.rowIndex);
        if (!row) { sendResponse({ ok: false, reason: "satır yok" }); return; }
        const res = clearRow(row);
        sendResponse({ ok: true, via, rowCount: rows.length, details: res.details });
      } else if (msg && msg.type === "EDM_LIST") {
        sendResponse({ ok: true, rows: listRows() });
      } else if (msg && msg.type === "EDM_NOTE") {
        sendResponse({ ok: true, result: await fillNotes() });
      } else if (msg && msg.type === "EDM_INSPECT") {
        sendResponse({ ok: true, inspect: inspectRows() });
      }
    })();
    return true; // async yanıt
  });

  // Tek satırlık sayfa-içi çubuk
  function inlinePreviewText(tCode, cCode) {
    const kisa = `${tCode}-${cCode}`;
    const long = EXACT_MAP[kisa] || kisa;
    const c = COLORS.find((x) => x.code === cCode);
    return `${kisa}: ${long} / ${c ? c.fiyat : ""} TL`;
  }

  function refreshInlineRows() {
    const bar = document.getElementById("edm-quick-fill");
    if (!bar) return;
    const sel = bar.querySelector("#edm-satir");
    if (!sel) return;
    const prev = sel.value;
    const list = listRows();
    sel.innerHTML = "";
    if (!list.length) {
      const o = document.createElement("option");
      o.value = "";
      o.textContent = "Satır bekleniyor...";
      sel.appendChild(o);
      return;
    }
    list.forEach((r) => {
      const o = document.createElement("option");
      o.value = String(r.index);
      o.textContent = r.label;
      sel.appendChild(o);
    });
    if (prev !== "" && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
  }

  function ensureInlineBar() {
    if (document.getElementById("edm-quick-fill")) return;
    const bar = document.createElement("div");
    bar.id = "edm-quick-fill";
    bar.innerHTML = `
      <span class="edm-qf-title">⚡ Hızlı Ürün:</span>
      <label>Tip <select id="edm-tip">
        <option value="KR">KR - KARE</option>
        <option value="DG">DG - PRİZMA</option>
        <option value="KLT">KLT - KİLİT-8</option>
        <option value="KL">KL - KALDIRIM-6</option>
      </select></label>
      <label>Renk <select id="edm-renk">
        <option value="G">Gri (280 TL)</option>
        <option value="S">Siyah (280 TL)</option>
        <option value="B">Beyaz (330 TL)</option>
        <option value="K">Kırmızı (280 TL)</option>
      </select></label>
      <label>Satır <select id="edm-satir"></select></label>
      <button id="edm-yenile" type="button" title="Satırları yenile">↻</button>
      <button id="edm-uygula" type="button">Uygula</button>
      <button id="edm-sifirla" type="button">Sıfırla</button>
      <button id="edm-not" type="button" title="Notlara şirket + IBAN yaz">Not Yaz</button>
      <span id="edm-msg"></span>
      <span id="edm-preview" style="width:100%;font-size:11px;color:#0b5394;"></span>
    `;
    const msg = (t, long = false) => {
      const m = bar.querySelector("#edm-msg");
      if (m) { m.textContent = t; m.title = t; }
      clearTimeout(bar._msgT);
      bar._msgT = setTimeout(() => { if (m) { m.textContent = ""; m.title = ""; } }, long ? 8000 : 2500);
    };
    const updatePreview = () => {
      const t = bar.querySelector("#edm-tip").value;
      const c = bar.querySelector("#edm-renk").value;
      bar.querySelector("#edm-preview").textContent = inlinePreviewText(t, c);
    };
    bar.querySelector("#edm-tip").addEventListener("change", updatePreview);
    bar.querySelector("#edm-renk").addEventListener("change", updatePreview);
    updatePreview();

    bar.querySelector("#edm-yenile").addEventListener("click", refreshInlineRows);
    bar.querySelector("#edm-uygula").addEventListener("click", async () => {
      const t = bar.querySelector("#edm-tip").value;
      const c = bar.querySelector("#edm-renk").value;
      const sVal = bar.querySelector("#edm-satir").value;
      const rowIndex = sVal === "" ? undefined : Number(sVal);
      const presets = await getPresets();
      const preset = buildPresetFromSelection(t, c, presets);
      const { row, rows, via } = pickTargetRow(rowIndex);
      if (!row) { msg("Satır bulunamadı"); return; }
      const res = fillRow(row, preset);
      lastFocusedRow = row;
      try { row.style.outline = "2px solid #2d89ef"; setTimeout(() => (row.style.outline = ""), 2000); } catch (e) {}
      // Her seferinde istisnasız: notlara 2. satırdan şirket + IBAN
      try { await fillNotes(); } catch (e) {}
      if (res.ok) msg(`Yazıldı (${via}): ${preset.kisa}`);
      else { msg(`HATA (${via}): ${res.reason} | ${(res.details || []).join(" | ")}`, true); console.log("[EDM Hata]", res); }
      refreshInlineRows();
    });
    bar.querySelector("#edm-not").addEventListener("click", async () => {
      const r = await fillNotes();
      msg(r.ok ? (r.skipped ? "Notlar zaten yazılı" : "Notlar yazıldı") : ("Not hatası: " + r.why), !r.ok);
    });
    bar.querySelector("#edm-sifirla").addEventListener("click", () => {
      const sVal = bar.querySelector("#edm-satir").value;
      const rowIndex = sVal === "" ? undefined : Number(sVal);
      const { row, rows, via } = pickTargetRow(rowIndex);
      if (!row) { msg("Satır yok"); return; }
      const res = clearRow(row);
      console.log("[EDM Sıfırla]", via, res);
      // Başarılıysa kısa mesaj, hatada detay
      const failed = (res.details || []).some((d) => /bulunamadı|HATA/i.test(d));
      if (!failed) msg(`Sıfırlandı (${via})`);
      else msg(`Sıfırla hatası (${via}): ${(res.details || []).join(" | ")}`, true);
      refreshInlineRows();
    });

    // Tek noktaya yerleştir: grid tablosunun üstü
    let placed = false;
    const grid = document.querySelector("table[id*='lineItemsGrid']");
    if (grid && grid.parentElement) {
      grid.parentElement.insertBefore(bar, grid);
      placed = true;
    }
    if (!placed) {
      const probe = [...document.querySelectorAll("*")].find((el) =>
        /MAL VE HİZMETLER/.test((el.textContent || "").trim()) && el.children.length < 5
      );
      if (probe && probe.parentElement) {
        probe.parentElement.insertBefore(bar, probe.nextSibling);
        placed = true;
      }
    }
    if (!placed) {
      bar.classList.add("edm-floating");
      document.body.prepend(bar);
    }
    refreshInlineRows();
  }

  // İlk kurulum: grid gelene kadar dene, sonra tekil tut
  let inlineTries = 0;
  const inlineTimer = setInterval(() => {
    inlineTries++;
    ensureInlineBar();
    refreshInlineRows();
    if (document.getElementById("edm-quick-fill") && findInvoiceRows().length) clearInterval(inlineTimer);
    if (inlineTries > 40) clearInterval(inlineTimer);
  }, 1000);

  let inlineDeb = null;
  new MutationObserver(() => {
    // Çoklu bar oluşmuşsa fazlaları sil
    const bars = document.querySelectorAll("#edm-quick-fill");
    if (bars.length > 1) {
      bars.forEach((b, i) => { if (i > 0) b.remove(); });
    }
    if (!document.getElementById("edm-quick-fill")) ensureInlineBar();
    clearTimeout(inlineDeb);
    inlineDeb = setTimeout(refreshInlineRows, 800);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
