import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import LandingPage from './components/LandingPage.tsx';
import DemoApp from './demo/DemoApp.tsx';
import Win3App from './win3/Win3App.tsx';
import ResourceApp from './win3/ResourceApp.tsx';
import './index.css';

const path = window.location.pathname;

const Root = () => {
  if (path === '/demo') return <DemoApp />;
  if (path === '/fnb') return <DemoApp />;
  if (path === '/win') return <Win3App />;
  if (path === '/resource') return <ResourceApp />;
  return <LandingPage />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
