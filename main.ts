import { App, Editor, MarkdownView, ItemView, WorkspaceLeaf, Modal, Menu, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

/**
 * 在这里添加所需的配置字段
 */
interface MyPluginSettings {
	mySetting: string;
}

/**
 * 默认配置值
 */
const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	
	/**
	 * 配置对象
	 */
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// 注册 TestView
		this.registerView(VIEW_TYPE_TEST, (leaf) => new TestView(leaf));

		// 添加一个激活 TestView 的按钮
		this.addRibbonIcon("dice", "Activate View", () => {
			this.activateView();
		})

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Kiritsugu', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('僕ね、正義の味方に、なりたいな');
			
			// 测试菜单
			const menu = new Menu(this.app);
			
			menu.addItem((item) =>
				item
					.setTitle("世界を、救う")
					.setIcon("documents")
					.onClick(() => {
						new Notice("あなたを、許すない...");
					})
			);

			menu.showAtMouseEvent(evt);
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				// new SampleModal(this.app).open();
				new TestModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		// 只有在编辑状态下，这条命令才会出现
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// 命令：clipboard => msdoc
		this.addCommand({
			id: 'clipboard2msdoc',
			name: 'clipboard => msdoc',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// 获取剪贴板文本
				// 加工
				// 写入光标位置
			}
		});

		// 命令：select => msdoc
		this.addCommand({
			id: 'select2msdoc',
			name: 'select => msdoc',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// 获取选中文本
				let text = editor.getSelection();
				// 加工
				// text = 'It takes two to tangle.\n\n' + text;
				text = '> ' + text.replace(/\n/g, '\n> ');
				text = '> [!note: ]+\n' + text;
				// 替换选中内容
				editor.replaceSelection(text);
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_TEST);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());  // 将后面的所有参数内容复制到第一个参数，并返回它
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_TEST);

		await this.app.workspace.getLeftLeaf(false).setViewState({
			type: VIEW_TYPE_TEST,
			active: true,
		})

		await this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_TEST)[0]
		);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

/**
 * 测试用弹窗
 */
class TestModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('ん？');
		contentEl.addEventListener('click', (evt: MouseEvent) => {
			new Notice(evt.button.toString());
			// 测试菜单
			const menu = new Menu(this.app);
			
			menu.addItem((item) =>
				item
					.setTitle("世界を、救う")
					.setIcon("documents")
					.onClick(() => {
						new Notice("あなたを、許すない...");
					})
			);

			menu.showAtMouseEvent(evt);
		});
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}

export const VIEW_TYPE_TEST = "test-view";

export class TestView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return VIEW_TYPE_TEST;
	}

	getDisplayText(): string {
		return "Test view";
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();
		container.createEl("h4", { text: "Test view"});
		container.createEl("a", { href: "https://www.baidu.com/", text:"baidu" });
	}

	async onClose(): Promise<void> {
		// nothing to clean up
	}
}

/*================= 文本处理 ======================================================*/ 

function formatting(text: String, callback: (text: String) => void) {
	//
	return 'bonjour!';
}