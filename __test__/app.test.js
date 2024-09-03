import request from "supertest"
import app from "../app.js"

describe("POST /tasks", () => {
  it("should return 201 and a message", async () => {
    const response = await request(app).post("/tasks").send({
      title: "Task 1",
      description: "Description 1",
      status: "pending",
    })
    expect(response.statusCode).toEqual(201)
    expect(response.body.message).toEqual("Task created successfully")
  })

  it("should return 400 and a message when title, description, and status are empty", async () => {
    const response = await request(app).post("/tasks").send({})
    expect(response.statusCode).toEqual(400)
    expect(response.body.message).toEqual(
      "Title, description, and status are required"
    )
  })

  it("should return 400 and a message when status is invalid", async () => {
    const response = await request(app).post("/tasks").send({
      title: "Task 1",
      description: "Description 1",
      status: "invalid",
    })
    expect(response.statusCode).toEqual(400)
    expect(response.body.message).toEqual("Status must be pending or completed")
  })
})
