import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Task title must be at least 3 characters long"],
      maxlength: [100, "Task title cannot exceed 100 characters"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: [true, "Estimated end time is required"],
    },
    actualEndTime: {
      type: Date,
      default: null,
    },
    priority: {
      type: Number,
      required: [true, "Priority is required"],
      min: [1, "Priority must be between 1 and 5"],
      max: [5, "Priority must be between 1 and 5"],
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do",
      required: true,
    }
  },
  {
    timestamps: true,
    strict: true,
  }
);

const taskModel = mongoose.models.Task || mongoose.model("task", taskSchema);

export default taskModel;
