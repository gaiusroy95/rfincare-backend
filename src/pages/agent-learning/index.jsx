import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketingPageShell from '../../components/layout/MarketingPageShell';
import Button from '../../components/ui/Button';
import TrainingResources from '../agent-dashboard/components/TrainingResources';
import {
  agentLearningService,
  resolveLearningOpenUrl,
  openLearningResource,
} from '../../services/agentLearningService';

const AgentLearningPage = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await agentLearningService.listForAgent();
      setResources(
        (Array.isArray(data) ? data : []).map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          duration: item.duration || item.durationLabel || '—',
          progress: item.progress ?? 0,
          isNew: item.isNew,
          openUrl: resolveLearningOpenUrl(item),
          legacy: item.legacy,
        })),
      );
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = async (resource) => {
    try {
      await openLearningResource(resource);
    } catch (err) {
      console.error('Failed to open learning resource:', err);
    }
    if (!resource.legacy && resource.id) {
      const nextProgress = resource.progress > 0 ? Math.min(100, resource.progress + 25) : 50;
      try {
        await agentLearningService.updateProgress(resource.id, nextProgress);
        setResources((prev) =>
          prev.map((r) =>
            r.id === resource.id ? { ...r, progress: nextProgress } : r,
          ),
        );
      } catch {
        /* ignore */
      }
    }
  };

  const handleStart = async (resource) => {
    await handleOpen(resource);
    if (!resource.legacy && resource.id && (resource.progress || 0) < 100) {
      try {
        await agentLearningService.updateProgress(resource.id, 100);
        setResources((prev) =>
          prev.map((r) => (r.id === resource.id ? { ...r, progress: 100 } : r)),
        );
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <MarketingPageShell
      title="Training & Learning"
      subtitle="Videos, PDFs, presentations, and circulars from your admin team."
    >
      <section className="py-10">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-6">
          <Button variant="outline" iconName="ArrowLeft" onClick={() => navigate('/agent-dashboard')}>
            Dashboard
          </Button>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading…</p>
        ) : resources.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 border border-dashed rounded-lg">
            No training content published yet. Check back later.
          </p>
        ) : (
          <TrainingResources
            resources={resources}
            onViewAll={() => {}}
            showViewAll={false}
            onOpenResource={handleOpen}
            onStartResource={handleStart}
          />
        )}
      </main>
      </section>
    </MarketingPageShell>
  );
};

export default AgentLearningPage;
