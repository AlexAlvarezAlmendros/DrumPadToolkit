# **DrumpadToolkit** – README Multilingüe / Multilingual / Multilingüe

---

## 📑 README – Español

### Descripción

**DrumpadToolkit** es un secuenciador de batería basado en web. Permite crear patrones de percusión con tus propios samples, guardarlos localmente y exportarlos a **MIDI** o **WAV** en cuestión de segundos.

### Características clave

* 🎚️ *Step‑sequencer* de 16 / 32 pasos en tu navegador.
* 🔊 Carga de samples personalizados ( `.wav`, `.mp3`, etc.).
* 💾 Guardado y recuperación de patrones en *localStorage*.
* 🌐 Interfaz multilingüe (inglés, castellano, catalán) gracias a archivos `locales/*.json`.
* ⬇️ Exportación instantánea a **MIDI** o **WAV**.

### Requisitos

* Navegador moderno con soporte de **Web Audio API** y **WebAssembly** (Chrome, Firefox, Edge, Safari).

### Primeros pasos

```bash
# Clona el repositorio
git clone https://github.com/<tu‑usuario>/drumpadtoolkit.git
cd drumpadtoolkit


### Estructura del proyecto (simplificada)

```
drumpadtoolkit/
├─ public/
│  └─ index.html
├─ src/
│  ├─ components/
│  │   ├─ icons/
│  │   ├─ EditorIcons.tsx
│  │   ├─ Controls.tsx
│  │   ├─ InstrumentLane.tsx
│  │   ├─ PatternManager.tsx
│  │   ├─ Sequencer.tsx
│  │   └─ StepButton.tsx
│  ├─ contexts/
│  │   └─ LanguageContext.tsx
│  ├─ hooks/
│  │   └─ useTranslations.ts
│  ├─ locales/
│  │   ├─ ca.json
│  │   ├─ en.json
│  │   └─ es.json
│  ├─ services/
│  │   ├─ audioService.ts
│  │   ├─ exportService.ts
│  │   ├─ geminiService.ts
│  │   └─ localStorageService.ts
│  ├─ sounds/              # Samples de ejemplo
│  │   ├─ clap.wav
│  │   ├─ hh_closed.wav
│  │   ├─ hh_open.wav
│  │   ├─ kick.wav
│  │   ├─ snare.wav
│  │   └─ tom.wav
│  ├─ App.tsx
│  ├─ constants.ts
│  ├─ index.tsx
│  ├─ types.ts
│  └─ vite-env.d.ts (si aplica)
├─ .env.local
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ LICENSE
```


---

## 📑 README – English

### Description

**DrumpadToolkit** is a web‑based drum sequencer. Craft percussion patterns with your own samples, save them locally, and export to **MIDI** or **WAV** in seconds.

### Key Features

* 🎚️ 16 / 32‑step browser sequencer.
* 🔊 Load custom samples (`.wav`, `.mp3`, etc.).
* 💾 Local pattern storage via *localStorage*.
* 🌐 Multilingual UI (English, Spanish, Catalan) driven by `locales/*.json`.
* ⬇️ One‑click **MIDI** / **WAV** export.

### Requirements

* Modern browser supporting **Web Audio API** & **WebAssembly** (Chrome, Firefox, Edge, Safari).


### Project Structure (simplified)

```
drumpadtoolkit/
├─ public/
│  └─ index.html
├─ src/
│  ├─ components/
│  │   ├─ icons/
│  │   ├─ EditorIcons.tsx
│  │   ├─ Controls.tsx
│  │   ├─ InstrumentLane.tsx
│  │   ├─ PatternManager.tsx
│  │   ├─ Sequencer.tsx
│  │   └─ StepButton.tsx
│  ├─ contexts/
│  │   └─ LanguageContext.tsx
│  ├─ hooks/
│  │   └─ useTranslations.ts
│  ├─ locales/
│  │   ├─ ca.json
│  │   ├─ en.json
│  │   └─ es.json
│  ├─ services/
│  │   ├─ audioService.ts
│  │   ├─ exportService.ts
│  │   ├─ geminiService.ts
│  │   └─ localStorageService.ts
│  ├─ sounds/
│  │   ├─ clap.wav
│  │   ├─ hh_closed.wav
│  │   ├─ hh_open.wav
│  │   ├─ kick.wav
│  │   ├─ snare.wav
│  │   └─ tom.wav
│  ├─ App.tsx
│  ├─ constants.ts
│  ├─ index.tsx
│  ├─ types.ts
│  └─ vite-env.d.ts (if applicable)
├─ .env.local
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ LICENSE
```


---

## 📑 README – Català

### Descripció

**DrumpadToolkit** és un seqüenciador de bateria basat en web. Permet crear patrons de percussió amb les teves pròpies mostres, desar‑los localment i exportar‑los a **MIDI** o **WAV** en segons.

### Funcionalitats clau

* 🎚️ Seqüenciador de 16 / 32 passos al navegador.
* 🔊 Càrrega de mostres personalitzades (`.wav`, `.mp3`, etc.).
* 💾 Desament i recuperació de patrons via *localStorage*.
* 🌐 Interfície multilingüe (anglès, castellà, català) amb `locales/*.json`.
* ⬇️ Exportació ràpida a **MIDI** o **WAV**.

### Requisits

* Navegador modern amb suport de **Web Audio API** i **WebAssembly** (Chrome, Firefox, Edge, Safari).



### Estructura del projecte (simplificada)

```
drumpadtoolkit/
├─ public/
│  └─ index.html
├─ src/
│  ├─ components/
│  │   ├─ icons/
│  │   ├─ EditorIcons.tsx
│  │   ├─ Controls.tsx
│  │   ├─ InstrumentLane.tsx
│  │   ├─ PatternManager.tsx
│  │   ├─ Sequencer.tsx
│  │   └─ StepButton.tsx
│  ├─ contexts/
│  │   └─ LanguageContext.tsx
│  ├─ hooks/
│  │   └─ useTranslations.ts
│  ├─ locales/
│  │   ├─ ca.json
│  │   ├─ en.json
│  │   └─ es.json
│  ├─ services/
│  │   ├─ audioService.ts
│  │   ├─ exportService.ts
│  │   ├─ geminiService.ts
│  │   └─ localStorageService.ts
│  ├─ sounds/
│  │   ├─ clap.wav
│  │   ├─ hh_closed.wav
│  │   ├─ hh_open.wav
│  │   ├─ kick.wav
│  │   ├─ snare.wav
│  │   └─ tom.wav
│  ├─ App.tsx
│  ├─ constants.ts
│  ├─ index.tsx
│  ├─ types.ts
│  └─ vite-env.d.ts (si escau)
├─ .env.local
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ LICENSE
```

