# Marine AR Module Builder

A visual web sandbox for creating **marine organism AR modules**.

Design AR-ready scenes by dragging, positioning, and scaling marine assets on a canvas — then export them as clean, structured JSON for Augmented Reality applications.

---

## ✨ Features

-  Drag & drop marine organisms from a palette  
-  Click to select, drag to move, and scale with visual handles  
-  Real-time property editing (name, position, scale)  
-  Optional grid snapping (40px)  
-  Toggleable grid background  
-  JSON preview, copy, and download  
-  Import existing `marine-ar-module` JSON files  
-  Live validation with performance hints  
-  Clean UI with toast notifications  

---

## 🧠 Overview

The **MMarine AR Module Builder** is a single-page React application that acts as a **WYSIWYG editor** for AR scene creation.

It is designed for:
- Educators  
- Designers  
- Marine biology enthusiasts  

Users can visually compose scenes without needing technical knowledge, and export them into a format consumable by AR engines.

---

## 🏗 Architecture

The application follows a **component-driven architecture** with clear separation of concerns.

### Core Components

| Component | Responsibility |
|----------|----------------|
| `App.jsx` | Root component, state orchestration, drag & drop |
| `PlacedAsset.jsx` | Draggable & scalable assets on canvas |
| `AssetCard.jsx` | Sidebar palette items |
| `PropsPanel.jsx` | Real-time property editor |
| `JSONPanel.jsx` | JSON preview and export |
| `ImportModal.jsx` | Import existing JSON |
| `ValidationBar.jsx` | Performance warnings |
| `ToolBtn.jsx` | Reusable toolbar buttons |

---

##  State Management

### Custom Hooks
- `useAssets.js` → Manages asset lifecycle (add, update, remove, clear)  
- `useToast.js` → Lightweight notification system  

### Local State
- `selected` → Currently selected asset  
- `moduleName` → AR module name  
- `showGrid / snapGrid` → Canvas behavior  
- `activeTab` → UI panel switching  

---

##  Core Interactions

### Drag & Drop
- Uses native HTML5 Drag and Drop API  
- Calculates drop position relative to canvas  

### Asset Manipulation
- Drag to move with boundary constraints  
- Bottom-right handle for scaling  
- Click vs drag detection handled internally  

### Grid Snapping
- Optional snapping to 40px grid  
- Applied during both drag and drop  

---

## Data Model

Each asset:

```json
{
  "uid": "unique-id",
  "id": "organism-id",
  "emoji": "🐠",
  "label": "Fish",
  "x": 120,
  "y": 200,
  "scale": 1.2
}
