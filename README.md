# Vibe PRD Generator

This project is an AI-powered self-service platform that transforms natural conversations into senior engineer-level Product Requirements Documents (PRDs), `plan.md` files, and agent instruction files, optimized for AI coding agents like Cursor, Gemini CLI, etc.

The core mission is to solve the "Trash In = Trash Out" problem in "vibe coding" by front-loading the creation of high-quality, structured documentation, ensuring AI agents have clear, actionable instructions.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Application Flow](#application-flow)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running the Application](#running-the-application)
- [Key Code Highlights](#key-code-highlights)
  - [Gemini Service](#gemini-service)
  - [State Management](#state-management)
  - [Document Generation](#document-generation)

## Tech Stack

-   **Frontend:** React 19, TypeScript
-   **AI Model:** Google Gemini 2.5 Flash (`@google/genai` SDK)
-   **Styling:** Tailwind CSS (via CDN)
-   **Utilities:** JSZip (for creating and downloading the `.zip` package)

Dependencies are loaded via CDN in `index.html` for simplicity, so there is no `package.json` or build step required.

## Project Structure

The codebase is organized to separate concerns, making it modular and easy to navigate.

```
.
├── App.tsx                   # Main application component, manages state and flow
├── components/
│   ├── Step1_InitialForm.tsx   # "Type-form" style component for initial project details
│   ├── Step2_Conversation.tsx  # Interactive chat interface with the AI
│   ├── Step3_Documents.tsx   # Displays generated documents in tabs and handles downloads
│   ├── icons/                  # SVG icon components
│   └── ui/
│       └── Loader.tsx          # Reusable loading spinner
├── constants.ts              # Shared constant values (e.g., initial form state)
├── index.html                # The main HTML entry point, loads scripts & styles
├── index.tsx                 # Renders the React app into the DOM
├── services/
│   └── geminiService.ts      # All logic for interacting with the Google Gemini API
├── types.ts                  # Shared TypeScript types and enums
└── README.md                 # This file
```

## Application Flow

The user is guided through a three-step process to generate their documentation:

1.  **Step 1: Initial Form (`Step1_InitialForm.tsx`)**
    -   A "type-form" style UI collects the user's high-level project idea, type, audience, goals, and optional tech stack.
    -   This provides the initial context for the AI conversation.

2.  **Step 2: AI Conversation (`Step2_Conversation.tsx`)**
    -   An interactive chat session is initiated with the Gemini API.
    -   The `geminiService.ts` uses a detailed system prompt to instruct the AI to act as a Senior Engineering Manager, asking targeted, clarifying questions one at a time.
    -   The user and AI have a "ping-pong" conversation (typically 5-10 exchanges) to flesh out detailed requirements.

3.  **Step 3: Document Generation & Review (`Step3_Documents.tsx`)**
    -   Once the user finishes the conversation, the entire chat history and initial project details are sent back to the Gemini API.
    -   A second, different prompt instructs the model to act as a Principal Engineer and generate three distinct markdown files by returning a structured JSON object.
    -   The generated `techspec.md`, `plan.md`, and `gemini.md` files are displayed in a tabbed view for review.
    -   The user can download all three files as a single `.zip` package using the JSZip library.

## Getting Started

### Prerequisites

You need a Google Gemini API key to run this application.

### Configuration

The application expects the API key to be available as an environment variable named `API_KEY`. The hosting environment (e.g., AI Studio) must have this variable configured. The code in `services/geminiService.ts` will throw an error if `process.env.API_KEY` is not set.

### Running the Application

Since this is a client-side application with no build step, you just need to serve the `index.html` file from a local web server.

1.  **Using VS Code Live Server:**
    -   Install the "Live Server" extension in Visual Studio Code.
    -   Right-click on `index.html` and select "Open with Live Server".

2.  **Using Python:**
    -   Navigate to the project's root directory in your terminal.
    -   Run the command: `python -m http.server`
    -   Open your browser and go to `http://localhost:8000`.

## Key Code Highlights

### Gemini Service (`services/geminiService.ts`)

This file is the brain of the application's AI interactions.

-   **`startConversation`**: Uses a detailed system prompt to set the context for the AI, instructing it on its persona (Senior EM) and conversational process. This is crucial for guiding the AI to ask effective questions.
-   **`generateDocuments`**: This function is key. It compiles the entire conversation and uses the `responseSchema` feature of the Gemini API. By defining a strict JSON schema, we ensure the model's output is predictable and can be safely parsed, preventing errors and improving reliability.

### State Management (`App.tsx`)

This component acts as the central hub for application state. It uses React's `useState` hook to manage:
-   The current step of the application (`AppStep` enum).
-   The data collected from the initial form (`ProjectDetails`).
-   The full history of the AI conversation (`ChatMessage[]`).
-   The final generated documents (`GeneratedDocs`).
-   Loading and error states.

### Document Generation (`Step3_Documents.tsx`)

-   **Markdown Rendering**: This component uses a very basic `<pre>` tag to render the markdown content. For a richer viewing experience, a library like `react-markdown` would be a good future addition.
-   **File Zipping**: It uses the `JSZip` library, loaded from a CDN in `index.html`, to dynamically create a `.zip` file in the browser for the user to download.