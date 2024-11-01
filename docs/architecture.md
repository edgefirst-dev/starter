# Architecture

The Starter is based on a layered architecture and is designed to be modular and extensible. The architecture is divided into the following layers:

- **Presentation Layer**: This layer is responsible for rendering the user interface and handling user input. It is implemented using React.
- **HTTP Layer**: This layer is responsible for handling HTTP requests and responses. This are the React Router loaders and actions.
- **Business Logic Layer**: This layer is responsible for implementing the business logic of the application. It's represented by the services functions.
- **Data Access Layer**: This layer is responsible for accessing the data. It's represented by the repositories objects.

Each layer know only about the layer immediately below it. For example, the Presentation Layer knows only about the HTTP Layer, and the HTTP Layer knows only about the Business Logic Layer, and so on.

A layer never knows about the layers above it. This means that the Data Access Layer doesn't know about the Business Logic Layer, and the Business Logic Layer doesn't know about the Presentation Layer, and so on.

## Presentation Layer

The Presentation Layer is represented by the React components, each route has an associated component that is responsible for rendering the user interface and handling user input and can render other components.

The `app/layouts` include routes used as layouts for other more specific routes like the `app/layouts/auth.tsx` which is used for `/login` and `/register`.

The `app/views` is where non layout routes are defined, here are files like `app/views/home.tsx` or `app/views/admin/dashboard.tsx`.

## HTTP Layer

The HTTP Layer is represented by the React Router loaders and actions

The loaders are responsible for handling GET requests, and the actions are responsible for handling POST requests, altought an action could handle other HTTP methods as well (PUT, DELETE, etc).

Consider the loader as a READ function and the action as a WRITE function.

## Business Logic Layer

The Business Logic Layer is represented by the services functions, each service is responsible for implementing a specific business logic, like login, register, etc.

The Starter comes with a few services already implemented, like the `auth/login` or `auth/register`, but you can create your own services to implement your business logic.

A service could be a class with a single method, a function, a file with multiple functions, etc. This is up to you but the built-in services follow the same pattern:

```ts
export async function serviceName(
  input: serviceName.Input,
  deps: serviceName.Dependencies = {
    // Default instances of the dependencies
  }
): Promise<serviceName.Output> {
  // Business logic here
}

export namespace servieName {
  export interface Input {
    // Input data
  }

  export interface Dependencies {
    // Dependencies like repositories or API clients
  }

  export interface Output {
    // Output data, this can be left to be inferred by the return type of the function
  }
}
```

Where `serviceName.Input` is the input data, `serviceName.Dependencies` are the dependencies needed to run the service, and `serviceName.Output` is the output data.

The dependencies are typed with only the methods that the service needs, this way you can mock the dependencies in the tests easily.

## Data Access Layer

The Data Access Layer is represented by the repositories and API client objects, each repository is responsible for accessing the data from a database.

A repository defined inside `app/repositories.server/` is a class that exposes all the methods to query a specific table, collection, etc. The Starter comes with a few repositories already implemented, like the `UserRepository`, but you can create your own repositories to access your data.

The recommendation is to only query the database in the repositories, and keep the business logic in the services, and to keep the methods here as simple as possible without any logic inside, just receive inputs and translate that to DB queries.

A method should either return nothing or return one or more entities.

The API clients defined inside `app/clients/` are classes that expose methods to interact with an external API, they extends APIClient class and can define methods to simplify the interaction with the API.

## Extras

### Data Transfer Objects

A Data Transfer Object (DTO) is an object that carries data between processes. The Starter uses DTOs to transfer data between the layers, like from the HTTP Layer to the Business Logic Layer.

A DTO is represented by a class that extends the Data class from `@edgefirst-dev/data` and uses a Parser to validate the data.

A DTO could also be leveraged to format the data before sending it to or from the Data Access Layer.

### Entities

The `app/entities` has files that represents a single object in the domain model. Most entities are backed by a database table, but some entities may be transient and not persisted to the database, or may be backed by a different kind of data store, like representations of data from an external API.

Here you can create classes that extends TableEntity or Entity classes, and each class could be as simple as a way to expose accessing in a type-safe way the actual data or expose other derived attributes and methods.

### Helpers

The `app/helpers` folder contains code that is related to the HTTP and Presentation layers, this can be code used in components, or in loader and actions.

### Jobs and Tasks

The Jobs and Tasks are a way to run code in the background, like sending an email, or cleaning up the database, etc.

Jobs are long-running processes that we enqueue and run in the background.

Tasks are scheduled jobs that run at a specific time or interval without the need to enqueue them again.

The Starter comes with an example job to sync the user profile from Gravatar as this can take time so it runs after the user registers.

An example task is included to clean up the database from expired sessions every hour.
