# Audyt mobilny — 29.09.2026

## Zakres i ograniczenia

Docelowy telefon: iPhone 16. Punkty odniesienia do późniejszego sprawdzenia układu: 393 × 852 CSS px (pion) i 852 × 393 (poziom), Safari i aplikacja dodana do ekranu początkowego.

**Nie wykonano testu na fizycznym iPhonie ani testu wizualnego w emulatorze.** Próba uruchomienia przeglądarki została zablokowana przez automatyczną kontrolę: wyczerpany limit narzędzia. Nie obchodzono blokady inną przeglądarką ani automatyzacją. Poniższe wyniki pochodzą z przeglądu kodu, testów jednostkowych i budowania aplikacji. Nie prowadzono badań z użytkownikami; oceny użyteczności są oceną projektową, a nie zebranymi preferencjami użytkowników.

## Problemy stwierdzone w kodzie i poprawki

- Dolne menu miało animowane skalowanie aktywnej pozycji, transformację całego paska oraz ułamkowe odsunięcie od safe area. Zastąpiono to pełnym, nieruchomym paskiem, bez skalowania i animowania geometrii.
- Menu znikało na ekranie formularza. Teraz ma stałe trzy pozycje, również w formularzach i imporcie. Chowane jest tylko po wykryciu klawiatury zasłaniającej ekran; nie przesuwa się nad nią. Ukrycie nie zmienia paddingu treści.
- Każde przejście zerowało pozycję przewijania, także powrót do listy. Nawigacja zapamiętuje pozycję dla widoku i obsługuje adresy oraz Wstecz/Dalej przeglądarki. Ponowne kliknięcie aktywnej pozycji niczego nie przesuwa.
- Przełączanie Teraz / Plan / Historia usuwało formularze z DOM, tracąc wpisany, niezapisany tekst. Panele pozostają zamontowane i są ukrywane. Pozycja przewijania jest osobna dla każdej zakładki. To nie jest gwarancja zachowania niezapisanych formularzy po opuszczeniu projektu lub przeładowaniu strony.
- W Planie nie było łatwo wrócić do zakładek po długim przewijaniu. Zakładki pozostają pod nagłówkiem.
- Część przycisków miała wysokość 28–38 px. Zwiększono obszary dotyku najważniejszych kontrolek do 44 px, a natywne pola tekstowe pozostały co najmniej 16 px.
- Szerokie przyciski i długie nazwy mogły konkurować o miejsce. Formularze i karty mogą się zawijać; na najmniejszych szerokościach przycisk dodawania przechodzi do kolejnego wiersza.
- Przypadkowe kliknięcie Zrobione nie miało prostego cofnięcia. Dodano Cofnij przy ostatnio wykonanym zadaniu, z zachowaniem problemów i pozostałej historii.
- Wyłączono wymuszenie pionowej orientacji w manifeście PWA. Uwzględniono zmniejszoną animację i safe area.

## Weryfikacja wykonana

`node --test src/plan.test.js src/planTransfer.test.js src/mobileNavigation.test.js`: **17/17 PASS**.

Sprawdzono m.in. kolejność etapów, cofanie wykonania, zachowanie problemów i historii, import/eksport, adresy z polskimi znakami, błędne adresy oraz rozróżnianie zmian paska Safari, zoomu i potencjalnego otwarcia klawiatury. Testy klawiatury sprawdzają funkcję decyzyjną na danych liczbowych, a nie systemową klawiaturę iOS.

`npm run lint`, `npm run build`, `git diff --check`: **PASS**.

## Do sprawdzenia na urządzeniu (jeszcze niewykonane)

1. Safari i PWA: przewinąć długi plan od początku do końca, obserwując pasek dolny i zakładki.
2. Otworzyć, przełączyć i zamknąć klawiaturę w nazwie etapu, zadaniu, problemie i uwadze; pole oraz przycisk zapisu mają pozostać osiągalne.
3. Zmienić orientację z otwartym formularzem; sprawdzić boki ekranu i obszar gestów.
4. Przełączyć zakładki z wpisanym tekstem; wrócić i zweryfikować tekst oraz pozycję przewijania.
5. Przewinąć listę projektów, wejść w projekt, użyć Wstecz i Dalej Safari.
6. Ukończyć zadanie, cofnąć i ukończyć ponownie; sprawdzić postęp oraz historię.
7. VoiceOver, powiększenie tekstu i pinch zoom: sprawdzić etykiety, kolejność nawigacji i brak zakrytych kontrolek.
8. Import pliku z aplikacji Pliki i eksport do Plików w Safari/PWA.

## Podstawa decyzji projektowych

- Apple, Tab bars: https://developer.apple.com/design/human-interface-guidelines/tab-bars — stabilna i przewidywalna nawigacja.
- Apple, Layout: https://developer.apple.com/design/human-interface-guidelines/layout — uwzględnianie obszarów bezpiecznych i zmian rozmiaru.
- iPhone 16, parametry: https://www.apple.com/iphone-16/specs/.
