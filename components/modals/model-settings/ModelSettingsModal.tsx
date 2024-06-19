import {
	Badge,
	Button,
	ButtonGroup,
	FormControl,
	FormLabel,
	HStack,
	Input,
	InputGroup,
	InputRightElement,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	VStack,
	useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OllamaIcon, OpenAIIcon } from "../../../assets/icons";
import { useSettingsStore } from "../../settings/SettingsStore"; // adjust the import based on your file structure

const ModelSettingsModal = () => {
	const isOpen = useSettingsStore((state) => state.showModelSettingsModal);
	const setIsOpen = useSettingsStore(
		(state) => state.setShowModelSettingsModal,
	);
	const handleClose = () => {
		setIsOpen(false);
	};

	useEffect(() => {
		useSettingsStore.getState().fetchSettings();
	}, []);

	const openaiKey = useSettingsStore((state) => state.openAIKey);
	const openAIBaseUrl = useSettingsStore((state) => state.openAIBaseUrl);
	const serverProxyUrl = useSettingsStore((state) => state.serverProxyUrl);
	const modelType = useSettingsStore((state) => state.modelType);
	const ollamaUrl = useSettingsStore((state) => state.ollamaUrl);
	const ollamaModel = useSettingsStore((state) => state.ollamaModel);
	const { setSettings, setModelType } = useSettingsStore.getState();
	const [show, setShow] = useState(false);
	const [tempOpenAIKey, setTempOpenAIKey] = useState("");
	const [tempServerUrl, setTempServerUrl] = useState("");
	const [tempBaseOpenAIUrl, setTempBaseOpenAIUrl] = useState("");
	const [isValid, setIsValid] = useState(true);
	const [tempModelType, setTempModelType] = useState(modelType);
	const [tempOllamaUrl, setTempOllamaUrl] = useState("");
	const [tempOllamaModel, setTempOllamaModel] = useState("");
	const toast = useToast();

	const loadSettings = () => {
		setTempOpenAIKey(openaiKey || "");
		setTempServerUrl(serverProxyUrl || "");
		setTempBaseOpenAIUrl(openAIBaseUrl || "");
		setTempOllamaUrl(ollamaUrl || "");
		setTempOllamaModel(ollamaModel || "");
		setTempModelType(modelType || "openai");
	};

	const validate = () => {
		if (tempBaseOpenAIUrl && !tempOpenAIKey) {
			setIsValid(false);
		} else {
			setIsValid(true);
		}
	};

	const saveSettings = async () => {
		if (!isValid) {
			toast({
				title: "Error",
				description: "API key must be set if base URL is provided.",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
			return;
		}
		await setSettings({
			openAIBaseUrl: tempBaseOpenAIUrl,
			openAIKey: tempOpenAIKey,
			serverProxyUrl: tempServerUrl,
			ollamaUrl: tempOllamaUrl,
			ollamaModel: tempOllamaModel,
			modelType: tempModelType,
		});
		setModelType(tempModelType);
		handleClose();
	};

	useEffect(() => {
		if (isOpen) {
			loadSettings();
		}
	}, [isOpen]);

	useEffect(() => {
		validate();
	}, [tempOpenAIKey, tempServerUrl, tempBaseOpenAIUrl]);

	useEffect(() => {
		setTempModelType(modelType);
	}, [modelType]);

	const toggleShowKey = () => setShow(!show);

	return (
		<Modal isOpen={isOpen} onClose={handleClose} size={["sm", "md", "lg"]}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Model Settings</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<ButtonGroup
						colorScheme="orange"
						width="100%"
						isAttached
						fontFamily={"Space Grotesk"}
					>
						<Button
							width="50%"
							variant={
								tempModelType === "openai" ? "solid" : "outline"
							}
							leftIcon={<OpenAIIcon />}
							onClick={() => setTempModelType("openai")}
						>
							OpenAI
						</Button>
						<Button
							width="50%"
							variant={
								tempModelType === "ollama" ? "solid" : "outline"
							}
							leftIcon={<OllamaIcon />}
							onClick={() => setTempModelType("ollama")}
							rightIcon={
								<Badge
									fontSize="smaller"
									colorScheme="blue"
									_dark={{ background: "blue.100" }}
								>
									Beta
								</Badge>
							}
						>
							Ollama
						</Button>
					</ButtonGroup>
					<VStack spacing={6} mt={5} fontFamily={"Space Grotesk"}>
						{tempModelType === "openai" ? (
							<>
								<FormControl
									id="api-key"
									isInvalid={Boolean(
										tempBaseOpenAIUrl && !tempOpenAIKey,
									)}
								>
									<FormLabel fontWeight="bold" fontSize="lg">
										OpenAI API Key
									</FormLabel>
									<InputGroup>
										<Input
											pr="4.5rem"
											type={show ? "text" : "password"}
											placeholder="Enter your OpenAI API Key"
											value={tempOpenAIKey}
											onChange={(e) =>
												setTempOpenAIKey(e.target.value)
											}
										/>
										<InputRightElement width="4.5rem">
											<Button
												colorScheme="orange"
												h="1.75rem"
												size="sm"
												onClick={toggleShowKey}
											>
												{show ? "Hide" : "Show"}
											</Button>
										</InputRightElement>
									</InputGroup>
									{!isValid && tempBaseOpenAIUrl && (
										<Text
											mt="2"
											fontSize="small"
											color="red.500"
										>
											API key must be set if base URL or
											proxy URL is provided.
										</Text>
									)}
									<Text
										mt="2"
										fontSize="small"
										color="gray.500"
									>
										For unlimited usage of Thread&apos;s AI
										features, enter your OpenAI API key
										above.
									</Text>
								</FormControl>
								<FormControl id="base-openai-url">
									<FormLabel fontWeight="bold" fontSize="lg">
										OpenAI Base URL
									</FormLabel>
									<Input
										placeholder="Enter your OpenAI Base URL"
										value={tempBaseOpenAIUrl}
										onChange={(e) =>
											setTempBaseOpenAIUrl(e.target.value)
										}
									/>
									<Text
										mt="2"
										fontSize="small"
										color="gray.500"
									>
										Optional: Enter the base URL for OpenAI.
									</Text>
								</FormControl>
							</>
						) : (
							<>
								<FormControl id="ollama-url">
									<FormLabel
										fontWeight="bold"
										fontSize="lg"
										fontFamily={"Space Grotesk"}
									>
										Ollama URL
									</FormLabel>
									<Input
										placeholder="Enter your Ollama URL"
										value={tempOllamaUrl}
										onChange={(e) =>
											setTempOllamaUrl(e.target.value)
										}
									/>
									<Text
										mt="2"
										fontSize="small"
										color="gray.500"
									>
										The URL of your Ollama model, e.g.
										http://localhost:11434/v1. If localhost
										doesn&apos;t work, try 0.0.0.0
									</Text>
								</FormControl>
								<FormControl id="ollama-model">
									<FormLabel
										fontWeight="bold"
										fontSize="lg"
										fontFamily={"Space Grotesk"}
									>
										Ollama Model Name
									</FormLabel>
									<Input
										placeholder="Enter your Ollama Model Name"
										value={tempOllamaModel}
										onChange={(e) =>
											setTempOllamaModel(e.target.value)
										}
									/>
									<Text
										mt="2"
										fontSize="small"
										color="gray.500"
									>
										The name of the Ollama model being
										served, e.g. llama3 or codestral. For
										current purposes,{" "}
										<Text
											as={Link}
											href={
												"https://ollama.com/library/codestral"
											}
											target={"_blank"}
											cursor={"pointer"}
											color="blue.500"
										>
											codestral
										</Text>{" "}
										is recommended.
									</Text>
								</FormControl>
							</>
						)}
					</VStack>
				</ModalBody>
				<ModalFooter>
					<HStack width="100%" justifyContent="flex-end">
						<Button
							variant="ghost"
							colorScheme="red"
							onClick={handleClose}
							fontFamily={"Space Grotesk"}
						>
							Cancel
						</Button>
						<Button
							colorScheme="orange"
							onClick={saveSettings}
							isDisabled={!isValid}
							fontFamily={"Space Grotesk"}
						>
							Save
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default ModelSettingsModal;
