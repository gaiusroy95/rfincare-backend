import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Footer from '../homepage/components/Footer';
import { homepageService } from '../../services/homepageService';
import { prepareLegalHtml } from '../../utils/legalContent';

const LegalPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    homepageService
      .getLegalPage(slug)
      .then(setPage)
      .catch(() => setError('Page not found'));
  }, [slug]);

  const bodyHtml = useMemo(
    () => (page?.bodyHtml ? prepareLegalHtml(page.bodyHtml) : ''),
    [page?.bodyHtml],
  );

  const updatedLabel = page?.updatedAt
    ? new Date(page.updatedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-background legal-page">
      <Header />
      <main className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/10"
          aria-hidden
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
          {error && (
            <p className="text-destructive text-center py-12">{error}</p>
          )}
          {page && (
            <article className="legal-document-card rounded-2xl border border-border/80 bg-card/95 shadow-xl backdrop-blur-sm overflow-hidden">
              <header className="legal-document-header px-6 md:px-10 pt-8 md:pt-10 pb-6 border-b border-border/60 bg-gradient-to-r from-primary/10 to-transparent">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                  Legal
                </p>
                <h1 className="legal-document-title text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  {page.title}
                </h1>
                {updatedLabel && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Last updated: {updatedLabel}
                  </p>
                )}
              </header>
              <div
                className="legal-document px-6 md:px-10 py-8 md:py-10"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalPage;
