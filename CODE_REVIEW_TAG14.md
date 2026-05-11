# Code Review – DealRadar index.html (Tag 14)

Datei: `index.html` (~4226 Zeilen)
Datum: 2026-05-07
Reviewer: Claude Code

---

## 1. TOTER CODE

---

### 1.1 `loadOffersFromAPI()` wird nirgendwo aufgerufen
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeile 2362–2440
- **Problem:** Die Funktion `loadOffersFromAPI()` ist vollständig implementiert (eigene `CHAIN_MAP`, sessionStorage-Cache, Fetch zu `/api/deals`, komplettes Mapping) – sie wird jedoch an keiner Stelle im Code aufgerufen. Sie ist 78 Zeilen toter Code.
- **Lösung:** Entweder an den richtigen Stellen einbinden (statt `fetchLiveOffers()`) oder vollständig entfernen. Die Logik überlappt mit `fetchLiveOffers()` und `loadLiveDeals()`.
- **Aufwand:** klein

---

### 1.2 `fetchProductImage()` und leere `loadImagesForCards()`
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeile 2871–2894
- **Problem:** `fetchProductImage()` ruft die OpenFoodFacts-API auf und cached Ergebnisse in `sessionStorage`. Die einzige aufrufende Funktion `loadImagesForCards()` (Zeile 2892) ist jedoch vollständig leer mit dem Kommentar `// Replaced by floating question mark animation`. Die gesamte OpenFoodFacts-Integration ist damit toter Code.
- **Lösung:** `fetchProductImage()` und den `sessionStorage`-Cache-Mechanismus entfernen. `loadImagesForCards()` (leere Funktion) ebenfalls entfernen und alle Aufrufe davon in `render()` (Zeile 2811) streichen.
- **Aufwand:** klein

---

### 1.3 `OFFER_IMAGES`-Objekt (Unsplash-IDs) nahezu ungenutzt
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeile 2087–2128
- **Problem:** Das 50-Einträge-Objekt mit Unsplash-Foto-IDs wird von `getImgUrl()` genutzt, das nur noch in `renderCartDrawer()` aufgerufen wird. Die Hauptkarten-Anzeige (`renderOfferCard()`) nutzt ausschließlich den `bilder/`-Ordner. 49 von 50 IDs sind im Kartenbetrieb faktisch tot.
- **Lösung:** Entscheiden ob Unsplash oder `bilder/` als Bildquelle gelten soll. `getImgUrl()` und `OFFER_IMAGES` entweder konsolidieren oder entfernen, wenn `bilder/` die definitive Quelle ist.
- **Aufwand:** mittel

---

### 1.4 CSS `.logo { display: none; }` – Kompatibilitäts-Stub
- **Priorität:** NIEDRIG
- **Datei + Zeile:** index.html, Zeile 182
- **Problem:** Der Kommentar „Altes Logo-Element ausblenden (Kompatibilität)" deutet auf ein entferntes HTML-Element hin. Im aktuellen HTML-Body existiert kein Element mit der Klasse `.logo` mehr.
- **Lösung:** Die CSS-Regel `.logo { display: none; }` ersatzlos entfernen.
- **Aufwand:** klein

---

### 1.5 CSS-Variablen `--accent-light` und `--green-light` identisch zu `--accent`
- **Priorität:** NIEDRIG
- **Datei + Zeile:** index.html, Zeile 120–123
- **Problem:** `--accent-light: #FFD600` und `--green-light: #FFD600` haben exakt denselben Wert wie `--accent`. `--green-light` ist semantisch irreführend (keine grüne Farbe). Im Light-Mode (Zeile 1391–1395) werden alle drei separat aber ebenfalls identisch überschrieben.
- **Lösung:** `--accent-light` durch `--accent` ersetzen oder einen tatsächlich anderen Farbton vergeben. `--green-light` umbenennen zu `--success` o.ä. und einen semantisch korrekten Wert setzen.
- **Aufwand:** mittel

---

## 2. DUPLIZIERTER CODE

---

