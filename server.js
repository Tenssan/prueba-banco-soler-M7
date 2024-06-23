const express = require("express");
const path = require("path");
const {
  addUser,
  getUsers,
  updateUser,
  deleteUser,
  addTransfer,
  getTransfers,
} = require("./queries");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, ".")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/usuario", async (req, res) => {
  const { nombre, balance } = req.body;
  try {
    const newUser = await addUser(nombre, balance);
    res.status(201).json(newUser);
  } catch (e) {
    res.status(500).json({ error: "Error adding new user", e });
  }
});

app.get("/usuarios", async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ error: "Error fetching users", e });
  }
});

app.put("/usuario", async (req, res) => {
  const { originalName, newName, balance } = req.body;
  try {
    const updatedUser = await updateUser(originalName, newName, balance);
    res.status(200).json(updatedUser);
  } catch (e) {
    res.status(500).json({ error: "Error updating user", message: e.message });
  }
});

app.delete("/usuario", async (req, res) => {
  const { id } = req.query;
  try {
    const deletedUser = await deleteUser(id);
    res.status(200).json(deletedUser);
  } catch (e) {
    res.status(500).json({ error: "Error deleting user", e });
  }
});

app.post("/transferencia", async (req, res) => {
  const { emisor, receptor, monto } = req.body;
  try {
    const newTransfer = await addTransfer(emisor, receptor, monto);
    res.status(201).json(newTransfer);
  } catch (e) {
    res.status(500).json({ error: "Error making transfer", e });
  }
});

app.get("/transferencias", async (req, res) => {
  try {
    const transfers = await getTransfers();
    res.status(200).json(transfers);
  } catch (e) {
    res.status(500).json({ error: "Error fetching transfers", e });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
