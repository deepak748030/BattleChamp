# Battle Champ

**Battle Champ** is a user management system built using the **MERN stack** (MongoDB, Express, React, Node.js). It includes features such as user registration, login with mobile numbers, and wallet management. The project provides a backend API for managing users, supporting functionalities like account creation, login, and updating user details, with restrictions on modifying wallet data.

> **Note**: This is the backend portion of the game, involving real money betting and prize systems. The system allows users to play games and win prizes, with wallet functionalities for winnings, deposits, and bonuses.

## Features

- **User Registration**: Create new users with mobile number, email, and name.
- **Login**: Authenticate users via mobile number and JWT.
- **Wallet Management**: Each user is assigned three wallets:
  - **Winning Wallet**
  - **Deposit Wallet**
  - **Bonus Wallet** (with ₹10 bonus upon registration)
- **User Update**: Update user details such as name and email while protecting wallet data from modifications.
- **API Security**: Secured with JWT authentication.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [License](#license)

## Technologies

- **Frontend**: React.js (Future scope)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token)
- **Validation**: Mongoose
- **Caching**: NodeCache
- **API Requests**: Axios

## Installation

To set up the project locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/deepak748030/BattleChamp.git
cd battle-champ
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables in a `.env` file

```env
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongo_connection_string
```

### 4. Run the application

```bash
npm start
```

## API Endpoints

1. **Register a New User**  
   - **URL**: `POST /api/users/register`
   
2. **Login User**  
   - **URL**: `POST /api/users/login`
   
3. **Get User by ID**  
   - **URL**: `GET /api/users/:id`
   
4. **Update User**  
   - **URL**: `PUT /api/users/update/:id`

## License

This project is licensed under the **ISC License**.

### Notes:
- This `README.md` file outlines the basic project structure, how to set it up locally, and the API endpoints available.
- The **Technologies** section lists the technologies used, and the **Installation** section provides detailed steps to clone and run the application.
- The **License** section mentions the license for the project (ISC in this case). If you plan to choose a different license, you can modify this section accordingly.
