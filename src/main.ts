import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		parties: [{
			name: "New Party #1",
			votes: 1
		}],
		seats: 10,
		treshold: 0
	}
});

export default app;