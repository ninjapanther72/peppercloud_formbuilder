# Form Builder Application (MERN Stack)

## Project Overview

This is a full-stack MERN application that allows users to create, edit, view, and manage forms. The frontend is built using React.js, the backend using Node.js with Express.js, MongoDB for the database, and the project is deployed using Netlify, Render, and MongoDB Atlas.

## Features

- Create, edit, and view forms.
- Supports various input types: Email, Text, Password, Number, Date.
- Drag and drop functionality for arranging inputs (optional).
- Group inputs into sections (optional).

## Technologies Used

- **Frontend**: React.js, React Router, Drag and Drop (no third-party library)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Deployment**:
  - **Frontend**: Netlify
  - **Backend**: Render
  - **Database**: MongoDB Atlas

## Installation

### Frontend

1. Clone the frontend repository:
    ```bash
    git clone https://github.com/your-username/form-builder-frontend.git
    cd form-builder-frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Run the development server:
    ```bash
    npm start
    ```

### Backend

1. Clone the backend repository:
    ```bash
    git clone https://github.com/your-username/form-builder-backend.git
    cd form-builder-backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Set up environment variables in `.env`:
    ```env
    MONGO_URI=your-mongodb-uri
    ```
4. Start the server:
    ```bash
    node server.js
    ```

## Deployment

### Frontend (Netlify)

1. Push your frontend code to GitHub.
2. Connect your repository to Netlify.
3. Set the build command to `npm run build`.
4. Set the publish directory to `build`.
5. Deploy the site.

### Backend (Render)

1. Push your backend code to GitHub.
2. Connect your repository to Render.
3. Set the start command to `node server.js`.
4. Set up the environment variable `MONGO_URI`.
5. Deploy the service.

### Database (MongoDB Atlas)

1. Create a free MongoDB cluster on MongoDB Atlas.
2. Create a new database and collection.
3. Obtain the connection string and add it to your `.env` file.

## Usage

1. Navigate to the homepage to view all forms.
2. Click "Create Form" to build a new form.
3. Edit and view forms using the respective pages.
4. Use drag-and-drop to rearrange inputs (optional).

## License

This project is licensed under the MIT License.
