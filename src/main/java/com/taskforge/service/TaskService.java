package com.taskforge.service;

import com.taskforge.dto.request.CreateTaskRequest;
import com.taskforge.dto.request.UpdateTaskRequest;
import com.taskforge.dto.request.UpdateTaskStatusRequest;
import com.taskforge.dto.response.PageResponse;
import com.taskforge.dto.response.TaskResponse;
import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;

public interface TaskService {
    TaskResponse createTask(String userId, CreateTaskRequest request);
    TaskResponse getTaskById(String userId, String taskId);
    PageResponse<TaskResponse> getTasks(String userId, TaskStatus status, TaskPriority priority, String search, int page, int size, String sortBy, String sortDir);
    TaskResponse updateTask(String userId, String taskId, UpdateTaskRequest request);
    TaskResponse updateTaskStatus(String userId, String taskId, UpdateTaskStatusRequest request);
    void deleteTask(String userId, String taskId);
}
