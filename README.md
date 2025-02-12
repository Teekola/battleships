# Battleships Online Game with Next.js

## Introduction

This is an implementation of the classic Battleships game as an online multiplayer web application. The game is publicly available at [teekolas-battleships.vercel.app](https://teekolas-battleships.vercel.app/). The project focuses on UI design and interactivity while leveraging modern web technologies. Some edge cases, such as handling opponent disconnections, are not implemented as they are outside the main objectives of this exercise.

---

## Features & Gameplay

### Game Setup

- Players can **create a game** by setting the game mode, board size, and number of ships.
- Players can **join a game** using a unique 6-digit game ID.
- The board size and ship count are validated to ensure they do not exceed 50% of the total grid area.

### Game Modes

- **Classic Mode**: Players can fire once per round, regardless of a hit or miss.
- **Rampage Mode**: Players can continue firing as long as they hit enemy ships.
- Both modes allow for a tie if both players sink all ships in the same number of rounds.

### Ship Placement

- Players drag and drop ships onto the board.
- Ships can be rotated via:
   1. Clicking a "Horizontal/Vertical" button
   2. Pressing the "R" key
   3. Right-clicking with the mouse
- Invalid ship placements are highlighted in red.

### Gameplay

- Players take turns firing at the opponent’s board.
- Hits are marked in **red**, misses in **white**.
- Sunk ships are revealed with a subtle animation.
- The UI dynamically updates the active board:
   - **On mobile**: The opponent's board is shown during your turn, and your board is visible when defending.
   - **On desktop**: The inactive board is dimmed for clarity.
- Special game-ending conditions:
   - The game ends immediately if one player sinks all ships and both have played the same number of rounds.
   - In Classic Mode, the game continues if the opponent has played one fewer round and only needs one hit.
   - In Rampage Mode, the game continues if the opponent has played one fewer round, regardless of the hits needed.
   - A tie occurs if both players sink all ships in the same number of rounds.
- A dialog appears at the end of the game with the option to play again or quit.

---

## Technologies Used

- **Frontend**: TypeScript, Next.js (React), TailwindCSS, Shadcn (Radix primitives)
- **Backend**: Supabase, PostgreSQL, Prisma
- **State Management**: Zustand
- **Drag & Drop**: dnd-kit
- **Forms & Validation**: React Hook Form, Zod
- **Sound Effects**: use-sound
- **Hosting**: Vercel
- **Version Control**: Git + GitHub

### Why These Technologies?

- **Next.js**: Efficient server-side rendering and routing.
- **Supabase**: A serverless, real-time database solution.
- **TailwindCSS & Shadcn**: Rapid styling and accessible UI components.
- **dnd-kit**: Simplifies drag-and-drop ship placement.
- **Vercel**: Ideal for deploying Next.js applications.

---

## High-Level Architecture

- The app is built with **Next.js** and **Supabase**.
- Server-side functionalities are handled via **Server Components** and **Server Actions**.
- **Supabase subscriptions** enable real-time updates.
- **Zustand** is used for efficient state management.
- **Next.js App Router** is used to structure views and handle navigation.

---

## UI Implementation Details

- The game states are divided into separate pages:
   - `/create-game`, `/join-game`, `/game/[gameId]`, `/ship-placement`, etc.
- Server Actions are stored in `actions.tsx`.
- Components and hooks are modularized in `(components)`, `(hooks)`, and `(stores)` folders.

### Multi-Modal Interaction

- Ships can be rotated via button, keyboard, or mouse right-click.
- Audio feedback for hits and misses.
- Visual feedback via animations and hover effects.
- UI adapts responsively for **mobile** and **desktop**.

### Challenges & Solutions

#### 1. **Real-Time State Handling Issues**

- Ensuring the game state updates correctly in multi-player interactions.
- Solution: **Checked the database state before updates** and optimized **Zustand state management**.

#### 2. **Responsive Ship Scaling**

- Initial implementation used element size from the DOM, leading to inconsistencies when resizing the window.
- Solution: **Ships now scale dynamically based on the grid size** instead of reading values from the DOM.

---

## Deployment & Development

- The game is hosted on **Vercel**.
- Uses **GitHub for version control**.
- Open-source and available for contributions at [GitHub](https://github.com/Teekola/battleships).

---

## Future Improvements

- handle situations where a player exits the game
- add powerups
- add matchmaking
- improve visuals
- add more sounds

---

## License

This project is open-source under the MIT License.
