# MebliX Desktop

**MebliX Desktop** is a professional-grade, offline 3D modeling desktop application. It is designed for advanced users who are familiar with industrial CAD software like SolidWorks or Bazis-Mebelshchik, offering them deep control over furniture geometry, detailing, and manufacturing preparation.

---

## 🚀 Key Features

* **Advanced 3D Modeling**: Parametric design engine for complex furniture systems.
* **Offline First**: Work directly on the local machine with secure, local file storage.
* **WebView UI**: Modern and highly responsive user interface built with web technologies.
* **Manufacturing Output**: Automated generation of technical drawings, bill of materials (BOM), and cutting optimization lists.

## 🛠 Technology Stack

* **Core Engine**: `C++` (for performance-critical calculations, geometry processing, and core logic).
* **User Interface**: `React` rendered inside a local `WebView` container (providing a sleek, modern UI with high responsiveness).
* **Communication**: Lightweight inter-process communication (IPC) between the C++ core and the WebView UI.

## 📂 Project Directory Structure

```text
MebliXDesktop/
├── src/            # Source code (C++ and React UI)
│   ├── core/       # C++ core geometry and logic
│   └── ui/         # React WebView frontend application
├── assets/         # Graphic assets, icons, and textures
└── CMakeLists.txt  # Build configuration file
```
