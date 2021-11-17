package fr.cirad.domain;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;

class PersonTest {

    @Test
    void isEvaluatingAndReciprocityTest() {
        var person1 = new Person("person1");
        var person2 = new Person("person2");
        var person3 = new Person("person3");
        var committee1 = new Committee(person1);
        var committee2 = new Committee(person2);
        var assignment1 = new CommitteeAssignment(person2, committee1, PersonType.PROFESSIONAL);
        var assignment2 = new CommitteeAssignment(person3, committee1, PersonType.PROFESSIONAL);
        var assignment3 = new CommitteeAssignment(person1, committee2, PersonType.PROFESSIONAL);
        var assignment4 = new CommitteeAssignment(person3, committee2, PersonType.PROFESSIONAL);
        person1.assignments.add(assignment3);
        person2.assignments.add(assignment1);
        person3.assignments.add(assignment2);
        person3.assignments.add(assignment4);
        assertTrue(person1.isEvaluating(person2));
        assertTrue(person3.isEvaluating(person1));
        assertFalse(person1.isEvaluating(person3));
    }
}