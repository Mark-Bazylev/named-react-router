# named-react-router

A lightweight extension to [React Router](https://reactrouter.com/) that provides **named routes** for simpler, more maintainable navigation.


## Features

- **Named navigation** with path parameters and query support
- **Hooks** for easy programmatic navigation (`useNamedNavigate`) and route-awareness (`useNamedLocation`)
- **Nested routes** just like React Router, but with named references
-  **Declarative route definition** – Use `<NamedRoutes>` and `<NamedRoute>` for JSX-based routing setup.
-  **Nested routes support** – Define structured, hierarchical routes with named references.

## Installation

Install named-react-router along with react-router-dom (which it depends on):

```bash
npm install named-react-router react-router-dom
```
Or, with Yarn:
```
yarn add named-react-router react-router-dom
```

## Usage

### Create a Named Router

Use `createNamedBrowserRouter` to define your routes as an array of `NamedRouteObject`:

```
import { createNamedBrowserRouter } from "named-react-router";
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import TeamPage from "./TeamPage";

enum RouteNames {
  home = "home",
  about = "about",
  team = "team",
}

export const router = createNamedBrowserRouter([
  {
    path: "",
    name: RouteNames.home,
    element: <HomePage />,
    children: [
      {
        path: "about",
        name: RouteNames.about,
        element: <AboutPage />,
        children: [
          { path: "team", name: RouteNames.team, element: <TeamPage /> },
        ],
      },
    ],
  },
]);

```

Then wrap your app with the returned router (similar to a standard React Router setup).

### Declarative Routing with `<NamedRoutes>`
   Alternatively, use the `<NamedRoutes>` and `<NamedRoute>` components for a JSX-based route definition.

```
import { NamedRoutes, NamedRoute } from "named-react-router";
import HomePage from "./HomePage";
import AboutPage from "./AboutPage";
import TeamPage from "./TeamPage";
import { BrowserRouter } from "react-router-dom";

export function App() {
  return (
    <BrowserRouter>
      <NamedRoutes>
        <NamedRoute name="home" path="/" element={<HomePage />}>
          <NamedRoute name="about" path="about" element={<AboutPage />}>
            <NamedRoute name="team" path="team/:id" element={<TeamPage />} />
          </NamedRoute>
        </NamedRoute>
      </NamedRoutes>
    </BrowserRouter>
  );
}

```
### Navigate by Name

Use the `useNamedNavigate` hook to navigate by route name instead of manually typed paths:

```
import { useNamedNavigate } from "named-react-router";

export function GoToTeamButton() {
  const navigate = useNamedNavigate();

  function handleClick() {
    navigate({ name: "team" }); // Navigates to "about/team" based on the example above
  }

  return <button onClick={handleClick}>Go To Team</button>;
}

```

### Access the Named Location

> ⚠ **Note:** `useNamedLocation()` **does not currently work** with `<NamedRoutes>`. Use `createNamedBrowserRouter`

Use the `useNamedLocation` hook to get the current location plus an optional `name` property:

```
import { useNamedLocation } from "named-react-router";

export function Breadcrumb() {
    const location = useNamedLocation();
    const routeName = location.name || "Unnamed Route";

    return (
        <div>
            <p>Current Path: {location.pathname}</p>
            <p>Current Named Route: {routeName}</p>
        </div>
    );
}
```

## API Reference

### `createNamedBrowserRouter(routes, options)`

Creates a React Router browser router with named-route capabilities.

- **`routes`** – An array of `NamedRouteObject` (extends React Router’s `RouteObject` with `name` and optional nested `children`).
- **`options`** – Optional configuration, same as the options in `createBrowserRouter`.

### `useNamedNavigate()`

Returns a function to navigate **by name** or by standard path.

```
const navigate = useNamedNavigate()

navigate("some/path");
// or
navigate({ name: RouteNames.team, params: { id: "123" }, query: { tab: "info" }
});

```

### `useNamedLocation()`

**Only works with** `createNamedBrowserRouter`. Returns the standard `location` object plus a `name` property for the active named route.

```
const location = useNamedLocation();

console.log(location.pathname); // "/about/team/123"
console.log(location.name); // "team"
```
### `<NamedRoutes/>`
A wrapper component that replaces <Routes> and enables named-route navigation. It automatically collects named route definitions for use with `useNamedNavigate()`.

```
import { NamedRoutes, NamedRoute } from "named-react-router";

<NamedRoutes>
  <NamedRoute name={RouteNames.home} path="/" element={<HomePage />} />
  <NamedRoute name={RouteNames.about} path="about" element={<AboutPage />} />
</NamedRoutes>;
```

### `<NamedRoute/>`
A component that defines a named route inside <NamedRoutes>.

Props:
- **`name`** (string) – The unique name of the route. Required for named navigation.
- **`path`** (string) – The path of the route.
- **`element`** (ReactNode) – The component to render at this route.

```
<NamedRoute name={RouteNames.profile} path="profile/:id" element={<ProfilePage />} />
```
