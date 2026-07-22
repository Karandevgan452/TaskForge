package com.taskforge.dto.response;

import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {

    private String id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Instant dueDate;
    private Instant createdAt;
    private Instant updatedAt;
    private String userId;
}
