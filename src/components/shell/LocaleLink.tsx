import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { LinkProps, NavLinkProps } from 'react-router-dom';
import { localizedPath, parsePath } from '../../site/routes';

/** Turns an address without a language prefix into one under the prefix the visitor is on. */
export function useLocalePath() {
  const { pathname } = useLocation();
  const { language } = parsePath(pathname);
  return (path: string) => localizedPath(path, language);
}

type LocaleLinkProps = Omit<LinkProps, 'to'> & { to: string };

/** A link to a page of this site that keeps the visitor's language prefix. */
export function LocaleLink({ to, ...props }: LocaleLinkProps) {
  const localePath = useLocalePath();
  return <Link to={localePath(to)} {...props} />;
}

type LocaleNavLinkProps = Omit<NavLinkProps, 'to'> & { to: string };

export function LocaleNavLink({ to, ...props }: LocaleNavLinkProps) {
  const localePath = useLocalePath();
  return <NavLink to={localePath(to)} {...props} />;
}

export default LocaleLink;
