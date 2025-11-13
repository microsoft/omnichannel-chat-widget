import React from 'react';

interface AttachmentLoaderProps {
  amsReferences: string;
  amsMetadata: string;
}

export const AttachmentLoader: React.FC<AttachmentLoaderProps> = ({ amsReferences, amsMetadata }) => {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function fetchBlob() {
      try {
        const refs = JSON.parse(amsReferences);
        const metas = JSON.parse(amsMetadata);
        const firstRef = Array.isArray(refs) ? refs[0] : refs;
        const firstMeta = Array.isArray(metas) ? metas[0] : metas;

        if (!firstRef || !firstMeta) {
          throw new Error('invalid ams references/metadata');
        }

        const mod = await import('./attachmentComponent');
        if (!mod || !mod.loadStatus) {
          throw new Error('loadStatus not available');
        }

        // NOTE: this passes placeholders for amsClient and chatToken. Replace with real instances if available.

        const url = await mod.loadStatus();
        if (mounted) setBlobUrl(url ?? "unknown");
      } catch (e: any) {
        if (mounted) setError(e?.message ?? String(e));
      }
    }

    fetchBlob();

    return () => {
      mounted = false;
    };
  }, [amsReferences, amsMetadata]);

  if (error) return <span>Error loading attachment</span>;
  if (!blobUrl) return <span>still loading</span>;

  return <span>{blobUrl}</span>;
};

export default AttachmentLoader;