### 2.1 `fmtFull()` und `fmt()` werden 7-mal lokal neu definiert
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeilen 2158–2159, 2256–2257, 2400–2401, 2723, 2993, 3021, 3744
- **Problem:** Die Hilfsfunktionen `fmt(dt)` (Datum als `DD.MM`) und `fmtFull(dt)` (ISO-String) werden in `buildOffersForWeek`, `fetchLiveOffers`, `loadOffersFromAPI`, `openKwModal`, `renderProspekteTab`, `renderProspektDetail` und `generateFlipbookPages` je einzeln als lokale Funktionen definiert – identische Implementierungen, sieben Mal.
- **Lösung:** Beide als Top-Level-Hilfsfunktionen direkt nach dem `// ─── DATE HELPERS` Block deklarieren und in allen Funktionen darauf referenzieren.
- **Aufwand:** klein

---

### 2.2 `CHAIN_MAP` doppelt definiert
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeilen 2233–2239 und 2362–2369
- **Problem:** Das Mapping von Retailer-Namen auf Chain-IDs wird in `fetchLiveOffers()` und `loadOffersFromAPI()` je separat als lokales Objekt angelegt. Die Einträge sind fast identisch (leichte Abweichungen beim `aldi süd`-Key-Encoding).
- **Lösung:** Als Modul-Konstante `CHAIN_MAP` auf Top-Level verschieben und in beiden Funktionen referenzieren. Dabei Encoding-Abweichungen vereinheitlichen.
- **Aufwand:** klein

---

### 2.3 Spinner-HTML-String doppelt inline
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeilen 2337–2340 und 2376–2379
- **Problem:** Beide Funktionen `reloadOffers()` und `loadOffersFromAPI()` setzen denselben mehrzeiligen Inline-HTML-String für einen Lade-Spinner in `mainContent.innerHTML`. Identischer Wortlaut, identisches Styling.
- **Lösung:** Eine Funktion `showMainSpinner()` extrahieren und in beiden Stellen aufrufen.
- **Aufwand:** klein

---

### 2.4 `safeStorage.setItem('dealradar_shop', ...)` in 4 Funktionen wiederholt
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeilen 3271, 3297, 3302, 3312
- **Problem:** `toggleShoppingItem_card()`, `toggleShopItem()`, `removeShopItem()` und `clearShoppingList()` serialisieren und speichern `state.shoppingList` jede für sich. Würde sich der Storage-Key oder Serialisierungsweg ändern, müssten 4 Stellen angepasst werden.
- **Lösung:** Eine private Funktion `persistShoppingList()` extrahieren, die nur den `setItem`-Aufruf kapselt.
- **Aufwand:** klein

---

### 2.5 Inkonsistentes Keyboard-Event-Muster bei Modals
- **Priorität:** NIEDRIG
- **Datei + Zeile:** index.html, Zeilen 3783–3788 vs. 4174
- **Problem:** `openFlipbook()` überschreibt `document.onkeydown` direkt (globales Event-Property), während `openProductModal()` `document.addEventListener('keydown', ...)` nutzt. Unterschiedliche Ansätze für dasselbe UX-Muster können sich gegenseitig stören.
- **Lösung:** Einheitlich `addEventListener`/`removeEventListener` verwenden und den Flipbook-Handler entsprechend umschreiben.
- **Aufwand:** klein

---

## 3. PERFORMANCE

---

### 3.1 AdSense-Skript wird doppelt geladen
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeilen 1727–1728 (hard `<script>` im `<head>`) und Zeile 20–26 (`loadTrackingScripts()`)
- **Problem:** Das `adsbygoogle.js`-Skript steht als statisches `<script async src="...">` direkt im `<head>` und wird *zusätzlich* in `loadTrackingScripts()` dynamisch nachgeladen. Damit wird AdSense **immer** geladen – unabhängig vom Cookie-Consent. Das verletzt die DSGVO-Konformität und belastet die Ladezeit unnötig.
- **Lösung:** Das statische `<script>`-Tag in Zeile 1727–1728 vollständig entfernen. AdSense nur über `loadTrackingScripts()` laden, das korrekt hinter dem Consent-Check steht.
- **Aufwand:** klein

---

