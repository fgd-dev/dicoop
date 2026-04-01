# CommitteeSolutionResourceApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiCommitteeSolutionIdGet**](CommitteeSolutionResourceApi.md#apicommitteesolutionidget) | **GET** /api/committeeSolution/{id} | Get Solution |
| [**apiCommitteeSolutionSolvePost**](CommitteeSolutionResourceApi.md#apicommitteesolutionsolvepost) | **POST** /api/committeeSolution/solve | Solve |
| [**apiCommitteeSolutionStopSolvingIdGet**](CommitteeSolutionResourceApi.md#apicommitteesolutionstopsolvingidget) | **GET** /api/committeeSolution/stopSolving/{id} | Stop Solving |



## apiCommitteeSolutionIdGet

> CommitteeSolution apiCommitteeSolutionIdGet(id)

Get Solution

### Example

```ts
import {
  Configuration,
  CommitteeSolutionResourceApi,
} from '';
import type { ApiCommitteeSolutionIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new CommitteeSolutionResourceApi();

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ApiCommitteeSolutionIdGetRequest;

  try {
    const data = await api.apiCommitteeSolutionIdGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**CommitteeSolution**](CommitteeSolution.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiCommitteeSolutionSolvePost

> CommitteeSolution apiCommitteeSolutionSolvePost(solverOptions)

Solve

### Example

```ts
import {
  Configuration,
  CommitteeSolutionResourceApi,
} from '';
import type { ApiCommitteeSolutionSolvePostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new CommitteeSolutionResourceApi();

  const body = {
    // SolverOptions
    solverOptions: ...,
  } satisfies ApiCommitteeSolutionSolvePostRequest;

  try {
    const data = await api.apiCommitteeSolutionSolvePost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **solverOptions** | [SolverOptions](SolverOptions.md) |  | |

### Return type

[**CommitteeSolution**](CommitteeSolution.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiCommitteeSolutionStopSolvingIdGet

> string apiCommitteeSolutionStopSolvingIdGet(id)

Stop Solving

### Example

```ts
import {
  Configuration,
  CommitteeSolutionResourceApi,
} from '';
import type { ApiCommitteeSolutionStopSolvingIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new CommitteeSolutionResourceApi();

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ApiCommitteeSolutionStopSolvingIdGetRequest;

  try {
    const data = await api.apiCommitteeSolutionStopSolvingIdGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

**string**

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

