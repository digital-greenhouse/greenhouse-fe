import './Reports.css';

function Reports() {
	return (
		<section className="reports">
			<header className="reports__header">
				<p className="reports__kicker">Reportes</p>
				<h2 className="reports__title">Estadísticas y Análisis</h2>
			</header>

			<div className="reports__content">
				<iframe 
					src="https://datastudio.google.com/embed/reporting/5e83c9b6-c295-41d2-8803-dee2238b3cc4/page/cGrzF" 
					frameBorder="0" 
					style={{ border: 0 }} 
					allowFullScreen 
					sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
					title="Reportes Looker"
				></iframe>
			</div>
		</section>
	);
}

export default Reports;
