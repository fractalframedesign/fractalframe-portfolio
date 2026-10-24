import fs from 'fs/promises';
import path from 'path';

const demosDirectory = path.join(process.cwd(), 'src/components/project-demos');

/** Raw source of a demo component, for "Show code". Path is relative to project-demos/. */
export async function readComponentSource(relativePath: string): Promise<string> {
  try {
    return await fs.readFile(path.join(demosDirectory, `${relativePath}.tsx`), 'utf8');
  } catch {
    return '';
  }
}
