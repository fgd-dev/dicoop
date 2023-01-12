# dicoop Project https://dicoop.app/

DICOOP (DIstributing evaluators in CertificatiOn Organized by Peers) is a quasi-solver for a class of scheduling problems, whose problem is to identify and allocate N peer reviewers to N peer reviews, knowing that other types of reviewers may accompany them (non-pro and external), and so that there is no reciprocity in the review, the team of reviewers has a set of expected skills, and the reviewers change from one year to the next for the same peer in order to maximize knowledge exchange and reduce the risk of tacit agreements. In the interest of fairness among evaluators, distance-to-go options can be chosen.

Ideal solutions to these problems can be extremely slow, but approximations are fast and often good enough for real-world purposes.

This application was conceived in the framework of a collaboration between different researchers: Sylvaine Lemeilleur and Nicolas Paget (CIRAD, Montpellier, France), Abdallah Saffidine and Cecilia Xifei Ni (Computer Science and Engineering, University of New South Wales, Sydney, Australia) and Nathanaël Barrot (Kyushu University, Japan), as well as the computer development realized by Fabrice Dominguez (fgd-dev).

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
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `build/quarkus-app/lib/` directory.

If you want to build an _über-jar_, execute the following command:

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

## UI informations and available Scripts

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the webapp project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## OpenAPI generator

To refresh the API client while the server is running in dev mode "npm run api" that runs:
rm -rf src/api
npx openapi-generator-cli generate -i http://localhost:8080/q/openapi -g typescript-axios -o src/api --skip-validate-spec

## npm maintenance

To discover dependencies that are out of date:
```console
npm outdated
```

To perform safe dependency upgrades:
```console
npm update
```

To upgrade to the latest major version of a package:
```console
npm install <packagename>@latest
```

To upgrade all dependencies to their latest major versions:
```console
npx npm-check-updates -u
```
and
```console
npm install
```
