import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Charts from './components/Charts';
import { formatMontant } from './utils/formatters';
import commonStyles from './styles/commonStyles';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// Styles pour le fond
const styles = {
    backgroundContainer: {
        minHeight: '100vh',
        background: '#0052cc',
        position: 'relative',
        overflow: 'hidden'
    },
    contentWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        minHeight: '100vh',
        padding: '2rem',
        position: 'relative',
        zIndex: 2,
        backdropFilter: 'blur(20px)',
        border: 'none'
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0, 82, 204, 0.8) 0%, rgba(0, 119, 255, 0.7) 100%)',
        zIndex: 1
    }
};

// Ajout des keyframes pour l'animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes wave {
        0% { background-position: 0% 0%; }
        50% { background-position: 100% 100%; }
        100% { background-position: 0% 0%; }
    }
`;
document.head.appendChild(styleSheet);

function getObservation(loyer) {
    if (loyer < 1000) return 'Bas';
    else if (loyer <= 5000) return 'Moyen';
    else return 'Élevé';
}

function Home() {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [username, setUsername] = useState('');
    const [newAppartement, setNewAppartement] = useState({
        numApp: '',
        design: '',
        loyer: ''
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedAppartement, setSelectedAppartement] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [appartementToDelete, setAppartementToDelete] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    const total = data.reduce((acc, hotel) => acc + hotel.loyer, 0);
    const min = data.length ? Math.min(...data.map(hotel => hotel.loyer)) : 0;
    const max = data.length ? Math.max(...data.map(hotel => hotel.loyer)) : 0;

    // Ajout des styles pour les notifications
    const notificationStyles = {
        container: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: notification.show ? 'translateX(0)' : 'translateX(100%)',
            opacity: notification.show ? 1 : 0,
            transition: 'all 0.5s ease',
            backgroundColor: notification.type === 'success' ? '#00B894' 
                         : notification.type === 'error' ? '#FF7675'
                         : '#6C5CE7'
        },
        icon: {
            marginRight: '12px',
            display: 'flex',
            alignItems: 'center'
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    useEffect(() => {
        fetchData();
        // Récupérer le nom d'utilisateur depuis le localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setUsername(user.username);
        }
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8081/');
            setData(res.data);
            setError('');
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            setError('Impossible de charger les données. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (numApp) => {
        setAppartementToDelete(numApp);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:8081/delete/${appartementToDelete}`);
            setShowDeleteModal(false);
            fetchData();
            showNotification('Appartement supprimé avec succès !');
        } catch (err) {
            console.error("Erreur lors de la suppression:", err);
            showNotification('Erreur lors de la suppression', 'error');
        }
    };

    const handleUpdate = (numApp) => {
        navigate(`/update/${numApp}`);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setAddError('');
        setAddLoading(true);

        try {
            const response = await axios.post('http://localhost:8081/appartement', {
                ...newAppartement,
                loyer: Number(newAppartement.loyer)
            });

            if (response.data.message === "Création réussie") {
                setShowAddModal(false);
                setNewAppartement({ numApp: '', design: '', loyer: '' });
                fetchData();
                showNotification('Appartement ajouté avec succès !');
            } else {
                setAddError(response.data.error || "Erreur lors de l'ajout");
            }
        } catch (err) {
            console.error("Erreur lors de l'ajout:", err);
            setAddError(err.response?.data?.error || "Erreur lors de l'ajout de l'appartement");
        } finally {
            setAddLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAppartement(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleOpenUpdateModal = (appartement) => {
        setSelectedAppartement({
            ...appartement,
            oldNumApp: appartement.numApp
        });
        setShowUpdateModal(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.put(`http://localhost:8081/update/${selectedAppartement.oldNumApp}`, {
                numApp: selectedAppartement.numApp,
                design: selectedAppartement.design,
                loyer: Number(selectedAppartement.loyer)
            });
            
            if (response.data.message === "Modification réussie") {
                setShowUpdateModal(false);
                fetchData();
                showNotification('Appartement modifié avec succès !');
            }
        } catch (err) {
            console.error("Erreur lors de la modification:", err);
            showNotification('Erreur lors de la modification', 'error');
        }
    };

    const exportToExcel = () => {
        // Préparer les données pour l'export
        const exportData = data.map(item => ({
            'N° App': item.numApp,
            'Désignation': item.design,
            'Loyer': formatMontant(item.loyer)
        }));
    
        // Créer le workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);
    
        // Ajouter la feuille au workbook
        XLSX.utils.book_append_sheet(wb, ws, "Appartements");
    
        // Générer le fichier Excel
        XLSX.writeFile(wb, 'liste_appartements.xlsx');
    };
    
    const exportToPDF = () => {
        // Créer un conteneur temporaire pour la capture
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.backgroundColor = 'white';
        container.style.padding = '20px';
        
        // Cloner le tableau et les diagrammes
        const tableClone = document.querySelector('.table-responsive').cloneNode(true);
        const chartsClone = document.querySelector('.mt-4').cloneNode(true);
        
        // Ajouter les éléments clonés au conteneur
        container.appendChild(tableClone);
        container.appendChild(chartsClone);
        
        // Ajouter le conteneur au document temporairement
        document.body.appendChild(container);
        
        html2canvas(container, {
            scale: 2, // Augmenter la qualité de l'image
            backgroundColor: 'white',
            logging: false,
            useCORS: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Supprimer le conteneur temporaire
            document.body.removeChild(container);
            
            pdf.save('liste_appartements.pdf');
        });
    };

    const exportToCSV = () => {
        // Préparer les données pour l'export
        const exportData = data.map(item => ({
            'N° App': item.numApp,
            'Désignation': item.design,
            'Loyer': formatMontant(item.loyer),
            'Observation': getObservation(item.loyer)
        }));
    
        // Ajouter les statistiques
        const stats = [
            { 'Statistique': 'Total', 'Valeur': formatMontant(total) },
            { 'Statistique': 'Minimum', 'Valeur': formatMontant(min) },
            { 'Statistique': 'Maximum', 'Valeur': formatMontant(max) }
        ];
    
        // Convertir en CSV
        const csvContent = [
            // En-têtes
            Object.keys(exportData[0]).join(','),
            // Données
            ...exportData.map(item => Object.values(item).join(',')),
            // Ligne vide
            '',
            // Statistiques
            ...stats.map(item => Object.values(item).join(','))
        ].join('\n');
    
        // Créer et télécharger le fichier
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'statistiques_appartements.csv');
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Styles pour les cartes statistiques
    const statCardStyles = {
        container: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        },
        title: {
            color: '#718096',
            fontSize: '0.875rem',
            fontWeight: '500'
        },
        value: {
            color: '#2D3748',
            fontSize: '1.5rem',
            fontWeight: '600'
        },
        trend: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
        },
        trendUp: {
            color: '#48BB78'
        },
        trendDown: {
            color: '#F56565'
        }
    };

    return (
        <div style={styles.backgroundContainer}>
            <div style={styles.overlay}></div>
            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={styles.contentWrapper}>
                    {/* En-tête avec le titre et le profil */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '2rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                    }}>
                        <h2 style={{ margin: 0, ...commonStyles.title }}>Dashboard</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ color: '#0052cc', fontWeight: 'bold' }}>
                                Bienvenue, {username}
                            </span>
                            <Link to="/profile" style={{
                                textDecoration: 'none',
                                color: '#0052cc',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #0052cc',
                                transition: 'all 0.3s ease'
                            }}>
                                Mon Profil
                            </Link>
                        </div>
                    </div>

                    {/* Cartes statistiques avec espacement ajusté */}
                    <div style={{
                        ...statCardStyles.container,
                        margin: '0 0 2rem 0',
                        padding: '1rem 0'
                    }}>
                        <div style={statCardStyles.card}>
                            <span style={statCardStyles.title}>Total Loyers</span>
                            <span style={statCardStyles.value}>{formatMontant(total)} Ar</span>
                        </div>
                        <div style={statCardStyles.card}>
                            <span style={statCardStyles.title}>Loyer Moyen</span>
                            <span style={statCardStyles.value}>
                                {formatMontant(data.length ? total / data.length : 0)} Ar
                            </span>
                        </div>
                        <div style={statCardStyles.card}>
                            <span style={statCardStyles.title}>Loyer Minimum</span>
                            <span style={statCardStyles.value}>{formatMontant(min)} Ar</span>
                        </div>
                        <div style={statCardStyles.card}>
                            <span style={statCardStyles.title}>Loyer Maximum</span>
                            <span style={statCardStyles.value}>{formatMontant(max)} Ar</span>
                        </div>
                    </div>

                    {/* Section Graphique et Liste avec espacement ajusté */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '2rem',
                        margin: '2rem 0',
                        minHeight: 'calc(100vh - 400px)'  // Ajustement pour l'espace vertical
                    }}>
                        {/* Graphique */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem'
                            }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#2D3748' }}>Statistiques</h3>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '6px',
                                        backgroundColor: 'white',
                                        color: '#718096',
                                        fontSize: '0.875rem'
                                    }}>7 jours</button>
                                    <button style={{
                                        padding: '0.5rem 1rem',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '6px',
                                        backgroundColor: 'white',
                                        color: '#718096',
                                        fontSize: '0.875rem'
                                    }}>30 jours</button>
                                </div>
                            </div>
                            <Charts data={data} />
                        </div>

                        {/* Liste des derniers appartements */}
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#2D3748' }}>
                                Derniers Appartements
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {data.slice(0, 5).map((appartement) => (
                                    <div key={appartement.numApp} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        backgroundColor: '#F7FAFC'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                backgroundColor: '#EBF4FF',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#4299E1'
                                            }}>
                                                {appartement.numApp[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500', color: '#2D3748' }}>
                                                    {appartement.numApp}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                                                    {appartement.design}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ color: '#48BB78', fontWeight: '500' }}>
                                            {formatMontant(appartement.loyer)} Ar
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action et tableau */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex gap-2">
                            <button
                                onClick={() => setShowAddModal(true)}
                                style={{
                                    backgroundColor: '#6C5CE7',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s ease',
                                    transform: 'translateY(0)',
                                    boxShadow: '0 4px 6px rgba(108, 92, 231, 0.2)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 8px rgba(108, 92, 231, 0.3)';
                                    e.currentTarget.style.backgroundColor = '#5B4BC4';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(108, 92, 231, 0.2)';
                                    e.currentTarget.style.backgroundColor = '#6C5CE7';
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Ajouter
                            </button>
                        </div>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {loading ? (
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                </div>
                    ) : data.length === 0 ? (
                        <div className="alert alert-info">Aucun appartement trouvé.</div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover">
                    <thead>
                        <tr>
                                            <th>N° App</th>
                                            <th>Désignation</th>
                            <th>Loyer</th>
                                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                                        {data.map((hotel) => (
                                            <tr key={hotel.numApp}>
                                <td>{hotel.numApp}</td>
                                <td>{hotel.design}</td>
                                                <td>{formatMontant(hotel.loyer)}</td>
                                                <td style={{
                                                    ...commonStyles.td,
                                                    display: 'flex',
                                                    gap: '8px',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}>
                                    <button 
                                                        onClick={() => handleOpenUpdateModal(hotel)}
                                                        style={{
                                                            backgroundColor: '#00B894',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '0.75rem 1.5rem',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            transition: 'all 0.3s ease',
                                                            transform: 'translateY(0)',
                                                            boxShadow: '0 4px 6px rgba(0, 184, 148, 0.2)'
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 184, 148, 0.3)';
                                                            e.currentTarget.style.backgroundColor = '#00A382';
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 184, 148, 0.2)';
                                                            e.currentTarget.style.backgroundColor = '#00B894';
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeWidth="2" strokeLinecap="round"/>
                                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round"/>
                                                        </svg>
                                        Modifier
                                    </button>
                                    <button 
                                                        onClick={() => handleDeleteClick(hotel.numApp)}
                                                        style={{
                                                            backgroundColor: '#FF7675',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '0.75rem 1.5rem',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            transition: 'all 0.3s ease',
                                                            transform: 'translateY(0)',
                                                            boxShadow: '0 4px 6px rgba(255, 118, 117, 0.2)'
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 6px 8px rgba(255, 118, 117, 0.3)';
                                                            e.currentTarget.style.backgroundColor = '#FF6B6A';
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(255, 118, 117, 0.2)';
                                                            e.currentTarget.style.backgroundColor = '#FF7675';
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeWidth="2" strokeLinecap="round"/>
                                                            <path d="M10 11v6M14 11v6" strokeWidth="2" strokeLinecap="round"/>
                                                        </svg>
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '2rem',
                                paddingTop: '1rem',
                                borderTop: '1px solid #eee'
                            }}>
                                {/* Boutons d'exportation à gauche */}
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem'
                                }}>
                                    <button
                                        onClick={exportToExcel}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            backgroundColor: '#00B894',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 2px 4px rgba(0, 184, 148, 0.2)'
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M5.884 6.68a.5.5 0 1 0-.768.64L7.349 10l-2.233 2.68a.5.5 0 0 0 .768.64L8 10.781l2.116 2.54a.5.5 0 0 0 .768-.641L8.651 10l2.233-2.68a.5.5 0 0 0-.768-.64L8 9.219l-2.116-2.54z"/>
                                            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                                        </svg>
                                        Excel
                                    </button>
                                    
                                </div>

                                {/* Bouton de déconnexion à droite */}
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        backgroundColor: '#FF7675',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 4px rgba(255, 118, 117, 0.2)'
                                    }}
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="20" 
                                        height="20" 
                                        fill="currentColor" 
                                        viewBox="0 0 16 16"
                                    >
                                        <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                                        <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                                    </svg>
                                    Se déconnecter
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Notification Component */}
            {notification.show && (
                <div style={notificationStyles.container}>
                    <span style={notificationStyles.icon}>
                        {notification.type === 'success' ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        ) : notification.type === 'error' ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </span>
                    {notification.message}
                </div>
            )}

            {/* Modal d'ajout */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        width: '90%',
                        maxWidth: '500px',
                        position: 'relative'
                    }}>
                        <button 
                            onClick={() => setShowAddModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: '#666',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            ×
                        </button>

                        <h2 style={{
                            ...commonStyles.title,
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            color: '#2c3e50',
                            fontSize: '1.8rem'
                        }}>Ajouter un appartement</h2>
                        
                        {addError && (
                            <div style={{
                                ...commonStyles.error,
                                marginBottom: '1rem',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                backgroundColor: '#fff5f5',
                                border: '1px solid #ffebee'
                            }}>
                                {addError}
                            </div>
                        )}

                        <form onSubmit={handleAddSubmit}>
                            <div style={{
                                ...commonStyles.formGroup,
                                marginBottom: '1.5rem'
                            }}>
                                <label style={{
                                    ...commonStyles.label,
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50',
                                    fontWeight: '500'
                                }}>Numéro d'appartement</label>
                                <input
                                    type="text"
                                    name="numApp"
                                    value={newAppartement.numApp}
                                    onChange={handleInputChange}
                                    style={{
                                        ...commonStyles.input,
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        transition: 'border-color 0.2s'
                                    }}
                                    required
                                    placeholder="Ex: A101"
                                />
                            </div>

                            <div style={{
                                ...commonStyles.formGroup,
                                marginBottom: '1.5rem'
                            }}>
                                <label style={{
                                    ...commonStyles.label,
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50',
                                    fontWeight: '500'
                                }}>Désignation</label>
                                <input
                                    type="text"
                                    name="design"
                                    value={newAppartement.design}
                                    onChange={handleInputChange}
                                    style={{
                                        ...commonStyles.input,
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        transition: 'border-color 0.2s'
                                    }}
                                    required
                                    placeholder="Ex: Appartement vue mer"
                                />
                            </div>

                            <div style={{
                                ...commonStyles.formGroup,
                                marginBottom: '1.5rem'
                            }}>
                                <label style={{
                                    ...commonStyles.label,
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50',
                                    fontWeight: '500'
                                }}>Loyer (Ar)</label>
                                <input
                                    type="number"
                                    name="loyer"
                                    value={newAppartement.loyer}
                                    onChange={handleInputChange}
                                    style={{
                                        ...commonStyles.input,
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        transition: 'border-color 0.2s'
                                    }}
                                    required
                                    min="0"
                                    placeholder="Ex: 200000"
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '1rem',
                                marginTop: '2rem'
                            }}>
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddModal(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: '1px solid #E0E0E0',
                                        borderRadius: '6px',
                                        backgroundColor: 'white',
                                        color: '#666',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        ':hover': {
                                            backgroundColor: '#F5F5F5',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                        }
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                    </svg>
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: '#6C5CE7',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease',
                                        ':hover': {
                                            backgroundColor: '#5B4BC4',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 8px rgba(108, 92, 231, 0.3)'
                                        },
                                        ':disabled': {
                                            backgroundColor: '#BDBDBD',
                                            cursor: 'not-allowed',
                                            transform: 'none',
                                            boxShadow: 'none'
                                        }
                                    }}
                                    disabled={addLoading}
                                >
                                    {addLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            Ajout en cours...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                            </svg>
                                            Ajouter
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de modification */}
            {showUpdateModal && selectedAppartement && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        width: '90%',
                        maxWidth: '500px',
                        position: 'relative'
                    }}>
                        <button 
                            onClick={() => setShowUpdateModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: '#666',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            ×
                        </button>

                        <h2 style={{
                            ...commonStyles.title,
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            color: '#2c3e50',
                            fontSize: '1.8rem'
                        }}>
                            Modifier l'appartement
                        </h2>

                        <form onSubmit={handleUpdateSubmit}>
                            <div style={{
                                ...commonStyles.formGroup,
                                marginBottom: '1.5rem'
                            }}>
                                <label style={{
                                    ...commonStyles.label,
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50',
                                    fontWeight: '500'
                                }}>
                                    Numéro d'appartement
                                </label>
                                <input
                                    type="text"
                                    value={selectedAppartement.numApp}
                                    onChange={(e) => setSelectedAppartement(prev => ({
                                        ...prev,
                                        numApp: e.target.value
                                    }))}
                                    style={{
                                        ...commonStyles.input,
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{
                                ...commonStyles.formGroup,
                                marginBottom: '1.5rem'
                            }}>
                                <label style={{
                                    ...commonStyles.label,
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50',
                                    fontWeight: '500'
                                }}>
                                    Désignation
                                </label>
                                <input
                                    type="text"
                                    value={selectedAppartement.design}
                                    onChange={(e) => setSelectedAppartement(prev => ({
                                        ...prev,
                                        design: e.target.value
                                    }))}
                                    style={{
                                        ...commonStyles.input,
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{
                                ...commonStyles.formGroup,
                                marginBottom: '2rem'
                            }}>
                                <label style={{
                                    ...commonStyles.label,
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: '#2c3e50',
                                    fontWeight: '500'
                                }}>
                                    Loyer (Ar)
                                </label>
                                <input
                                    type="number"
                                    value={selectedAppartement.loyer}
                                    onChange={(e) => setSelectedAppartement(prev => ({
                                        ...prev,
                                        loyer: e.target.value
                                    }))}
                                    style={{
                                        ...commonStyles.input,
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                    required
                                    min="0"
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '1rem'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowUpdateModal(false)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        backgroundColor: 'white',
                                        color: '#666',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: 'none',
                                        borderRadius: '6px',
                                        backgroundColor: '#00B894',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 6px rgba(0, 184, 148, 0.2)'
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de suppression */}
            {showDeleteModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        width: '90%',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="48" 
                            height="48" 
                            fill="#FF7675" 
                            viewBox="0 0 16 16"
                            style={{ marginBottom: '1rem' }}
                        >
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                        </svg>
                        <h2 style={{
                            color: '#2c3e50',
                            marginBottom: '1rem',
                            fontSize: '1.5rem'
                        }}>
                            Confirmer la suppression
                        </h2>
                        <p style={{
                            color: '#666',
                            marginBottom: '1.5rem'
                        }}>
                            Êtes-vous sûr de vouloir supprimer cet appartement ?
                            Cette action est irréversible.
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '1rem'
                        }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    backgroundColor: 'white',
                                    color: '#666',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: '#FF7675',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de déconnexion */}
            {showLogoutModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        width: '90%',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <h2 style={{
                            color: '#2c3e50',
                            marginBottom: '1rem',
                            fontSize: '1.5rem'
                        }}>
                            Confirmer la déconnexion
                        </h2>
                        <p style={{
                            color: '#666',
                            marginBottom: '1.5rem'
                        }}>
                            Êtes-vous sûr de vouloir vous déconnecter ?
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '1rem'
                        }}>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    backgroundColor: 'white',
                                    color: '#666',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmLogout}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: '#FF7675',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
