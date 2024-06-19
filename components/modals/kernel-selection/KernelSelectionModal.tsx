import { ChevronDownIcon } from "@chakra-ui/icons";
import {
	Box,
	Button,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import ConnectionManager, {
	useConnectionManagerStore,
} from "../../../services/connection/connectionManager";
import { useNotebookStore } from "../../notebook/store/NotebookStore";

const NO_KERNEL = "No kernel";

type KernelSpecs = {
	name: string;
	display_name: string;
};

const KernelSelectionModal = () => {
	const connectionManager = ConnectionManager.getInstance();
	const {
		isKernelSelectionModalOpen: isModalOpen,
		closeKernelSelectionModal: closeModal,
	} = useConnectionManagerStore();

	const [selectedKernel, setSelectedKernel] = useState<KernelSpecs>();
	const [kernelSpecs, setKernelSpecs] = useState<KernelSpecs[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchKernels = async () => {
			const cm = ConnectionManager.getInstance();
			await cm.ready;
			await cm.serviceManager?.ready;

			const specs = await cm.serviceManager?.kernelspecs.specs;
			const kernelSpecs = specs?.kernelspecs;

			const kernels = Object.keys(kernelSpecs ?? {}).map((key) => {
				return {
					name: kernelSpecs![key]?.name,
					display_name: kernelSpecs![key]?.display_name,
				};
			}) as KernelSpecs[];

			setKernelSpecs(kernels);
			if (kernels) {
				setSelectedKernel(kernels[0]);
			}
		};
		fetchKernels();
	}, []);

	const handleKernelSelect = (kernel: KernelSpecs) => {
		setSelectedKernel(kernel);
	};

	const handleSelectClick = async () => {
		setIsLoading(true);
		try {
			if (selectedKernel?.name != NO_KERNEL) {
				await connectionManager.connectToKernelForNotebook({
					kernelSelection: selectedKernel?.name,
				});
			}
			closeModal();
		} catch (error) {
			console.error("Failed to connect to kernel:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal isOpen={isModalOpen} onClose={closeModal}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader fontFamily={"Space Grotesk"}>
					Select Kernel
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody fontFamily={"Space Grotesk"} pb={6}>
					<Text size={"xs"} mb={1} pl={1}>
						{`Select kernel for: "${useNotebookStore
							.getState()
							.getNotebookPath()}"`}
					</Text>
					<Menu>
						<MenuButton
							as={Button}
							rightIcon={<ChevronDownIcon />}
							w="100%"
							textAlign="left"
						>
							{kernelSpecs.find(
								(k) =>
									k.name.toLowerCase() ===
									selectedKernel?.name,
							)?.display_name || "Select Kernel"}
						</MenuButton>
						<MenuList>
							<Box px={4}>
								<Text fontWeight="bold" py={2}>
									Start Preferred Kernel
								</Text>
								{kernelSpecs.map((kernel) => (
									<MenuItem
										key={kernel.name}
										onClick={() =>
											handleKernelSelect(kernel)
										}
									>
										{kernel.display_name}
									</MenuItem>
								))}
							</Box>
							<Box px={4}>
								<Text fontWeight="bold" py={2}>
									Use No Kernel
								</Text>
								<MenuItem
									onClick={() =>
										handleKernelSelect({
											name: "",
											display_name: NO_KERNEL,
										})
									}
								>
									No Kernel
								</MenuItem>
							</Box>
						</MenuList>
					</Menu>
				</ModalBody>
				<ModalFooter>
					<Button
						size="sm"
						colorScheme="gray"
						mr={3}
						onClick={closeModal}
						fontFamily={"Space Grotesk"}
					>
						No Kernel
					</Button>
					<Button
						size="sm"
						colorScheme="orange"
						loadingText="Connecting"
						isLoading={isLoading}
						onClick={handleSelectClick}
						fontFamily={"Space Grotesk"}
					>
						Select
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default KernelSelectionModal;
