import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const tasks = useSelector((state) => state.tasks.tasks);
  const [stats, setStats] = useState({
    totalTasks: 0,
    statusDistribution: {
      todo: 0,
      inProgress: 0,
      done: 0
    },
    inProgressMetrics: {
      totalLapsedTime: 0,
      totalBalanceTime: 0,
      taskCount: 0
    },
    averageCompletionTime: 0
  });

  useEffect(() => {
    calculateStats();
  }, [tasks]);

  const calculateStats = () => {
    const now = new Date();
    let totalCompletionTime = 0;
    let completedTaskCount = 0;

    // Initialize counts
    const newStats = {
      totalTasks: tasks.length,
      statusDistribution: {
        todo: 0,
        inProgress: 0,
        done: 0
      },
      inProgressMetrics: {
        totalLapsedTime: 0,
        totalBalanceTime: 0,
        taskCount: 0
      },
      averageCompletionTime: 0
    };

    tasks.forEach(task => {
      // Status distribution
      switch (task.status) {
        case "To Do":
          newStats.statusDistribution.todo++;
          break;
        case "In Progress":
          newStats.statusDistribution.inProgress++;
          newStats.inProgressMetrics.taskCount++;
          
          // Calculate lapsed and balance time for in-progress tasks
          const lapsedTime = (now - new Date(task.startTime)) / (1000 * 60 * 60); // hours
          const balanceTime = (new Date(task.endTime) - now) / (1000 * 60 * 60); // hours
          
          newStats.inProgressMetrics.totalLapsedTime += Math.max(0, lapsedTime);
          newStats.inProgressMetrics.totalBalanceTime += Math.max(0, balanceTime);
          break;
        case "Done":
          newStats.statusDistribution.done++;
          if (task.actualEndTime) {
            const completionTime = (new Date(task.actualEndTime) - new Date(task.startTime)) / (1000 * 60 * 60);
            totalCompletionTime += completionTime;
            completedTaskCount++;
          }
          break;
      }
    });

    // Calculate percentages
    const total = tasks.length;
    if (total > 0) {
      newStats.statusDistribution.todoPercent = (newStats.statusDistribution.todo / total * 100).toFixed(1);
      newStats.statusDistribution.inProgressPercent = (newStats.statusDistribution.inProgress / total * 100).toFixed(1);
      newStats.statusDistribution.donePercent = (newStats.statusDistribution.done / total * 100).toFixed(1);
    }

    // Calculate average completion time
    if (completedTaskCount > 0) {
      newStats.averageCompletionTime = (totalCompletionTime / completedTaskCount).toFixed(1);
    }

    setStats(newStats);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Task Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow text-white">
          <h2 className="text-lg font-semibold mb-2">Total Tasks</h2>
          <p className="text-3xl font-bold text-gray-200">{stats.totalTasks}</p>
        </div>

        {/* Status Distribution Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow text-white">
          <h2 className="text-lg font-semibold mb-2">Status Distribution</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>To Do:</span>
              <span className="font-medium">{stats.statusDistribution.todoPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span>In Progress:</span>
              <span className="font-medium">{stats.statusDistribution.inProgressPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span>Done:</span>
              <span className="font-medium">{stats.statusDistribution.donePercent}%</span>
            </div>
          </div>
        </div>

        {/* In Progress Metrics Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow text-white">
          <h2 className="text-lg font-semibold mb-2">In Progress Metrics</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Avg Lapsed Time:</span>
              <span className="font-medium">
                {stats.inProgressMetrics.taskCount > 0 
                  ? (stats.inProgressMetrics.totalLapsedTime / stats.inProgressMetrics.taskCount).toFixed(1)
                  : 0} hrs
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Balance Time:</span>
              <span className="font-medium">
                {stats.inProgressMetrics.taskCount > 0
                  ? (stats.inProgressMetrics.totalBalanceTime / stats.inProgressMetrics.taskCount).toFixed(1)
                  : 0} hrs
              </span>
            </div>
          </div>
        </div>

        {/* Average Completion Time Card */}
        <div className="bg-gray-800 p-4 rounded-lg shadow text-white">
          <h2 className="text-lg font-semibold mb-2">Average Completion Time</h2>
          <p className="text-3xl font-bold text-gray-200">{stats.averageCompletionTime} hrs</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 