


package com.smartplacement.Demo.repository.StudentRepository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.smartplacement.Demo.entity.Student.Student;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
}
