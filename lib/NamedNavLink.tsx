import { NavLink, NavLinkProps } from "react-router-dom";
import { JunctionTo, __namedToFilledPath } from "./index";
import { useMemo } from "react";

interface NamedNavLinkProps extends Omit<NavLinkProps, "to"> {
  /**
   * A wrapper component around react-router-dom's `NavLink` that enables named route navigation.
   *
   * It accepts either a direct path or a named navigation object that
   * resolves named routes to their absolute paths, including parameters and query strings.
   *
   * @example
   * ```tsx
   * // Named route navigation with params and query
   * <NamedNavLink
   *   to={{
   *     name: "searchResults",
   *     params: { category: "books" },
   *     query: { sort: "price", order: "asc", page: "2" }
   *   }}
   * />
   *
   * // Direct path navigation
   * <NamedNavLink to="/about" />
   * ```
   *
   * @param to - Either a named route or a direct path as a string.
   */
  to: JunctionTo;
}

export function NamedNavLink({ to, ...navLinkProps }: NamedNavLinkProps) {
  const path = useMemo(() => __namedToFilledPath(to), [to]);

  return <NavLink to={path} {...navLinkProps} />;
}
