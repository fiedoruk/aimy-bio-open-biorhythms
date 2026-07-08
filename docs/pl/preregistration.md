<!-- Publiczna pre-rejestracja (Faza 0) programu walidacji dyskretnej metody biorytmów dr. Sikory
     dla aimy.bio. Zamrożona i zarejestrowana z timestampem PRZED zebraniem jakichkolwiek danych. -->

# Pre-rejestracja: oddolny test dyskretnej metody biorytmów dr. Sikory

**Status:** ZAREJESTROWANA publicznie 2026-07-08 (Faza 0), PRZED zebraniem jakichkolwiek danych.
Plan analizy jest od tej chwili WIĄŻĄCY (zero p-hackingu) — korekta po fakcie zniszczyłaby wartość pre-rejestracji.
*Sprostowanie 2026-07-08 (przed zebraniem danych): doprecyzowano status Fazy 2 (opt-in dostępny, nie „dormant") i sformułowanie o wieku (nota „dla dorosłych" jest w opt-inie apki) — bez zmian hipotez i planu analizy.*

## 1. Tło i cel

Klasyczny (sinusoidalny) model biorytmów jest w literaturze uznawany za niepotwierdzony
(np. Hines 1998 — przegląd ~134 badań, brak efektu). Dyskretna metoda dr. Jerzego Sikory
(fazy +/−/X/0, korekta godziny urodzenia) **nie była dotąd publicznie testowana**. Cel: uczciwie
oszacować, czy istnieje JAKAKOLWIEK powtarzalna zależność między fazą cyklu a samooceną stanu —
metodą oddolną, anonimową, z góry zarejestrowaną. **Hipoteza domyślna = brak efektu (H0).**

## 2. Hipotezy (falsyfikowalne, zamrożone)

- **H1 — dni krytyczne:** średnia samoocena (energia/nastrój/skupienie) w dni krytyczne (X)
  danego cyklu jest **niższa** niż w dni „wyż" (+) tego cyklu, o efekt większy niż w modelu
  losowym (permutacyjnym).
- **H2 — faza ↔ stan (w obrębie osoby):** istnieje dodatnia korelacja między wartością fazy
  cyklu fizycznego a samooceną energii (analogicznie: emocjonalny↔nastrój, intelektualny↔skupienie).
- **H0 (domyślna):** rozkłady efektów nie różnią się od modelu losowego. Obalamy tylko realnym,
  powtarzalnym efektem o z góry ustalonej minimalnej wielkości.

## 3. Pomiar (operacjonalizacja)

- **Codzienna samoocena (przed odsłonięciem wykresu — patrz §4):** ZAMROŻONE — 3 pozycje, skala 1–5
  (1 = bardzo nisko, 5 = bardzo wysoko), mapujące się 1:1 na trzy cykle:
  - **Energia** (fizyczne: siła/wytrzymałość) → cykl fizyczny (23 dni)
  - **Nastrój** (samopoczucie/wrażliwość) → cykl emocjonalny (28 dni)
  - **Skupienie** (koncentracja/jasność myśli) → cykl intelektualny (33 dni)
  Bez pozycji całościowej i bez notatek tekstowych (minimalizacja + brak ryzyka PII w treści).
- **Faza (liczona lokalnie z silnika `engine.js`):** dla każdego cyklu stan {+, −, X, 0} oraz
  wartość ciągła fazy. Data urodzenia służy TYLKO do lokalnego wyliczenia — nie opuszcza urządzenia.
- Jednostka analizy: para (faza danego cyklu danego dnia, odpowiednia samoocena), w obrębie osoby.

## 4. Projekt badania i kontrola obciążeń (krytyczne)

