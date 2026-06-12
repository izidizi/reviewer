import { Injectable } from '@angular/core';
import JSZip from 'jszip';

@Injectable({
  providedIn: 'root',
})
export class ZipService {
  async extractAllJSON(zip: unknown): Promise<{ [file: string]: unknown }> {
    const result: { [file: string]: unknown } = {};
    const contents = await JSZip.loadAsync(zip as any);

    for (const filename of Object.keys(contents.files).filter(
      (fileName) => fileName.slice(-5) === '.json',
    )) {
      const zipEntry = contents.files[filename];
      if (!zipEntry.dir) {
        const fileText = await zipEntry.async('string');
        result[filename] = JSON.parse(fileText);
      }
    }

    return result;
  }

  async zipFiles(files: { name: string; content: string }[]): Promise<Blob> {
    const zip = new JSZip();

    for (const { name, content } of files) {
      zip.file(name, content);
    }

    return zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });
  }
}
