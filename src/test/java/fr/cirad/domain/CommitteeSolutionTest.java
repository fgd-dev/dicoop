package fr.cirad.domain;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import jakarta.inject.Inject;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import ai.timefold.solver.benchmark.api.PlannerBenchmark;
import ai.timefold.solver.benchmark.api.PlannerBenchmarkFactory;
import ai.timefold.solver.core.api.score.buildin.hardmediumsoft.HardMediumSoftScore;
import ai.timefold.solver.core.api.solver.SolverManager;
import ai.timefold.solver.test.api.score.stream.ConstraintVerifier;
import fr.cirad.solver.CommitteeSchedulingConstraintProvider;
import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
class CommitteeSolutionTest {

        @Inject
        ConstraintVerifier<CommitteeSchedulingConstraintProvider, CommitteeSolution> constraintProvider;

        @Inject
        SolverManager<CommitteeSolution, UUID> solverManager;

        @Inject
        PlannerBenchmarkFactory benchmarkFactory;

        Long committeeAssignmentId = 0L;

        private String getResourceAsText(String filename) throws IOException {
                var path = Paths.get("src/test/resources", filename);
                return Files.readString(path);
        }

        private SolverOptions loadDefaultSolverOptions() throws IOException {
                var mapper = new ObjectMapper();
                mapper.findAndRegisterModules();
                var resource = getResourceAsText("default-problem.json");
                return mapper.readValue(resource, SolverOptions.class);
        }

        // @Test
        void benchmark() throws IOException {
                // problem 1
                var solverOptions1 = loadDefaultSolverOptions();
                var problem1 = new CommitteeSolution(UUID.randomUUID(), solverOptions1);

                // problem 2
                var solverOptions2 = loadDefaultSolverOptions();
                solverOptions2.settings.numberOfAssignmentsForAProfessional = new Range(2, 2);
                var problem2 = new CommitteeSolution(UUID.randomUUID(), solverOptions2);

                // problem 3
                var solverOptions3 = loadDefaultSolverOptions();
                solverOptions3.settings.nbProParticipants = new Range(0, 5);
                solverOptions3.settings.nbNonProParticipants = new Range(0, 5);
                solverOptions3.participants.stream().filter(p -> p.needsEvaluation).limit(31)
                                .forEach(p -> p.needsEvaluation = false);
                var problem3 = new CommitteeSolution(UUID.randomUUID(), solverOptions3);

                // benchmark
                PlannerBenchmark benchmark = benchmarkFactory.buildPlannerBenchmark(problem1,
                                problem2, problem3);
                var path = benchmark.benchmark().toPath().toAbsolutePath().toString();
                assertNotNull(path);
                System.out.println("PATH: " + path);
        }

        // @Test
        void solutionTest() throws IOException, InterruptedException, ExecutionException {
                var solverOptions = loadDefaultSolverOptions();
                var problem = new CommitteeSolution(UUID.randomUUID(), solverOptions);
                var solverJob = solverManager.solve(problem.id, problem);
                var solution = solverJob.getFinalBestSolution();
                assertTrue(solution.score.isFeasible());
        }

