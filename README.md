# Banco Solar - Financial Management System

This project is a Node.js application that interacts with a PostgreSQL database to manage user accounts and perform financial transactions. It includes functionalities to add, retrieve, update, and delete user records, as well as to handle money transfers between users.

## Prerequisites

- Node.js installed on your machine
- PostgreSQL installed and running
- A PostgreSQL database and tables created for storing user and transfer data

## Installation

1. Clone the repository to your local machine:

2. Install the required dependencies:

    ```bash
    npm install
    ```

3. Set up your environment variables. Create a `.env` file in the root directory of your project and add the following variables from `.env.example`:

    ```plaintext
    USER_DB=your_db_user
    HOST_DB=your_db_host
    DB_NAME=your_db_name
    PASSWORD_DB=your_db_password
    DB_PORT=your_db_port
    ```

4. Create the PostgreSQL database and tables. You can use the following SQL script to create the tables:

    ```sql
    CREATE DATABASE bancosolar;

    \c bancosolar

    CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        balance FLOAT CHECK (balance >= 0)
    );

    CREATE TABLE transferencias (
        id SERIAL PRIMARY KEY,
        emisor INT,
        receptor INT,
        monto FLOAT,
        fecha TIMESTAMP,
        FOREIGN KEY (emisor) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (receptor) REFERENCES usuarios(id) ON DELETE CASCADE
    );
    ```

## Usage

1. Run the application:

    ```bash
    node server.js
    ```

2. Open your browser and navigate to `http://localhost:3000` to interact with the web interface.

## API Endpoints

### Add a new user

- **URL:** `/usuario`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "nombre": "User Name",
    "balance": 1000
  }
  ```

### Retrieve all users

- **URL:** `/usuarios`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    [
      {
        "id": 1,
        "nombre": "User Name",
        "balance": 1000
      }
    ]
    ```

### Update a user

- **URL:** `/usuario`
- **Method:** `PUT`
- **Body:**
  ```json
  {
    "originalName": "Original User Name",
    "newName": "New User Name",
    "balance": 2000
  }
  ```

### Delete a user

- **URL:** `/usuario`
- **Method:** `DELETE`
- **Query Parameter:** `id`
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "message": "User with id 1 deleted successfully"
    }
    ```

### Add a new transfer

- **URL:** `/transferencia`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "emisor": "Sender Name",
    "receptor": "Receiver Name",
    "monto": 100
  }
  ```

### Retrieve all transfers

- **URL:** `/transferencias`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    [
      {
        "id": 1,
        "monto": 100,
        "fecha": "2024-06-22T22:35:47.700Z",
        "emisor_nombre": "Sender Name",
        "receptor_nombre": "Receiver Name"
      }
    ]
    ```

## Functions

- `addUser(name, balance)`: Adds a new user to the database.
- `getUsers()`: Retrieves all users from the database.
- `updateUser(originalName, newName, balance)`: Updates the details of a user identified by their original name.
- `deleteUser(id)`: Deletes a user from the database identified by their ID.
- `addTransfer(emisorName, receptorName, amount)`: Makes a new transfer between two users.
- `getTransfers()`: Retrieves all transfers from the database.

## Error Handling

The application uses prepared statements to prevent SQL injection and includes error handling to manage database query errors. The `sanitizeInput` function ensures that user input is cleaned before being processed or stored, significantly reducing the risk of security vulnerabilities.

## Frontend Usage

- The frontend interface allows you to add new users, update existing users, delete users, and perform money transfers between users.
- The user table and transfer table dynamically update to reflect the latest data.
