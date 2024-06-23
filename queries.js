require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.USER_DB,
  host: process.env.HOST_DB,
  database: process.env.DB_NAME,
  password: process.env.PASSWORD_DB,
  port: process.env.DB_PORT,
});

const sanitizeInput = (input) => {
  return input.replace(/[^\w\s.-]/g, "").trim();
};

const getUserId = async (name) => {
  const client = await pool.connect();
  try {
    const query = {
      text: "SELECT id FROM usuarios WHERE nombre = $1",
      values: [name],
    };
    const res = await client.query(query);
    if (res.rows.length === 0) throw new Error(`User ${name} not found`);
    return res.rows[0].id;
  } finally {
    client.release();
  }
};

const addUser = async (name, balance) => {
  name = sanitizeInput(name);

  if (name.length === 0 || balance === undefined)
    throw new Error("Name and balance must be provided");
  if (balance < 0) throw new Error("Balance must be a positive number");
  if (name.length > 50) throw new Error("Name must be less than 50 characters");

  const userExists = await getUserId(name.toUpperCase()).catch(() => null);
  if (userExists) throw new Error("User already exists");

  name = name.toUpperCase().trim();

  const query = {
    text: "INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *",
    values: [name, balance],
  };
  try {
    const res = await pool.query(query);
    return res.rows[0];
  } catch (e) {
    console.error("Error adding new user: ", e);
    throw e;
  }
};

const getUsers = async () => {
  const query = "SELECT * FROM usuarios";
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error fetching users: ", e);
    throw e;
  }
};

const updateUser = async (originalName, newName, balance) => {
  const userId = await getUserId(originalName);
  if (!userId) throw new Error(`User ${originalName} not found`);

  if (newName.length === 0 && balance === undefined)
    throw new Error("Name and/or balance must be provided");
  if (balance !== undefined && balance < 0)
    throw new Error("Balance must be a positive number");
  if (newName.length > 50)
    throw new Error("Name must be less than 50 characters");

  newName = sanitizeInput(newName).toUpperCase().trim();

  const query = {
    text: "UPDATE usuarios SET nombre = COALESCE($1, nombre), balance = COALESCE($2, balance) WHERE id = $3 RETURNING *",
    values: [newName, balance, userId],
  };

  try {
    const res = await pool.query(query);
    return res.rows[0];
  } catch (e) {
    console.error("Error updating user: ", e);
    throw e;
  }
};

const deleteUser = async (id) => {
  const query = {
    text: "DELETE FROM usuarios WHERE id = $1 RETURNING *",
    values: [id],
  };
  try {
    const res = await pool.query(query);
    return res.rows[0];
  } catch (e) {
    console.error("Error deleting user: ", e);
    throw e;
  }
};

const addTransfer = async (emisorName, receptorName, monto) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const emisor = await getUserId(emisorName);
    const receptor = await getUserId(receptorName);

    if (emisor === receptor)
      throw new Error("Sender and recipient must be different");

    const deductQuery = {
      text: "UPDATE usuarios SET balance = balance - $1 WHERE id = $2 RETURNING *",
      values: [monto, emisor],
    };
    const addQuery = {
      text: "UPDATE usuarios SET balance = balance + $1 WHERE id = $2 RETURNING *",
      values: [monto, receptor],
    };
    const transferQuery = {
      text: "INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, NOW()) RETURNING *",
      values: [emisor, receptor, monto],
    };

    const deductRes = await client.query(deductQuery);
    if (deductRes.rows.length === 0)
      throw new Error("Insufficient funds or invalid sender");

    const addRes = await client.query(addQuery);
    if (addRes.rows.length === 0) throw new Error("Invalid recipient");

    const transferRes = await client.query(transferQuery);

    await client.query("COMMIT");
    return transferRes.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error making transfer: ", e);
    throw e;
  } finally {
    client.release();
  }
};

const getTransfers = async () => {
  const query = `
      SELECT 
        t.id, 
        t.monto, 
        t.fecha, 
        ue.nombre AS emisor_nombre, 
        ur.nombre AS receptor_nombre 
      FROM 
        transferencias t
      JOIN 
        usuarios ue ON t.emisor = ue.id
      JOIN 
        usuarios ur ON t.receptor = ur.id
      ORDER BY 
        t.fecha DESC
    `;
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (e) {
    console.error("Error fetching transfers: ", e);
    throw e;
  }
};

module.exports = {
  addUser,
  getUsers,
  updateUser,
  deleteUser,
  addTransfer,
  getTransfers,
};
