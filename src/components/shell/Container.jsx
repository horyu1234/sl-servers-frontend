import React from 'react';
import TopMenu from './TopMenu';
import Footer from './Footer';

export default function Container({ view }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopMenu />
      <main className="flex-1">{view}</main>
      <Footer />
    </div>
  );
}
