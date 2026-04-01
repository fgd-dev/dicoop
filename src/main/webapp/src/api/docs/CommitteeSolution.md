
# CommitteeSolution


## Properties

Name | Type
------------ | -------------
`id` | string
`settings` | [Settings](Settings.md)
`committeeAssignments` | [Array&lt;CommitteeAssignment&gt;](CommitteeAssignment.md)
`score` | [HardMediumSoftScore](HardMediumSoftScore.md)
`scoreExplanation` | string
`solverStatus` | [SolverStatus](SolverStatus.md)

## Example

```typescript
import type { CommitteeSolution } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "settings": null,
  "committeeAssignments": null,
  "score": null,
  "scoreExplanation": null,
  "solverStatus": null,
} satisfies CommitteeSolution

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CommitteeSolution
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


