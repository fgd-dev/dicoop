
# CommitteeAssignment


## Properties

Name | Type
------------ | -------------
`id` | number
`assignedPerson` | [Person](Person.md)
`committee` | [Committee](Committee.md)

## Example

```typescript
import type { CommitteeAssignment } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "assignedPerson": null,
  "committee": null,
} satisfies CommitteeAssignment

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CommitteeAssignment
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


