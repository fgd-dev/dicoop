# dicoop Project https://dicoop.app/

DICOOP (DIstributing evaluators in CertificatiOn Organized by Peers) is a quasi-solver for a class of scheduling problems, whose problem is to identify and allocate N peer reviewers to N peer reviews, knowing that other types of reviewers may accompany them (non-pro and external), and so that there is no reciprocity in the review, the team of reviewers has a set of expected skills, and the reviewers change from one year to the next for the same peer in order to maximize knowledge exchange and reduce the risk of tacit agreements. In the interest of fairness among evaluators, distance-to-go options can be chosen.

Ideal solutions to these problems can be extremely slow, but approximations are fast and often good enough for real-world purposes.

This application was conceived in the framework of a collaboration between different researchers: Sylvaine Lemeilleur and Nicolas Paget (CIRAD, Montpellier, France), Abdallah Saffidine and Cecilia Xifei Ni (Computer Science and Engineering, University of New South Wales, Sydney, Australia) and Nathanael Barrot (Kyushu University, Japan), as well as the computer development realized by Fabrice Dominguez (fgd-dev).

It follows various requests from civil society organizations in Morocco and France and has received support from the French Development Agency under the project "Institutional Innovations for Organic Agriculture in Africa", coordinated by Afronet and in which CIRAD is a partner.

It led to a first scientific communication: Barrot, N., Lemeilleur, S., Paget, N., Saffidine, A., (2020). Peer Reviewing in Participatory Guarantee Systems: Modelisation and Algorithmic Aspects. Presented at the Nineteenth International Conference on Autonomous Agents and Multi-Agent Systems, Auckland, New Zealand.

## Running the application with docker

For instance if you want to run Dicoop locally for the version v1.13.6

```shell script
docker run -p 8080:8080 fgd99/dicoop:v1.13.6
```

## Technical points

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: https://quarkus.io/ .

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:

```shell script
./gradlew quarkusDev
```

> **_NOTE:_** Quarkus now ships with a Dev UI, which is available in dev mode only at http://localhost:8080/q/dev/.

## Packaging and running the application

The application can be packaged using:

```shell script
./gradlew build
```

It produces the `quarkus-run.jar` file in the `build/quarkus-app/` directory.
Be aware that it's not an _uber-jar_ as the dependencies are copied into the `build/quarkus-app/lib/` directory.

If you want to build an _uber-jar_, execute the following command:

```shell script
./gradlew build -Dquarkus.package.type=uber-jar
```

The application is now runnable using `java -jar build/quarkus-app/quarkus-run.jar`.

## Creating a native executable

You can create a native executable using:

```shell script
./gradlew build -Dquarkus.package.type=native
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using:

```shell script
./gradlew build -Dquarkus.package.type=native -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./build/dicoop-1.0.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult https://quarkus.io/guides/gradle-tooling.

## Frontend (Web UI)

This project uses [Vite](https://vitejs.dev/) + [pnpm](https://pnpm.io/) for the frontend build system.

### Requirements

- Node.js 18+
- pnpm (install with: `npm install -g pnpm`)

### Running the frontend

In the `src/main/webapp` directory:

```shell script
cd src/main/webapp
pnpm install
pnpm dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

### Build commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production (output to `dist`) |
| `pnpm prod` | Build and copy to Quarkus resources |

### Building the full application

To build the complete application (backend + frontend):

```shell script
./gradlew build
```

This will:
1. Build the Java/Quarkus backend
2. Build the Vite frontend
3. Copy the frontend assets to `src/main/resources/META-INF/resources`

## OpenAPI generator

To refresh the API client while the server is running in dev mode:

```shell script
cd src/main/webapp
pnpm api
```

This runs:
```shell script
openapi-generator-cli generate -i http://localhost:8080/q/openapi -g typescript-axios -o src/api --skip-validate-spec
```

## pnpm maintenance

To discover dependencies that are out of date:
```console
pnpm outdated
```

To update dependencies:
```console
pnpm update
```