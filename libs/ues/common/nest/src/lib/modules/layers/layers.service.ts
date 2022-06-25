import { Injectable, NotFoundException } from '@nestjs/common';

import { promises as fs } from 'fs';

@Injectable()
export class LayersService {
  public tokenPath = './token.txt';
  public layersPath = './layers.txt';

  public async getLayers() {
    let token, layers;

    try {
      layers = await fs.readFile(this.layersPath, 'utf-8');
    } catch (err) {
      throw new NotFoundException();
    }

    try {
      token = await fs.readFile(this.tokenPath, 'utf-8');
    } catch (err) {
      throw new NotFoundException();
    }

    const parsedLayers = JSON.parse(layers);

    const injected = parsedLayers.sources.map((group) => {
      const groups = group.sources.map((l) => {
        l.native.apiKey = token;
        return l;
      });

      return { ...group, sources: groups };
    });

    return { ...parsedLayers, sources: injected };
  }

  public async saveLayers(json: string) {
    await fs.writeFile(this.layersPath, json, { encoding: 'utf-8' });

    return JSON.parse(json);
  }

  public async saveToken(token: string) {
    await fs.writeFile(this.tokenPath, token, { encoding: 'utf-8' });

    return token;
  }
}
