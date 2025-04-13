import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Fonction pour formater les montants en Ariary
function formatAriary(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        maximumFractionDigits: 0
    }).format(amount) + ' Ar';
}

function Charts({ data }) {
    // Vérification des données
    if (!Array.isArray(data) || data.length === 0) {
        return (
            <div className="alert alert-info">
                Aucune donnée disponible pour les graphiques.
            </div>
        );
    }

    // Calcul des statistiques avec vérification des valeurs numériques
    const loyers = data.map(apt => Number(apt.loyer)).filter(loyer => !isNaN(loyer));
    
    if (loyers.length === 0) {
        return (
            <div className="alert alert-warning">
                Les données de loyer ne sont pas valides pour générer les graphiques.
            </div>
        );
    }

    const totalLoyers = loyers.reduce((acc, loyer) => acc + loyer, 0);
    const minLoyer = Math.min(...loyers);
    const maxLoyer = Math.max(...loyers);
    const moyenLoyer = totalLoyers / loyers.length;

    // Configuration des options communes
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    // Données pour le camembert
    const categories = [
        { label: 'Bas (<1k Ar)', min: 0, max: 1000 },
        { label: 'Moyen (1k-5k Ar)', min: 1000, max: 5000},
        { label: 'Élevé (>5k Ar)', min: 5000, max: Infinity }
    ];

    const categoryCounts = categories.map(cat => {
        return loyers.filter(loyer => loyer >= cat.min && loyer < cat.max).length;
    });

    const pieData = {
        labels: categories.map(cat => cat.label),
        datasets: [{
            data: categoryCounts,
            backgroundColor: [
                'rgba(75, 192, 192, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 99, 132, 0.8)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 2,
        }],
    };

    const pieOptions = {
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            title: {
                display: true,
                text: 'Répartition par Catégorie de Loyer',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            legend: {
                position: 'right',
                labels: {
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const value = context.raw;
                        const percentage = ((value / loyers.length) * 100).toFixed(1);
                        return `${value} appartement(s) (${percentage}%)`;
                    }
                }
            }
        }
    };

    // Données pour l'histogramme
    const barData = {
        labels: ['Loyer Minimal', 'Loyer Moyen', 'Loyer Maximal'],
        datasets: [{
            label: 'Montant en Ariary',
            data: [minLoyer, moyenLoyer, maxLoyer],
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 99, 132, 0.6)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
        }],
    };

    const barOptions = {
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            title: {
                display: true,
                text: 'Statistiques des Loyers',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return 'Montant: ' + formatAriary(context.raw);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Montant en Ariary',
                    font: { size: 12 }
                },
                ticks: {
                    callback: function(value) {
                        return formatAriary(value);
                    },
                    font: { size: 11 }
                }
            }
        }
    };

    return (
        <div className="row">
            <div className="col-md-6 mb-4">
                <div style={{ height: '400px' }}>
                    <Bar data={barData} options={barOptions} />
                </div>
            </div>
            <div className="col-md-6 mb-4">
                <div style={{ height: '400px' }}>
                    <Pie data={pieData} options={pieOptions} />
                </div>
            </div>
        </div>
    );
}

export default Charts; 