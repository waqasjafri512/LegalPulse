# 🎨 LegalPulse - Frontend

LegalPulse Frontend is a high-performance, responsive React application built for legal professionals. It focuses on clarity, density of information, and seamless document interaction.

## 🚀 Key Technologies

- **React 19**: Leveraging the latest features for optimal performance and developer experience.
- **Vite**: Ultra-fast build tool and development server.
- **Tailwind CSS 4**: Modern CSS-in-JS alternative with zero-runtime overhead and rich utility-first styling.
- **Clerk**: Secure, pre-built authentication and user management.
- **Zustand**: Lightweight, scalable state management for global application state.
- **TanStack Query (v5)**: Robust data fetching, caching, and synchronization.
- **Lucide React**: Crisp, professional icon set.
- **React Dropzone**: Intuitive file upload experience.

## 📂 Page Reference

| Page | Description |
| :--- | :--- |
| **Dashboard** | High-level overview of portfolio health, upcoming deadlines, and recent activity. |
| **Contracts** | A powerful table view of all legal documents with advanced filtering and status tracking. |
| **Contract Detail** | Side-by-side view featuring a high-fidelity PDF renderer and AI-extracted term panel. |
| **Upload** | Bulk upload interface for PDFs and DOCX files with real-time processing status. |
| **Matters** | Tracking system for litigation, corporate, and IP matters. |
| **Alerts** | Centralized notification management for renewals and expirations. |
| **Settings** | Organization management, team invitations, and integration configuration. |

## 🛠️ Development Setup

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root of the `client` directory:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Backend API URL
VITE_API_URL=http://localhost:3000/api
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Production Build
```bash
npm run build
```

## 🏗️ UI Patterns
- **Responsive Design**: Mobile-friendly layouts for on-the-go legal reviews.
- **Skeleton Loading**: Smooth transitions and perceived performance improvements.
- **Optimistic Updates**: Immediate UI feedback for actions like tagging or status changes.
- **Split-Pane Layout**: Specialized component for document-centric workflows.

