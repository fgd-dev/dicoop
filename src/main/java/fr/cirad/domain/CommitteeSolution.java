package fr.cirad.domain;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.optaplanner.core.api.domain.solution.PlanningEntityCollectionProperty;
import org.optaplanner.core.api.domain.solution.PlanningScore;
import org.optaplanner.core.api.domain.solution.PlanningSolution;
import org.optaplanner.core.api.domain.solution.ProblemFactCollectionProperty;
import org.optaplanner.core.api.domain.valuerange.ValueRangeProvider;
import org.optaplanner.core.api.score.buildin.hardsoft.HardSoftScore;
import org.optaplanner.core.api.solver.SolverStatus;

@PlanningSolution
public class CommitteeSolution {

    public UUID id;

    @ProblemFactCollectionProperty
    @JsonIgnore
    public List<Committee> committees;

    @ProblemFactCollectionProperty
    @JsonIgnore
    @ValueRangeProvider(id = "personRange")
    public List<Person> persons;

    @ProblemFactCollectionProperty
    @JsonIgnore
    public List<Skill> skills;

    @ProblemFactCollectionProperty
    @JsonIgnore
    @ValueRangeProvider(id = "timeSlotRange")
    public List<TimeSlot> timeSlots;

    @PlanningEntityCollectionProperty
    public List<CommitteeAssignment> committeeAssignments;

    @PlanningScore
    public HardSoftScore score = null;

    public String scoreExplanation = "";

    // Ignored by OptaPlanner, used by the UI to display solve or stop solving
    // button
    public SolverStatus solverStatus;

    public CommitteeSolution() {
        // No-arg constructor required for OptaPlanner
    }

    public CommitteeSolution(SolverOptions options) {
        this.id = UUID.randomUUID();
        this.persons = options.participants;
        this.skills = options.participants.stream().flatMap(person -> person.skills.stream())
                .distinct().collect(Collectors.toList());
        this.timeSlots =
                options.participants.stream().flatMap(person -> person.availability.stream())
                        .distinct().collect(Collectors.toList());

        // Committees based on persons skills to certificate
        this.committees = options.participants.stream()
                .filter(person -> !person.skillsToCertificate.isEmpty()).map(Committee::new)
                .collect(Collectors.toList());
        this.committeeAssignments = new ArrayList<>();
        // initialization of the Committees assignments needed, 2 professionals ans 1
        // non-professional person
        var professionalPersonType = new PersonType("professional");
        var nonProfessionalPersonType = new PersonType("non-professional");
        Long committeeAssignmentId = 0L;
        for (var committee : this.committees) {
            committee.maximumNumberOfAssignments = options.settings.maximumNumberOfAssignments;
            for (int i = 1; i <= options.settings.nbProParticipants; i++) {
                this.committeeAssignments.add(new CommitteeAssignment(committeeAssignmentId++,
                        committee, professionalPersonType));
            }
            for (int i = 1; i <= options.settings.nbNonProParticipants; i++) {
                this.committeeAssignments.add(new CommitteeAssignment(committeeAssignmentId++,
                        committee, nonProfessionalPersonType));
            }
        }
    }
}
