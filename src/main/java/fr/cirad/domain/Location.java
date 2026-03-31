package fr.cirad.domain;

import java.util.Comparator;
import ai.timefold.solver.core.api.domain.lookup.PlanningId;

public class Location implements Comparable<Location> {

    @PlanningId
    public String name;

    private static final Comparator<Location> COMPARATOR = Comparator.comparing(l -> l.name);

    public Location() {
        // No-arg constructor required for Hibernate and OptaPlanner
    }

    public Location(String name) {
        this.name = name;
    }

    @Override
    public int compareTo(Location o) {
        return COMPARATOR.compare(this, o);
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Location)) {
            return false;
        }
        Location other = (Location) o;
        return this.name.equalsIgnoreCase(other.name);
    }

    @Override
    public int hashCode() {
        return this.name.hashCode();
    }

    @Override
    public String toString() {
        return "Location: " + name;
    }

}
