
# Committee


## Properties

Name | Type
------------ | -------------
`id` | string
`evaluatedPerson` | [Person](Person.md)
`createdDate` | Date
`useAvailability` | boolean
`settings` | [Settings](Settings.md)
`timeSlot` | [TimeSlot](TimeSlot.md)

## Example

```typescript
import type { Committee } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "evaluatedPerson": null,
  "createdDate": null,
  "useAvailability": null,
  "settings": null,
  "timeSlot": null,
} satisfies Committee

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Committee
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


