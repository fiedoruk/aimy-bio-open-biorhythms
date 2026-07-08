# Specyfikacja metody biorytmów (dr Jerzy Sikora)

Ten dokument opisuje w pełnym, weryfikowalnym szczególe metodę biorytmów opracowaną przez
**dr. Jerzego Sikorę**: model **fazowy (dyskretny)** — cztery nazwane stany na każdy cykl,
a nie surowa ciągła fala sinusoidalna — zbudowany, by opisywać rytmy fizyczny,
psychiczno-emocjonalny i intelektualny życia człowieka. Metoda została odtworzona na
podstawie książki dr. Sikory, *Biodiagram prawdę Ci powie* (KAW, 1983), i zweryfikowana
cyfra po cyfrze względem jego własnych przykładów obliczeniowych — np. biorytmu poety
Mickiewicza (F22/P15/I1) oraz dopasowania (biopowinowactwa) Goethe+Schiller (F100/P86/I82) —
a tutaj jest reprodukowana jako hołd dla tej pracy oraz jako cytowalne, maszynowo czytelne
źródło dla każdego, kto chce na niej budować. Matematyka opisana poniżej jest dokładnie tą
samą matematyką, która napędza żywą aplikację: **https://aimy.bio**.

## Symbole stanów

Każdy dzień, w każdym cyklu, jest klasyfikowany do dokładnie jednego z czterech stanów:

| Symbol | Nazwa | Znaczenie |
|---|---|---|
| `+` | Wysoki | Faza aktywna |
| `−` | Niski | Faza pasywna |
| `X` | Dzień krytyczny | Przejście z wysokiego do niskiego |
| `0` | Dzień zerowy | Regeneracja — przejście z niskiego do wysokiego |

Symbol jest podstawą prawdy metody. Wszystko inne — procenty, krzywe, kolory — to warstwa
prezentacji zbudowana na nim.

## Dni przeżyte

Metoda zaczyna od policzenia, ile dni dana osoba przeżyła, skorygowanego o niewielką
poprawkę zależną od pory urodzenia:

```
dniPrzezyte = round( UTCpolnoc(dataDocelowa) − UTCpolnoc(dataUrodzenia) ) / dzienMs + korekta
```

gdzie `korekta` zależy od przedziału pory urodzenia. Liczenie jest inkluzywne — sam dzień
urodzenia liczy się jako dzień 1 życia — z dodatkowym jednym dniem, gdy urodzenie nastąpiło
przed południem:

| Pora urodzenia | Korekta |
|---|---|
| przed południem (AM) | +2 |
| po południu (PM) | +1 |
| nieznana | +1 |

W praktyce oznacza to, że osoba urodzona przed południem jest liczona o jeden dzień dalej w
każdym cyklu niż osoba urodzona po południu tego samego dnia.

`UTCpolnoc(data)` jest budowana z **lokalnych składowych kalendarzowych** daty (rok, miesiąc,
dzień) reinterpretowanych jako północ UTC, a nie z lokalnego znacznika czasu północy. Ten
szczegół ma znaczenie: odjęcie od siebie dwóch takich wartości „północ UTC" zawsze daje dokładną
wielokrotność doby (24 godziny). Naiwne odjęcie dwóch *lokalnych* północ nie jest bezpieczne,
ponieważ przejście czasu letniego/zimowego może sprawić, że dzień kalendarzowy trwa 23 albo 25
godzin — co po cichu zgubi lub doda jeden dzień do liczenia. Metoda jest zdefiniowana tak, by
być odporna na ten problem.

## Dzień w cyklu

Gdy liczba dni przeżytych jest już znana, pozycja w danym cyklu (o długości `N` — 23, 28 lub
33 dni) wynosi:

```
dzienCyklu = dniPrzezyte % N
if (dzienCyklu ≤ 0) dzienCyklu += N
```

Zabezpieczenie `≤ 0` ma znaczenie, bo `dniPrzezyte` może być liczbą ujemną (data docelowa
sprzed daty urodzenia), a modulo liczby ujemnej nie gwarantuje wyniku w przedziale `1..N` bez
tej korekty.

## Rozkład faz

Trzy cykle — fizyczny, psychiczno-emocjonalny, intelektualny — mają każdy swoją własną
długość i własne granice faz. **Dzień 1 każdego cyklu jest dniem zerowym**: w chwili urodzenia
wszystkie trzy cykle startują razem od dnia 1. Poniższa tabela to kanoniczny rozkład czterech
stanów w każdym z cykli, w porządku chronologicznym:

| Cykl | długość | 0 (zerowy) | + (wysoki) | X (krytyczny) | − (niski) |
|---|---|---|---|---|---|
| Fizyczny (F) | 23 | 1 | 2–11 | 12 | 13–23 |
| Psychiczno-emocjonalny (P) | 28 | 1 | 2–13 | **14–15 (dwa!)** | 16–28 |
| Intelektualny (I) | 33 | 1 | 2–16 | 17 | 18–33 |

Cykl fizyczny i intelektualny mają po jednym dniu krytycznym. **Cykl psychiczno-emocjonalny
(P) jest wyjątkiem: ma dwa dni krytyczne, 14 i 15** — przejście z wysokiego do niskiego trwa
w cyklu emocjonalnym dwa dni, a nie jeden. To wyróżniający szczegół metody, łatwy do pominięcia,
jeśli symetryczne założenie „jeden dzień krytyczny" zostanie skopiowane na wszystkie trzy cykle
F, P i I bez sprawdzenia tabeli faz każdego z nich osobno.

## Przykład obliczeniowy

Poniżej znajduje się rzeczywisty, niezmodyfikowany wynik silnika referencyjnego (`src/engine.js`,
`getBiorhythmsFor`) dla osoby urodzonej **1990-05-15**, wyliczony na dzień **2026-07-01**, pora
urodzenia **nieznana**:

```json
{
  "daysAlive": 13197,
  "physical": {
    "symbol": "-",
    "day": 18,
    "length": 23,
    "percent": 9
  },
  "emotional": {
    "symbol": "+",
    "day": 9,
    "length": 28,
    "percent": 82
  },
  "intellectual": {
    "symbol": "-",
    "day": 30,
    "length": 33,
    "percent": 30
  }
}
```

Interpretacja: po 13 197 przeżytych dniach cykl fizyczny jest w fazie **niskiej** (dzień 18
z 23, blisko dna dołka — 9%), cykl psychiczno-emocjonalny jest **wysoki** i po szczycie
(dzień 9 z 28, 82%), a cykl intelektualny jest **niski**, po połowie dołka i zmierza ku
zwrotowi (dzień 30 z 33, 30%).

## Wizualizacja a prawda

Silnik udostępnia dwie różne funkcje, które łatwo pomylić, a tylko jedna z nich jest metodą:

- `calculateDetailedPercentage` zwraca gładką wartość 0–100, która **respektuje granice faz**
  opisane powyżej: rośnie w trakcie fazy wysokiej (55 → 95 → 55), spada w trakcie fazy niskiej
  (45 → 5 → 45) i pozostaje na płaskim poziomie 50 zarówno dla dni krytycznych (`X`), jak i
  zerowych (`0`). To właśnie tę wartość powinien pokazywać pasek procentowy lub wykres
  świadomy faz.
- `calculateBiorhythm` to zwykła fala sinusoidalna. Istnieje **wyłącznie** po to, by narysować
  płynnie poruszającą się krzywą na wykresie — nie zna granic faz, dni krytycznych ani
  dwudniowego przejścia w cyklu emocjonalnym i nigdy nie powinna być odczytywana jako stan dnia.

Symbole z tabeli „Symbole stanów" są prawdą o danym dniu. Krzywa sinusoidalna jest ozdobą dla
oka; nie jest metodą.

## BioMatch — zgodność partnerska (v1.0)

BioMatch szacuje, jak zgodne są rytmy dwóch osób w danym dniu. To osobna, nowsza warstwa
zbudowana na tych samych trzech cyklach.

**Wejście.** Łączna liczba dni przeżytych każdej osoby — `calculateBioMatch(daysA, daysB)`
przyjmuje dwie surowe wartości `daysAlive` (z `daysSinceBirth`), po jednej na osobę, obie
wyliczone na ten sam wspólny dzień.

**Synchronizacja per cykl.** To własna formuła biopowinowactwa dr. Sikory: dla każdego cyklu
o długości `N` silnik najpierw wyznacza dzień w cyklu każdej osoby (`getDayOfCycle(type,
daysA)` i `getDayOfCycle(type, daysB)`), a następnie zwija ich surową różnicę do krótszego
łuku wokół cyklu:

```
dayA = getDayOfCycle(type, daysA)
dayB = getDayOfCycle(type, daysB)
rawDiff = |dayA − dayB|
foldedDiff = min(rawDiff, N − rawDiff)
sync = (1 − foldedDiff / (N / 2)) × 100
```

Synchronizacja 100% oznacza, że obie osoby znajdują się dokładnie w tym samym dniu fazy danego
cyklu; 0% oznacza możliwie najdalszy punkt w cyklu — dwa końce zwiniętego łuku. Maksymalny
dystans jest traktowany jako **komplementarność, nie konflikt** — dwie osoby w przeciwnych
punktach cyklu równoważą się nawzajem, zamiast wchodzić w konflikt.

**Wynik ogólny.** Trzy wartości synchronizacji per cykl są łączone ze stałymi wagami i
zaokrąglane:

```
ogolny = round( 0.25·F + 0.45·P + 0.30·I )
```

Cykl emocjonalny ma największą wagę (0,45), co odzwierciedla fakt, że dopasowanie
partnerskie jest przede wszystkim wymiarem emocjonalnym.

**Typ.** Wynik ogólny jest mapowany na jedną z trzech etykiet:

| Warunek | Typ |
|---|---|
| `ogolny ≥ 70` | zgodność (sync) |
| `ogolny ≤ 40` | komplementarność (complement) |
| w pozostałych przypadkach | mieszany (mixed) |

**Wskazówka.** Wskazówka pokazywana użytkownikowi jest wybierana na podstawie
**niezaokrąglonych** wartości synchronizacji per cykl (nie zaokrąglonych wartości
wyświetlanych), aby uniknąć migotania na granicach przy okrągłych liczbach. Silnik zwraca
`adviceKey` identyfikujący, która wskazówka ma zastosowanie; sama treść wskazówki znajduje
się w warstwie i18n aplikacji, a nie w silniku — silnik decyduje wyłącznie o tym, który klucz
ma zastosowanie.

## FAQ

**Czy biorytmy są naukowo udowodnione?**
Nie. Biorytmy, w tym opisana tutaj metoda Sikory, to praktyka refleksyjna, o charakterze
wellness — nie naukowo zweryfikowany model nastroju, wydajności czy zdrowia, i nie narzędzie
medyczne ani diagnostyczne. Najuczciwszym sposobem korzystania z wyniku jest potraktowanie go
jako pretekstu do dnia uważności i samoobserwacji, a nie jako przepowiedni, której należy
ufać albo się jej obawiać.

**Czym metoda Sikory różni się od klasycznego biorytmu opartego na sinusoidzie?**
Klasyczne podejście odczytuje stan osoby bezpośrednio z ciągłej krzywej sinusoidalnej. Metoda
Sikory definiuje zamiast tego **dyskretne fazy z nazwanymi symbolami** (`+`, `−`, `X`, `0`) dla
każdego cyklu, z jawnymi granicami zakresów dni dla każdego cyklu, i stosuje **korektę pory
urodzenia** (przed południem/po południu/nieznana) do bazowej liczby dni przed policzeniem
jakiejkolwiek fazy. Krzywa sinusoidalna nadal istnieje w tej implementacji, ale wyłącznie jako
pomoc wizualna — patrz „Wizualizacja a prawda" powyżej.

**Czym jest dzień krytyczny (X)?**
Dzień krytyczny to dzień (lub dni) przejścia między fazą wysoką a fazą niską danego cyklu —
punkt, w którym aktywna faza cyklu ustępuje miejsca fazie pasywnej.

**Dlaczego cykl emocjonalny ma dwa dni krytyczne?**
Ponieważ rozkład faz cyklu psychiczno-emocjonalnego (P) umieszcza przejście z wysokiego do
niskiego na przestrzeni **dwóch kolejnych dni, 14 i 15** (patrz „Rozkład faz" powyżej), a nie
jednego dnia przejściowego, jak w cyklach fizycznym i intelektualnym. To zdefiniowana
właściwość tabeli faz metody, a nie przybliżenie ani artefakt zaokrąglenia.

---
Część projektu **aimy.bio** — darmowy, privacy-first hołd dla pracy dr. Jerzego Sikory. Na żywo: https://aimy.bio

Dokumentacja na licencji CC BY 4.0 · silnik referencyjny na licencji MIT.