### 3.2 Mehrfache redundante `render()`-Aufrufe pro Aktion
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeilen 2557–2561 (`removeFromCart`), 2537–2548 (`addToCart`), 3265–3273 (`toggleShoppingItem_card`)
- **Problem:** `removeFromCart()` ruft `updateCartUI()`, `renderCartDrawer()` und `render()` auf. `render()` selbst ruft aber ohnehin `updateCartUI()` (Zeile 2803) auf – also doppelt. Bei 45 Karten bedeutet ein Warenkorb-Klick drei vollständige DOM-Rebuilds.
- **Lösung:** Redundante Vor-Aufrufe von `updateCartUI()` und `renderCartDrawer()` in Aktionsfunktionen entfernen; alles durch den abschließenden `render()`-Aufruf erledigen lassen.
- **Aufwand:** klein

---

### 3.3 Fehlende `loading="lazy"` auf Angebotsbildern
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeile 2915 (`renderOfferCard`) und Zeile 1916 (`renderProspektSection`)
- **Problem:** Die `<img>`-Tags in den Angebotskarten und Prospekt-Karten haben kein `loading="lazy"`. Bei 45+ Karten werden alle Bilder sofort beim ersten Render angefordert, auch wenn sie weit außerhalb des Viewports liegen.
- **Lösung:** `loading="lazy"` zu allen `<img>`-Tags in `renderOfferCard()` und `renderProspektSection()` hinzufügen. Nur das LCP-Bild (erstes sichtbares Produkt) sollte `loading="eager"` behalten.
- **Aufwand:** klein

---

### 3.4 `document.querySelectorAll()` bei jedem `render()`-Aufruf ungecacht
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeilen 3512 (`updateCategoryChips`), 3554 (`setSortBy`), 3674 (`syncSliders`), 2691 (`selectFreq`)
- **Problem:** Jede dieser Funktionen führt `document.querySelectorAll('.chip')` oder `.sort-chip` durch. Da `render()` bei jeder Nutzerinteraktion aufgerufen wird, akkumulieren sich diese DOM-Queries schnell.
- **Lösung:** Da die betreffenden Elemente statisch im HTML stehen (nicht dynamisch generiert), können die NodeLists bei `DOMContentLoaded` einmalig gecacht werden.
- **Aufwand:** mittel

---

### 3.5 `detectPriceComparisons()` läuft bei jedem `reloadOffers()`
- **Priorität:** NIEDRIG
- **Datei + Zeile:** index.html, Zeilen 2352, 3353–3370
- **Problem:** `detectPriceComparisons()` iteriert über alle Angebote (`O(n²)` durch gruppenweises Vergleichen) und wird bei jedem `reloadOffers()` ausgeführt – auch beim automatischen 6-Stunden-Refresh. Bei wachsender Angebotsmenge skaliert das schlecht.
- **Lösung:** Ergebnis cachen und nur neu berechnen, wenn sich `state.offers` tatsächlich geändert hat (z.B. per Hash-Vergleich oder indem das Ergebnis erst bei Änderung der Offers invalidiert wird).
- **Aufwand:** mittel

---

## 4. WARTBARKEIT

---

### 4.1 Magic Numbers ohne benannte Konstanten
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeilen 2218, 2750, 3187, 3699, 3711, 3833
- **Problem:** Kritische numerische Werte sind direkt im Code verstreut: `5000` (API-Timeout), `2500` (Toast-Anzeigedauer), `6 * 60 * 60 * 1000` (Auto-Refresh-Intervall), `8000` (Loading-Overlay-Fallback), `20` (Standard-Preismaximum, kommt an 3 Stellen vor), `0.005` (Preis-Änderungs-Schwelle). Änderungen erfordern Suche im Code.
- **Lösung:** Konstanten am Dateianfang definieren: `const TOAST_DURATION = 2500`, `const AUTO_REFRESH_INTERVAL = 6 * 60 * 60 * 1000`, `const PRICE_MAX_DEFAULT = 20`, etc.
- **Aufwand:** klein

---

