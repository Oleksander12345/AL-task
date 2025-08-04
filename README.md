# Experiment Log Visualizer 📈

A performant CSV visualizer for MLOps experiment logs.  
Upload a large `.csv` file containing experiment metrics and explore line charts per metric across multiple experiments.

## 🌐 Live Demo

➡️ [Visit the hosted application](https://al-task.vercel.app/)

## 📂 Repository

➡️ [GitHub Repository](https://github.com/Oleksander12345/AL-task)

## 🧩 Features

- ✅ Upload and parse CSV files with hundreds of thousands of rows
- ✅ Efficient parsing using Web Workers and streaming with PapaParse
- ✅ Persistent storage via IndexedDB (data stays after page reload)
- ✅ Select up to 3 experiments to visualize concurrently
- ✅ Switch between metrics (`train_loss`, `val_accuracy`, etc.)
- ✅ Display average, min, and max values for selected experiments
- ✅ Responsive chart built with Recharts

## ⚙️ Tech Stack

- **React + TypeScript**
- **Recharts** — chart rendering
- **PapaParse** — CSV parsing
- **IndexedDB** — persistent data storage
- **Tailwind CSS** — styling
- **Web Workers** — async parsing without UI blocking

## 📦 Getting Started

To run locally:

```bash
git clone https://github.com/Oleksander12345/AL-task.git
cd AL-task
npm install
npm run dev
