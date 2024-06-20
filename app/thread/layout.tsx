"use client";
import { HStack, VStack, useColorMode } from "@chakra-ui/react";
import React, { ReactNode, useEffect } from "react";
import { ToastContainer } from "@/theme";
import ShortcutsCheatSheetModal from "@/components/modals/cheat-sheet/ShortcutsCheatSheetModal";
import FileViewModal from "@/components/modals/file-view/FileViewModal";
import KernelSelectionModal from "@/components/modals/kernel-selection/KernelSelectionModal";

import { initializeServerConnection } from "@/components/notebook/Notebook";
import { useNotebookStore } from "@/components/notebook/store/NotebookStore";
import Sidebar from "@/components/sidebar";
interface AppLayoutProps {
	children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
	const { colorMode } = useColorMode();

	// TODO: See if a server has always been started when hitting /app, even when incognito.
	useEffect(() => {
		const { path, navigateToPath } = useNotebookStore.getState();
		initializeServerConnection();
		navigateToPath(path);
	}, []);

	return (
		<VStack width="100%" height="100vh" overflowX="hidden">
			<HStack height="calc(100%)" width="100%" gap={0}>
				<ToastContainer />
				<ShortcutsCheatSheetModal />
				<Sidebar />
				<KernelSelectionModal />
				<FileViewModal />
				{children}
			</HStack>
		</VStack>
	);
};

export default AppLayout;
