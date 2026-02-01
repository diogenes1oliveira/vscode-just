import * as vscode from 'vscode';

import { COMMANDS, EXTENSION_NAME, SETTINGS } from './const';
import { dumpWithExecutable, formatWithExecutable } from './format';
import { getLauncher } from './launcher';
import { getLogger } from './logger';
import { runRecipeCommand } from './recipe';
import { TaskProvider } from './tasks';

export const activate = (context: vscode.ExtensionContext) => {
  console.debug(`${EXTENSION_NAME} activated`);

  const formatDisposable = vscode.commands.registerCommand(
    COMMANDS.formatDocument,
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        formatWithExecutable(editor.document.uri.fsPath);
      }
    },
  );
  context.subscriptions.push(formatDisposable);

  // Install as a document formatter for just files (allows setting "editor.defaultFormatter")
  const documentFormatProviderDisposable =
    vscode.languages.registerDocumentFormattingEditProvider('just', {
      provideDocumentFormattingEdits(
        document: vscode.TextDocument,
      ): Promise<vscode.TextEdit[]> {
        return dumpWithExecutable(document.uri.fsPath)
          .then((formattedText) => [
            vscode.TextEdit.replace(
              new vscode.Range(
                document.lineAt(0).range.start,
                document.lineAt(document.lineCount - 1).rangeIncludingLineBreak.end,
              ),
              formattedText,
            ),
          ])
          .catch((error) => {
            vscode.window.showErrorMessage(`Failed to format document: ${error}`);
            return [];
          });
      },
    });
  context.subscriptions.push(documentFormatProviderDisposable);

  const runRecipeDisposable = vscode.commands.registerCommand(
    COMMANDS.runRecipe,
    async () => {
      runRecipeCommand();
    },
  );
  context.subscriptions.push(runRecipeDisposable);

  context.subscriptions.push(
    vscode.tasks.registerTaskProvider(EXTENSION_NAME, new TaskProvider()),
  );
};

export const deactivate = () => {
  console.debug(`${EXTENSION_NAME} deactivated`);
  getLogger().dispose();
  getLauncher().dispose();
};

vscode.workspace.onWillSaveTextDocument((event) => {
  if (vscode.workspace.getConfiguration(EXTENSION_NAME).get(SETTINGS.formatOnSave)) {
    formatWithExecutable(event.document.uri.fsPath);
  }
});
