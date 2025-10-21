import LoadingText from "./LoadingText.jsx";

export default function PaymentsList({
	payments = [],
	isLoading = false,
	isError = false,
	error = null,
	pageCount = 1,
	currentPage = 1,
	onPageChange = () => {},
	isFetching = false,
	className = "",
	style = {},
	emptyText = "No payments found.",
	onUsernameClick,
	onPaymentClick,
}) {
	return (
		<div className={`flex flex-col gap-4 mb-6 ${className}`} style={style}>
			{isLoading ? (
				<LoadingText />
			) : isError ? (
				<div className="alert alert-error">
					{error?.message || "Failed to load payments"}
				</div>
			) : payments.length === 0 ? (
				<div className="alert alert-info">{emptyText}</div>
			) : (
				payments.map((p) => {
					const username = p.isSender ? (p.otherUserName || p.receiverUserName) : (p.otherUserName || p.senderUserName);
					return (
						<div
							key={p.paymentId}
							className="card bg-base-200 shadow flex flex-col md:flex-row md:items-center p-4 md:justify-between gap-2 md:gap-0 cursor-pointer hover:bg-base-300 transition"
							onClick={onPaymentClick ? () => onPaymentClick(p.paymentId) : undefined}
						>
							<div className="flex-1">
								<div className="font-semibold text-lg">
									{p.isSender ? (
										<>
											<span className="text-base-content/70">To </span>
											<span
												className="text-primary underline underline-offset-2 cursor-pointer hover:text-primary-focus"
												onClick={e => {
													e.stopPropagation();
													onUsernameClick && onUsernameClick(username);
												}}
											>
												@{username}
											</span>
										</>
									) : (
										<>
											<span className="text-base-content/70">From </span>
											<span
												className="text-primary underline underline-offset-2 cursor-pointer hover:text-primary-focus"
												onClick={e => {
													e.stopPropagation();
													onUsernameClick && onUsernameClick(username);
												}}
											>
												@{username}
											</span>
										</>
									)}
								</div>
								<div className="text-base-content/70 text-sm break-words">
									{p.description}
								</div>
							</div>
							<div className="font-bold text-lg whitespace-nowrap">{p.amount}</div>
							<div className="text-xs text-base-content/50 whitespace-nowrap">
								{new Date(p.timestamp).toLocaleString()}
							</div>
						</div>
					);
				})
			)}
			{pageCount > 1 && (
				<div className="join flex justify-center">
					{Array.from({ length: pageCount }).map((_, i) => (
						<button
							key={i}
							type="button"
							className={`join-item btn btn-sm ${
								currentPage === i + 1 ? "btn-primary" : "btn-ghost"
							}`}
							onClick={() => onPageChange(i + 1)}
							disabled={isFetching}
						>
							{i + 1}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
