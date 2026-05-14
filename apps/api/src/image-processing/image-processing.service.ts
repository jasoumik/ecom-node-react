import { Injectable, Inject } from '@nestjs/common';
import * as sharp from 'sharp';
import { Knex } from 'knex';
import { randomBytes } from 'crypto';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface WatermarkConfig {
  enabled: boolean;
  type: 'text' | 'image';
  text: string;
  imageUrl: string;
  opacity: number;
  position: string;
  size: number;
}

@Injectable()
export class ImageProcessingService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}

  private async getWatermarkConfig(): Promise<WatermarkConfig> {
    const keys = [
      'watermark_enabled',
      'watermark_type',
      'watermark_text',
      'watermark_image',
      'watermark_opacity',
      'watermark_position',
      'watermark_size',
    ];
    const rows = await this.knex('settings').whereIn('key', keys).select('key', 'value');
    const map: Record<string, string> = {};
    rows.forEach((r: any) => (map[r.key] = r.value));

    return {
      enabled: map['watermark_enabled'] === 'true',
      type: (map['watermark_type'] as 'text' | 'image') || 'text',
      text: map['watermark_text'] || '',
      imageUrl: map['watermark_image'] || '',
      opacity: parseFloat(map['watermark_opacity'] || '0.5'),
      position: map['watermark_position'] || 'southeast',
      size: parseInt(map['watermark_size'] || '200', 10),
    };
  }

  async processAndSaveImage(file: Express.Multer.File): Promise<{ filename: string; mimetype: string; size: number }> {
    if (!file.mimetype.startsWith('image/')) {
      // Non-image: write buffer as-is with a generated filename
      const ext = file.originalname.includes('.') ? file.originalname.slice(file.originalname.lastIndexOf('.')) : '';
      const filename = `${randomBytes(16).toString('hex')}${ext}`;
      const dir = join(process.cwd(), 'uploads');
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, filename), file.buffer);
      return { filename, mimetype: file.mimetype, size: file.size };
    }

    const config = await this.getWatermarkConfig();
    let image = sharp(file.buffer);
    const metadata = await image.metadata();

    if (config.enabled) {
      if (config.type === 'text' && config.text) {
        const width = metadata.width || 800;
        const height = metadata.height || 600;
        const fontSize = Math.max(16, Math.min(52, Math.floor(width / 12)));
        const escaped = config.text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');

        const svgBuffer = Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
            `<text x="50%" y="94%" text-anchor="middle" dominant-baseline="auto" ` +
            `font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="bold" ` +
            `fill="white" fill-opacity="${config.opacity}" ` +
            `stroke="black" stroke-width="1" stroke-opacity="${config.opacity * 0.4}">` +
            escaped +
            `</text></svg>`,
        );

        image = image.composite([{ input: svgBuffer, blend: 'over' }]);
      } else if (config.type === 'image' && config.imageUrl) {
        try {
          const response = await fetch(config.imageUrl);
          if (response.ok) {
            const wmBuf = Buffer.from(await response.arrayBuffer());
            const wmResized = await sharp(wmBuf)
              .resize(config.size, null, { fit: 'inside', withoutEnlargement: true })
              .ensureAlpha()
              .toBuffer();

            image = image.composite([
              {
                input: wmResized,
                gravity: this.positionToGravity(config.position),
                blend: 'over',
              },
            ]);
          }
        } catch {
          // watermark image unavailable — proceed without it
        }
      }
    }

    const processedBuffer = await image.webp({ quality: 85 }).toBuffer();
    const filename = `${randomBytes(16).toString('hex')}.webp`;
    const dir = join(process.cwd(), 'uploads');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), processedBuffer);

    return { filename, mimetype: 'image/webp', size: processedBuffer.length };
  }

  private positionToGravity(position: string): sharp.Gravity {
    const map: Record<string, sharp.Gravity> = {
      northwest: 'northwest',
      northeast: 'northeast',
      southwest: 'southwest',
      southeast: 'southeast',
      center: 'center',
    };
    return map[position] ?? 'southeast';
  }
}
