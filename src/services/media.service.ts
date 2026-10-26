import { MediaAsset } from '../types';
import { storageService } from './storage.service';

class MediaService {
  public getAssets(category?: string): MediaAsset[] {
    const list = storageService.getMedia();
    if (!category || category === 'all') return list;
    return list.filter((m) => m.category.toLowerCase() === category.toLowerCase());
  }

  public uploadDemoAsset(file: File, category: string = 'General'): MediaAsset {
    const objectUrl = URL.createObjectURL(file);
    const newAsset: MediaAsset = {
      id: `media-upload-${Date.now()}`,
      name: file.name,
      type: file.type.startsWith('audio') ? 'audio' : 'image',
      url: objectUrl,
      thumbnailUrl: objectUrl,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      category,
      isDemoUploaded: true,
    };

    const all = storageService.getMedia();
    all.unshift(newAsset);
    storageService.saveMedia(all);
    return newAsset;
  }

  public deleteAsset(id: string): boolean {
    const all = storageService.getMedia();
    const target = all.find((m) => m.id === id);
    if (target && target.isDemoUploaded && target.url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(target.url);
      } catch (e) {
        // ignore
      }
    }

    const filtered = all.filter((m) => m.id !== id);
    if (filtered.length !== all.length) {
      storageService.saveMedia(filtered);
      return true;
    }
    return false;
  }
}

export const mediaService = new MediaService();
