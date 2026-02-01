import child_process from 'node:child_process';
import util from 'node:util';

import { spawn } from 'child_process';

const exec = util.promisify(child_process.exec);

async function lsExample() {
  const { stdout, stderr } = await exec('ls');
  console.log('stdout:', stdout);
  console.error('stderr:', stderr);
}
lsExample();

import { getLogger } from './logger';
import { getJustPath } from './utils';

const LOGGER = getLogger();

export const formatWithExecutable = (fsPath: string) => {
  const args = ['-f', fsPath, '--fmt', '--unstable'];

  const childProcess = spawn(getJustPath(), args);
  childProcess.stdout.on('data', (data: string) => {
    LOGGER.info(data);
  });
  childProcess.stderr.on('data', (data: string) => {
    // TODO: successfully formatted documents also log to stderr
    // so treat everything as info for now
    LOGGER.info(data);
    // showErrorWithLink('Error formatting document.');
  });
  childProcess.on('close', (code) => {
    console.debug(`just --fmt exited with ${code}`);
  });
};

/**
 * Uses --dump to format the file and return the formatted content.
 *
 * @param fsPath - The path to the file to format.
 * @returns A promise that resolves to the formatted content.
 */
export const dumpWithExecutable = async (fsPath: string): Promise<string> => {
  const { stdout, stderr } = await exec(`${getJustPath()} -f ${fsPath} --dump`);

  if (stderr.length > 0) {
    LOGGER.error(`Error formatting '${fsPath}':\n${stderr}`);
    throw new Error(`Error formatting '${fsPath}'. See output for more info.`);
  }

  return stdout;
};
