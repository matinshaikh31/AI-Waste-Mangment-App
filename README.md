# AI Waste Management App

This repository contains the code for the **AI Waste Management App**, built with **Next.js**, **Tailwind CSS**, and other modern technologies. This app leverages AI for waste management by integrating services like Firebase, Google Maps API, and more.

## Table of Contents

- [About](#about)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setup Environment Variables](#setup-environment-variables)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [Scripts](#scripts)
- [Contributing](#contributing)

---

## About

The **AI Waste Management App** allows users to report waste locations and for other users to collect and dispose of the reported waste. Users can sign up, report waste, and collect waste through the app. For each report or collection action, users earn points, which can be redeemed for rewards.

The app's key functionalities include:

- User authentication with **Firebase**.
- Reporting and tracking waste in real-time using **Google Maps**.
- Earning points for reporting and collecting waste, which can be redeemed for rewards.
- A smooth and intuitive interface built with modern UI tools like **Radix UI** and **TailwindCSS**.

---

## Features

- **Waste Reporting & Collection**: Users can report waste locations, and other users can collect the reported waste.
- **Points & Rewards**: Earn points for reporting or collecting waste, which can be redeemed for rewards.
- **Firebase Authentication**: Secure user sign-in/sign-up using Firebase.
- **Interactive Google Maps Integration**: Visualize waste reports and collection locations on an interactive map.
- **Modern UI/UX**: Clean and responsive design using Radix UI and TailwindCSS.

---

## Prerequisites

Before setting up the project, ensure you have the following tools installed:

- **Node.js** (v18 or higher)
- **npm** (or **yarn**)
- **Drizzle ORM CLI** for database management
- **Firebase Account** for authentication and database
- **Google Cloud API Key** for Maps integration
- **PostgreSQL Database** (can be set up on Neon, Supabase, etc.)

---

## Installation

Follow these steps to set up the project locally.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/matinshaikh31/AI-Waste-Mangment-App.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd AI-Waste-Mangment-App
   ```
3. **Install dependencies:**

   ```bash
   npm install
   ```
   ```bash
   yarn install
   ```


---

## Setup Environment Variables

To set up the required environment variables, create a .env.local file in the root directory:

```bash
touch .env.local
```
Add the following environment variables to the .env.local file:

### PostgreSQL Database URL
```bash
DATABASE_URL=your_postgresql_database_url
```

### Google Maps API Key

```bash
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Firebase API Key
```bash

FIREBASE_API_KEY=your_firebase_api_key
```

### Obtaining API Keys
- **PostgreSQL Database URL**: Get this from a service like Neon or Supabase after creating a PostgreSQL database.
- **Google Maps API Key**: You can obtain this from the Google Cloud Console after enabling the Maps API.
- **Firebase API Key**: Set up a Firebase project and enable authentication, then get the API key from the project settings.

---

## Database Setup

Push database schema: Use Drizzle ORM to set up the database schema.

```bash
npm run db:push
```
Access Drizzle Studio (optional): If you want to view or manage your database visually, use the Drizzle Studio:
```bash
npm run db-studio
```

## Running the App
Once all dependencies and environment variables are set, you can run the app locally.

1. To start the development server:

```bash
npm run dev
```
Visit the app at http://localhost:3000.



##  Scripts
- **npm run dev**: Starts the development server.
- **npm run build**: Builds the app for production.
- **npm start**: Runs the production build.
- **npm run lint**: Lints your code.
- **npm run db:push**: Pushes database migrations with Drizzle.
- **npm run db-studio**: Opens the Drizzle database studio.

---

## Contributing
If you want to contribute to this project:

1. Fork the repository.
2. Create a new branch 
```bash
git checkout -b feature-branch.
```
3. Make your changes.
4. Commit and push your changes.
5. Open a pull request.

All contributions are welcome!
