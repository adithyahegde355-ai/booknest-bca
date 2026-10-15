# BookNest BCA Project — Local Run & Free Hosting

## Local run on Windows
1. Install Node.js LTS: https://nodejs.org/en/download
2. Extract the ZIP.
3. Double-click `START BOOKNEST.bat` (if included) or follow manual run below.

## Free hosting overview
This app has two parts: a React/Vite frontend (`client`) and an Express API (`server`). Deploy the API as a Render Web Service, then deploy the frontend as a Render Static Site (or Netlify). Both can use free tiers, with provider limits. Render free web services sleep after inactivity, so the first request can take about a minute. See https://render.com/docs/free.

### 1. Put the project on GitHub
1. Sign in to https://github.com and create a new repository, e.g. `booknest-bca`.
2. Upload the extracted project files/folders to the repository (keep `client` and `server` as top-level folders).

### 2. Deploy backend on Render
1. Open https://render.com and sign in using GitHub.
2. Choose **New + → Web Service** and connect the `booknest-bca` repository.
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Choose **Free** and create the service.
7. When it finishes deploying, copy its public URL, e.g. `https://your-api-name.onrender.com` (use your actual URL).

### 3. Deploy frontend on Render
1. In Render choose **New + → Static Site** and connect the same repository.
2. Set **Root Directory** to `client`.
3. Set **Build Command** to `npm install && npm run build`.
4. Set **Publish Directory** to `dist`.
5. Add environment variable `VITE_API_URL` with the backend URL from Step 2, without `/api` at the end (example `https://your-api-name.onrender.com`).
6. Create the static site and copy its public URL.

### 4. Allow the frontend to contact the backend
1. Open your backend Web Service in Render → **Environment**.
2. Add `CLIENT_ORIGIN` with the exact frontend URL from Step 3 (example `https://your-booknest-site.onrender.com`).
3. Save changes and redeploy the backend if prompted.
4. Open the frontend URL on your phone. Test the book list and demo login.

## Demo login
- Reader: `reader@booknest.demo`
- Admin demo: `admin@booknest.demo`
- Password: `booknest123`

## Important demo limitations
- This is a student demonstration project, not a production e-commerce system.
- Login and checkout are demo-only; UPI is simulated and does not collect money.
- Orders are stored in memory and reset when the backend restarts or sleeps/restarts. Do not use for real customers or real payments.
- Free hosting services may sleep after inactivity, so the first visit may be slow.

## Manual local run
Backend terminal:
```bash
cd server
npm install
npm run dev
```
Frontend terminal:
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173.
