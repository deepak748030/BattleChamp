# Battle Champ

Battle Champ is a user management system built using the MERN stack (MongoDB, Express, React, Node.js). It includes features such as user registration, login with mobile numbers, and wallet management. This project provides an API for managing users with functionalities for account creation, login, and updating user details, while restricting wallet modifications.

## Features

- **User Registration**: Create new users with mobile, email, and name.
- **Login**: Authenticate users via mobile number and JWT.
- **Wallet Management**: Each user is assigned three wallets: `Winning Wallet`, `Deposit Wallet`, and `Bonus Wallet`, with a bonus of ₹10 upon registration.
- **User Update**: Update user details like name and email while protecting wallet data from modification.
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

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/deepak748030/BattleChamp.git
   cd battle-champ
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables in a `.env` file:

   ```bash
   JWT_SECRET=your_jwt_secret
   MONGO_URI=your_mongo_connection_string
   ```

4. Run the application:

   ```bash
   npm start
   ```

## API Endpoints

### 1. **Register a New User**
   - **URL**: `POST /api/users/register`

### 2. **Login User**
   - **URL**: `POST /api/users/login`

### 3. **Get User by ID**
   - **URL**: `GET /api/users/:id`

### 4. **Update User**
   - **URL**: `PUT /api/users/update/:id`
  


## License

