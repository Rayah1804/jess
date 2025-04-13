import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Ajouter() {
    const [values, setValues] = useState({
        numApp: '',
        design: '',
        loyer: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('Formulaire soumis avec les valeurs:', values);

        // Validation des données avant l'envoi
        if (!values.numApp.trim() || !values.design || !values.loyer) {
            setError('Tous les champs sont obligatoires!');
            setLoading(false);
            return;
        }

        // Assure-toi que 'loyer' est un nombre positif
        if (isNaN(values.loyer) || values.loyer <= 0) {
            setError('Le loyer doit être un nombre positif');
            setLoading(false);
            return;
        }

        try {
            console.log('Envoi de la requête POST...');
            const response = await axios.post('http://localhost:8081/appartement', {
                ...values,
                numApp: values.numApp.trim()
            }, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Réponse du serveur:', response.data);
            navigate('/');
        } catch (err) {
            console.error('Erreur détaillée:', err);
            if (err.code === 'ERR_NETWORK') {
                setError('Impossible de se connecter au serveur. Veuillez vérifier que le serveur est bien démarré.');
            } else if (err.response) {
                console.error('Données de réponse:', err.response.data);
                console.error('Status:', err.response.status);
                setError(err.response.data.error || 'Une erreur est survenue. Veuillez réessayer plus tard.');
            } else {
                setError('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-vh-100 py-5' style={{ backgroundColor: 'rgb(110, 129, 157)' }}>
            <div className='container'>
                <div className='row justify-content-center'>
                    <div className='col-12 col-md-8 col-lg-6'>
                        <div className='bg-white rounded-3 p-4 shadow'>
                            <form onSubmit={handleSubmit}>
                                <h4 className='text-center mb-4'>
                                    <strong>Ajouter un nouvel Appartement</strong>
                                </h4>

                                {error && <div className="alert alert-danger">{error}</div>}

                                <div className="mb-3">
                                    <label htmlFor="numApp" className="form-label">Numéro d'appartement :</label>
                                    <input 
                                        type="text" 
                                        id="numApp"
                                        placeholder="Entrez le numéro" 
                                        className="form-control"
                                        value={values.numApp} 
                                        onChange={e => setValues({ ...values, numApp: e.target.value })} 
                                        disabled={loading}
                                        maxLength="50"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="design" className="form-label">Désignation :</label>
                                    <input 
                                        type="text" 
                                        id="design"
                                        placeholder="Entrez la désignation" 
                                        className="form-control"
                                        value={values.design} 
                                        onChange={e => setValues({ ...values, design: e.target.value })} 
                                        disabled={loading}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="loyer" className="form-label">Loyer (en Ariary) :</label>
                                    <div className="input-group">
                                        <input 
                                            type="number" 
                                            id="loyer"
                                            placeholder="Entrez le montant" 
                                            className="form-control"
                                            value={values.loyer} 
                                            onChange={e => setValues({ ...values, loyer: e.target.value })} 
                                            disabled={loading}
                                            min="0"
                                            step="100"
                                        />
                                        <span className="input-group-text">Ar</span>
                                    </div>
                                </div>

                                <div className="d-grid gap-2">
                                    <button 
                                        className="btn btn-success"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Enregistrement...
                                            </>
                                        ) : 'Sauvegarder'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
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
            </div>
        </div>
    );
}

export default Ajouter;
    