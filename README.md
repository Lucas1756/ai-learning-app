# Learning Quest AI

Eine kostenlose, lokale PWA-Lernapp mit:
- Lernmodus
- Übungsmodus
- Spielmodus
- Bild-Upload für Lernstoffanalyse
- Installierbar als App im Browser

## Features
- Bilder hochladen und mit OCR analysieren
- Lernstoff in Lernkarten, Quizfragen und Aufgaben umformen
- Simpler, lokaler Workflow ohne Cloud-API nötig
- funktioniert als installierbare Web-App (PWA)

## Schnellstart

```bash
npm install
npm run dev
```

Danach öffnest du die App unter:
- http://localhost:5173

## Als App installieren
In Chrome/Edge:
1. Öffne die App im Browser
2. Klicke auf das Drei-Punkte-Menü
3. „App installieren“ oder „Zu Startbildschirm hinzufügen“

## Anpassbar
- App-Logik: `src/App.jsx`
- Styling: `src/styles.css`
- Lern-Generator: `src/lib/studyEngine.js`

## Hinweis
Dieses Projekt ist bewusst lokal und erweiterbar gehalten. Du kannst später problemlos echte KI-APIs einbauen.
