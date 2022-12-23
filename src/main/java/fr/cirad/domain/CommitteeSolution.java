package fr.cirad.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.optaplanner.core.api.domain.lookup.PlanningId;
import org.optaplanner.core.api.domain.solution.PlanningEntityCollectionProperty;
import org.optaplanner.core.api.domain.solution.PlanningScore;
import org.optaplanner.core.api.domain.solution.PlanningSolution;
import org.optaplanner.core.api.domain.solution.ProblemFactCollectionProperty;
import org.optaplanner.core.api.domain.solution.ProblemFactProperty;
import org.optaplanner.core.api.domain.valuerange.ValueRangeProvider;
import org.optaplanner.core.api.score.buildin.hardmediumsoft.HardMediumSoftScore;
import org.optaplanner.core.api.solver.SolverStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.base.Strings;

@PlanningSolution
public class CommitteeSolution {

    @PlanningId
    public UUID id;

    @ProblemFactProperty
    public Settings settings;

    @PlanningEntityCollectionProperty
    @JsonIgnore
    @ValueRangeProvider(id = "committeeRange")
    public List<Committee> committees;

    @ProblemFactCollectionProperty
    @JsonIgnore
    public List<Person> persons;

    @ProblemFactCollectionProperty
    @JsonIgnore
    @ValueRangeProvider(id = "timeSlotRange")
    public List<TimeSlot> timeSlots;

    @PlanningEntityCollectionProperty
    public List<CommitteeAssignment> committeeAssignments;

    @PlanningScore
    public HardMediumSoftScore score = null;

    public String scoreExplanation = "";

    // Ignored by OptaPlanner, used by the UI to display solve or stop solving
    // button
    public SolverStatus solverStatus;

    public CommitteeSolution() {
        // must have a no-args constructor so it can be constructed by OptaPlanner
    }

    public CommitteeSolution(UUID id, SolverOptions options) {
        this.id = id;
        this.settings = options.settings;
        this.persons = options.participants;

        // verify that all persons have a unique id
        if (persons.stream().map(p -> p.name).distinct().count() != persons.size()) {
            throw new IllegalArgumentException("All persons must have a unique name");
        }

        // set range option for each participant and also travelling distance constraint
        this.persons.stream().forEach(p -> {
            p.init(options.settings);
            p.travellingDistanceRangeConstraint = options.settings.travellingDistanceRange;
        });

        this.timeSlots = this.persons.stream().flatMap(person -> person.availability.stream())
                .filter(timeSlot -> !Strings.isNullOrEmpty(timeSlot.name)).distinct()
                .collect(Collectors.toList());

        // Committees based on persons required skills
        this.committees = this.persons.stream().filter(person -> person.needsEvaluation)
                .map(person -> new Committee(person, options.settings))
                .collect(Collectors.toList());

        // initialization of the Committees assignments needed (professionals, non-professionals and
        // externals)
        this.committeeAssignments = new ArrayList<>();
        Long committeeAssignmentId = 0L;
        for (var person : this.persons) {
            var range = options.settings.getNumberOfAssignmentsRange(person.personType);
            for (int i = 0; i < range.getMax(); i++) {
                this.committeeAssignments.add(new CommitteeAssignment(committeeAssignmentId++,
                        person, options.settings.distanceMatrix));
            }
        }

        // Optional shuffling of the participants
        if (Boolean.TRUE.equals(options.settings.shuffleParticipants)) {
            // No need to use strong randomness, as the shuffling is only done once
            // Devskim: ignore DS148264
            Collections.shuffle(this.committeeAssignments);
        }
    }

    public Optional<Committee> getCommitteeByEvaluatedPersonName(String personName) {
        return this.committees.stream()
                .filter(committee -> committee.evaluatedPerson.name.equals(personName)).findFirst();
    }

    public Optional<Person> getPersonByName(String personName) {
        return this.persons.stream().filter(person -> person.name.equals(personName)).findFirst();
    }

}
