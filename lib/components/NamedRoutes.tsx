import { Route, Routes, RoutesProps } from "react-router-dom";
import { Fragment, ReactElement, useEffect } from "react";
import { NamedRoute } from "./NamedRoute";
import { collectRouteNames, NamedRouteObject } from "../index";

/**
 * Props for the NamedRoutes component.
 * Includes children (ReactElements) to define nested named routes.
 */
type NamedRoutesProps = {
  children: ReactElement[];
} & RoutesProps;

/**
 * A component that transforms <NamedRoute> definitions into real <Route> elements
 * for use with `react-router-dom`. Also collects named route data to enable
 * named-route navigation via `useNamedNavigate`.
 *
 * @example
 * ```tsx
 * import { NamedRoutes, NamedRoute } from "named-react-router";
 *
 * export function AppRoutes() {
 *   return (
 *     <NamedRoutes>
 *       <NamedRoute name="home" path="/" element={<Home />} />
 *       <NamedRoute name="about" path="about" element={<About />} />
 *       <NamedRoute name="profile" path="profile/:id" element={<Profile />} />
 *     </NamedRoutes>
 *   );
 * }
 * ```
 */
export function NamedRoutes({ children }: NamedRoutesProps): ReactElement {
  const namedRoutes: NamedRouteObject[] = [];

  /**
   * Recursively translates a <NamedRoute> into a NamedRouteObject.
   * Throws if the passed element is neither <NamedRoute> nor <Fragment>.
   *
   * @param child - A React element representing a NamedRoute.
   * @returns A fully structured NamedRouteObject.
   */
  function collectNamedRoutes(child: ReactElement): NamedRouteObject {
    if (child.type !== NamedRoute && child.type !== Fragment) {
      throw new Error(
        `Type ${child.type} is not of type NamedRoute or React.Fragment.`,
      );
    }

    const { props } = child;
    // path, name, children are part of NamedRoute's props
    const { path, name, children: nestedChildren, ...routeProps } = props;

    const route: NamedRouteObject = {
      name,
      path,
      ...routeProps,
      children: [],
    };

    // If the <NamedRoute> has children, collect them too.
    if (Array.isArray(nestedChildren)) {
      route.children = nestedChildren.map(collectNamedRoutes);
    } else if (nestedChildren) {
      route.children = [collectNamedRoutes(nestedChildren)];
    }

    return route;
  }

  useEffect(() => {
    // Convert top-level NamedRoutes children to NamedRouteObjects
    children.forEach((child) => {
      namedRoutes.push(collectNamedRoutes(child));
    });
    // Use the same route collection mechanism from main.ts
    collectRouteNames(namedRoutes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Recursively renders a <NamedRoute> as a real <Route> element.
   *
   * @param child - A NamedRoute to convert into a <Route>.
   * @returns A <Route> element that can be rendered by <Routes>.
   */
  function renderRoute(child: ReactElement): ReactElement {
    if (child.type !== NamedRoute && child.type !== Fragment) {
      throw new Error(
        `Type ${child.type} is not of type NamedRoute or React.Fragment.`,
      );
    }
    const { key, props } = child;
    const { children: nestedChildren, ...routeProps } = props;

    let nestedRoutes = null;

    if (Array.isArray(nestedChildren)) {
      nestedRoutes = nestedChildren.map(renderRoute);
    } else if (nestedChildren) {
      nestedRoutes = renderRoute(nestedChildren);
    }

    return (
      <Route key={key} {...routeProps}>
        {nestedRoutes}
      </Route>
    );
  }

  return <Routes>{children.map(renderRoute)}</Routes>;
}
