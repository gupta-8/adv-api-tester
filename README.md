<img width="1917" height="911" alt="image" src="https://github.com/user-attachments/assets/618a5d0a-cc9d-462d-a080-bf8a3d63866f" /># Adv. API Tester

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)

**Adv. API Tester** is a professional, browser-based API client designed for modern developers. It provides a sleek, minimalist interface for testing RESTful endpoints, inspecting responses, and managing request history without the bloat of heavy desktop applications.

Built with a focus on performance and user experience, it features a premium dark-mode UI with glassmorphism elements, ensuring a comfortable environment for extended development sessions.

## Live Demo

Check out the live application here:
[https://adv-api-frontend.onrender.com](https://adv-api-frontend.onrender.com)


## Features

*   **RESTful Support**: Full support for GET, POST, PUT, DELETE, PATCH, HEAD, and OPTIONS methods.
*   **Advanced Request Builder**:
    *   **Params & Headers**: Dynamic key-value editors for query parameters and request headers.
    *   **JSON Editor**: Syntax-highlighted body editor with auto-formatting capabilities.
    *   **Authentication**: Integrated support for Bearer Token and Basic Auth.
*   **Smart Response Viewer**:
    *   **Pretty Print**: Auto-formats JSON responses with collapsible trees and syntax highlighting.
    *   **Raw View**: Inspect the raw response text.
    *   **Metadata**: Instant visibility into status codes, response time (ms), and payload size.
*   **History & Persistence**:
    *   **Request History**: Automatically tracks recent requests in a searchable drawer.
    *   **Collections**: Save and name frequently used requests for quick access.
    *   **Local Storage**: Work is auto-saved locally, ensuring no data loss on refresh.
*   **Technical Polish**:
    *   **CORS Proxy**: Includes a lightweight FastAPI backend proxy to bypass browser CORS restrictions.
    *   **Dark Mode**: Native dark theme designed for visual comfort.
    *   **Responsive**: Fully functional on desktop and mobile devices.

## Tech Stack

**Frontend**
*   **Framework**: React 18
*   **Styling**: Tailwind CSS
*   **Components**: Shadcn/UI (Radix Primitives)
*   **Icons**: Lucide React
*   **HTTP Client**: Native Fetch API

**Backend (Proxy Service)**
*   **Runtime**: Python 3.9+
*   **Framework**: FastAPI
*   **Database**: MongoDB (for logging/analytics optional)

## Getting Started

Follow these instructions to set up the project on your local machine.

### Prerequisites

*   Node.js (v16 or higher)
*   Yarn or npm
*   Python 3.9+ (for the backend proxy)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/adv-api-tester.git
    cd adv-api-tester
    ```

2.  **Install Frontend Dependencies**
    ```bash
    cd frontend
    yarn install
    ```

3.  **Install Backend Dependencies**
    ```bash
    cd ../backend
    pip install -r requirements.txt
    ```

### Running Locally

You need to run both the frontend and the backend concurrently.

**1. Start the Backend Server**
```bash
cd backend
python server.py
# Server will start on http://0.0.0.0:8001
```

**2. Start the Frontend Development Server**
```bash
cd frontend
yarn start
# Application will open at http://localhost:3000
```

### Folder Structure

```text
adv-api-tester/
├── .gitignore
├── README.md
├── backend/
│   ├── requirements.txt
│   └── server.py
└── frontend/
    ├── package.json
    ├── yarn.lock
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── craco.config.js
    ├── jsconfig.json
    ├── components.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css
        ├── App.js
        ├── App.css
        ├── lib/
        │   └── utils.js
        ├── hooks/
        │   └── use-toast.js
        └── components/
            ├── ApiTester.jsx
            ├── HistoryDrawer.jsx
            ├── KeyValueEditor.jsx
            ├── RequestPanel.jsx
            ├── ResponsePanel.jsx
            ├── SaveDialog.jsx
            └── ui/
                ├── accordion.jsx
                ├── alert.jsx
                ├── alert-dialog.jsx
                ├── aspect-ratio.jsx
                ├── avatar.jsx
                ├── badge.jsx
                ├── breadcrumb.jsx
                ├── button.jsx
                ├── calendar.jsx
                ├── card.jsx
                ├── carousel.jsx
                ├── checkbox.jsx
                ├── collapsible.jsx
                ├── command.jsx
                ├── context-menu.jsx
                ├── dialog.jsx
                ├── drawer.jsx
                ├── dropdown-menu.jsx
                ├── form.jsx
                ├── hover-card.jsx
                ├── input.jsx
                ├── input-otp.jsx
                ├── label.jsx
                ├── menubar.jsx
                ├── navigation-menu.jsx
                ├── pagination.jsx
                ├── popover.jsx
                ├── progress.jsx
                ├── radio-group.jsx
                ├── resizable.jsx
                ├── scroll-area.jsx
                ├── select.jsx
                ├── separator.jsx
                ├── sheet.jsx
                ├── skeleton.jsx
                ├── slider.jsx
                ├── sonner.jsx
                ├── switch.jsx
                ├── table.jsx
                ├── tabs.jsx
                ├── textarea.jsx
                ├── toast.jsx
                ├── toaster.jsx
                ├── toggle.jsx
                ├── toggle-group.jsx
                └── tooltip.jsx
```

## Usage

1.  **Enter URL**: Type your target API endpoint (e.g., `https://api.example.com/users`) in the main input bar.
2.  **Select Method**: Choose the HTTP method (GET, POST, etc.) from the dropdown.
3.  **Configure Request**:
    *   Use the **Params** tab to add URL query parameters.
    *   Use the **Headers** tab to add custom headers (e.g., `Content-Type`).
    *   Use the **Body** tab to enter JSON payloads for POST/PUT requests.
    *   Use the **Auth** tab to configure Bearer or Basic authentication.
4.  **Send**: Click the **Send** button (or `Cmd/Ctrl + Enter`).
5.  **View Response**: The right-hand panel will display the status, time, size, and formatted JSON response.
6.  **History**: Click **History** in the header to recall previous requests.

## Configuration

Create a `.env` file in the `frontend` directory to configure the connection to the backend proxy.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `REACT_APP_BACKEND_URL` | URL of the backend proxy server | `http://localhost:8001` |

## Deployment

### Vercel Deployment (Frontend)

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import the `frontend` directory into Vercel.
3.  Vercel will automatically detect Create React App.
4.  Add the `REACT_APP_BACKEND_URL` environment variable in the Vercel dashboard pointing to your deployed backend.
5.  Click **Deploy**.

### Netlify Deployment (Frontend)

1.  Connect your GitHub repository to Netlify.
2.  Set the **Base directory** to `frontend`.
3.  Set the **Build command** to `yarn build`.
4.  Set the **Publish directory** to `frontend/build`.
5.  Add environment variables in Site Settings > Build & Deploy > Environment.
6.  Click **Deploy Site**.

### Static Export

To host on any static file server (AWS S3, Nginx, Apache):

1.  Build the project:
    ```bash
    cd frontend
    yarn build
    ```
2.  Upload the contents of the `build` folder to your web root.

*Note: This application requires the Python backend proxy to function correctly (to bypass CORS). Ensure the backend is deployed to a service like Render, Railway, or AWS, and update the frontend configuration to point to it.*

## Roadmap

*   [ ] **Collections Export**: Export saved requests to JSON/Postman format.
*   [ ] **Environment Variables**: Support for `{{variable}}` syntax in URLs and bodies.
*   [ ] **Workspaces**: Separate history and collections for different projects.
*   [ ] **Code Generation**: Generate fetch/cURL code snippets for requests.
*   [ ] **WebSocket Support**: Add testing capabilities for WS/WSS connections.

## Contributing

Contributions are welcome. Please follow these steps:

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Credits

*   **React**: Frontend library.
*   **Tailwind CSS**: Utility-first CSS framework.
*   **Shadcn/UI**: Accessible component primitives.
*   **FastAPI**: High-performance Python framework.
