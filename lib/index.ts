import {
  createBrowserRouter,
  generatePath,
  Location,
  NavigateOptions,
  RouteObject,
  To,
  useLocation,
  useMatches,
  useNavigate,
} from "react-router-dom";

/**
 * An object that represents a named route navigation intent.
 */
type NamedTo = {
  /**
   * The unique name of the route.
   */
  name: string;
  /**
   * A map of path parameters. Each key should match a dynamic segment (e.g. :id).
   */
  params?: { [key: string]: string };
  /**
   * A map of query parameters that will be appended to the URL.
   */
  query?: { [key: string]: string };
};

/**
 * Extension of `RouteObject` that includes optional `name`, `absolutePath`,
 * fields for named-route functionality.
 */
export type NamedRouteObject = {
  /**
   * Optional name to identify this route. Must be unique if provided.
   */
  name?: string;
  /**
   * Nested children in the route hierarchy.
   */
  children?: NamedRouteObject[];
  /**
   * The absolute path resolved by combining parent paths.
   * This is an internal property, automatically populated by `collectRouteNames`.
   * Not intended for external modification.
   */
  __absolutePath?: string;
  /**
   * Optional additional metadata for this route.
   */
} & RouteObject;

type JunctionTo = To | NamedTo;

/**
 * Type guard that checks whether the provided value is a NamedTo object.
 * @param to - The navigation target to inspect.
 * @returns True if `to` is of type NamedTo, false otherwise.
 */
function isNamedTo(to: JunctionTo): to is NamedTo {
  return !!(to as NamedTo).name;
}

const namedRoutesMap = new Map<string, NamedRouteObject>();

/**
 * Recursively collects and validates named routes, setting absolute paths.
 *
 * @param routes - An array of NamedRouteObject to collect.
 * @param parentPath - The path of the parent route, defaults to "/".
 * @param accId - Accumulated ID for child route indexing.
 * @throws Error if a duplicate route name is encountered.
 */
function collectRouteNames(
  routes: NamedRouteObject[],
  parentPath = "",
  accId = "",
) {
  routes.forEach((route, index) => {
    const id = !accId ? `${index}` : `${accId}-${index}`;
    let absolutePath;
    if (route.path?.startsWith("/")) {
      absolutePath = route.path;
    } else {
      absolutePath = parentPath + route.path;
    }
    // If route is named, store it in the map
    if (route.name) {
      route.__absolutePath = absolutePath;
      const existingRoute = namedRoutesMap.get(route.name);
      if (existingRoute) {
        console.warn(
          `Duplicate route name: ${route.name} found. Use unique names.`,
        );
      }
      namedRoutesMap.set(route.name, route);
      namedRoutesMap.set(id, route);
    }

    // Ensure trailing slash for potential children paths
    if (!route.path?.endsWith("/")) {
      absolutePath += "/";
    }

    // Recursively collect child routes
    if (route.children) {
      collectRouteNames(route.children, absolutePath, id);
    }
  });
}

/**
 * Creates a React Router browser router with named-route capabilities.
 *
 * Accepts an array of `NamedRouteObject` entries (each optionally containing a `name`,
 * `path`, `element`, and nested `children`) and returns a router instance that supports
 * named navigation.
 *
 * @example
 * ```ts
 * enum RouteNames { home = "home", about = "about", team = "team" }
 *
 * const router = createNamedBrowserRouter([
 *   {
 *     path: "",
 *     name: RouteNames.home,
 *     element: <HomePage />,
 *     children: [
 *       {
 *         path: "about",
 *         name: RouteNames.about,
 *         element: <AboutPage />,
 *         children: [
 *           { path: "team/:id", name: RouteNames.team, element: <TeamPage /> },
 *         ],
 *       },
 *     ],
 *   },
 * ]);
 * ```
 *
 * @param routes - An array of `NamedRouteObject`.
 * @param opts - Optional router configuration.
 * @returns A browser router instance with named route support.
 */

function createNamedBrowserRouter(
  routes: NamedRouteObject[],
  opts?: Parameters<typeof createBrowserRouter>[1],
) {
  collectRouteNames(routes);
  return createBrowserRouter(routes, opts);
}

/**
 * Returns a navigation function that supports both standard `To`
 * and named-route (`NamedTo`) navigation.
 *
 * @example
 * ```tsx
 * import { useNamedNavigate } from "named-react-router";
 *
 * function MyComponent() {
 *   const navigate = useNamedNavigate();
 *
 *   function handleClick() {
 *     navigate({
 *       name: "profile",
 *       params: { id: "123" },
 *       query: { tab: "posts" }
 *     });
 *   }
 *
 *   return <button onClick={handleClick}>Go to Profile</button>;
 * }
 * ```
 *
 * @returns A function that can navigate by name (with params & queries) or by path/string.
 */
function useNamedNavigate() {
  const navigate = useNavigate();

  /**
   * @param to - Either a string/path-based `To` or a `NamedTo` object.
   * @param options - Navigation options (replace, state, etc).
   */
  function namedNavigateFunction(to: JunctionTo, options?: NavigateOptions) {
    if (isNamedTo(to)) {
      const { name, params, query } = to;

      const namedRoute = namedRoutesMap.get(name);
      if (namedRoute?.__absolutePath) {
        // Replace dynamic segments with provided params
        let filledNamedPath = generatePath(namedRoute.__absolutePath, params);

        // Append query string if any
        if (query) {
          const queryString = new URLSearchParams(query).toString();
          filledNamedPath += `?${queryString}`;
        }

        navigate(filledNamedPath, options);
      } else {
        throw new Error(`Route name: ${name} not found.`);
      }
    } else {
      // Standard path/string-based navigation
      navigate(to, options);
    }
  }

  return namedNavigateFunction;
}

/**
 * A hook that returns the current location, enhanced with the named route (if available).
 *
 * @example
 * ```tsx
 * import { useNamedLocation } from "named-react-router";
 *
 * function Breadcrumb() {
 *   const location = useNamedLocation();
 *   // location.name might be "about", "profile", etc.
 *   return <span>Current Page: {location.name || "Unnamed"}</span>;
 * }
 * ```
 *
 * @returns The standard react-router location object with an optional `name` property.
 */
function useNamedLocation(): Location & { name?: string } {
  const location = useLocation();
  try {
    const matchingRoutes = useMatches();
    const matchingRoute = matchingRoutes[matchingRoutes.length - 1];
    const route = namedRoutesMap.get(matchingRoute.id);
    return { ...location, name: route?.name };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "useNamedLocation is only supported with createNamedBrowserRouter",
      );
    }
  }
  return location;
}

export {
  namedRoutesMap,
  createNamedBrowserRouter,
  useNamedNavigate,
  useNamedLocation,
  collectRouteNames,
};
