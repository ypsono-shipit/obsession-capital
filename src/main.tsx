import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import LandingPage from './components/LandingPage.tsx';
import DemoApp from './demo/DemoApp.tsx';
import Win3App from './win3/Win3App.tsx';
import ResourceApp from './win3/ResourceApp.tsx';
import ResourceGuide from './win3/ResourceGuide.tsx';
import UploadedResource from './win3/UploadedResource.tsx';
import AdminApp from './win3/AdminApp.tsx';
import './index.css';

const path = window.location.pathname.replace(/\/+$/, "") || "/";

const Root = () => {
  if (path === '/demo') return <DemoApp />;
  if (path === '/fnb') return <DemoApp />;
  if (path === '/win') return <Win3App />;
  if (path === '/admin') return <AdminApp />;
  if (path === '/resource') return <ResourceApp />;
  if (path === '/resource/compounding-second-brain') return <ResourceGuide />;
  if (path.startsWith('/resource/')) {
    const slug = decodeURIComponent(path.slice('/resource/'.length));
    if (slug && !slug.includes('/')) return <UploadedResource slug={slug} />;
  }
  return <LandingPage />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
