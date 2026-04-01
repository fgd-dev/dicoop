
# Person


## Properties

Name | Type
------------ | -------------
`name` | string
`personType` | [PersonType](PersonType.md)
`skills` | [Array&lt;Skill&gt;](Skill.md)
`location` | [Location](Location.md)
`availability` | [Array&lt;TimeSlot&gt;](TimeSlot.md)
`requiredSkills` | [Array&lt;Skill&gt;](Skill.md)
`needsEvaluation` | boolean
`vetoes` | [Array&lt;Person&gt;](Person.md)
`hasAlreadyInspected` | Array&lt;Array&lt;string&gt;&gt;
`maxNumberOfInspections` | number
`settings` | [Settings](Settings.md)

## Example

```typescript
import type { Person } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "personType": null,
  "skills": null,
  "location": null,
  "availability": null,
  "requiredSkills": null,
  "needsEvaluation": null,
  "vetoes": null,
  "hasAlreadyInspected": null,
  "maxNumberOfInspections": null,
  "settings": null,
} satisfies Person

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Person
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


