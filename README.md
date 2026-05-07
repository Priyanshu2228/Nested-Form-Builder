# Nested Form Builder

A modern, highly interactive, and fully responsive React application for building and answering complex, nested questionnaires. The project features a dual-mode interface (Developer / User), smooth drag-and-drop reordering, dynamic sliding door transitions, and a premium light-themed glassmorphism UI.

## Features

- **Developer Mode:**
  - Create infinitely nestable questions.
  - Supported question types: `Short Answer`, `Text`, and `True / False`.
  - Conditional Logic: Add child questions that are conditionally triggered (e.g., when a parent True/False question is answered as 'True').
  - Drag and Drop: Seamlessly reorder questions and whole sub-trees using `@dnd-kit`.
  
- **User Mode:**
  - Clean, distraction-free interface for users to answer the questionnaire.
  - Automatically hides developer controls (delete, add child, drag handles).
  - Clean hierarchical submission review page.

- **Dynamic Sidebar Indexing:**
  - Auto-generated hierarchical numbering (e.g., `1`, `1.1`, `1.1.1`).
  - Scroll-spy integration highlights the currently viewed question in the sidebar.
  - Collapsible sub-trees.

- **Polished UI/UX:**
  - Premium light theme with deep indigo accents (`#4f46e5`).
  - Advanced micro-animations, stagger effects, and a 3D "Sliding Door" transition when switching modes.
  - Fully responsive layout: Sidebar gracefully hides on smaller screens, maximizing the editor view.

- **State Persistence:**
  - Automatic `localStorage` syncing ensures you never lose your form progress on refresh.

## Tech Stack

- **Framework:** React 18 (via Vite)
- **Styling:** Vanilla CSS (CSS Variables, Flexbox, Keyframes, Custom Easing)
- **Drag and Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Unique IDs:** `uuid`
- **Typography:** Inter (Google Fonts)

## Getting Started

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the Vite development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Usage Guide

1. **Building the Form (Developer Mode):**
   - Click **Add Question** to create a top-level question.
   - Use the **Type** dropdown to select the input format.
   - For True/False questions, select the target answer condition that will allow child questions, then click **Add Child Question**.
   - Use the drag handles (≡) on the left of each card to reorder questions.
   
2. **Testing the Form (User Mode):**
   - Toggle the switch in the top right to **User** mode.
   - The sliding door transition will hide the developer tools.
   - Answer the questions as a user would.
   - Click **Submit** to view the hierarchical submission review page.
   - Click **Go Back** to return to the active form.

## Project Structure

- `src/App.jsx`: Main layout, state management, scroll-spy intersection observer, and DnD context.
- `src/components/Sidebar.jsx`: The sticky sidebar for navigation and indexing.
- `src/components/QuestionItem.jsx`: Recursive component rendering the individual question nodes and controls.
- `src/components/SortableQuestion.jsx`: Drag-and-drop wrapper for the question items.
- `src/components/ReviewList.jsx`: Recursive component that displays submitted answers.
- `src/utils/reorder.js`: Utility functions for handling complex drag-and-drop array mutations.
- `src/styles.css`: All CSS styling, theme variables, and keyframe animations.
