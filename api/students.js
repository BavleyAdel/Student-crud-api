import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
let isConnected = false;

// Schema and model
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  phone: { type: String, required: true }
});
const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

export default async function handler(req, res) {
  if (!isConnected) {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
  }

  const { method, query, body } = req;

  try {
    switch (method) {
      case "POST":
        const student = await Student.create(body);
        return res.status(201).json(student);

      case "GET":
        if (query.id) {
          const found = await Student.findById(query.id);
          if (!found) return res.status(404).json({ error: "Student not found" });
          return res.status(200).json(found);
        } else {
          const students = await Student.find();
          return res.status(200).json(students);
        }

      case "PUT":
        if (!query.id) return res.status(400).json({ error: "ID is required" });
        const updated = await Student.findByIdAndUpdate(query.id, body, { new: true, runValidators: true });
        if (!updated) return res.status(404).json({ error: "Student not found" });
        return res.status(200).json(updated);

      case "DELETE":
        if (!query.id) return res.status(400).json({ error: "ID is required" });
        const deleted = await Student.findByIdAndDelete(query.id);
        if (!deleted) return res.status(404).json({ error: "Student not found" });
        return res.status(200).json({ message: "Student deleted successfully" });

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
