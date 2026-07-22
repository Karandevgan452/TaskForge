package com.taskforge.repository;

import com.taskforge.model.Task;
import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String>, JpaSpecificationExecutor<Task> {
    Page<Task> findByUserId(String userId, Pageable pageable);
    Optional<Task> findByIdAndUserId(String id, String userId);
    Page<Task> findByUserIdAndStatus(String userId, TaskStatus status, Pageable pageable);
    Page<Task> findByUserIdAndPriority(String userId, TaskPriority priority, Pageable pageable);
}
