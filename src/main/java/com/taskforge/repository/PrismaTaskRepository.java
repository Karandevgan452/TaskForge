package com.taskforge.repository;

import com.taskforge.model.Task;
import com.taskforge.model.TaskPriority;
import com.taskforge.model.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class PrismaTaskRepository {

    private final TaskRepository taskRepository;

    public PrismaTaskRepository(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task save(Task task) {
        return taskRepository.save(task);
    }

    public Optional<Task> findById(String id) {
        return taskRepository.findById(id);
    }

    public Optional<Task> findByIdAndUserId(String id, String userId) {
        return taskRepository.findByIdAndUserId(id, userId);
    }

    public Page<Task> findAll(Specification<Task> spec, Pageable pageable) {
        return taskRepository.findAll(spec, pageable);
    }

    public void delete(Task task) {
        taskRepository.delete(task);
    }

    public void deleteById(String id) {
        taskRepository.deleteById(id);
    }

    public static Specification<Task> buildSpecification(String userId, TaskStatus status, TaskPriority priority, String search) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();
            if (userId != null) {
                predicates = cb.and(predicates, cb.equal(root.get("user").get("id"), userId));
            }
            if (status != null) {
                predicates = cb.and(predicates, cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates = cb.and(predicates, cb.equal(root.get("priority"), priority));
            }
            if (search != null && !search.isBlank()) {
                String likePattern = "%" + search.trim().toLowerCase() + "%";
                var titleLike = cb.like(cb.lower(root.get("title")), likePattern);
                var descLike = cb.like(cb.lower(root.get("description")), likePattern);
                predicates = cb.and(predicates, cb.or(titleLike, descLike));
            }
            return predicates;
        };
    }
}
