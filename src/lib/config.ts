import fs from 'fs';
import path from 'path';
import { logger } from './logger';
import { Config } from '../types';

export const configPath = path.join(process.cwd(), 'config.json');

export function getConfig(): Config {
    try {
        const cfg = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(cfg) as Config;
    } catch (err) {
        logger.fatal(
            `Błąd podczas wczytywania pliku konfiguracyjnego ${configPath}: ${err}`
        );
        process.exit(1);
    }
}

export function saveConfig(config: Config): void {
    try {
        const json = JSON.stringify(config, null, 4);
        fs.writeFileSync(configPath, json, 'utf8');
        logger.debug(`Zapisano konfigurację do ${configPath}.`);
    } catch (err) {
        logger.error(
            `Błąd podczas zapisywania pliku konfiguracyjnego ${configPath}: ${err}`
        );
    }
}
