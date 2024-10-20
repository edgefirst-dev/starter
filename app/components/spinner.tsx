type SpinnerProps = React.SVGProps<SVGSVGElement>;

export function Spinner(props: SpinnerProps) {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: This is decorative
		<svg {...props} width="24px" height="24px" viewBox="0 0 100 100">
			<circle
				cx="50"
				cy="50"
				fill="none"
				stroke="currentColor"
				strokeWidth="10"
				r="35"
				strokeDasharray="164.93361431346415 56.97787143782138"
			>
				<animateTransform
					attributeName="transform"
					type="rotate"
					repeatCount="indefinite"
					dur="1s"
					values="0 50 50;360 50 50"
					keyTimes="0;1"
				/>
			</circle>
		</svg>
	);
}