### 4.2 `render()` ist eine monolithische 50-Zeilen-Funktion
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeilen 2762–2812
- **Problem:** `render()` erledigt: Tab-Klassen-Update, Tab-Text-Übersetzung, Favoriten-Badge-Handling, Menü-Labels, Such-Placeholder, Filter-/Category-/Sort-Bar-Visibility, FilterBar-Render, CategoryChips, SavedFilters, CartUI, FavBadge, ShopListBadge und delegiert dann an den Tab-spezifischen Renderer. Das macht die Funktion schwer lesbar und jede Änderung riskant.
- **Lösung:** In logische Teilfunktionen aufteilen, z.B. `updateTabUI()`, `updateVisibility()`, `updateBadges()`. `render()` koordiniert nur noch den Ablauf.
- **Aufwand:** mittel

---

### 4.3 Hartcodierte Angebotsdaten direkt im JavaScript
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeilen 2165–2211 (`buildOffersForWeek`)
- **Problem:** 45 Angebots-Objekte mit allen Feldern (Kette, Name, Kategorie, Preis, Datum, Bild) sind direkt als JavaScript-Literal im Code. Die Funktion muss wöchentlich manuell editiert werden. Dabei ist es leicht, Syntaxfehler einzubauen, die die gesamte App lahmlegen.
- **Lösung:** Daten in eine externe `offers-kw19.json` auslagern und zur Laufzeit über `fetch('/offers/current.json')` laden. Fallback auf eingebettete Defaults wenn fetch schlägt.
- **Aufwand:** mittel

---

### 4.4 `renderOfferCard()` baut HTML per String-Konkatenation ohne Escaping
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeilen 2896–2938
- **Problem:** Die Funktion ist 43 Zeilen lang und baut HTML als Template-Literal-String. Nur `offer.name` wird via `safeAlt` für das `alt`-Attribut escaped – im Elementinhalt (`<div class="offer-name">${nameHtml}</div>`) jedoch nicht systematisch. Zudem ist der String schwer zu lesen und zu debuggen.
- **Lösung:** Zumindest eine `escapeHtml(str)` Hilfsfunktion einführen und konsequent für alle Datenwerte aus `state.offers` nutzen. Mittelfristig auf ein Template-System oder `createElement` umsteigen.
- **Aufwand:** mittel

---

### 4.5 Globaler State inkonsistent verwaltet
- **Priorität:** NIEDRIG
- **Datei + Zeile:** index.html, Zeilen 2744, 3720, 4026, 4132
- **Problem:** Neben dem zentralen `state`-Objekt existieren separate globale Variablen: `toastTimer`, `_audioCtx`, `currentLang`, `modalOfferId`. Einige werden im `state`-Objekt hätten untergebracht werden können (z.B. `state.currentLang`, `state.modalOfferId`). Das erschwert das Nachvollziehen des App-Zustands.
- **Lösung:** `modalOfferId` und `currentLang` in das `state`-Objekt verschieben. `toastTimer` und `_audioCtx` als Modul-Private kapseln (z.B. in ein `ui`-Objekt).
- **Aufwand:** mittel

---

## 5. SICHERHEIT

---

### 5.1 API-Key hardcodiert im öffentlich zugänglichen Frontend-JavaScript
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeile 2222
- **Problem:** Der Marktguru API-Key `wB9MkCNNpJwbKSNBjTCHkTmBIgrR5hfzGEyUPgVp` ist als Klartext im `fetch()`-Aufruf enthalten. Jeder Besucher der Seite kann diesen Key mit Browser-DevTools auslesen und auf dem Marktguru-API-Kontingent des Betreibers beliebige Anfragen stellen. Für den Betreiber kann dies zu unerwarteten Kosten oder Account-Sperrung führen.
- **Lösung:** Den API-Call vollständig hinter die Vercel-Serverless-Function `/api/deals` verlagern (die bereits existiert). Den Key dort als Umgebungsvariable (`MARKTGURU_API_KEY`) hinterlegen. Den direkten Client-seitigen Aufruf in `fetchLiveOffers()` entfernen.
- **Aufwand:** klein

---

### 5.2 `innerHTML` mit nicht-escaped Angebotsnamen in `renderCartDrawer()`
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeilen 2629–2656
- **Problem:** `offer.name` wird ohne HTML-Escaping direkt in den `innerHTML`-String eingebaut (`<div class="cart-item-name">${offer.name}</div>`). Wenn Daten von der Marktguru-API kommen und ein Angebotsname `<img src=x onerror=...>` oder ähnliches enthält, ist Stored-XSS möglich. Dasselbe gilt für `renderShoppingListDrawer()` (Zeile 3328).
- **Lösung:** Eine Funktion `esc(str)` einführen: `str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')` und für alle externen Datenwerte in innerHTML-Strings verwenden.
- **Aufwand:** mittel

