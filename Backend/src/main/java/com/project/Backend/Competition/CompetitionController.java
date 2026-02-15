package com.project.Backend.Competition;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/competitions")
@RequiredArgsConstructor
public class CompetitionController {

    private final CompetitionRepository repository;

    @GetMapping
    public ResponseEntity<List<Competition>> findAllCompetitions() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findCompetitionById(@PathVariable String id) {
        Optional<Competition> competition = repository.findById(id);
        if (competition.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(competition.get());
    }
}
