import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

import { EXTENSION_NAME, SETTINGS } from './const';
import { getLogger } from './logger';

const LOGGER = getLogger();

export const showErrorWithLink = (message: string) => {
  const outputButton = 'Output';
  vscode.window
    .showErrorMessage(message, outputButton)
    .then((selection) => selection === outputButton && LOGGER.show());
};

export const workspaceRoot = (): string => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  return workspaceFolders && workspaceFolders.length > 0
    ? workspaceFolders[0].uri.fsPath
    : '~';
};

/**
 * Resolves VS Code variables in a string.
 * @param str The string with variables like ${workspaceFolder}.
 * @returns The resolved string.
 */
export const resolveVariables = (str: string): string => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  const workspaceFolder = workspaceFolders?.[0]?.uri.fsPath ?? '';
  const workspaceFolderBasename = workspaceFolder ? path.basename(workspaceFolder) : '';
  const userHome = os.homedir();

  const editor = vscode.window.activeTextEditor;
  const file = editor?.document.uri.fsPath ?? '';
  const fileBasename = file ? path.basename(file) : '';
  const fileBasenameNoExtension = file ? path.basename(file, path.extname(file)) : '';
  const fileDirname = file ? path.dirname(file) : '';
  const fileExtname = file ? path.extname(file) : '';
  const relativeFile =
    workspaceFolder && file ? path.relative(workspaceFolder, file) : file;
  const relativeFileDirname = relativeFile ? path.dirname(relativeFile) : '';

  return str
    .replace(/\${workspaceFolder}/g, workspaceFolder)
    .replace(/\${workspaceFolderBasename}/g, workspaceFolderBasename)
    .replace(/\${userHome}/g, userHome)
    .replace(/\${file}/g, file)
    .replace(/\${fileBasename}/g, fileBasename)
    .replace(/\${fileBasenameNoExtension}/g, fileBasenameNoExtension)
    .replace(/\${fileDirname}/g, fileDirname)
    .replace(/\${fileExtname}/g, fileExtname)
    .replace(/\${relativeFile}/g, relativeFile)
    .replace(/\${relativeFileDirname}/g, relativeFileDirname)
    .replace(/\${cwd}/g, workspaceFolder || userHome)
    .replace(/\${pathSeparator}/g, path.sep)
    .replace(/\${env:([^}]+)}/g, (_, name) => process.env[name] ?? '');
};

export const isDefaultJust = (p: string): boolean => {
  const low = p.toLowerCase();
  if (low === 'just') return true;
  if (
    process.platform === 'win32' &&
    (low === 'just.exe' || low === 'just.bat' || low === 'just.cmd')
  ) {
    return true;
  }
  return false;
};

export const getJustPath = (): string => {
  const configPath =
    (vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .get(SETTINGS.justPath) as string) || 'just';

  return resolveVariables(configPath);
};

export const getLspPath = (): string => {
  const configPath =
    (vscode.workspace
      .getConfiguration(EXTENSION_NAME)
      .get(SETTINGS.lspPath) as string) || 'just-lsp';

  return resolveVariables(configPath);
};
