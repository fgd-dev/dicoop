package fr.cirad.rest;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.jboss.logging.Logger;
import ai.timefold.solver.core.api.score.ScoreManager;
import ai.timefold.solver.core.api.score.buildin.hardmediumsoft.HardMediumSoftScore;
import ai.timefold.solver.core.api.solver.SolverManager;
import ai.timefold.solver.core.api.solver.SolverStatus;
import fr.cirad.domain.CommitteeSolution;
import fr.cirad.domain.SolverOptions;
import net.jodah.expiringmap.ExpiringMap;

@Path("api/committeeSolution")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CommitteeSolutionResource {

    static Map<UUID, CommitteeSolution> solutions =
            ExpiringMap.builder().maxSize(50).expiration(1, TimeUnit.DAYS).build();

    @Inject
    SolverManager<CommitteeSolution, UUID> solverManager;

    @Inject
    ScoreManager<CommitteeSolution, HardMediumSoftScore> scoreManager;

    @Inject
    Logger log;

    @GET
    @Path("/{id}")
    public CommitteeSolution getSolution(@PathParam(value = "id") UUID id) {
        // Get the solver status before loading the solution
        // to avoid the race condition that the solver terminates between them
        SolverStatus solverStatus = getSolverStatus(id);
        CommitteeSolution solution = findById(id);
        scoreManager.updateScore(solution); // Sets the score
        solution.solverStatus = solverStatus;
        var scoreExplanation = scoreManager.explainScore(solution);
        log.info(scoreExplanation);
        solution.scoreExplanation = scoreExplanation.toString();
        return solution;
    }

    @POST
    @Path("solve")
    public CommitteeSolution solve(SolverOptions options) {
        var solution = initSolution(options);
        solverManager.solveAndListen(solution.id, this::findById, this::save);
        return solution;
    }

    @GET
    @Path("stopSolving/{id}")
    public String stopSolving(@PathParam(value = "id") UUID id) {
        solverManager.terminateEarly(id);
        return "The solving solution " + id + " has been terminated.";
    }

    CommitteeSolution initSolution(SolverOptions options) {
        var solution = new CommitteeSolution(UUID.randomUUID(), options);
        solutions.put(solution.id, solution);
        return solution;
    }

    SolverStatus getSolverStatus(UUID id) {
        return solverManager.getSolverStatus(id);
    }

    @Transactional
    CommitteeSolution findById(UUID id) {
        if (!solutions.containsKey(id)) {
            throw new IllegalStateException("There is no solution with id (" + id + ").");
        }
        return solutions.get(id);
    }

    @Transactional
    void save(CommitteeSolution solution) {
        solutions.put(solution.id, solution);
    }
}
