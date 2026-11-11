import React from 'react';
import { useLocation } from 'react-router-dom';
import { ModelPage } from '../../components/site/ModelPage';
import { useSiteContext } from '../../lib/hooks/useSiteContext';
import { docModel } from '../../site/pages/docs';
import { parsePath } from '../../site/routes';
import NotFound from '../NotFound';

/** The written pages: about, how the data works, why the site has ads, privacy and contact. */
export default function DocPage() {
  const ctx = useSiteContext();
  const { route } = parsePath(useLocation().pathname);
  const model = route ? docModel(ctx, route.page) : null;

  if (!model) return <NotFound />;
  return <ModelPage model={model} />;
}
