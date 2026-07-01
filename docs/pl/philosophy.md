# Filozofia — po co istnieje aimy.bio

**Po co istnieje aimy.bio.** aimy.bio to internetowy hołd dla pracy **dr. Jerzego Sikory** nad
opisywaniem biorytmów za pomocą dyskretnych faz i korekty pory urodzenia, zamiast zwykłej
ciągłej fali sinusoidalnej. Ta metoda została odtworzona na podstawie oryginalnych wydruków
referencyjnych dr. Sikory z lat **1983, 2000 i 2001** i zweryfikowana względem nich cyfra po
cyfrze. aimy.bio istnieje po to, by tę pracę utrzymać przy życiu, dostępną i darmową — nie po
to, by ją zmonetyzować, i nie po to, by ją wymyślać na nowo.

## Czym jest

aimy.bio to darmowa aplikacja webowa zbudowana na metodzie opisanej w
[`docs/pl/method.md`](./method.md):

- trzy cykle — fizyczny (23 dni), psychiczno-emocjonalny (28 dni), intelektualny (33 dni);
- wyszukiwanie dni kluczowych (najbliższy dzień krytyczny lub zerowy dla każdego cyklu);
- widok kalendarza;
- do dziesięciu profili przechowywanych lokalnie, dzięki czemu gospodarstwo domowe lub rodzina
  może śledzić wszystkich z jednej przeglądarki;
- widok rodzinny, by zobaczyć kilka profili obok siebie;
- BioMatch, wskaźnik zgodności partnerskiej zbudowany na tych samych cyklach;
- dostępna w ośmiu językach;
- pełną funkcjonalność offline jako instalowalna aplikacja PWA.

## Czym NIE jest

- **Nie jest komercyjna.** Nie ma tu paywalli, kont użytkowników ani zbierania danych
  osobowych. Nic w aimy.bio nie jest sprzedawane, a żadne dane odwiedzającego nie są
  przechwytywane, by sprzedać je później.
- **Nie jest medyczna.** Metoda i aplikacja są praktyką wellness i autorefleksji, a nie
  narzędziem diagnostycznym ani predykcyjnym w sensie medycznym. Jest to zastrzeżone jako
  disclaimer wszędzie tam, gdzie pokazywany jest wynik metody, i jest tu powtórzone
  celowo: traktuj „dzień krytyczny" jako sygnał, by zwrócić uwagę, a nie jako przepowiednię.
- **Nie jest laboratorium do wymyślania algorytmu na nowo.** Matematyka jest kanoniczna, nie
  eksperymentalna. Jest przypięta zestawem testów golden-vector (patrz
  [`data/README.md`](../data/README.md)) i nie jest „ulepszana" ani nie dryfuje między
  wydaniami — wierność metodzie źródłowej jest tu celem samym w sobie.

## Trzy filary

1. **Wierność metodzie.** Silnik w tym repozytorium jest portem 1:1 kanonicznej
   implementacji, zweryfikowanym względem 663 wektorów fazowych Sikory i 86 wektorów
   zgodności BioMatch. Fala sinusoidalna, którą można zobaczyć na wykresie, jest jedynie
   wizualnym udogodnieniem — nigdy nie zastępuje dyskretnych symboli fazowych metody jako
   źródła prawdy o danym dniu.
2. **Prywatność wbudowana w architekturę.** Profile żyją wyłącznie w pamięci lokalnej
   przeglądarki (localStorage). Zadaniem serwera jest wyłącznie serwowanie plików
   statycznych, nic więcej — nie ma tu systemu kont ani bazy danych osobowych do wycieku,
   bo żadna z nich nie istnieje.
3. **Spokojny, autentyczny charakter.** Idea przewodnia stojąca zarówno za ujęciem metody,
   jak i za projektem aplikacji, jest prosta: po dołku zawsze przyjdzie górka. Interfejs
   odzwierciedla to spokojną, wellnessową paletą zieleni, odręcznym krojem akcentowym, brakiem
   emoji i brakiem dark patterns — nic tu nie jest zaprojektowane, by straszyć, uzależniać czy
   manipulować.

## Dlaczego open source

To repozytorium istnieje z powodu uczciwej obserwacji dotyczącej samej aplikacji: kod
statycznej aplikacji działającej po stronie klienta jest trywialnie łatwy do skopiowania przez
każdego, kto tego zechce. Zamiast traktować to jako zagrożenie, ten projekt zamienia to w atut.

Otwarcie specyfikacji metody i silnika referencyjnego daje odwiedzającym coś bardziej
przekonującego niż deklarację: **dowód możliwy do sprawdzenia obietnicy prywatności** — każdy
może przeczytać każdą linijkę silnika i samodzielnie potwierdzić, że żadne dane osobowe nigdzie
nie są przesyłane. To także zamienia sam hołd w coś, co społeczność może zweryfikować i na czym
może budować, a nie musi przyjmować na wiarę. Wymóg atrybucji licencji CC BY oznacza, że każde
cytowanie, fork czy dzieło pochodne niesie ze sobą link z powrotem do domu — do źródła metody i
do pracy dr. Sikory.

Fosą obronną nigdy nie była tajność kodu. Jest nią wierność metodzie i zaufanie, które ta
wierność buduje.

---
Część projektu **aimy.bio** — darmowy, privacy-first hołd dla pracy dr. Jerzego Sikory. Na żywo: https://aimy.bio

Dokumentacja na licencji CC BY 4.0 · silnik referencyjny na licencji MIT.
