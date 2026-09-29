# Plany tworzone przez Codex

Na ekranie projektów wybierz **Importuj plan**, wskaż plik JSON, sprawdź podgląd i kliknij **Dodaj projekt**. Import zawsze tworzy osobny projekt; nie nadpisuje istniejących danych i nie scala aktualizacji. Podgląd zawiera pełne instrukcje. W tym samym ekranie można pobrać przykład: Angielski — 21 dni.

W zakładce Plan przycisk **Eksportuj plan i postęp** pobiera JSON, który można przekazać Codexowi. Eksport obejmuje etapy, zadania z instrukcjami i statusem, cel, zarys, uwagi projektu i etapów, problemy przy zadaniach oraz historię wykonania. To plik planu, nie pełna kopia zapasowa aplikacji: starsze osobne podzadania, zdjęcia i dawne plany tygodniowe nie wchodzą do eksportu.

Przy poprawianiu wyeksportowanego planu zachowaj identyfikatory, statusy `done`, historię i notatki. Zmieniony plik można wczytać jako nowy projekt i porównać go ze starym.

## Format dla Codex

Zwróć poprawny plik JSON UTF-8, bez komentarzy i bez otaczających znaczników Markdown. `format` i `version` są wymagane. Tygodnie lub inne etapy trafiają do `planStages`, zadania do `steps`. Krótka nazwa zadania jest w `title`, pełne instrukcje w `description`. Identyfikatory etapów i zadań muszą być unikalne w całym planie. Mogą zostać pominięte przy tworzeniu nowego planu. Nie dopisuj brakujących materiałów jako rzekomo dostarczonych przez użytkownika — opisz brak w `planNotes`.

```json
{
  "format": "planner-plan",
  "version": 1,
  "project": {
    "title": "Mój projekt",
    "goal": "Cel",
    "horizon": "3 tygodnie",
    "planStages": [
      {
        "id": "etap-1",
        "title": "Pierwszy etap",
        "steps": [
          {
            "id": "zadanie-1",
            "title": "Pierwsze zadanie",
            "description": "Dokładna instrukcja wykonania.",
            "done": false
          }
        ]
      }
    ]
  }
}
```

Dodatkowe pola projektu: `why`, `win`, `description`, `notes`, `planNotes`, `sessions`, `stepDiscussions`, `selectedStepId`. Etap może mieć `planNotes`. Wpis uwagi: `id`, `kind` (`problem`, `note`, `decision`), `text`, `createdAt` (ISO), `resolved` (boolean).

Limit importu: 2 MB, 100 etapów, 1000 zadań na etap. Nie są wykonywane HTML ani skrypty zawarte w treści. Dane pozostają w localStorage przeglądarki.

Testy: `node --test src/plan.test.js src/planTransfer.test.js`.
