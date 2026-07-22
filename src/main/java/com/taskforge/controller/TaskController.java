package com.taskforge.controller;

import com.taskforge.dto.request.CreateTaskRequest;
import com.taskforge.dto.request.UpdateTaskRequest;
import com.taskforge.dto.request.UpdateTaskStatusRequest;
import com.taskforge.dto.response.PageResponse;
import com.taskforge.dto.response.TaskResponse;
import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;
import com.taskforge.security.UserPrincipal;
import com.taskforge.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tasks", description = "Endpoints for managing user tasks")
@SecurityRequirement(name = "Bearer Authentication")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    @Operation(summary = "Create a new task", description = "Creates a new task for the authenticated user.")
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateTaskRequest request) {
        TaskResponse response = taskService.createTask(currentUser.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID", description = "Retrieves a single task by its unique ID for the authenticated user.")
    public ResponseEntity<TaskResponse> getTaskById(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable("id") String taskId) {
        TaskResponse response = taskService.getTaskById(currentUser.getId(), taskId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "List and filter tasks", description = "Retrieves a paginated list of tasks with optional filtering by status, priority, and search keyword.")
    public ResponseEntity<PageResponse<TaskResponse>> getTasks(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<TaskResponse> response = taskService.getTasks(
                currentUser.getId(), status, priority, search, page, size, sortBy, sortDir);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update task", description = "Updates all fields of an existing task.")
    public ResponseEntity<TaskResponse> updateTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable("id") String taskId,
            @Valid @RequestBody UpdateTaskRequest request) {
        TaskResponse response = taskService.updateTask(currentUser.getId(), taskId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update task status", description = "Updates only the status field of an existing task.")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable("id") String taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request) {
        TaskResponse response = taskService.updateTaskStatus(currentUser.getId(), taskId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete task", description = "Deletes a task by ID.")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable("id") String taskId) {
        taskService.deleteTask(currentUser.getId(), taskId);
        return ResponseEntity.noContent().build();
    }
}
