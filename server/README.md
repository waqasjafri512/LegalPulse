# ⚙️ LegalPulse - Backend

The robust, scalable backend for LegalPulse, built with NestJS and TypeScript. It serves as the orchestrator for AI document processing, matter tracking, and multi-channel notification delivery.

## 🚀 Key Technologies

- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **TypeORM**: Modern Object-Relational Mapper for PostgreSQL interaction.
- **PostgreSQL (Supabase)**: Relational database with `pgvector` support for semantic search.
- **BullMQ + Redis (Upstash)**: Advanced, distributed message queue for asynchronous AI processing and background tasks.
- **Claude 3.5 Sonnet**: State-of-the-art LLM for precise legal document extraction and analysis.
- **Clerk Backend**: Secure server-side authentication, session validation, and organization management.
- **Cloudinary**: Cloud-based image and video management for document storage.
- **Resend**: Modern email delivery service.
- **Slack SDK**: Integration for real-time legal alerts.

## 📂 Module Architecture

The application is structured into specialized modules to ensure maintainability and scalability:

| Module | Purpose |
| :--- | :--- |
| **Contracts** | Manages contract lifecycle, metadata, and status tracking. |
| **Extraction** | Orchestrates the AI extraction pipeline using AWS Textract and Claude. |
| **Matters** | Handles the tracking of legal cases, corporate matters, and IP filings. |
| **Alerts** | Generates and manages notifications for contract milestones and deadlines. |
| **Orgs/Users** | Manages multi-tenant organization structure and user roles (RBAC). |
| **Integrations** | Bridges with external services like Google Drive and Dropbox. |
| **Webhooks** | Receives and processes events from Clerk (Auth) and other third parties. |

## 🧠 AI Extraction Pipeline

1. **Upload**: User uploads a document (PDF/DOCX) via the frontend.
2. **Queue**: The server stores the file in Cloudinary and places a job on the BullMQ `extraction` queue.
3. **OCR/Text Extraction**: The worker uses AWS Textract (or specialized libraries) to pull raw text from the document.
4. **LLM Analysis**: The text is sent to Claude 3.5 Sonnet with a specialized legal prompt to extract structured JSON data.
5. **Validation**: The system calculates confidence scores and flags fields that require human review.
6. **Notification**: Once complete, a real-time event is emitted to the user.

## 🛠️ Development Setup

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and configure your keys:

```bash
# Database (Postgres)
DB_HOST=...
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=...

# Redis (BullMQ)
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASS=...

# AI (Claude)
ANTHROPIC_API_KEY=...

# Auth (Clerk)
CLERK_SECRET_KEY=...
CLERK_WEBHOOK_SECRET=...
```

### 3. Running the App
```bash
# Development (with HMR)
npm run start:dev

# Production Build
npm run build
npm run start:prod
```

## 📖 API Documentation
The API documentation is automatically generated using Swagger. Once the server is running, visit:
`http://localhost:3000/api/docs`
