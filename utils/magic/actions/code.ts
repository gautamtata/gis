import { useSettingsStore } from "../../../components/settings/SettingsStore";
import { ActionState } from "../magicQuery";
import { sharedAction } from "./shared/utils";

const { getServerProxyUrl } = useSettingsStore.getState();

export async function* codeAction(
	actionState: ActionState,
	wasAborted: () => boolean,
): AsyncGenerator<any, void, unknown> {
	yield* sharedAction(
		actionState,
		wasAborted,
		`${getServerProxyUrl()}/api/code`,
		"code",
	);
}
