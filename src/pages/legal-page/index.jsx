import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
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

  const bodyHtml = useMemo(() => {
    const raw = page?.bodyHtml ?? page?.bodyhtml ?? page?.body_html ?? '';
    return raw ? prepareLegalHtml(raw) : '';
  }, [page]);

  const updatedLabel = (() => {
    const raw = page?.updatedAt ?? page?.updatedat ?? page?.updated_at;
    if (!raw) return null;
    return new Date(raw).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  })();

  return (
    <MarketingPageShell
      title={page?.title || 'Legal'}
      subtitle={updatedLabel ? `Last updated: ${updatedLabel}` : 'Terms, policies, and legal information'}
    >
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && <p className="text-destructive text-center py-12">{error}</p>}
          {page && (
            <article className="legal-page rf-filter-card overflow-hidden">
              <div
                className="legal-document px-6 md:px-10 py-8 md:py-10"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </article>
          )}
        </div>
      </section>
    </MarketingPageShell>
  );
};

export default LegalPage;