---

### 5.3 `successText.innerHTML` mit User-Eingabe ohne Escaping
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeilen 2706–2707
- **Problem:** In `saveProfile()` wird `document.getElementById('successText').innerHTML = ...` gesetzt, wobei `email` direkt aus dem Formularfeld und `chainText` aus verketteten Chain-Namen stammt. Ein Nutzer könnte im E-Mail-Feld `<b>XSS</b>` eingeben und dieser wird gerendert.
- **Lösung:** `textContent` statt `innerHTML` verwenden, oder den String mit der oben genannten `esc()`-Funktion bereinigen. Der `<strong>`-Wrapper kann mit `createElement` erzeugt werden.
- **Aufwand:** klein

---

### 5.4 E-Mail-Validierung in `saveProfile()` unzureichend
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeile 2700
- **Problem:** `!email.includes('@')` validiert nicht wirklich. Eingaben wie `@`, `a@`, `@b` oder `test@` werden als gültig akzeptiert. Da das Profil-Feature Push-Benachrichtigungen triggern soll, führt eine ungültige E-Mail zu stillen Fehlern.
- **Lösung:** Mindestens eine einfache Regex verwenden: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)`. Alternativ das `<input type="email">`-Element nutzen und `input.validity.valid` prüfen.
- **Aufwand:** klein

---

### 5.5 `localStorage`-Zugriff ohne Consent in `acceptCookies()`
- **Priorität:** NIEDRIG
- **Datei + Zeile:** index.html, Zeilen 3167–3173 und 29–31
- **Problem:** `localStorage.getItem('cookieConsent')` wird in Zeile 29 aufgerufen, *bevor* der Nutzer Einwilligung gegeben hat. Das ist für technisch notwendige Cookies zulässig, jedoch werden `dealradar_fav`, `dealradar_shop` und `dealradar_filters` (Zeilen 2308–2310) ebenfalls beim Start aus `localStorage` gelesen – ohne explizite Klassifizierung als „notwendig" in der Datenschutzerklärung.
- **Lösung:** In der Datenschutzerklärung klar benennen, welche `localStorage`-Keys als technisch notwendig gelten. Für nicht-notwendige Daten (z.B. Analytics-Daten) den Zugriff hinter dem Consent-Check platzieren.
- **Aufwand:** mittel

---

## 6. ACCESSIBILITY (a11y)

---

### 6.1 Tab-Navigation mit `<div>` statt semantischen Elementen
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeilen 2007–2011
- **Problem:** Die vier Haupt-Tabs (`Heute`, `Diese Woche`, `Favoriten`, `Prospekte`) sind als `<div onclick="...">` implementiert. Sie sind für Tastatur-Nutzer nicht per Tab-Taste erreichbar, haben keine `role="tab"`, kein `tabindex`, kein `aria-selected`. Screen-Reader können die Tab-Struktur nicht als solche erkennen.
- **Lösung:** Auf `<button role="tab">` mit `aria-selected` umstellen und in ein `<div role="tablist">` einbetten. Die zugehörigen Inhalts-Container mit `role="tabpanel"` und `aria-labelledby` versehen.
- **Aufwand:** mittel

---

### 6.2 Modals fehlen `role="dialog"`, `aria-modal` und Focus-Trap
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeilen 1744, 1784, 1794, 1864
- **Problem:** Alle vier Modal-Overlays (`plzModal`, `kwModal`, `profileModal`, `productModal`) haben weder `role="dialog"`, `aria-modal="true"` noch `aria-labelledby`. Beim Öffnen wird kein Focus in das Modal gesetzt, und der Tab-Fokus kann hinter das Modal wandern. Screen-Reader können das Modal nicht als solches erkennen.
- **Lösung:** `role="dialog" aria-modal="true" aria-labelledby="<heading-id>"` zu den Modal-Containern hinzufügen. In den `open*Modal()`-Funktionen Focus auf das erste focussierbare Element im Modal setzen und einen einfachen Focus-Trap implementieren.
- **Aufwand:** mittel

---

### 6.3 Filter-Chips und Kategorie-Chips ohne Tastatur-Support
- **Priorität:** HOCH
- **Datei + Zeile:** index.html, Zeilen 2814–2843 (`renderFilterBar`) und `updateCategoryChips`
- **Problem:** Dynamisch generierte Filter-Chips (`<div class="chip" onclick="...">`) und Kategorie-Chips haben kein `role="checkbox"` oder `role="button"`, kein `tabindex="0"` und keinen `onkeydown`-Handler. Tastatur-Nutzer können Filter nicht bedienen.
- **Lösung:** `tabindex="0"` und `onkeydown="if(e.key==='Enter'||e.key===' ')this.click()"` zu allen dynamisch erstellten Chip-Elementen hinzufügen. Für toggle-artige Chips `role="checkbox"` mit `aria-checked` verwenden.
- **Aufwand:** mittel

---

### 6.4 Angebotskarten-Bildbereich als klickbares `<div>` ohne ARIA
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeile 2914
- **Problem:** `<div class="offer-img" onclick="openProductModal(...)" style="cursor:pointer" title="...">` ist ein klickbares Div ohne `role="button"`, `tabindex="0"` oder `aria-label`. Screen-Reader ignorieren es, Tastatur-Nutzer können das Produkt-Modal nicht öffnen.
- **Lösung:** Entweder zu einem `<button>` machen oder `role="button" tabindex="0"` und einen `onkeydown`-Handler hinzufügen. Das `title`-Attribut durch `aria-label` ersetzen oder ergänzen.
- **Aufwand:** klein

---

### 6.5 Favoriten-Buttons fehlt `aria-label` und `aria-pressed`
- **Priorität:** MITTEL
- **Datei + Zeile:** index.html, Zeile 2912
- **Problem:** `<button class="fav-btn" onclick="toggleFavorite(...)">` zeigt nur Emoji-Inhalt (`❤️` / `🤍`). Screen-Reader lesen das Emoji vor, aber es fehlt eine verständliche Beschriftung und der Zustand (`aria-pressed`) wird nicht kommuniziert. Ein Nutzer mit Screen-Reader hört nur „Herz-Emoji Button" ohne Kontext.
- **Lösung:** `aria-label="Zu Favoriten hinzufügen"` bzw. `aria-label="Aus Favoriten entfernen"` dynamisch setzen und `aria-pressed="true/false"` bei jedem Toggle aktualisieren.
- **Aufwand:** klein

---

## Zusammenfassung

| Kategorie       | HOCH | MITTEL | NIEDRIG |
|-----------------|------|--------|---------|
| Toter Code      | 2    | 1      | 2       |
| Duplizierter Code | 1  | 3      | 1       |
| Performance     | 2    | 2      | 1       |
| Wartbarkeit     | 2    | 2      | 1       |
| Sicherheit      | 2    | 2      | 1       |
| Accessibility   | 3    | 2      | 0       |
| **Gesamt**      | **12** | **12** | **6** |

### Empfohlene Reihenfolge (Quick Wins zuerst)

1. API-Key aus Frontend entfernen (Sicherheit 5.1) – **5 Minuten, kritisch**
2. AdSense doppeltes Laden fixen (Performance 3.1) – **2 Minuten, DSGVO-relevant**
3. `loadOffersFromAPI()` entfernen (Toter Code 1.1) – **5 Minuten**
4. `loading="lazy"` zu Bildern hinzufügen (Performance 3.3) – **10 Minuten**
5. `esc()` Funktion einführen + in renderCartDrawer/renderShoppingListDrawer nutzen (Sicherheit 5.2) – **30 Minuten**
6. Tabs auf `<button role="tab">` umstellen (a11y 6.1) – **1 Stunde**
7. Magic Numbers durch Konstanten ersetzen (Wartbarkeit 4.1) – **20 Minuten**
8. `fmt()`/`fmtFull()` konsolidieren (Duplizierter Code 2.1) – **20 Minuten**
