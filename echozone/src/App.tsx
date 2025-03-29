import { useEffect } from 'preact/hooks'
import './App.css' // or remove if you're ditching styles
	import { getCurrentWindow } from '@tauri-apps/api/window';

function App() {
	useEffect(() => {
		// Find the DOM element that you want to stop double-clicks on
		const titlebar = document.querySelector(".titlebar");

		if (titlebar) {
			// Add an event listener for double-clicks
			titlebar.addEventListener("dblclick", (e) => {
				e.preventDefault();     // Stop any default browser behavior
				e.stopPropagation();    // Stop it from bubbling up to other handlers
			});
		}

		// Cleanup function: remove the event listener when the component unmounts
		return () => {
			if (titlebar) {
				titlebar.removeEventListener("dblclick", () => {});
			}
		};
	}, []); // Empty array = only run once on mount

	const appWindow = getCurrentWindow();

	function minimize() {
		appWindow.minimize()
		.then(() => {
			console.log("minimizing...");
		})
		.catch(err => {
			console.error(`error when minimizing: ${err}`);
		});
	}

	function close() {
		appWindow.close()
		.then(() => {
			console.log("closing...");
		})
		.catch(err => {
			console.error(`error when closing: ${err}`);
		});
	}

	return (
		<div class="app">
			<div class="titlebar">
				<span class="title">echozone</span>
				<div class="window-buttons">
					<button onClick={() => minimize()}>_</button>
					<button onClick={() => close()}>X</button>
				</div>
			</div>
		</div>
	)
}

export default App
