import Seo from "../Components/Seo/Seo";

const PageInfo = () => {
	return (
		<main role="main">
			<Seo page="pageinfo" path="/page" />
			<section
				style={{
					minHeight: "75vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "60px 20px",
					background: "linear-gradient(135deg, #f5f7fb, #ffffff)",
				}}
			>
				<div
					style={{
						maxWidth: 980,
						width: "100%",
						textAlign: "center",
						padding: "48px",
						borderRadius: 24,
						background: "#fff",
						boxShadow: "0 20px 60px rgba(15, 23, 42, 0.12)",
					}}
				>
					<p
						style={{
							textTransform: "uppercase",
							letterSpacing: 2,
							fontSize: 12,
							color: "#6c757d",
							marginBottom: 16,
						}}
					>
						EnnéaMaroc - Accès sécurisé
					</p>
					<h1
						style={{
							fontSize: "clamp(32px, 5vw, 48px)",
							margin: 0,
							fontWeight: 800,
							color: "#0a83ca",
						}}
					>
						Se connecter ou s’inscrire
					</h1>
					<p
						style={{
							marginTop: 18,
							marginBottom: 32,
							color: "#4e5a6b",
							lineHeight: 1.7,
						}}
					>
						Cette page permet d’accéder à l’espace membre pour gérer vos
						parcours, reprendre vos formations et suivre vos prochaines dates.
						Choisissez l’action qui vous correspond pour continuer.
					</p>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							flexWrap: "wrap",
							gap: 14,
						}}
					>
						<a
							href="/app/#/login"
							style={{
								padding: "14px 28px",
								borderRadius: 999,
								textDecoration: "none",
								fontWeight: 700,
								fontSize: 16,
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								background: "#0a83ca",
								color: "#fff",
								minWidth: 220,
							}}
						>
							Se connecter
						</a>
						<a
							href="/app/#/signup"
							style={{
								padding: "14px 28px",
								borderRadius: 999,
								textDecoration: "none",
								fontWeight: 700,
								fontSize: 16,
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								border: "2px solid #0a83ca",
								color: "#0a83ca",
								minWidth: 220,
							}}
						>
							S'inscrire
						</a>
					</div>
				</div>
			</section>
		</main>
	);
};

export default PageInfo;
