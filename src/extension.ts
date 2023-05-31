import * as vscode from 'vscode';
import { exec } from 'child_process';

/* The following code adopted from jkillian.custom-local-formatters */

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('Embuild Formatter');

	vscode.languages.registerDocumentFormattingEditProvider('embuild', {
		provideDocumentFormattingEdits(document: vscode.TextDocument) {
			const command = __dirname + '/format.sh ' + document.fileName;

			const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
			const backupFolder = vscode.workspace.workspaceFolders?.[0];
			const cwd = workspaceFolder?.uri?.fsPath || backupFolder?.uri.fsPath;

			return new Promise<vscode.TextEdit[]>((resolve, reject) => {
				outputChannel.appendLine(`Starting formatter: ${command}`);
				const originalDocumentText = document.getText();

				const process = exec(command, { cwd }, (error, stdout, stderr) => {
					if (error) {
						outputChannel.appendLine(`Formatter failed: ${command}\nStderr:\n${stderr}`);
						reject(error);
					}

					if (originalDocumentText.length > 0 && stdout.length === 0) {
						outputChannel.appendLine(`Formatter returned nothing - not applying changes.`);
						resolve([]);
					}

					const documentRange = new vscode.Range(
						document.lineAt(0).range.start,
						document.lineAt(document.lineCount - 1).rangeIncludingLineBreak.end,
					);

					outputChannel.appendLine(`Finished running formatter: ${command}`);
					if (stderr.length > 0)
						outputChannel.appendLine(`Possible issues ocurred:\n${stderr}`);

					resolve([new vscode.TextEdit(documentRange, stdout)]);
				});

				process.stdin?.write(originalDocumentText);
				process.stdin?.end();
			});
		},
	});
}

export function deactivate() { }
