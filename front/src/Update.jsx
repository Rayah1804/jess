import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import commonStyles from './styles/commonStyles';
import { formatMontant } from './utils/formatters';

function Update() {
    const { numApp: initialNumApp } = useParams();
    const navigate = useNavigate();
    const [appartement, setAppartement] = useState({
        numApp: '',
        design: '',
        loyer: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        fetchAppartement();
    }, [initialNumApp]);

    const fetchAppartement = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Tentative de récupération de l\'appartement:', initialNumApp);
            
            const res = await axios.get(`http://localhost:8081/appartement/${initialNumApp}`);
            console.log('Données reçues:', res.data);
            
            if (res.data && res.data.length > 0) {
                const data = res.data[0];
                setAppartement({
                    numApp: data.numApp || '',
                    design: data.design || '',
                    loyer: data.loyer || ''
                });
            } else {
                throw new Error('Appartement non trouvé');
            }
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Impossible de charger les données de l\'appartement.';
            setError(errorMessage);
            
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!appartement.numApp.trim() || !appartement.design.trim()) {
            setError('Tous les champs sont obligatoires');
            return;
        }

        // Convertir le loyer en nombre et valider
        const loyer = Number(appartement.loyer);
        if (isNaN(loyer) || loyer <= 0) {
            setError('Le loyer doit être un nombre positif');
            return;
        }

        try {
            setLoading(true);
            setError('');
            console.log('Tentative de modification avec les données:', { ...appartement, loyer });
            
            const response = await axios.put(`http://localhost:8081/update/${initialNumApp}`, {
                numApp: appartement.numApp.trim(),
                design: appartement.design.trim(),
                loyer: loyer
            });
            
            console.log('Réponse de la modification:', response.data);
            
            if (response.data.message === "Modification réussie") {
                navigate('/');
            } else {
                throw new Error('La modification n\'a pas été effectuée');
            }
        } catch (err) {
            console.error('Erreur lors de la modification:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de la modification. Veuillez réessayer.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setAppartement(prev => ({
            ...prev,
            [id]: value
        }));
    };

    if (initialLoad) {
        return (
            <div style={commonStyles.backgroundContainer}>
                <div style={commonStyles.overlay}></div>
                <div className='container mt-5' style={{ position: 'relative', zIndex: 2 }}>
                    <div style={commonStyles.contentWrapper}>
                        <h2 style={commonStyles.title}>Modifier l'Appartement {initialNumApp}</h2>
                        <div className="text-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={commonStyles.backgroundContainer}>
            <div style={commonStyles.overlay}></div>
            <div className='container mt-5' style={{ position: 'relative', zIndex: 2 }}>
                <div style={commonStyles.contentWrapper}>
                    <h2 style={commonStyles.title}>Modifier l'Appartement</h2>
                    <form onSubmit={handleUpdate}>
                        <div className="mb-3" style={commonStyles.formControl}>
                            <label htmlFor="numApp" className="form-label">Numéro d'appartement</label>
                            <input
                                type="text"
                                className="form-control"
                                id="numApp"
                                value={appartement.numApp}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3" style={commonStyles.formControl}>
                            <label htmlFor="design" className="form-label">Désignation</label>
                            <input
                                type="text"
                                className="form-control"
                                id="design"
                                value={appartement.design}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3" style={commonStyles.formControl}>
                            <label htmlFor="loyer" className="form-label">Loyer</label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control"
                                    id="loyer"
                                    value={appartement.loyer}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="1000"
                                    required
                                />
                                <span className="input-group-text">
                                    {appartement.loyer ? formatMontant(Number(appartement.loyer)).replace(' Ar', '') : '0K Ar'}
                                </span>
                            </div>
                        </div>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="d-flex gap-2">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                style={commonStyles.button}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Enregistrement...
                                    </>
                                ) : (
                                    'Sauvegarder'
                                )}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                style={commonStyles.button}
                                onClick={() => navigate('/')}
                                disabled={loading}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Update; 