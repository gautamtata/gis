import { captureException, captureMessage } from "@sentry/nextjs";
import { create } from "zustand";
import ConnectionManager, {
	useConnectionManagerStore,
} from "@/services/connection/connectionManager";
import { API_URL } from "../../utils/constants/constants";

const SETTINGS_FILE_NAME = "settings.json";
const SETTINGS_DIR_PATH = ".thread-dev";
const SETTINGS_FILE_PATH = `${SETTINGS_DIR_PATH}/${SETTINGS_FILE_NAME}`;

const saveDefaultSettingsFile = async () => {
	const contents = ConnectionManager.getInstance().serviceManager?.contents;
	try {
		await contents?.save(SETTINGS_FILE_PATH, {
			type: "file",
			format: "text",
			content: JSON.stringify(
				{
					openAIKey: "",
					openAIBaseUrl: "",
					serverProxyUrl: "",
					ollamaUrl: "",
					ollamaModel: "",
					modelType: "openai",
					autoExecuteGeneratedCode: false,
				},
				null,
				2,
			),
		});
	} catch (error) {
		console.error(error);
	}
};

const ensureSettingsExists = async () => {
	await ConnectionManager.getInstance().isServiceReady();
	const contents = ConnectionManager.getInstance().serviceManager?.contents;
	if (!contents) {
		captureMessage("Contents was undefined");
		return;
	}
	try {
		await contents.get(SETTINGS_DIR_PATH);
	} catch (error) {
		console.error("Error encountered: ", error);
		const folder = await contents?.newUntitled({
			path: "/",
			type: "directory",
		});
		if (folder) {
			await contents?.rename(folder?.path, SETTINGS_DIR_PATH);
			await saveDefaultSettingsFile();
		} else {
			captureMessage("Folder rename failed");
			return;
		}
	}
};

type ModelType = "openai" | "ollama";

interface SettingsState {
	openAIKey: string;
	openAIBaseUrl: string;
	serverProxyUrl: string;

	modelType: ModelType;
	autoExecuteGeneratedCode: boolean;

	setOpenAIKey: (key: string) => void;
	setOpenAIBaseUrl: (url: string) => void;
	setServerProxyUrl: (url: string) => void;
	getServerProxyUrl: () => string;

	setModelType: (type: ModelType) => void;
	fetchSettings: () => Promise<void>;
	setSettings: (settings: Partial<SettingsState>) => Promise<void>;
	getAdditionalRequestMetadata: () => Object;
	setAutoExecuteGeneratedCode: (autoExecuteGeneratedCode: boolean) => void;
	saveSettings: (newSettings: Partial<SettingsState>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
	autoExecuteGeneratedCode: false,
	openAIKey: "",
	openAIBaseUrl: "",
	serverProxyUrl: "",

	modelType: "openai",

	setOpenAIKey: (key) => {
		set({ openAIKey: key });
		get().saveSettings({ openAIKey: key });
	},
	setOpenAIBaseUrl: (url) => {
		set({ openAIBaseUrl: url });
		get().saveSettings({ openAIBaseUrl: url });
	},
	setServerProxyUrl: (url) => {
		set({ serverProxyUrl: url });
		get().saveSettings({ serverProxyUrl: url });
	},
	getServerProxyUrl: () => {
		const serverProxyUrl = get().serverProxyUrl;
		if (!serverProxyUrl || serverProxyUrl == "") {
			return API_URL;
		}
		return serverProxyUrl;
	},

	setModelType: (type) => {
		set({ modelType: type });
		get().saveSettings({ modelType: type });
	},
	fetchSettings: async () => {
		const connectionManager = ConnectionManager.getInstance();
		await connectionManager.isServiceReady();
		const contentsManager = connectionManager.serviceManager?.contents;

		if (typeof window !== "undefined" && contentsManager) {
			try {
				await ensureSettingsExists();

				const file = await contentsManager.get(SETTINGS_FILE_PATH);
				const fileContent = JSON.parse(file.content);

				set({
					autoExecuteGeneratedCode:
						fileContent.autoExecuteGeneratedCode || false,
					openAIKey: fileContent.openAIKey || "",
					openAIBaseUrl: fileContent.openAIBaseUrl || "",
					serverProxyUrl: fileContent.serverProxyUrl || "",

					modelType: fileContent.modelType || "openai",
				});
			} catch (error) {
				console.error("Error occurred when fetching settings: ", error);
			}
		}
	},
	setSettings: async (settings) => {
		const connectionManager = ConnectionManager.getInstance();
		await connectionManager.isServiceReady();
		const contentsManager = connectionManager.serviceManager?.contents;
		const settingsContent = JSON.stringify(
			{
				...settings,
			},
			null,
			2,
		);
		try {
			await contentsManager?.save(SETTINGS_FILE_PATH, {
				type: "file",
				format: "text",
				content: settingsContent,
			});
			// Update the state after the settings are saved
			set((state) => ({
				...state,
				...settings,
			}));
		} catch (error) {
			console.error("Error saving settings: ", error);
		}
	},
	getAdditionalRequestMetadata: () => {
		return {
			modelInformation: {
				openAIKey: get().openAIKey,
				openAIBaseUrl: get().openAIBaseUrl,

				modelType: get().modelType,
			},
			uniqueId: useConnectionManagerStore.getState().uniqueId,
		};
	},
	setAutoExecuteGeneratedCode: async (autoExecuteGeneratedCode: boolean) => {
		set({ autoExecuteGeneratedCode });
		get().saveSettings({ autoExecuteGeneratedCode });
	},
	saveSettings: async (newSettings: Partial<SettingsState>) => {
		const connectionManager = ConnectionManager.getInstance();
		await connectionManager.isServiceReady();
		try {
			const result = await connectionManager.getFileContents(
				SETTINGS_FILE_PATH,
			);
			let prevSettings: Partial<SettingsState> = {};
			if (result.content) {
				try {
					prevSettings = JSON.parse(result.content);
				} catch (e) {
					captureException(e);
					console.error(e);
				}
			}

			const updatedSettings: Partial<SettingsState> = {
				openAIBaseUrl: prevSettings.openAIBaseUrl || "",
				openAIKey: prevSettings.openAIKey || "",
				serverProxyUrl: prevSettings.serverProxyUrl || "",
				modelType: prevSettings.modelType || "openai",
				autoExecuteGeneratedCode:
					prevSettings.autoExecuteGeneratedCode || false,

				...newSettings,
			};

			await get().setSettings(updatedSettings);
		} catch (error) {
			console.error("Error saving settings: ", error);
		}
	},
}));