        @Test
        void constraintsTest() throws IOException {
                var solverOptions = loadDefaultSolverOptions();

                // create a solution from the default data
                var solution = new CommitteeSolution(UUID.randomUUID(), solverOptions);

                // reset the solution assignments
                solution.committeeAssignments = new ArrayList<>();

                // populate the solution with the default data
                addCommitteeAssignments("Léo", "Isaac", "Emma", "Mathilde", solverOptions,
                                solution);
                addCommitteeAssignments("Raphaël", "Ethan", "Rose", "Assia", solverOptions,
                                solution);
                addCommitteeAssignments("Louis", "Mia", "Jules", "Clémence", solverOptions,
                                solution);
                addCommitteeAssignments("Jade", "Marius", "Mohamed", "Sohan", solverOptions,
                                solution);
                addCommitteeAssignments("Adam", "Mohamed", "Isaac", "Maya", solverOptions,
                                solution);
                addCommitteeAssignments("Lucas", "Arthur", "Mia", "Oscar", solverOptions, solution);
                addCommitteeAssignments("Emma", "Alice", "Tom", "Oscar", solverOptions, solution);
                addCommitteeAssignments("Gabriel", "Inès", "Sacha", "Théa", solverOptions,
                                solution);
                addCommitteeAssignments("Alice", "Agathe", "Marius", "Livia", solverOptions,
                                solution);
                addCommitteeAssignments("Arthur", "Inaya", "Ambre", "Livia", solverOptions,
                                solution);
                addCommitteeAssignments("Ambre", "Tom", "Mael", "Yasmine", solverOptions, solution);
                addCommitteeAssignments("Jules", "Adam", "Inaya", "Ibrahim", solverOptions,
                                solution);
                addCommitteeAssignments("Lina", "Zoé", "Jade", "Apolline", solverOptions, solution);
                addCommitteeAssignments("Mael", "Aaron", "Hugo", "Gaspard", solverOptions,
                                solution);
                addCommitteeAssignments("Hugo", "Emma", "Ambre", "Théa", solverOptions, solution);
                addCommitteeAssignments("Chloé", "Liam", "Arthur", "Yasmine", solverOptions,
                                solution);
                addCommitteeAssignments("Noah", "Chloé", "Inès", "Gaspard", solverOptions,
                                solution);
                addCommitteeAssignments("Rose", "Mael", "Léo", "Iris", solverOptions, solution);
                addCommitteeAssignments("Liam", "Paul", "Gabin", "Iris", solverOptions, solution);
                addCommitteeAssignments("Gabin", "Rose", "Noah", "Clémence", solverOptions,
                                solution);
                addCommitteeAssignments("Sacha", "Tiago", "Liam", "Valentine", solverOptions,
                                solution);
                addCommitteeAssignments("Paul", "Romy", "Sacha", "Roxane", solverOptions, solution);
                addCommitteeAssignments("Mia", "Jade", "Romy", "Gaspard", solverOptions, solution);
                addCommitteeAssignments("Nathan", "Lucas", "Léo", "Alba", solverOptions, solution);
                addCommitteeAssignments("Aaron", "Raphaël", "Tiago", "Roxane", solverOptions,
                                solution);
                addCommitteeAssignments("Anna", "Louis", "Aaron", "Alba", solverOptions, solution);
                addCommitteeAssignments("Mohamed", "Nathan", "Agathe", "Clémence", solverOptions,
                                solution);
                addCommitteeAssignments("Ethan", "Noah", "Louis", "Valentine", solverOptions,
                                solution);
                addCommitteeAssignments("Tom", "Gabriel", "Nathan", "Apolline", solverOptions,
                                solution);
                addCommitteeAssignments("Romy", "Anna", "Lina", "Simon", solverOptions, solution);
                addCommitteeAssignments("Inès", "Paul", "Ethan", "Iris", solverOptions, solution);
                addCommitteeAssignments("Tiago", "Lina", "Chloé", "Maya", solverOptions, solution);
                addCommitteeAssignments("Isaac", "Gabriel", "Anna", "Clara", solverOptions,
                                solution);
                addCommitteeAssignments("Agathe", "Zoé", "Adam", "Livia", solverOptions, solution);
                addCommitteeAssignments("Marius", "Gabin", "Lucas", "Apolline", solverOptions,
                                solution);
                addCommitteeAssignments("Inaya", "Hugo", "Raphaël", "Clara", solverOptions,
                                solution);
                addCommitteeAssignments("Zoé", "Jules", "Alice", "Théa", solverOptions, solution);

                // test all the constraints
                constraintProvider.verifyThat().given(solution.committeeAssignments.toArray())
                                .scores(HardMediumSoftScore.of(0, 0, 0));
        }

        private void addCommitteeAssignments(String evaluated, String p1, String p2, String p3,
                        SolverOptions solverOptions, CommitteeSolution solution) {
                var committee = solution.getCommitteeByEvaluatedPersonName(evaluated).get();
                assignToCommittee(p1, PersonType.PROFESSIONAL, committee, solverOptions, solution);
                assignToCommittee(p2, PersonType.PROFESSIONAL, committee, solverOptions, solution);
                assignToCommittee(p3, PersonType.NON_PROFESSIONAL, committee, solverOptions,
                                solution);
        }

        private void assignToCommittee(String personName, PersonType personType,
                        Committee committee, SolverOptions solverOptions,
                        CommitteeSolution solution) {
                var person = solution.getPersonByName(personName);
                if (!person.isPresent())
                        throw new IllegalArgumentException("Person " + personName + " not found");
                /*
                 * var assignment = new CommitteeAssignment(committeeAssignmentId++, person.get(),
                 * committee, personType, solverOptions.settings.distanceMatrix);
                 * solution.committeeAssignments.add(assignment);
                 */
        }

}
