# BleedBuddy.com - Automated PDF Prepress

This is a Full Stack Application designed to analyze PDF files and automate bleed correction for the commercial print industry.

## Architecture

### Frontend
- **Framework:** React 18
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS (via CDN)
- **PDF Processing:** PDF.js + PDF-lib
- **Entry Point:** `index.html` loads `index.tsx`

### Backend
- **Framework:** Node.js / Express
- **Location:** `/server` directory
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** Currently uses in-memory mock data (ready for MongoDB/Postgres migration).

## Environment Variables

The application is cloud-ready and relies on the following environment variables:

**Frontend:**
- `VITE_API_URL`: The full URL of the deployed backend (e.g., `https://api.bleedbuddy.com`). Defaults to localhost if not set.

**Backend:**
- `PORT`: The port to listen on (Google Cloud sets this automatically).
- `JWT_SECRET`: Secret key for signing admin tokens.

## Deployment Instructions (For Developer)

1. **Frontend:** Deploy as a Static Site or via Cloud Run (using Nginx/Vite preview).
2. **Backend:** Deploy the `/server` folder to Google Cloud Run or App Engine.
3. **Networking:** Ensure the Frontend `VITE_API_URL` points to the Backend's deployed URL.
4. **CI/CD:** Connect this repository to Google Cloud Build for automatic deployment on push to `main`.
