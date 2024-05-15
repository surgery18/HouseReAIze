<template>
	<div class="loader" v-if="isLoading">
		<!-- Replace this with your SVG or image -->
		<div class="camera"><img src="../assets/camera.png" width="200" /></div>
		<div class="text">Filming episode, please wait...</div>
	</div>
</template>

<script>
	import { isLoading } from "@/utils/eventbus"
	export default {
		setup() {
			return {
				isLoading,
			}
		},
	}
</script>

<style scoped>
	@keyframes shakeAnimation {
		0% {
			transform: translate(1px, 1px) rotate(1deg);
		}
		10% {
			transform: translate(-1px, -1px) rotate(-1deg);
		}
		20% {
			transform: translate(-1px, 1px) rotate(1deg);
		}
		30% {
			transform: translate(1px, 1px) rotate(1deg);
		}
		40% {
			transform: translate(1px, -1px) rotate(-1deg);
		}
		50% {
			transform: translate(-1px, 1px) rotate(1deg);
		}
		60% {
			transform: translate(-1px, -1px) rotate(-1deg);
		}
		70% {
			transform: translate(1px, -1px) rotate(1deg);
		}
		80% {
			transform: translate(-1px, 1px) rotate(-1deg);
		}
		90% {
			transform: translate(1px, 1px) rotate(1deg);
		}
		100% {
			transform: translate(1px, -1px) rotate(-1deg);
		}
	}

	.loader {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		position: fixed; /* Fixed positioning */
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999; /* Ensure it's on top */

		width: 100vw; /* Full viewport width */
		height: 100vh; /* Full viewport height */
		color: white;
		background-color: rgba(0, 0, 0, 0.8);
	}

	.camera {
		font-family: "Courier New", monospace;
		font-size: 2rem;
		text-align: center;
		animation: shakeAnimation 0.5s infinite;
	}

	.text {
		font-family: "Courier New", monospace;
		font-size: 1.5rem;
		margin-top: 10px;
	}
</style>
