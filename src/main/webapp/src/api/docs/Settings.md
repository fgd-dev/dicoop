
# Settings


## Properties

Name | Type
------------ | -------------
`nbProParticipants` | [Range](Range.md)
`numberOfAssignmentsForAProfessional` | [Range](Range.md)
`nbNonProParticipants` | [Range](Range.md)
`numberOfAssignmentsForANonProfessional` | [Range](Range.md)
`nbExternalParticipants` | [Range](Range.md)
`numberOfAssignmentsForAnExternal` | [Range](Range.md)
`nbRotationsToReinspect` | number
`nbInspectorsFollowingUp` | number
`distanceMatrix` | [DistanceMatrix](DistanceMatrix.md)
`travellingDistanceRange` | [Range](Range.md)
`useAvailability` | boolean
`shuffleParticipants` | boolean
`committeeMeetingSize` | [Range](Range.md)

## Example

```typescript
import type { Settings } from ''

// TODO: Update the object below with actual values
const example = {
  "nbProParticipants": null,
  "numberOfAssignmentsForAProfessional": null,
  "nbNonProParticipants": null,
  "numberOfAssignmentsForANonProfessional": null,
  "nbExternalParticipants": null,
  "numberOfAssignmentsForAnExternal": null,
  "nbRotationsToReinspect": null,
  "nbInspectorsFollowingUp": null,
  "distanceMatrix": null,
  "travellingDistanceRange": null,
  "useAvailability": null,
  "shuffleParticipants": null,
  "committeeMeetingSize": null,
} satisfies Settings

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Settings
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


