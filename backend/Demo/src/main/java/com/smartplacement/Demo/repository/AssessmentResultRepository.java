
package com.smartplacement.Demo.repository;

import com.smartplacement.Demo.entity.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssessmentResultRepository
        extends JpaRepository<AssessmentResult, Long> {

    List<AssessmentResult> findByStudentId(Long studentId);
}
