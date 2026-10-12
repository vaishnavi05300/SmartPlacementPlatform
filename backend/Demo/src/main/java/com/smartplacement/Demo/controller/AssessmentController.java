


package com.smartplacement.Demo.controller;

import com.smartplacement.Demo.entity.AssessmentResult;
import com.smartplacement.Demo.repository.AssessmentResultRepository;
import com.smartplacement.Demo.repository.StudentRepository.StudentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentResultRepository assessmentRepository;
    private final StudentRepository studentRepository;

    public AssessmentController(
            AssessmentResultRepository assessmentRepository,
            StudentRepository studentRepository) {
        this.assessmentRepository = assessmentRepository;
        this.studentRepository = studentRepository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AssessmentResult saveAssessment(
            @RequestBody AssessmentResult result) {

        if (result.getStudentId() == null
                || !studentRepository.existsById(result.getStudentId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Valid student ID is required");
        }

        if (result.getSkillCategory() == null
                || result.getSkillCategory().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Skill category is required");
        }

        if (result.getTotalQuestions() == null
                || result.getTotalQuestions() <= 0
                || result.getCorrectAnswers() == null
                || result.getCorrectAnswers() < 0
                || result.getCorrectAnswers() > result.getTotalQuestions()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid assessment score");
        }

        double percentage = result.getCorrectAnswers() * 100.0
                / result.getTotalQuestions();

        result.setScorePercentage(percentage);

        return assessmentRepository.save(result);
    }

    @GetMapping
    public List<AssessmentResult> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<AssessmentResult> getStudentAssessments(
            @PathVariable Long studentId) {

        if (!studentRepository.existsById(studentId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Student not found");
        }

        return assessmentRepository.findByStudentId(studentId);
    }
}
