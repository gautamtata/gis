'use client';
import { HStack, VStack, useColorMode } from '@chakra-ui/react';
import React, { ReactNode, useEffect } from 'react';
import { ToastContainer } from '@/theme';
import ShortcutsCheatSheetModal from '@/components/modals/cheat-sheet/ShortcutsCheatSheetModal';
import FileViewModal from '@/components/modals/file-view/FileViewModal';
import KernelSelectionModal from '@/components/modals/kernel-selection/KernelSelectionModal';
import ModelSettingsModal from '@/components/modals/model-settings/ModelSettingsModal';
import QueryLimitModal from '@/components/modals/query-limit/QueryLimitModal';
import ServerSettingsModal from '@/components/modals/server-settings/ServerSettingsModal';
import { initializeServerConnection } from '@/components/notebook/Notebook';
import { useNotebookStore } from '@/components/notebook/store/NotebookStore';
import Sidebar from '@/components/sidebar';
interface AppLayoutProps {
	children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
	const { colorMode } = useColorMode();

	useEffect(() => {
		// Update the theme class on the root element
		const root = document.documentElement;
		if (colorMode === 'dark') {
			root.classList.remove('cm-light');
			root.classList.add('cm-dark');
		} else {
			root.classList.remove('cm-dark');
			root.classList.add('cm-light');
		}
	}, [colorMode]);

	// TODO: See if a server has always been started when hitting /app, even when incognito.
	useEffect(() => {
		const { path, navigateToPath } = useNotebookStore.getState();
		initializeServerConnection();
		navigateToPath(path);
	}, []);

	return (
		<VStack width='100%' height='100vh' overflowX='hidden'>
			<HStack height='calc(100%)' width='100%' gap={0}>
				<ToastContainer />
				<ShortcutsCheatSheetModal />
				<Sidebar />
				<KernelSelectionModal />
				<FileViewModal />
				<QueryLimitModal />
				<ServerSettingsModal />
				<ModelSettingsModal />
				{children}
			</HStack>
		</VStack>
	);
};

export default AppLayout;
