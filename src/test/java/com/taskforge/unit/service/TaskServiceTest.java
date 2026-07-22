package com.taskforge.unit.service;

import com.taskforge.dto.request.CreateTaskRequest;
import com.taskforge.dto.request.UpdateTaskRequest;
import com.taskforge.dto.request.UpdateTaskStatusRequest;
import com.taskforge.dto.response.PageResponse;
import com.taskforge.dto.response.TaskResponse;
import com.taskforge.exception.ResourceNotFoundException;
import com.taskforge.model.Task;
import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;
import com.taskforge.model.User;
import com.taskforge.repository.PrismaTaskRepository;
import com.taskforge.repository.UserRepository;
import com.taskforge.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private PrismaTaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private User user;
    private Task task;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id("usr-123")
                .name("Alex Johnson")
                .email("alex@example.com")
                .password("encoded_pass")
                .build();

        task = Task.builder()
                .id("tsk-456")
                .title("Write Documentation")
                .description("Document codebase and APIs")
                .status(TaskStatus.PENDING)
                .priority(TaskPriority.HIGH)
                .dueDate(Instant.now().plusSeconds(86400))
                .user(user)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("Should create a new task successfully")
    void createTask_Success() {
        CreateTaskRequest request = CreateTaskRequest.builder()
                .title("Write Documentation")
                .description("Document codebase and APIs")
                .priority(TaskPriority.HIGH)
                .dueDate(task.getDueDate())
                .build();

        given(userRepository.findById("usr-123")).willReturn(Optional.of(user));
        given(taskRepository.save(any(Task.class))).willReturn(task);

        TaskResponse response = taskService.createTask("usr-123", request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo("tsk-456");
        assertThat(response.getTitle()).isEqualTo("Write Documentation");
        assertThat(response.getPriority()).isEqualTo(TaskPriority.HIGH);
        assertThat(response.getStatus()).isEqualTo(TaskStatus.PENDING);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user is not found during task creation")
    void createTask_UserNotFound_ThrowsException() {
        CreateTaskRequest request = CreateTaskRequest.builder()
                .title("Invalid Task")
                .build();

        given(userRepository.findById("invalid-usr")).willReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.createTask("invalid-usr", request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("Should retrieve task by ID and user ID")
    void getTaskById_Success() {
        given(taskRepository.findByIdAndUserId("tsk-456", "usr-123")).willReturn(Optional.of(task));

        TaskResponse response = taskService.getTaskById("usr-123", "tsk-456");

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo("tsk-456");
        assertThat(response.getUserId()).isEqualTo("usr-123");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when task ID is not found")
    void getTaskById_NotFound_ThrowsException() {
        given(taskRepository.findByIdAndUserId("nonexistent", "usr-123")).willReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTaskById("usr-123", "nonexistent"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Task not found");
    }

    @Test
    @DisplayName("Should retrieve filtered and paginated tasks")
    void getTasks_WithFilters_Success() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
        Page<Task> taskPage = new PageImpl<>(List.of(task), pageable, 1);

        given(taskRepository.findAll(any(Specification.class), any(Pageable.class))).willReturn(taskPage);

        PageResponse<TaskResponse> response = taskService.getTasks(
                "usr-123", TaskStatus.PENDING, TaskPriority.HIGH, null, 0, 10, "createdAt", "desc");

        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getTotalElements()).isEqualTo(1);
        assertThat(response.getContent().get(0).getId()).isEqualTo("tsk-456");
    }

    @Test
    @DisplayName("Should update task details successfully")
    void updateTask_Success() {
        UpdateTaskRequest updateRequest = UpdateTaskRequest.builder()
                .title("Updated Task Title")
                .description("Updated description")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.HIGH)
                .build();

        given(taskRepository.findByIdAndUserId("tsk-456", "usr-123")).willReturn(Optional.of(task));
        given(taskRepository.save(any(Task.class))).willReturn(task);

        TaskResponse response = taskService.updateTask("usr-123", "tsk-456", updateRequest);

        assertThat(response).isNotNull();
        verify(taskRepository).save(task);
    }

    @Test
    @DisplayName("Should update task status successfully")
    void updateTaskStatus_Success() {
        UpdateTaskStatusRequest statusRequest = UpdateTaskStatusRequest.builder()
                .status(TaskStatus.COMPLETED)
                .build();

        given(taskRepository.findByIdAndUserId("tsk-456", "usr-123")).willReturn(Optional.of(task));
        given(taskRepository.save(any(Task.class))).willReturn(task);

        TaskResponse response = taskService.updateTaskStatus("usr-123", "tsk-456", statusRequest);

        assertThat(response).isNotNull();
        verify(taskRepository).save(task);
    }

    @Test
    @DisplayName("Should delete task successfully")
    void deleteTask_Success() {
        given(taskRepository.findByIdAndUserId("tsk-456", "usr-123")).willReturn(Optional.of(task));

        taskService.deleteTask("usr-123", "tsk-456");

        verify(taskRepository).delete(task);
    }
}
