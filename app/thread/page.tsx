'use client';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import Notebook from '@/components/notebook/Notebook';
import { useNotebookStore } from '@/components/notebook/store/NotebookStore';

const DEFAULT_TITLE_TAG = 'Thread: Notebooks (but with AI)';

const DynamicHeadTag = () => {
	const fileContents = useNotebookStore((state) => state.fileContents);
	const { getNotebookName } = useNotebookStore.getState();
	const [titleTag, setTitleTag] = useState(DEFAULT_TITLE_TAG);

	useEffect(() => {
		if (fileContents) {
			const name = getNotebookName();
			if (name) {
				setTitleTag(`${name} | Thread`);
			} else {
				setTitleTag(DEFAULT_TITLE_TAG);
			}
		} else {
			setTitleTag(DEFAULT_TITLE_TAG);
		}
	}, [fileContents]);

	return (
		<Head>
			<title>{titleTag}</title>
		</Head>
	);
};

export default function Home() {
	return (
		<>
			<DynamicHeadTag />
			<Notebook />
		</>
	);
}
