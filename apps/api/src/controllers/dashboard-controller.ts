import type { Request, Response } from 'express';
import { ProjectModel } from '../models/project.js';
import { TaskModel } from '../models/task.js';
import { ActivityLogModel } from '../models/activity-log.js';
import { respond } from '../utils/api.js';
export const dashboard = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const allProjects = await ProjectModel.find({
    $or: [{ owner: userId }, { members: userId }],
    archivedAt: null,
  }).select('_id');
  const allProjectIds = allProjects.map((p) => p.id);

  const [projects, assignedTasks, totalAssignedCount, totalCompletedCount, activity] =
    await Promise.all([
      ProjectModel.find({ _id: { $in: allProjectIds } })
        .sort({ updatedAt: -1 })
        .limit(6),
      TaskModel.find({ assignee: userId, status: { $ne: 'done' } })
        .populate('project', 'name key')
        .sort({ dueDate: 1 })
        .limit(8),
      TaskModel.countDocuments({ assignee: userId, status: { $ne: 'done' } }),
      TaskModel.countDocuments({ project: { $in: allProjectIds }, status: 'done' }),
      ActivityLogModel.find({ project: { $in: allProjectIds } })
        .populate('actor', 'name avatarUrl')
        .populate('project', 'name key')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

  return respond(res, 200, 'Dashboard retrieved', {
    statistics: {
      projects: allProjects.length,
      assignedTasks: totalAssignedCount,
      completedTasks: totalCompletedCount,
    },
    projects,
    assignedTasks,
    activity,
  });
};
