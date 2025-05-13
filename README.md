# Project Title Contractor Pro

Website created to help small community in Brazil find and rate contractors rather than using a WhatsApp Groupchat

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js and npm:** This project relies on Node.js for its runtime and npm (Node Package Manager) for managing dependencies. You can download them from [nodejs.org](https://nodejs.org/). It's recommended to use the latest LTS (Long Term Support) version.
  - To check if you have Node.js and npm installed, open your terminal and run:
    ```bash
    node -v
    npm -v
    ```
- **Git:** For version control and cloning the repository (if applicable). You can download it from [git-scm.com](https://git-scm.com/).

### Installation

1.  **Clone the repository (if you haven't already):**

    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>
    ```

    If you've downloaded the project as a ZIP file, extract it and navigate into the project directory.

2.  **Install project dependencies:**
    This project likely has separate dependencies for the server and the client-side application.

    - **Server-side dependencies:**

      ```bash
      cd server  # Navigate to the server directory
      npm install
      cd ..      # Navigate back to the project root
      ```

    - **Client-side dependencies (if your `npm run dev` is for a client like React, Vue, Angular, etc., typically run from the root or a `client` folder):**
      If your client app has its own `package.json` (e.g., in a `client` folder):
      ```bash
      cd client
      npm install
      cd ..
      ```

## Running the Application

This project consists of a separate backend server and a frontend development server. You'll need to run them in separate terminal windows.

1.  **Start the Backend Server:**

    - Open your terminal.
    - Navigate to the `server` directory from the project root:
      ```bash
      cd server
      ```
    - Start the server using the following command:
      ```bash
      npm start
      ```
    - Keep this terminal window open. The server will typically log output here, such as "Server running on port XXXX".

2.  **Start the Frontend Development Server:**

    - Open a **new** terminal window or tab (do not close the terminal running the backend server).
    - Navigate to the **project root directory** (or the client directory, e.g., `cd client`, if `npm run dev` is meant to be run from there – _please clarify your project structure_). Assuming it's run from the root for now:
      ```bash
      # Ensure you are in the project root directory (or client directory if appropriate)
      # cd <project-root-or-client-directory>
      ```
    - Run the development server:
      ```bash
      npm run dev
      ```
    - This command will typically compile your frontend assets and start a development server, often with hot-reloading. It will usually output a URL (e.g., `http://localhost:3000` or `http://localhost:5173`) where you can access the application in your web browser.

3.  **Access the Application:**
    - Open your web browser and navigate to the URL provided by the `npm run dev` command (e.g., `http://localhost:3000`).
