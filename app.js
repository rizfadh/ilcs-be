import express from "express"
import { dbConfig, statusValue } from "./constants.js"
import oracledb from "oracledb"

const app = express()

app.use(express.json())

app.post("/tasks", async (req, res) => {
  try {
    const { title, description, status } = req.body

    if (!title || !description || !status) {
      return res
        .status(400)
        .json({ message: "Title, description, and status are required" })
    }

    if (!statusValue.includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be pending or completed" })
    }

    const connection = await oracledb.getConnection(dbConfig)
    await connection.execute(
      "INSERT INTO task (title, description, status) VALUES (:title, :description, :status)",
      [title, description, status],
      { autoCommit: true }
    )

    res.status(201).json({
      message: "Task created successfully",
      task: {
        title,
        description,
        status,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
})

app.get("/tasks", async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig)
    const result = await connection.execute(
      "SELECT * FROM task ORDER BY id ASC"
    )

    const rows = result.rows.map((row) => {
      return {
        id: row[0],
        title: row[1],
        description: row[2],
        status: row[3],
      }
    })

    res.status(200).json(rows)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
})

app.get("/tasks/:id", async (req, res) => {
  try {
    const id = req.params.id

    if (isNaN(id)) {
      return res.status(400).json({ message: "id is not valid" })
    }

    const connection = await oracledb.getConnection(dbConfig)
    const result = await connection.execute(
      "SELECT * FROM task WHERE id = :id",
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" })
    }

    const data = result.rows.map((row) => {
      return {
        id: row[0],
        title: row[1],
        description: row[2],
        status: row[3],
      }
    })

    res.status(200).json(data[0])
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
})

app.put("/tasks/:id", async (req, res) => {
  try {
    const id = req.params.id

    if (isNaN(id)) {
      return res.status(400).json({ message: "id is not valid" })
    }

    const connection = await oracledb.getConnection(dbConfig)
    const isTaskExist = await connection.execute(
      "SELECT * FROM task WHERE id = :id",
      [id]
    )

    if (isTaskExist.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" })
    }

    const { title, description, status } = req.body

    if (!title || !description || !status) {
      return res
        .status(400)
        .json({ message: "Title, description, and status are required" })
    }

    if (!statusValue.includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be pending or completed" })
    }

    await connection.execute(
      "UPDATE task SET title = :title, description = :description, status = :status WHERE id = :id",
      [title, description, status, id],
      { autoCommit: true }
    )

    res.status(200).json({
      message: "Task updated successfully",
      task: {
        id,
        title,
        description,
        status,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
})

app.delete("/tasks/:id", async (req, res) => {
  try {
    const id = req.params.id

    if (isNaN(id)) {
      return res.status(400).json({ message: "id is not valid" })
    }

    const connection = await oracledb.getConnection(dbConfig)
    const isTaskExist = await connection.execute(
      "SELECT * FROM task WHERE id = :id",
      [id]
    )

    if (isTaskExist.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" })
    }

    await connection.execute("DELETE FROM task WHERE id = :id", [id], {
      autoCommit: true,
    })

    res.status(200).json({ message: "Task deleted successfully" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
})

export default app