- **Zaślepienie (blinding):** użytkownik wypełnia ocenę dnia ZANIM zobaczy wykres/fazę na ten
  dzień (tryb „ślepy dziennik"). Eliminuje potwierdzanie tezy — najważniejszy mechanizm wiarygodności.
- **Model null (permutacyjny):** dla każdej osoby przetasowujemy etykiety faz względem ocen
  (≥1000 permutacji) i budujemy rozkład „efektu losowego"; realny efekt porównujemy do tego rozkładu.
- **N-of-1 + meta:** najpierw statystyka w obrębie osoby (każde urządzenie liczy własną), potem
  meta-analiza rozkładu efektów między osobami (patrz §5 — edge analytics).
- **Kryteria włączenia (z góry):** przeznaczone dla osób dorosłych (opt-in Fazy 2 zawiera notę „tylko dla dorosłych"; wieku ani tożsamości nie zbieramy — badanie anonimowe); min. 30 dni
  z oceną na osobę; wykluczenie „stałej oceny" (np. ta sama liczba ≥95% dni — brak wariancji);
  wykluczenie < 1 pełnego cyklu (33 dni).

## 5. Dane i prywatność (anonymous by design)

- Statystyki liczone **na urządzeniu** (federacyjnie). Wychodzi WYŁĄCZNIE wynik zbiorczy:
  per-osoba współczynniki efektu (np. r faza↔ocena dla 3 cykli; różnica X vs +) **+ N dni**.
- **Nie wychodzą:** data urodzenia, surowy dziennik, imię, żaden trwały identyfikator.
- Wysyłka jednorazowa; agregat **zaprojektowany jako anonimowy** — po stronie serwera nie da się go
  powiązać z osobą (spójne z podejściem relatywnym TSUE, C-413/23 P, EDPS v SRB, 4.09.2025: dane
  nieodwracalne dla odbiorcy). Surowe samooceny i data urodzenia — z których liczone są współczynniki —
  **nigdy nie opuszczają urządzenia** i pozostają objęte polityką prywatności oraz zgodą użytkownika.
  Gdyby mimo to zagregowane współczynniki uznano za dane osobowe, podstawą przetwarzania jest **zgoda
  (art. 6 ust. 1 lit. a RODO)**, a dla ewentualnej kategorii szczególnej — **zgoda wyraźna (art. 9
  ust. 2 lit. a)** lub **cele badań naukowych (art. 9 ust. 2 lit. j)** z zabezpieczeniami art. 89.
- Włączenie wyłącznie na wyraźne, świadome działanie (podwójny opt-in, domyślnie wyłączone). Użytkownik
  w każdej chwili może **wyłączyć wysyłkę na przyszłość**. Uwaga: pojedynczej, już wysłanej porcji
  anonimowej nie da się wycofać — właśnie dlatego, że jest nie-linkowalna (brak identyfikatora, po
  którym można by ją odnaleźć); ten fakt jest komunikowany przed wyrażeniem zgody.

## 6. Plan analizy (zamrożony)

- Główna miara H1: standaryzowana różnica średnich (Cohen's d) ocena[+] − ocena[X], per cykl.
- Główna miara H2: r (lub rho) faza↔ocena, per cykl, per osoba.
- Agregacja: rozkład efektów + meta-średnia ważona N; **przedziały ufności**, nie tylko p.
- **Korekta wielokrotnych porównań** (3 cykle × 3 oceny): Benjamini–Hochberg (FDR).
- **Próg sensowności (z góry):** |d| ≥ 0.2 lub |r| ≥ 0.1 ORAZ przewaga nad modelem null
  (realny efekt poza 95% rozkładu permutacyjnego). Poniżej = wynik zgodny z H0.

## 7. Reguła decyzyjna i publikacja

- Publikujemy wynik (także null) **pod warunkiem zebrania minimalnej próby (§11.1)**; poniżej progu —
  publikujemy jawnie **status pilotażu** (bez wniosków), zamiast milczeć. Zobowiązanie z góry.
- Otwarcie: anonimowy zbiór zagregowany + kod analizy (repo) → raport na blogu + ew. preprint.
- Wynik null jest pełnoprawnym wynikiem — wzmacnia wiarygodność („testujemy uczciwie").

## 8. Etyka / RODO

- Badanie przeznaczone dla osób dorosłych — opt-in Fazy 2 („udostępnij anonimowo") zawiera notę
  „tylko dla dorosłych", więc włączając udostępnianie użytkownik potwierdza pełnoletność; wieku ani
  tożsamości nie zbieramy. Jasna informacja przed zgodą. **Do transmisji nie trafiają żadne surowe oceny ani dane o samopoczuciu — wyłącznie
  zagregowane współczynniki korelacji, które nie stanowią danych o zdrowiu.** Surowe samooceny (mogące
  być traktowane jako dane o stanie samopoczucia w rozumieniu art. 9 RODO) **pozostają wyłącznie na
  urządzeniu** i nie są przez nas przetwarzane. Charakter narzędzia jest **wellness/autorefleksyjny,
  nie medyczny.**
- **Ocena prawna (RODO) wykonana przed uruchomieniem zbierania danych** (recenzja Legal Advisor,
  2026-07-07; ostateczne brzmienie klauzul podstawy prawnej + granica wieku art. 8 uodo do potwierdzenia
  z radcą prawnym przed skalowaniem). Sekcja prywatności na stronie = prawda 1:1.

## 9. Zależności do kolejnych faz (poza Fazą 0)

- **Faza 1 (apka):** tryb „ślepy dziennik" (ocena przed wykresem), localStorage, N-of-1 lokalnie.
- **Faza 2 (backend):** wąski, opt-in endpoint na anonimowe agregaty — **wymaga decyzji infra
  (gdzie/host) + przeglądu Legal/RODO**. Świadomy wyjątek od zasady „zero-backend".
- **Faza 3:** analiza + otwarte dane + publikacja.

## 10. Decyzje zamrożone (2026-06-15) — wcześniej otwarte pytania

Rozstrzygnięte z góry wg najlepszych praktyk badawczych:

1. **Skala (§3) — ZAMROŻONA:** 3 pozycje (Energia / Nastrój / Skupienie), 1–5, mapujące się na
   3 cykle. Brzmienie spójne w 8 językach (klucze i18n — patrz spec Fazy 1).
2. **Częstotliwość wysyłki agregatu (Faza 2):** liczone na urządzeniu; wysyłka na kamieniach
   milowych **30 / 90 / 180 dni** (maks. 3 razy). Każda wysyłka = współczynniki per cykl
   (d dla X vs +, r faza↔ocena) + N dni + zgrubne meta (wersja apki, bucket języka). Cap 180 dni.
3. **Host endpointu (Faza 2) — dedykowany serwer na własnej infrastrukturze, NIE hosting współdzielony.**
   Uzasadnienie: pełna kontrola (rate-limit, hardening, rotacja), izolacja od statycznego produkcyjnego
   frontendu. **Apka pozostaje statyczna (frontend nietknięty);** zasadę „zero-backend" luzujemy WYŁĄCZNIE
   na wydzielonym, opt-in endpointcie (`research.aimy.bio`, CORS dla `aimy.bio`, tylko POST anonimowego agregatu).
4. **Identyfikator — BRAK trwałego ID w transmisji.** Urządzenie trzyma lokalny salt (NIGDY nie
   wysyłany) tylko do własnej ciągłości N-of-1; każda wysyłka ma jedynie losowy nonce (nie-linkowalny),
   by uniknąć podwójnego liczenia. Anonimowe z założenia (nie-linkowalne po stronie serwera); traktujemy je jako **dane anonimowe**, a gdyby uznano je za osobowe — podstawą jest **zgoda (art. 6 ust. 1 lit. a RODO)**. Świadomy koszt: brak analizy
   longitudinalnej cross-send po stronie serwera (within-person liczone lokalnie, wysyłane jako gotowy
   współczynnik) — akceptowalny, bo to właśnie chroni anonimowość.

Po recenzji Legal (przed Fazą 2) → publiczna pre-rejestracja z timestampem (OSF/GitHub).

## 11. Kryteria przejścia faz + interpretacja wyniku (2026-06-15, audyt)

Zamrożone PRZED zbieraniem danych — korekta po fakcie zniszczyłaby wartość pre-rejestracji.

1. **Kryterium przejścia Faza 1 → Faza 2 (zbieranie agregatu ma sens):** zbieranie Fazy 2 rusza
   wyłącznie na świadomy podwójny opt-in użytkownika (domyślnie OFF; dostępny kill-switch `RESEARCH_ENDPOINT=null` do natychmiastowego wyłączenia).
   Próg orientacyjny do **realnej analizy** (Faza 3): **≥ 50 niezależnych zgłoszeń** na kamieniu
   milowym (most pierwszy: 30 dni). Poniżej — dane traktujemy jako pilotaż, nie publikujemy wniosków.
2. **Moc statystyczna a długość (uczciwość N-of-1):** 30 dni = ~1 cykl fizyczny (23) i <1 emocjonalny
   (28). Within-person Cohen d/r z 30 dni ma **szerokie przedziały ufności — niestabilny na poziomie
   osoby**. Dlatego: **Faza 1 (ślepy dziennik) = narzędzie AUTOREFLEKSJI dla użytkownika, NIE dowód.**
   Wiarygodność rośnie z meta-analizą między osobami (Faza 3) i z dłuższymi seriami (90/180 dni).
   **Komunikacja MUSI rozdzielać:** „Twoje wzorce" (Faza 1, prywatne, orientacyjne) od „wspólnego
   wyniku" (Faza 2/3, populacyjne). Nie obiecujemy naukowej odpowiedzi na poziomie osoby z 30 dni.
3. **Narracja na wynik NULL (zamrożona — null jest najbardziej prawdopodobny wg literatury):**
   - Publikujemy null jako pełnoprawny wynik (zobowiązanie z §7). Wartość = **rzetelność, nie kierunek**.
   - **Hołd PRZEZ uczciwość:** „byliśmy pierwsi, którzy *otwarcie* sprawdzili dyskretną metodę Sikory" —
     to większy szacunek niż bezkrytyczne powtarzanie. Wierność metodzie (port 1:1, golden-vectory)
     dotyczy *rekonstrukcji* tego, co opisał Sikora — niezależnie od tego, czy efekt istnieje.
   - **Wartość narzędzia jest niezależna od korelacji:** jak dziennik czy rytuał uważności — codzienna
     szczera samoocena bywa warta więcej niż jakikolwiek współczynnik. To mówimy wprost (już w treści
     artykułu „otwarte badanie" + sekcja prywatności), więc null nie podważa sensu apki.
   - Apka pozostaje **darmowa i privacy-first niezależnie od wyniku** — nie ma zachęty do naciągania.
