# EDM Fatura Hızlı Doldurma

EDM e-Fatura portalı manuel fatura ekranındaki **Mal ve Hizmetler** satırlarını ve **Notlar** alanını tek tıkla dolduran Chrome eklentisi (Manifest V3).

## Özellikler

- Fatura sayfasına tek satırlık çubuk ekler: **Tip + Renk + Satır + Uygula / Sıfırla / Not Yaz**
- Tip (Kare / Prizma / Kilit-8 / Kaldırım-6) ve renk seçimiyle mal/hizmet adı, miktar, ölçü birimi ve fiyat otomatik yazılır
- Beyaz ürünler 330 TL, diğer renkler 280 TL (popup'tan değiştirilebilir)
- Uygula'ya her basışta Notlar alanına şirket unvanı + IBAN eklenir (ilk satır korunur)
- Çok satırlı faturalarda satır seçimi; tek satırda doğrudan yazma
- Sadece `ManualInvoiceEdit*` sayfalarında çalışır
- Tüm ayarlar yalnızca tarayıcıda (`chrome.storage`) saklanır; dışarı veri gönderilmez

## Kurulum (geliştirici modu)

1. Bu repoyu klonlayın veya ZIP olarak indirip çıkarın
2. Chrome'da `chrome://extensions` adresini açın
3. Sağ üstten **Geliştirici modu**nu açın
4. **Paketlenmemiş öğe yükle** ile bu klasörü seçin
5. Fatura sayfasını yenileyin

## Kullanım

1. Fatura ekranında çubuktan **Tip** ve **Renk** seçin
2. Gerekirse **Satır** listesinden hedef satırı seçin (veya satırdaki bir kutuya tıklayın)
3. **Uygula**'ya basın
4. Satırı temizlemek için **Sıfırla**, yalnızca not yazmak için **Not Yaz**

### İlk kurulum

- Eklenti ikonuna tıklayın → **Not Ayarları** bölümüne şirket unvanı ve IBAN girin
- Fiyatlar **Fiyat / Ürün Tanımları** bölümünden düzenlenebilir (JSON içe/dışa aktarma desteklenir)

## Gizlilik

Eklenti yalnızca EDM fatura düzenleme sayfasında çalışır, yalnızca form alanlarını doldurur. Hiçbir veri toplanmaz, iletilmez veya üçüncü taraflarla paylaşılmaz.

## Lisans

MIT — bkz. [LICENSE](LICENSE).
