import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  ExternalLink,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { mediaService } from '../../../services/media.service';
import { MediaAsset } from '../../../types';
import { BuildingFacade } from '../../../assets/illustrations/building-facade';
import { RoomScene } from '../../../assets/illustrations/room-scenes';
import { BadgeEmblem } from '../../../assets/illustrations/badges';
import { Modal } from '../../../components/common/Modal';

export const MediaLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [assets, setAssets] = useState<MediaAsset[]>(() => mediaService.getAssets());
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const categories = ['all', 'Facility', 'Instructors', 'Badges', 'General'];

  const refreshAssets = () => {
    setAssets(mediaService.getAssets());
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    mediaService.uploadDemoAsset(file, 'General');
    refreshAssets();
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleDelete = (id: string) => {
    mediaService.deleteAsset(id);
    refreshAssets();
  };

  const filtered = assets.filter((a) => {
    const matchesCat = selectedCategory === 'all' || a.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !search.trim() || a.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const renderThumbnail = (asset: MediaAsset) => {
    if (asset.url === 'building-facade') {
      return (
        <div style={{ width: '100%', height: '140px', backgroundColor: '#1E2729' }}>
          <BuildingFacade />
        </div>
      );
    }
    if (asset.url.startsWith('room-')) {
      return (
        <div style={{ width: '100%', height: '140px', backgroundColor: '#1C2426' }}>
          <RoomScene roomId={asset.url} />
        </div>
      );
    }
    if (asset.url.startsWith('badge-')) {
      return (
        <div style={{ width: '100%', height: '140px', backgroundColor: '#173B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BadgeEmblem id={asset.url} size={70} />
        </div>
      );
    }
    return (
      <img
        src={asset.url}
        alt={asset.name}
        style={{ width: '100%', height: '140px', objectFit: 'cover' }}
      />
    );
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#173B3A', margin: 0 }}>
            Training Content & Media Library
          </h1>
          <p style={{ color: '#68716D', fontSize: '13px', margin: '4px 0 0' }}>
            Curate facility schematics, room inspection vector scenes, instructor portraits, and credentials.
          </p>
        </div>

        {/* Local device upload button */}
        <label
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          <Upload size={15} />
          <span>Upload Demo Asset</span>
          <input
            type="file"
            accept="image/*,audio/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {uploadSuccess && (
        <div
          style={{
            backgroundColor: '#EAF3EE',
            border: '1px solid #9DC7B0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#387A5A',
            fontSize: '13px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>Asset uploaded to current browser session with Blob URL.</span>
        </div>
      )}

      {/* Info notice about browser-local media */}
      <div
        style={{
          backgroundColor: '#FAF8F3',
          border: '1px solid #E5E0D5',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          color: '#68716D',
        }}
      >
        <Info size={16} color="#B87955" style={{ flexShrink: 0 }} />
        <span>
          Bundled vector assets are permanently packaged. Any file uploaded from your local machine is stored in memory via browser Object URLs during this demonstration session.
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8E9995',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media assets by filename..."
            className="form-input"
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'capitalize',
                backgroundColor: selectedCategory === cat ? '#173B3A' : '#FAF8F3',
                color: selectedCategory === cat ? '#FFFFFF' : '#68716D',
                border: selectedCategory === cat ? '1px solid #173B3A' : '1px solid #E5E0D5',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="card card-interactive"
            onClick={() => setPreviewAsset(asset)}
            style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {renderThumbnail(asset)}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="badge badge-stone">{asset.category}</span>
                  <span style={{ fontSize: '11px', color: '#8E9995', textTransform: 'uppercase' }}>
                    {asset.type}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#173B3A', lineHeight: 1.3 }}>
                  {asset.name}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '10px 16px',
                backgroundColor: '#FAF8F3',
                borderTop: '1px solid #E5E0D5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewAsset(asset)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px 8px', fontSize: '12px' }}
              >
                <span>Inspect</span>
              </button>

              {asset.isDemoUploaded && (
                <button
                  onClick={() => handleDelete(asset.id)}
                  style={{ color: '#B44D45', padding: '4px' }}
                  title="Remove Upload"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewAsset && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewAsset(null)}
          title={`Asset Preview: ${previewAsset.name}`}
          maxWidth="720px"
        >
          <div>
            <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', border: '1px solid #E5E0D5' }}>
              {renderThumbnail(previewAsset)}
            </div>
            <div style={{ fontSize: '13px', color: '#68716D', lineHeight: 1.6 }}>
              <div><strong>Category:</strong> {previewAsset.category}</div>
              <div><strong>Format Type:</strong> {previewAsset.type}</div>
              <div><strong>Uploaded:</strong> {new Date(previewAsset.uploadedAt).toLocaleString()}</div>
              {previewAsset.isDemoUploaded && (
                <div style={{ color: '#D49B65', fontWeight: 600, marginTop: '4px' }}>
                  Demo upload stored in browser memory.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
