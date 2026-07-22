package com.taskforge.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.dto.request.*;
import com.taskforge.dto.response.AuthResponse;
import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;
import com.taskforge.repository.TaskRepository;
import com.taskforge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        taskRepository.deleteAll();
        userRepository.deleteAll();

        // Register user and get JWT
        RegisterRequest registerRequest = RegisterRequest.builder()
                .name("Task Owner")
                .email("owner@example.com")
                .password("password123")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseJson, AuthResponse.class);
        this.jwtToken = "Bearer " + authResponse.getToken();
    }

    @Test
    @DisplayName("POST /api/tasks should create a new task successfully")
    void createTask_Authenticated_Returns201() throws Exception {
        CreateTaskRequest request = CreateTaskRequest.builder()
                .title("Build CI/CD Pipeline")
                .description("Configure GitHub Actions workflow")
                .priority(TaskPriority.HIGH)
                .dueDate(Instant.now().plusSeconds(86400))
                .build();

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Build CI/CD Pipeline"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.priority").value("HIGH"));
    }

    @Test
    @DisplayName("GET /api/tasks without authorization header should return 401 Unauthorized")
    void getTasks_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/tasks/{id} should return task details")
    void getTaskById_ReturnsTask() throws Exception {
        // Create task
        CreateTaskRequest request = CreateTaskRequest.builder()
                .title("Single Task Test")
                .description("Testing single task retrieval")
                .priority(TaskPriority.MEDIUM)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        String taskId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // Get by ID
        mockMvc.perform(get("/api/tasks/" + taskId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(taskId))
                .andExpect(jsonPath("$.title").value("Single Task Test"));
    }

    @Test
    @DisplayName("GET /api/tasks with status and priority filters should return filtered list")
    void getTasks_FilterByStatusAndPriority_ReturnsFilteredPage() throws Exception {
        // Create 2 tasks
        CreateTaskRequest task1 = CreateTaskRequest.builder()
                .title("High Pending Task")
                .priority(TaskPriority.HIGH)
                .build();

        CreateTaskRequest task2 = CreateTaskRequest.builder()
                .title("Low Pending Task")
                .priority(TaskPriority.LOW)
                .build();

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(task1)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(task2)))
                .andExpect(status().isCreated());

        // Filter by priority=HIGH
        mockMvc.perform(get("/api/tasks")
                        .header("Authorization", jwtToken)
                        .param("priority", "HIGH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("High Pending Task"));
    }

    @Test
    @DisplayName("PUT /api/tasks/{id} should update task content")
    void updateTask_ReturnsUpdatedTask() throws Exception {
        CreateTaskRequest createRequest = CreateTaskRequest.builder()
                .title("Original Title")
                .priority(TaskPriority.LOW)
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String taskId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        UpdateTaskRequest updateRequest = UpdateTaskRequest.builder()
                .title("Updated Title")
                .description("Added description")
                .status(TaskStatus.IN_PROGRESS)
                .priority(TaskPriority.HIGH)
                .build();

        mockMvc.perform(put("/api/tasks/" + taskId)
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.priority").value("HIGH"));
    }

    @Test
    @DisplayName("PATCH /api/tasks/{id}/status should update status only")
    void updateTaskStatus_ReturnsTaskWithNewStatus() throws Exception {
        CreateTaskRequest createRequest = CreateTaskRequest.builder()
                .title("Status Patch Test")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String taskId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        UpdateTaskStatusRequest statusRequest = UpdateTaskStatusRequest.builder()
                .status(TaskStatus.COMPLETED)
                .build();

        mockMvc.perform(patch("/api/tasks/" + taskId + "/status")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} should delete task and return 204 No Content")
    void deleteTask_Returns204NoContent() throws Exception {
        CreateTaskRequest createRequest = CreateTaskRequest.builder()
                .title("Task to be deleted")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String taskId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(delete("/api/tasks/" + taskId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isNoContent());

        // Verify task is deleted
        mockMvc.perform(get("/api/tasks/" + taskId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isNotFound());
    }
}
