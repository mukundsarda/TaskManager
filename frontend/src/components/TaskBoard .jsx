/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X, Edit, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setTasks,
  addTask,
  updateTask,
  removeTask,
} from "../redux/features/task/taskSlice";
import { logout } from "../redux/features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import Button from "./Button";

axios.defaults.withCredentials = true;

const API_URL =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000";

  const TaskDetailModal = ({ task, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{task.title}</h2>
        
        <div className="space-y-4">
          <div>
            <p className="font-medium">Status</p>
            <p className={`inline-block px-2 py-1 rounded ${
              task.status === 'finished' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {task.status}
            </p>
          </div>
  
          <div>
            <p className="font-medium">Priority</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`${
                    star <= task.priority ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
  
          <div>
            <p className="font-medium">Start Time</p>
            <p>{new Date(task.startTime).toLocaleString()}</p>
          </div>
  
          <div>
            <p className="font-medium">
              {task.status === 'finished' ? 'Completion Time' : 'Expected End Time'}
            </p>
            <p>
              {new Date(
                task.status === 'finished' ? task.actualEndTime : task.endTime
              ).toLocaleString()}
            </p>
          </div>
  
          {task.status === 'finished' && task.actualEndTime && (
            <div>
              <p className="font-medium">Original Estimated End Time</p>
              <p>{new Date(task.endTime).toLocaleString()}</p>
            </div>
          )}
        </div>
  
        <button
          onClick={onClose}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Close
        </button>
      </div>
    </div>
  );

  const EditTaskModal = ({ task, onSave, onClose }) => {
    const [editedTask, setEditedTask] = useState(task);
  
    const handleSave = () => {
      onSave(editedTask);
      onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Edit Task</h2>
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="w-full p-2 mb-4 border rounded"
            placeholder="Task Title"
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={editedTask.startTime ? new Date(editedTask.startTime).toISOString().slice(0, 16) : ''}
              onChange={(e) => setEditedTask({ ...editedTask, startTime: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
  
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Estimated End Time</label>
            <input
              type="datetime-local"
              value={editedTask.endTime ? new Date(editedTask.endTime).toISOString().slice(0, 16) : ''}
              onChange={(e) => setEditedTask({ ...editedTask, endTime: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
  
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Priority (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={editedTask.priority}
              onChange={(e) => setEditedTask({ ...editedTask, priority: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
            />
          </div>
  
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={editedTask.status}
              onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
  
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

const TrelloBoard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewTask, setViewTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tasks = useSelector((state) => state.tasks.tasks);
  let color = "#ffffff";

  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "#3498db",
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/tasks`);
        dispatch(setTasks(response.data));
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          dispatch(logout());
          navigate("/login");
        } else {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchTasks();
  }, [dispatch, navigate]);

  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        break;
      case 'startTime':
        filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        break;
      case 'endTime':
        filtered.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
        break;
      case 'priority':
        filtered.sort((a, b) => b.priority - a.priority); // Higher priority first
        break;
      default:
        break;
    }

    return filtered;
  };

  const columns = {
    todo: {
      id: "todo",
      title: "TO DO",
      tasks: getFilteredAndSortedTasks().filter((task) => task.status === "To Do"),
    },
    inProgress: {
      id: "inProgress",
      title: "IN PROGRESS",
      tasks: getFilteredAndSortedTasks().filter((task) => task.status === "In Progress"),
    },
    done: {
      id: "done",
      title: "DONE",
      tasks: getFilteredAndSortedTasks().filter((task) => task.status === "Done"),
    },
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const task = columns[source.droppableId].tasks[source.index];
    const updatedTask = {
      ...task,
      status:
        destination.droppableId === "inProgress"
          ? "In Progress"
          : destination.droppableId === "done"
          ? "Done"
          : "To Do",
    };

    try {
      const response = await axios.put(
        `${API_URL}/api/v1/tasks/${task._id}`,
        updatedTask
      );
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const addNewTask = async () => {
    const newTask = {
      title: "New Task",
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: 3,
      status: "To Do", // Changed from "pending" to "To Do"
    };
  
    try {
      const response = await axios.post(`${API_URL}/api/v1/tasks`, newTask);
      dispatch(addTask(response.data));
      setEditTask(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/api/v1/tasks/${taskId}`);
      dispatch(removeTask(taskId));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  const handleEditTask = async (updatedTask) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/v1/tasks/${updatedTask._id}`,
        updatedTask
      );
      dispatch(updateTask(response.data));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate("/login");
      } else {
        setError(err.message);
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center text-2xl">
        <h1>
          Using Free Service for Hosting, So it will take upto 40-50 secs for
          Initial Loading...
          <ClipLoader
            color={color}
            loading={loading}
            cssOverride={override}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </h1>
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            bgColor="bg-gray-700"
            textColor="text-white"
            className="rounded hover:bg-gray-600"
            onClick={addNewTask}
          >
            Add Task
          </Button>
          <Button
            bgColor="bg-gray-700"
            textColor="text-white"
            className="rounded hover:bg-gray-600"
            onClick={() => navigate("/dashboard")}
          >
            View Dashboard
          </Button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="recent">Recent</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="startTime">Start Time</option>
          <option value="endTime">End Time</option>
          <option value="priority">Priority</option>
        </select>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row gap-4">
          {Object.values(columns).map((column) => (
            <div key={column.id} className="flex-1 min-w-[250px]">
              <h2 className="font-bold mb-2 bg-gray-700 text-white p-2 rounded">
                {column.title}
              </h2>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gray-200 p-2 rounded min-h-[100px]"
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 mb-2 rounded shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold">{task.title}</h3>
                              <span className={`px-2 py-1 rounded text-xs ${
                                task.status === 'finished' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {task.status}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-2">
                              <div className="flex items-center mb-1">
                                <span className="font-medium mr-2">Priority:</span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`${
                                        star <= task.priority ? 'text-yellow-500' : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="text-xs space-y-1">
                                <p>
                                  <span className="font-medium">Start:</span>{' '}
                                  {new Date(task.startTime).toLocaleString()}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    {task.status === 'finished' ? 'Completed:' : 'Expected End:'}
                                  </span>{' '}
                                  {new Date(task.status === 'finished' ? task.actualEndTime : task.endTime).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-end mt-2 space-x-2">
                              <button
                                onClick={() => deleteTask(task._id)}
                                className="text-red-500 hover:bg-red-100 p-1 rounded"
                              >
                                <X size={16} />
                              </button>
                              <button
                                onClick={() => setEditTask(task)}
                                className="text-blue-500 hover:bg-blue-100 p-1 rounded"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => setViewTask(task)}
                                className="text-green-500 hover:bg-green-100 p-1 rounded"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      {viewTask && (
        <TaskDetailModal task={viewTask} onClose={() => setViewTask(null)} />
      )}
      {editTask && (
        <EditTaskModal
          task={editTask}
          onSave={handleEditTask}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
};

export default TrelloBoard;
