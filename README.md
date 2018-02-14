# lynx-auth

Authentication module for the Lynx framework

## Installation

```
npm install lynx-auth --save
```

## Usage

In your main app file:

```
import AuthModule from "lynx-auth";
...

let myConfig = new ConfigBuilder(__dirname).build();

const app = new App(myConfig, [new AuthModule()]);
app.startServer(port);
```

## Customization

You can override the settings of the `AuthController` using the `AuthController.settings`.
Please check the `src/views/auth` and the `src/locale` folders to create further customizations.
