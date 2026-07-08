# Filozofia — po co istnieje aimy.bio

**Po co istnieje aimy.bio.** To hołd dla **dr. Jerzego A. Sikory** — polskiego badacza
urodzonego w 1930 r. w Cieszynie, nazywanego ojcem polskiej biorytmiki, autora książki
*Biodiagram prawdę Ci powie* (KAW, 1983) — który opisał biorytmy poprzez dyskretne fazy i
korektę pory urodzenia, zamiast zwykłej ciągłej fali sinusoidalnej. Ta metoda została
odtworzona na podstawie tej właśnie książki i zweryfikowana cyfra po cyfrze względem własnych
przykładów obliczeniowych dr. Sikory — m.in. biorytmu poety Mickiewicza (F22/P15/I1) oraz
dopasowania (biopowinowactwa) Goethe+Schiller (F100/P86/I82). aimy.bio istnieje po to, by tę
pracę utrzymać przy życiu, dostępną i darmową — nie po to, by ją zmonetyzować, i nie po to, by
ją wymyślać na nowo.

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

- **Nie jest komercyjna.** Nie ma tu paywalli, kont ani zbierania danych osobowych po to, by
  budować profil użytkownika czy je sprzedawać. Nic w aimy.bio nie jest sprzedawane, a żadne
  dane odwiedzającego nie są przechwytywane, by sprzedać je później.
- **Nie jest medyczna.** Metoda i aplikacja są praktyką wellness i autorefleksji, a nie
  narzędziem diagnostycznym ani predykcyjnym w sensie medycznym. Jest to zastrzeżone jako
  disclaimer wszędzie tam, gdzie pokazywany jest wynik metody, i jest tu powtórzone
  celowo: traktuj „dzień krytyczny" jako sygnał, by zwrócić uwagę, a nie jako przepowiednię.
- **Nie jest laboratorium do wymyślania algorytmu na nowo.** Matematyka jest kanoniczna, nie
  eksperymentalna. Jest przypięta zestawem testów golden-vector (patrz
  [`data/README.md`](../../data/README.md)) i nie jest „ulepszana" ani nie dryfuje między
  wydaniami — wierność metodzie źródłowej jest tu celem samym w sobie.

## Trzy filary

1. **Wierność metodzie.** Silnik w tym repozytorium jest portem 1:1 kanonicznej
   implementacji, zweryfikowanym względem 741 wektorów fazowych Sikory i 211 wektorów
   zgodności BioMatch. Fala sinusoidalna, którą można zobaczyć na wykresie, jest jedynie
   wizualnym udogodnieniem — nigdy nie zastępuje dyskretnych symboli fazowych metody jako
   źródła prawdy o danym dniu.
2. **Prywatność wbudowana w architekturę.** Profile żyją wyłącznie w pamięci lokalnej
   przeglądarki (localStorage). Zadaniem serwera jest podawanie plików statycznych; Twoje
   profile nigdy nie opuszczają przeglądarki — nie ma tu systemu kont ani bazy danych
   osobowych do wycieku, bo żadna z nich nie istnieje.
3. **Spokojny, autentyczny charakter.** Idea przewodnia stojąca zarówno za ujęciem metody,
   jak i za projektem aplikacji, jest prosta: po dołku zawsze przyjdzie górka. Interfejs
   odzwierciedla to spokojną, wellnessową paletą zieleni, odręcznym krojem akcentowym, brakiem
   emoji i brakiem dark patterns — nic tu nie jest zaprojektowane, by straszyć, uzależniać czy
   manipulować.

## Dlaczego open source

Otwarcie metody i silnika referencyjnego zamienia obietnicę w coś, co można samemu sprawdzić.
Silnik to czysta matematyka — każdy może przeczytać każdą linijkę i potwierdzić, że nie
wykonuje żadnych połączeń sieciowych i nic nie wysyła; w aplikacji Twoje profile żyją
wyłącznie w Twojej przeglądarce. (To, jak hostowana strona obchodzi się z danymi — analityka
bez ciasteczek i szanująca prywatność, dobrowolny anonimowy agregat badawczy oraz
przetwarzanie IP przez dostawców hostingu/CDN — opisuje polityka prywatności na aimy.bio:
https://aimy.bio.) Otwartość pozwala też każdemu zweryfikować hołd i na nim budować, zamiast
przyjmować go na wiarę, a wymóg atrybucji CC BY sprawia, że link do pracy dr. Sikory jedzie z
każdym forkiem i cytatem.

Otwierając ten kod, niewiele tracimy: kod statycznej aplikacji po stronie klienta i tak jest
trywialnie łatwy do skopiowania. Przewagą nigdy nie była tajność — jest nią wierność metodzie
i zaufanie, które ta wierność buduje.

---
Część projektu **aimy.bio** — darmowy, privacy-first hołd dla pracy dr. Jerzego Sikory. Na żywo: https://aimy.bio

Dokumentacja na licencji CC BY 4.0 · silnik referencyjny na licencji MIT.
