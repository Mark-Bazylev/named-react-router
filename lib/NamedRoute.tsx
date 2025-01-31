import { RouteProps } from "react-router-dom";

/**
 * Props for NamedRoute including an optional `name` field
 * to identify this route in the named-routes system.
 */
export type NamedRoutesProps = {
  /**
   * Unique name for the route to be registered in `namedRoutesMap`.
   */
  name?: string;
} & RouteProps;

/**
 * A no-op component used to define a named route.
 * We later reconstruct real <Route /> elements from these definitions in `NamedRoutes`.
 *
 * @example
 * ```tsx
 * <NamedRoute name="home" path="account/:id" element={<Home />} />
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function NamedRoute(_: NamedRoutesProps) {
  return <></>;
}
